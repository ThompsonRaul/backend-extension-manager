import { QueryTypes } from "sequelize";
import sequelize from "infra/database.js";
import { createError } from "application/errors/errorHandler.js";

export async function obterStatusBanco() {
  try {
    await sequelize.authenticate();

    const [versionResult] = await sequelize.query(
      "SELECT SUBSTRING_INDEX(VERSION(), '-', 1) AS version",
      { type: QueryTypes.SELECT },
    );

    const [maxConnResult] = await sequelize.query(
      "SHOW VARIABLES LIKE 'max_connections'",
      { type: QueryTypes.SELECT },
    );

    const [openConnResult] = await sequelize.query(
      "SHOW STATUS LIKE 'Threads_connected'",
      { type: QueryTypes.SELECT },
    );

    return {
      version: versionResult?.version || "unknown",
      max_connections: Number(maxConnResult?.Value ?? 0),
      opened_connections: Number(openConnResult?.Value ?? 0),
    };
  } catch (erro) {
    throw createError(
      `Falha ao consultar status do banco: ${erro.message}`,
      500,
    );
  }
}
