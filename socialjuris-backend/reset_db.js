require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function limparBanco() {
  try {
    console.log("🔥 Limpando banco de dados...");
    
    // Ordem correta de deleção
    console.log("1. Apagando mensagens...");
    await pool.query("DELETE FROM mensagens;");
    
    console.log("2. Apagando consultas...");
    await pool.query("DELETE FROM consultas;");

    console.log("3. Apagando casos...");
    await pool.query("DELETE FROM casos;");

    console.log("4. Apagando advogados...");
    await pool.query("DELETE FROM advogados;");

    console.log("5. Apagando usuários...");
    await pool.query("DELETE FROM users;");
    
    console.log("✅ Todos os usuários e dados vinculados foram apagados!");
    console.log("✨ Banco pronto para novos testes.");

  } catch (err) {
    console.error("❌ Erro ao limpar:", err);
  } finally {
    await pool.end();
  }
}

limparBanco();
