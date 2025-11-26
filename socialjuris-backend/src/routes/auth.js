const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ========= ROTA: CADASTRAR USUÁRIO ========= //
router.post('/register', async (req, res) => {
  try {
    console.log("📝 Tentando cadastrar:", req.body);
    const { nome, email, senha, tipo, origem } = req.body; 

    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ ok: false, error: "Campos faltando" });
    }

    // verificar se já existe email
    const check = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ ok: false, error: "Email já cadastrado" });
    }

    // hash seguro
    const senha_hash = await bcrypt.hash(senha, 10);

    const insert = `
      INSERT INTO users (nome, email, senha_hash, tipo, origem)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, email, tipo
    `;

    // Tratamento de nulos
    const origemFinal = origem || null;

    const result = await pool.query(insert, [
      nome,
      email,
      senha_hash,
      tipo,
      origemFinal
    ]);

    return res.json({ ok: true, user: result.rows[0] });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro interno" });
  }
});

// ========= ROTA: LOGIN DE USUÁRIO ========= //
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ ok: false, error: "Informe email e senha" });
    }

    // buscar usuário
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
    }

    const user = result.rows[0];

    // verificar senha
    const match = await bcrypt.compare(senha, user.senha_hash);
    if (!match) {
      return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
    }

    // atualizar ultimo_login
    await pool.query("UPDATE users SET ultimo_login = now() WHERE id = $1", [user.id]);

    // retornar dados (sem a senha, claro)
    const { senha_hash, ...userData } = user;
    
    return res.json({ 
      ok: true, 
      user: userData,
      // token: "JWT_FUTURO" (aqui entraria o JWT se formos usar token depois)
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro interno no login" });
  }
});

module.exports = router;
