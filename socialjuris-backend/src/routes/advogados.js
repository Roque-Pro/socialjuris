const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ========= LISTAR ADVOGADOS ========= //
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.nome, u.email 
      FROM advogados a
      JOIN users u ON a.user_id = u.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar advogados" });
  }
});

// ========= PERFIL DO ADVOGADO (CRIAR/ATUALIZAR) ========= //
router.post('/perfil', async (req, res) => {
  try {
    const { user_id, oab_numero, oab_estado, especialidades, descricao, oab_status } = req.body;

    // Verifica se o advogado já tem perfil
    const check = await pool.query("SELECT id FROM advogados WHERE user_id = $1", [user_id]);

    if (check.rows.length > 0) {
      // Atualizar
      const update = `
        UPDATE advogados 
        SET oab_numero=$1, oab_estado=$2, especialidades=$3, descricao=$4, oab_status=$5
        WHERE user_id=$6
        RETURNING *
      `;
      const result = await pool.query(update, [oab_numero, oab_estado, especialidades, descricao, oab_status || 'pendente', user_id]);
      return res.json({ ok: true, advogado: result.rows[0] });
    } else {
      // Criar novo - OAB inicia como pendente se não preenchida
      const insert = `
        INSERT INTO advogados (user_id, oab_numero, oab_estado, especialidades, descricao, oab_status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const result = await pool.query(insert, [user_id, oab_numero, oab_estado, especialidades, descricao, oab_status || 'pendente']);
      return res.json({ ok: true, advogado: result.rows[0] });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar perfil de advogado" });
  }
});

// ========= VALIDAR OAB (MOCK OFICIAL) ========= //
router.post('/validar-oab', async (req, res) => {
  try {
    console.log("⚖️ Validando OAB:", req.body); // LOG NOVO
    const { nome, numero, estado } = req.body;
    
    // 1. Validação de Formato
    if (!numero || numero.length < 3) {
      return res.status(400).json({ error: "Número da OAB inválido." });
    }
    if (!['SP','RJ','MG','RS','PR','SC','SC','ES','BA','BA','SE','AL','PE','PB','RN','CE','PI','CE','MA','AM','PA','PA','AP','AP','RR','RR','RO','AC','DF','TO','MT','GO','MS'].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido." });
    }

    // 2. Simulação de Consulta Oficial (CNA/DataJud)
    // Aqui você substituiria por: await axios.get(`https://api.datajud.cnj.jus.br/...`)
    
    // MOCK: Vamos fingir que a API retornou sucesso
    // Para teste: Se o número for '000000', retorna erro proposital
    if (numero === '000000') {
      return res.status(404).json({ error: "Registro não encontrado no CNA." });
    }

    // Sucesso simulado
    res.json({ 
      ok: true, 
      mensagem: "Cadastro ativo e regular.",
      dados_oficiais: {
        nome: nome, // Confirma o nome enviado
        situacao: "Regular",
        inscricao: `${numero}/${estado}`
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao conectar com o CNA." });
  }
});

module.exports = router;
