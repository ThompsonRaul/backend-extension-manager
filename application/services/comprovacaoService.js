import {
  Comprovacao,
  Participacao,
  Aluno,
  AtividadeExtensao,
} from "infra/models/index.js";

import sequelize from "infra/database.js";
import { registrarAuditoria } from "infra/utils/registrarAuditoria.js";
import { createError } from "application/errors/errorHandler.js";

export async function listarComprovacoes() {
  return await Comprovacao.findAll({
    include: [
      {
        model: Participacao,
        as: "participacao",
        attributes: ["id_participacao", "status_validacao", "horas_validadas"],
        include: [
          {
            model: Aluno,
            as: "aluno",
            attributes: ["id_aluno", "curso"],
          },
        ],
      },
    ],
    order: [["data_envio", "DESC"]],
  });
}

export async function criarComprovacao(dados, usuario) {
  const { id_participacao, tipo_documento, caminho_arquivo, horas_cumpridas } =
    dados;

  const id_usuario = usuario.id_usuario;

  if (!id_participacao)
    throw createError("Campo 'id_participacao' é obrigatório.", 400);

  if (horas_cumpridas == null)
    throw createError("Campo 'horas_cumpridas' é obrigatório.", 400);

  const participacao = await Participacao.findByPk(id_participacao);
  if (!participacao) throw createError("Participação não encontrada.", 404);

  if (participacao.id_aluno !== id_usuario)
    throw createError("Você não pode enviar comprovante de outro aluno.", 403);

  const existe = await Comprovacao.findOne({ where: { id_participacao } });
  if (existe)
    throw createError("Já existe um comprovante para esta participação.", 409);

  const transaction = await sequelize.transaction();
  let nova;

  try {
    nova = await Comprovacao.create(
      {
        id_participacao,
        tipo_documento: tipo_documento || "outro",
        caminho_arquivo: caminho_arquivo || null,
        horas_cumpridas: Number(horas_cumpridas) || 0,
        status_aprovacao: "pendente",
      },
      { transaction },
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  await registrarAuditoria({
    acao: "comprovacao.create",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "comprovacao",
    id_entidade: nova.id_comprovacao,
    valor_anterior: null,
    valor_novo: nova.toJSON(),
    descricao: `Comprovação criada para participação ${id_participacao}`,
  });

  return nova.toJSON();
}

export async function buscarComprovacaoPorId(id) {
  const comprovacao = await Comprovacao.findByPk(id, {
    include: [
      {
        model: Participacao,
        as: "participacao",
        include: [
          {
            model: Aluno,
            as: "aluno",
            attributes: [
              "id_aluno",
              "curso",
              "horas_acumuladas",
              "horas_restantes",
            ],
          },
          {
            model: AtividadeExtensao,
            as: "atividade",
            attributes: ["id_atividade", "carga_horaria_total"],
          },
        ],
      },
    ],
  });

  if (!comprovacao) throw createError("Comprovação não encontrada.", 404);

  return comprovacao;
}

export async function atualizarStatus(comprovacao, novoStatus, usuario) {
  if (!["pendente", "aceita", "rejeitada"].includes(novoStatus))
    throw createError(
      "Status inválido. Use: pendente, aceita ou rejeitada.",
      400,
    );

  const statusAnterior = comprovacao.status_aprovacao;

  if (novoStatus === statusAnterior) return comprovacao;

  const transaction = await sequelize.transaction();

  try {
    const participacao = await Participacao.findByPk(
      comprovacao.id_participacao,
      {
        include: [
          {
            model: AtividadeExtensao,
            as: "atividade",
            attributes: ["id_atividade", "carga_horaria_total"],
          },
          {
            model: Aluno,
            as: "aluno",
            attributes: [
              "id_aluno",
              "curso",
              "horas_acumuladas",
              "horas_restantes",
            ],
          },
        ],
        transaction,
      },
    );

    if (!participacao)
      throw createError("Participação associada não encontrada.", 404);

    const aluno = participacao.aluno;
    if (!aluno)
      throw createError("Aluno associado à participação não encontrado.", 404);

    if (novoStatus === "aceita") {
      const limite = participacao.atividade.carga_horaria_total;
      const horasAntes = participacao.horas_validadas ?? 0;
      const horasSomadas = horasAntes + (comprovacao.horas_cumpridas ?? 0);

      const novasHorasParticipacao =
        horasSomadas > limite ? limite : horasSomadas;

      const horasAplicadas = novasHorasParticipacao - horasAntes;

      await participacao.update(
        {
          horas_validadas: novasHorasParticipacao,
          status_validacao: "aprovada",
        },
        { transaction },
      );

      await aluno.update(
        {
          horas_acumuladas: aluno.horas_acumuladas + horasAplicadas,
          horas_restantes: Math.max(aluno.horas_restantes - horasAplicadas, 0),
        },
        { transaction },
      );
    }

    if (novoStatus === "rejeitada") {
      await participacao.update(
        { status_validacao: "reprovada" },
        { transaction },
      );
    }

    await comprovacao.update({ status_aprovacao: novoStatus }, { transaction });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  await registrarAuditoria({
    acao: "comprovacao.update_status",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "comprovacao",
    id_entidade: comprovacao.id_comprovacao,
    valor_anterior: { status: statusAnterior },
    valor_novo: { status: novoStatus },
    descricao: `Status da comprovação ${comprovacao.id_comprovacao} alterado para ${novoStatus}`,
  });

  return comprovacao.toJSON();
}

export async function excluirComprovacao(comprovacao, usuario) {
  const transaction = await sequelize.transaction();
  const antes = comprovacao.toJSON();

  try {
    await comprovacao.destroy({ transaction });
    await transaction.commit();
  } catch (erro) {
    await transaction.rollback();
    throw erro;
  }

  await registrarAuditoria({
    acao: "comprovacao.delete",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "comprovacao",
    id_entidade: comprovacao.id_comprovacao,
    valor_anterior: antes,
    valor_novo: null,
    descricao: `Comprovação ${comprovacao.id_comprovacao} removida por ${usuario?.email}`,
  });
}
