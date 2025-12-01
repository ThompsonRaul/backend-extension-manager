import * as participacaoService from "application/services/participacaoService.js";
import { handleError } from "application/errors/errorHandler.js";

export async function listar(req, res) {
  try {
    const participacoes = await participacaoService.listarParticipacoes();
    return res.status(200).json({ participacoes });
  } catch (erro) {
    return handleError(res, erro, "participacaoController.listar");
  }
}

export async function criar(req, res) {
  try {
    const nova = await participacaoService.criarParticipacao(
      req.body,
      req.user,
    );
    return res.status(201).json({
      mensagem: "Inscrição realizada com sucesso.",
      participacao: nova,
    });
  } catch (erro) {
    return handleError(res, erro, "participacaoController.criar");
  }
}

export async function buscar(req, res) {
  try {
    const participacao = await participacaoService.buscarParticipacaoPorId(
      req.query.id,
    );

    const isOwner = participacao.id_aluno === req.user.id_usuario;
    const isPrivileged = req.user.papeis.some((p) =>
      ["admin", "membro_comissao"].includes(p),
    );

    if (!isOwner && !isPrivileged)
      return res.status(403).json({
        erro: "Sem permissão para visualizar esta participação.",
      });

    return res.status(200).json({ participacao });
  } catch (erro) {
    return handleError(res, erro, "participacaoController.buscar");
  }
}

export async function atualizar(req, res) {
  try {
    const participacao = await participacaoService.buscarParticipacaoPorId(
      req.query.id,
    );

    const atualizada = await participacaoService.atualizarParticipacao(
      participacao,
      req.body,
      req.user,
    );

    return res.status(200).json({
      mensagem: "Participação atualizada com sucesso.",
      participacao: atualizada,
    });
  } catch (erro) {
    return handleError(res, erro, "participacaoController.atualizar");
  }
}

export async function excluir(req, res) {
  try {
    const participacao = await participacaoService.buscarParticipacaoPorId(
      req.query.id,
    );

    await participacaoService.excluirParticipacao(participacao, req.user);

    return res.status(204).end();
  } catch (erro) {
    return handleError(res, erro, "participacaoController.excluir");
  }
}
