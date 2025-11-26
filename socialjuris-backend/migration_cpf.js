require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function adicionarCPF() {
  try {
    console.log("🆔 Adicionando coluna 'cpf' na tabela users...");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf text;");
    console.log("✅ Coluna CPF criada!");
  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    await pool.end();
  }
}

adicionarCPF();
