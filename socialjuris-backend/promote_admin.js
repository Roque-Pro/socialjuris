require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function promoteAdmin() {
  try {
    const email = "administrador@socialjuris.com";
    console.log(`👑 Promovendo ${email} a ADMIN...`);

    const result = await pool.query(
      "UPDATE users SET tipo = 'admin' WHERE email = $1 RETURNING *",
      [email]
    );

    if (result.rows.length > 0) {
      console.log("✅ Sucesso! Usuário agora é ADMIN:", result.rows[0].nome);
    } else {
      console.log("❌ Usuário não encontrado. Crie a conta primeiro na tela de Registro!");
    }

  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    await pool.end();
  }
}

promoteAdmin();
