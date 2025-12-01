import {
  AtividadeExtensao,
  Categoria,
  Usuario,
  Participacao,
  ResponsavelAtividade,
} from "infra/models/index.js";

import sequelize from "infra/database.js";
import { registrarAuditoria } from "infra/utils/registrarAuditoria.js";
import { createError } from "application/errors/errorHandler.js";

export async function listarAtividades({ categoria, status }) {
  try {
    const where = {};
    if (categoria) where.id_categoria = categoria;
    if (status) where.status = status;

    const atividades = await AtividadeExtensao.findAll({
      where,
      include: [
        { model: Categoria, as: "categoria", attributes: ["nome_categoria"] },
        {
          model: Usuario,
          as: "responsaveis",
          attributes: ["id_usuario", "nome", "email"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return atividades.map((a) => a.toJSON());
  } catch {
    throw createError("Falha ao listar atividades.", 500);
  }
}

export async function criarAtividade(dados, user) {
  const {
    titulo,
    descricao,
    semestre,
    carga_horaria_total,
    id_categoria,
    responsaveis = [],
  } = dados;

  if (!titulo?.trim() || !semestre || !carga_horaria_total)
    throw createError(
      "Os campos 'titulo', 'semestre' e 'carga_horaria_total' são obrigatórios.",
      400,
    );

  const transaction = await sequelize.transaction();
  let nova;

  try {
    nova = await AtividadeExtensao.create(
      {
        titulo,
        descricao: descricao || null,
        semestre,
        carga_horaria_total,
        id_categoria: id_categoria || null,
      },
      { transaction },
    );

    if (responsaveis.length > 0) {
      const registrosPivot = responsaveis.map((id) => ({
        id_atividade: nova.id_atividade,
        id_usuario: id,
      }));

      await ResponsavelAtividade.bulkCreate(registrosPivot, { transaction });
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  await registrarAuditoria({
    acao: "atividade.create",
    usuario: user?.id_usuario ? { id_usuario: user.id_usuario } : null,
    entidade: "atividade_extensao",
    id_entidade: nova.id_atividade,
    valor_anterior: null,
    valor_novo: nova.toJSON(),
    descricao: `Atividade criada (${nova.titulo})`,
  });

  return nova.toJSON();
}

export async function buscarAtividadePorId(id) {
  const atividade = await AtividadeExtensao.findByPk(id, {
    include: [
      { model: Categoria, as: "categoria", attributes: ["nome_categoria"] },
      {
        model: Usuario,
        as: "responsaveis",
        attributes: ["id_usuario", "nome", "email"],
        through: { attributes: [] },
      },
    ],
  });

  if (!atividade) throw createError("Atividade não encontrada.", 404);
  return atividade;
}

export async function atualizarAtividade(atividade, dados, user) {
  const {
    titulo,
    descricao,
    semestre,
    carga_horaria_total,
    status,
    id_categoria,
    responsaveis,
  } = dados;

  const transaction = await sequelize.transaction();
  const antes = atividade.toJSON();

  try {
    await atividade.update(
      {
        titulo: titulo ?? atividade.titulo,
        descricao: descricao ?? atividade.descricao,
        semestre: semestre ?? atividade.semestre,
        carga_horaria_total:
          carga_horaria_total ?? atividade.carga_horaria_total,
        status: status ?? atividade.status,
        id_categoria: id_categoria ?? atividade.id_categoria,
      },
      { transaction },
    );

    if (Array.isArray(responsaveis)) {
      await ResponsavelAtividade.destroy({
        where: { id_atividade: atividade.id_atividade },
        transaction,
      });

      const novos = responsaveis.map((id) => ({
        id_atividade: atividade.id_atividade,
        id_usuario: id,
      }));

      await ResponsavelAtividade.bulkCreate(novos, { transaction });
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  const depois = atividade.toJSON();

  await registrarAuditoria({
    acao: "atividade.update",
    usuario: user?.id_usuario ? { id_usuario: user.id_usuario } : null,
    entidade: "atividade_extensao",
    id_entidade: atividade.id_atividade,
    valor_anterior: antes,
    valor_novo: depois,
    descricao: `Atividade atualizada (${atividade.titulo}) por ${user?.email}`,
  });

  return atividade.toJSON();
}

export async function excluirAtividade(atividade, user) {
  const transaction = await sequelize.transaction();
  const antes = atividade.toJSON();

  try {
    const vinculos = await Participacao.count({
      where: { id_atividade: atividade.id_atividade },
      transaction,
    });

    if (vinculos > 0)
      throw createError(
        "Não é possível remover a atividade: há alunos vinculados.",
        400,
      );

    await ResponsavelAtividade.destroy({
      where: { id_atividade: atividade.id_atividade },
      transaction,
    });

    await atividade.destroy({ transaction });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  await registrarAuditoria({
    acao: "atividade.delete",
    usuario: user?.id_usuario ? { id_usuario: user.id_usuario } : null,
    entidade: "atividade_extensao",
    id_entidade: atividade.id_atividade,
    valor_anterior: antes,
    valor_novo: null,
    descricao: `Atividade removida (${atividade.titulo}) por ${user?.email}`,
  });
}
