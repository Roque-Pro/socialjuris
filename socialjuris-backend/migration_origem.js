require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function adicionarColunaOrigem() {
  try {
    console.log("🛠️ Adicionando coluna 'origem' na tabela users...");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS origem text;");
    console.log("✅ Coluna criada com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao alterar tabela:", err);
  } finally {
    await pool.end();
  }
}

adicionarColunaOrigem();
