import sequelize from "infra/database.js";

export async function limparBanco() {
  let connection;
  try {
    connection = await sequelize.connectionManager.getConnection();

    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    const result = await connection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()",
    );

    const tabelas = Array.isArray(result[0]) ? result[0] : result;

    if (tabelas.length === 0) {
      console.log("Nenhuma tabela encontrada.");
      return;
    }

    for (const t of tabelas) {
      const nome = t.table_name || Object.values(t)[0];
      try {
        await connection.query(`TRUNCATE TABLE \`${nome}\``);
      } catch (err) {
        console.warn(`Erro ao limpar ${nome}: ${err.message}`);
      }
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
  } catch (err) {
    console.error("Erro ao limpar banco:", err);
  } finally {
    if (connection) {
      await sequelize.connectionManager.releaseConnection(connection);
    }
  }
}

export async function fecharConexao() {
  try {
    await sequelize.close();
  } catch (err) {
    console.error("Erro ao encerrar conexão:", err);
  }
}
