require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function criarTabelaChat() {
  try {
    console.log("💬 Criando tabela 'mensagens'...");
    
    const query = `
      CREATE TABLE IF NOT EXISTS mensagens (
        id uuid primary key default gen_random_uuid(),
        caso_id uuid references casos(id),
        remetente_id uuid references users(id),
        texto text not null,
        criado_em timestamptz default now()
      );
    `;
    
    await pool.query(query);
    console.log("✅ Tabela 'mensagens' criada com sucesso!");

  } catch (err) {
    console.error("❌ Erro ao criar tabela:", err);
  } finally {
    await pool.end();
  }
}

criarTabelaChat();
