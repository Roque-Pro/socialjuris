require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function adicionarAvaliacao() {
  try {
    console.log("⭐ Adicionando colunas de avaliação na tabela casos...");
    await pool.query("ALTER TABLE casos ADD COLUMN IF NOT EXISTS nota integer;");
    await pool.query("ALTER TABLE casos ADD COLUMN IF NOT EXISTS comentario_avaliacao text;");
    console.log("✅ Colunas criadas com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao alterar tabela:", err);
  } finally {
    await pool.end();
  }
}

adicionarAvaliacao();
