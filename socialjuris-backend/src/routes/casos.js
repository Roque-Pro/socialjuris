const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ========= CRIAR NOVO CASO (CLIENTE) ========= //
router.post('/', async (req, res) => {
  try {
    const { cliente_id, area_juridica, resumo, origem } = req.body;

    const insert = `
      INSERT INTO casos (cliente_id, area_juridica, resumo, origem, status)
      VALUES ($1, $2, $3, $4, 'novo')
      RETURNING *
    `;
    const result = await pool.query(insert, [cliente_id, area_juridica, resumo, origem]);
    
    // AQUI ENTRARIA A LÓGICA DE TRIAGEM AUTOMÁTICA (MATCH COM ADVOGADO)
    // Por enquanto, deixamos como 'novo' para painel admin ou advogado puxar.

    res.json({ ok: true, caso: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar caso" });
  }
});

// ========= LISTAR MEUS CASOS (CLIENTE) COM DADOS DO ADVOGADO ========= //
router.get('/meus/:cliente_id', async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const result = await pool.query(`
      SELECT c.*, 
             a.oab_status,
             u.nome as advogado_nome
      FROM casos c
      LEFT JOIN advogados a ON c.advogado_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE c.cliente_id = $1 
      ORDER BY c.criado_em DESC
    `, [cliente_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar casos" });
  }
});

// ========= LISTAR CASOS DISPONÍVEIS (PARA ADVOGADOS/ADMIN) ========= //
router.get('/feed', async (req, res) => {
  try {
    // Retorna casos 'novos' que ainda não tem advogado
    const result = await pool.query(`
      SELECT c.*, u.nome as cliente_nome 
      FROM casos c
      JOIN users u ON c.cliente_id = u.id
      WHERE c.status = 'novo'
      ORDER BY c.criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar feed de casos" });
  }
});

// ========= ACEITAR CASO (ADVOGADO) ========= //
router.post('/:id/aceitar', async (req, res) => {
  try {
    const { id } = req.params;
    const { advogado_id } = req.body;

    console.log(`🔍 Tentativa de aceitar caso: ID=${id}, Advogado=${advogado_id}`);

    // Primeiro, vamos ver se o adv existe na tabela de advogados
    // Se o usuário for advogado no cadastro, mas não tiver perfil na tabela 'advogados', pode dar erro de chave estrangeira se a tabela casos apontar para 'advogados' e não 'users'
    // Vamos checar a estrutura. Pelo CREATE TABLE: advogado_id uuid references advogados(id)
    // OPA! A tabela casos referencia a tabela 'advogados', mas o 'advogado_id' que vem do frontend é o ID do usuário (tabela users)!
    // Precisamos pegar o ID da tabela 'advogados' correspondente ao usuário.

    const advQuery = await pool.query("SELECT id FROM advogados WHERE user_id = $1", [advogado_id]);
    
    if (advQuery.rows.length === 0) {
      // Se não tiver perfil de advogado ainda, cria um temporário ou retorna erro
      console.log("❌ Advogado não tem perfil na tabela 'advogados'. Criando perfil básico...");
      const novoPerfil = await pool.query(
        "INSERT INTO advogados (user_id, oab_numero, oab_estado) VALUES ($1, 'PENDENTE', 'XX') RETURNING id",
        [advogado_id]
      );
      var realAdvogadoId = novoPerfil.rows[0].id;
    } else {
      var realAdvogadoId = advQuery.rows[0].id;
    }

    console.log(`✅ ID real na tabela advogados: ${realAdvogadoId}`);

    const update = `
      UPDATE casos 
      SET advogado_id = $1, status = 'em_atendimento'
      WHERE id = $2 AND status = 'novo'
      RETURNING *
    `;
    
    const result = await pool.query(update, [realAdvogadoId, id]);

    if (result.rows.length === 0) {
      console.log("❌ Falha no UPDATE: Caso não encontrado ou status != novo");
      return res.status(400).json({ error: "Caso não disponível ou já aceito." });
    }

    console.log("✅ Caso aceito com sucesso!");

    // Notificar via Socket.io
    // Envia para uma sala global ou específica do usuário (se tivéssemos room por user_id)
    // Como não temos room por user, vamos emitir um evento global 'case_updated' e o front filtra se é dono do caso
    req.io.emit('case_updated', { 
      caso_id: id, 
      novo_status: 'em_atendimento',
      advogado_id: realAdvogadoId 
    });

    res.json({ ok: true, caso: result.rows[0] });
  } catch (err) {
    console.error("🔴 Erro crítico ao aceitar caso:", err);
    res.status(500).json({ error: "Erro ao aceitar caso" });
  }
});

// ========= CONCLUIR E AVALIAR CASO (CLIENTE) ========= //
router.post('/:id/concluir', async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, comentario } = req.body;

    const update = `
      UPDATE casos 
      SET status = 'concluido', nota = $1, comentario_avaliacao = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(update, [nota, comentario, id]);
    
    // Notificar socket que acabou
    req.io.emit('case_updated', { caso_id: id, novo_status: 'concluido' });

    res.json({ ok: true, caso: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao concluir caso" });
  }
});

// ========= LISTAR CASOS DO ADVOGADO (MEUS ATENDIMENTOS) ========= //
router.get('/advogado/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // 1. Descobrir o ID da tabela advogados
    const advResult = await pool.query("SELECT id FROM advogados WHERE user_id = $1", [user_id]);
    
    if (advResult.rows.length === 0) {
      return res.json([]); // Sem perfil, sem casos
    }

    const advogadoId = advResult.rows[0].id;

    // 2. Buscar casos aceitos por esse advogado com dados do cliente
    const query = `
      SELECT c.*, u.nome as cliente_nome, u.email as cliente_email 
      FROM casos c
      JOIN users u ON c.cliente_id = u.id
      WHERE c.advogado_id = $1
      ORDER BY c.criado_em DESC
    `;

    const result = await pool.query(query, [advogadoId]);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar casos do advogado" });
  }
});

module.exports = router;
