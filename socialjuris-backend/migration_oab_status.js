require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    console.log('🔄 Adicionando coluna oab_status à tabela advogados...');
    
    await pool.query(
      "ALTER TABLE advogados ADD COLUMN IF NOT EXISTS oab_status text DEFAULT 'pendente';"
    );
    
    console.log('✅ Coluna oab_status adicionada com sucesso!');
    await pool.end();
  } catch (err) {
    console.error('❌ Erro na migration:', err);
    process.exit(1);
  }
}

migrate();
