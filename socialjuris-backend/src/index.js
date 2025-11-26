require('dotenv').config();
const express = require('express');
const http = require('http'); // Importante para Socket.io
const { Server } = require('socket.io'); // Importante para Socket.io
const cors = require('cors');
const basicRoutes = require('./routes/basic');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth');
const advogadosRoutes = require('./routes/advogados');
const casosRoutes = require('./routes/casos');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const path = require('path');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const server = http.createServer(app); // Criar servidor HTTP cru

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// middlewares básicos
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(express.json());

// Middleware de Log (Para ver se a requisição chega)
app.use((req, res, next) => {
  console.log(`📩 Recebido: ${req.method} ${req.url}`);
  next();
});

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware para injetar IO em todas as rotas
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', basicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/advogados', advogadosRoutes);
app.use('/api/casos', casosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ========= ROTA DE HISTÓRICO DE MENSAGENS ========= //
app.get('/api/mensagens/:caso_id', async (req, res) => {
  try {
    const { caso_id } = req.params;
    const result = await pool.query(
      `SELECT m.*, u.nome as remetente_nome 
       FROM mensagens m 
       JOIN users u ON m.remetente_id = u.id 
       WHERE caso_id = $1 
       ORDER BY criado_em ASC`,
      [caso_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});


// ========= LÓGICA DO SOCKET.IO ========= //
io.on('connection', (socket) => {
  console.log('⚡ Cliente conectado:', socket.id);

  // Entrar na sala do caso
  socket.on('join_case', (casoId) => {
    socket.join(casoId);
    console.log(`👥 Usuário entrou na sala do caso: ${casoId}`);
  });

  // Enviar mensagem
  socket.on('send_message', async (data) => {
    // data espera: { caso_id, remetente_id, texto }
    const { caso_id, remetente_id, texto } = data;
    
    try {
      // 1. Salvar no banco
      const insert = await pool.query(
        "INSERT INTO mensagens (caso_id, remetente_id, texto) VALUES ($1, $2, $3) RETURNING *",
        [caso_id, remetente_id, texto]
      );
      
      const novaMensagem = insert.rows[0];
      
      // 2. Buscar nome do remetente para enviar pro front
      const userRes = await pool.query("SELECT nome FROM users WHERE id = $1", [remetente_id]);
      novaMensagem.remetente_nome = userRes.rows[0].nome;

      // 3. Emitir para todos na sala (incluindo quem enviou)
      io.to(caso_id).emit('receive_message', novaMensagem);

    } catch (err) {
      console.error("Erro ao salvar msg socket:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


// testar conexão
pool.connect()
  .then(() => console.log("🟢 Conectado ao Supabase Postgres"))
  .catch(err => console.error("🔴 Erro ao conectar no banco:", err));

// rota de teste temporária
app.get('/', (req, res) => {
  res.send('Backend SocialJuris ON');
});


// iniciar servidor (USAR server.listen e não app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🔥 Backend + Socket.io rodando na porta ${PORT}`);
});




