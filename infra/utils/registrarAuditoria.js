import { Auditoria } from "infra/models/index.js";
import { createError } from "application/errors/errorHandler.js";

export async function registrarAuditoria({
  acao,
  usuario,
  entidade,
  id_entidade,
  valor_anterior = null,
  valor_novo = null,
  descricao = "",
}) {
  try {
    const auditoria = await Auditoria.create({
      id_usuario: usuario?.id_usuario || null,
      entidade,
      id_entidade,
      acao,
      valor_anterior,
      valor_novo,
      descricao,
    });

    return auditoria.id_auditoria;
  } catch (err) {
    console.error("Falha ao registrar auditoria:", err);
    throw createError("Falha ao registrar auditoria.", 500);
  }
}
