import { Participacao, Aluno, AtividadeExtensao } from "infra/models/index.js";
import sequelize from "infra/database.js";
import { registrarAuditoria } from "infra/utils/registrarAuditoria.js";
import { createError } from "application/errors/errorHandler.js";

export async function listarParticipacoes() {
  return Participacao.findAll({
    include: [
      { model: Aluno, as: "aluno", attributes: ["id_aluno", "curso"] },
      {
        model: AtividadeExtensao,
        as: "atividade",
        attributes: ["id_atividade", "titulo"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

export async function criarParticipacao(dados, usuario) {
  const { id_atividade } = dados;
  const id_aluno = usuario.id_usuario;

  if (!id_atividade)
    throw createError("O campo 'id_atividade' é obrigatório.", 400);

  const aluno = await Aluno.findByPk(id_aluno);
  if (!aluno) throw createError("Aluno não encontrado ou não cadastrado.", 404);

  const atividade = await AtividadeExtensao.findByPk(id_atividade);
  if (!atividade)
    throw createError("Atividade de extensão não encontrada.", 404);

  const existe = await Participacao.findOne({
    where: { id_aluno, id_atividade },
  });

  if (existe) throw createError("Você já está inscrito nesta atividade.", 409);

  const transaction = await sequelize.transaction();
  let nova;

  try {
    nova = await Participacao.create(
      {
        id_aluno,
        id_atividade,
        horas_validadas: 0,
        status_validacao: "pendente",
      },
      { transaction },
    );

    await transaction.commit();
  } catch (erro) {
    await transaction.rollback();
    throw erro;
  }

  await registrarAuditoria({
    acao: "participacao.create",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "participacao",
    id_entidade: nova.id_participacao,
    valor_anterior: null,
    valor_novo: nova.toJSON(),
    descricao: `Aluno ${id_aluno} inscrito na atividade ${id_atividade}`,
  });

  return nova.toJSON();
}

export async function buscarParticipacaoPorId(id) {
  const participacao = await Participacao.findByPk(id, {
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
        attributes: ["id_atividade", "titulo", "carga_horaria_total"],
      },
    ],
  });

  if (!participacao) throw createError("Participação não encontrada.", 404);

  return participacao;
}

export async function atualizarParticipacao(participacao, dados, usuario) {
  const { status_validacao, horas_validadas } = dados;

  if (
    status_validacao &&
    !["pendente", "aprovada", "reprovada"].includes(status_validacao)
  ) {
    throw createError(
      "Status inválido. Use: pendente, aprovada ou reprovada.",
      400,
    );
  }

  const transaction = await sequelize.transaction();
  const antes = participacao.toJSON();

  try {
    await participacao.update(
      {
        status_validacao: status_validacao ?? participacao.status_validacao,
        horas_validadas: horas_validadas ?? participacao.horas_validadas,
      },
      { transaction },
    );

    await transaction.commit();
  } catch (erro) {
    await transaction.rollback();
    throw erro;
  }

  const depois = participacao.toJSON();

  await registrarAuditoria({
    acao: "participacao.update",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "participacao",
    id_entidade: participacao.id_participacao,
    valor_anterior: antes,
    valor_novo: depois,
    descricao: `Participação ${participacao.id_participacao} atualizada por ${usuario?.email}`,
  });

  return depois;
}

export async function excluirParticipacao(participacao, usuario) {
  const idPart = participacao.id_participacao;
  const antes = participacao.toJSON();
  const transaction = await sequelize.transaction();

  try {
    await participacao.destroy({ transaction });
    await transaction.commit();
  } catch (erro) {
    await transaction.rollback();
    throw erro;
  }

  await registrarAuditoria({
    acao: "participacao.delete",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "participacao",
    id_entidade: idPart,
    valor_anterior: antes,
    valor_novo: null,
    descricao: `Participação ${idPart} removida por ${usuario?.email}`,
  });
}
