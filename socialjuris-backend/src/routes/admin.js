const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware simples para verificar se é admin (em produção, usar JWT)
const checkAdmin = async (req, res, next) => {
  const { admin_id } = req.headers;
  if (!admin_id) return res.status(401).json({ error: "Não autorizado" });
  
  const result = await pool.query("SELECT tipo FROM users WHERE id = $1", [admin_id]);
  if (result.rows.length === 0 || result.rows[0].tipo !== 'admin') {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
};

// ========= DASHBOARD KPIs (MÉTRICAS GERAIS) ========= //
router.get('/dashboard', checkAdmin, async (req, res) => {
  try {
    const kpis = {
      total_users: (await pool.query("SELECT count(*) FROM users")).rows[0].count,
      total_advogados: (await pool.query("SELECT count(*) FROM advogados")).rows[0].count,
      advogados_pendentes: (await pool.query("SELECT count(*) FROM advogados WHERE verificado = false")).rows[0].count,
      total_casos: (await pool.query("SELECT count(*) FROM casos")).rows[0].count,
      casos_novos: (await pool.query("SELECT count(*) FROM casos WHERE status = 'novo'")).rows[0].count,
    };
    res.json(kpis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar dashboard admin" });
  }
});

// ========= ORIGEM DOS USUÁRIOS (MÉTRICAS) ========= //
router.get('/metricas/origem', checkAdmin, async (req, res) => {
  try {
    // Agrupa usuários por origem e conta
    // COALESCE(origem, 'direto') transforma null em 'direto'
    const query = `
      SELECT COALESCE(origem, 'Desconhecido/Direto') as origem, COUNT(*) as total
      FROM users
      GROUP BY origem
      ORDER BY total DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar métricas de origem" });
  }
});

// ========= LISTAR ADVOGADOS PENDENTES ========= //
router.get('/advogados/pendentes', checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.nome, u.email 
      FROM advogados a
      JOIN users u ON a.user_id = u.id
      WHERE a.verificado = false
      ORDER BY a.criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar advogados pendentes" });
  }
});

// ========= APROVAR ADVOGADO (VALIDAÇÃO MANUAL) ========= //
router.post('/advogados/:id/aprovar', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params; // ID da tabela advogados
    await pool.query("UPDATE advogados SET verificado = true WHERE id = $1", [id]);
    res.json({ ok: true, message: "Advogado verificado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao aprovar advogado" });
  }
});

module.exports = router;
