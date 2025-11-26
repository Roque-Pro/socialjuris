require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixColumns() {
  try {
    console.log("🔧 Consertando colunas da tabela users...");
    
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf text;");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS origem text;");
    
    // Garante que CPF seja único se não for nulo
    try {
        await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_cpf_key ON users(cpf);");
    } catch (e) { console.log("Index CPF já existe ou erro:", e.message) }

    console.log("✅ Colunas CPF e Origem garantidas!");

  } catch (err) {
    console.error("❌ Erro ao consertar:", err);
  } finally {
    await pool.end();
  }
}

fixColumns();
