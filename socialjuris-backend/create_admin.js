require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
  try {
    const nome = "Carlos Admin";
    const email = "carlos@admin.com";
    const senha = "carlosadmin25";
    const tipo = "admin";

    const senha_hash = await bcrypt.hash(senha, 10);

    console.log("🔐 Criando Admin...");

    // Tenta inserir ou atualizar se já existir
    const query = `
      INSERT INTO users (nome, email, senha_hash, tipo)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET tipo = 'admin', senha_hash = $3
      RETURNING id, nome, email, tipo;
    `;

    const res = await pool.query(query, [nome, email, senha_hash, tipo]);
    console.log("✅ Admin criado/atualizado com sucesso:", res.rows[0]);

  } catch (err) {
    console.error("❌ Erro ao criar admin:", err);
  } finally {
    await pool.end();
  }
}

createAdmin();
