import { Auditoria, Usuario } from "infra/models/index.js";
import { createError } from "application/errors/errorHandler.js";

export async function listarAuditoriasFiltradas({ entidade, acao, limite }) {
  try {
    const where = {};
    if (entidade) where.entidade = entidade;
    if (acao) where.acao = acao;

    const parsedLimit = Number.isInteger(parseInt(limite))
      ? parseInt(limite)
      : 50;

    const auditorias = await Auditoria.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id_usuario", "nome", "email"],
        },
      ],
      order: [["id_auditoria", "DESC"]],
      limit: parsedLimit,
    });

    return auditorias.map((a) => a.toJSON());
  } catch (err) {
    throw createError("Falha ao listar auditorias.", 500);
  }
}
