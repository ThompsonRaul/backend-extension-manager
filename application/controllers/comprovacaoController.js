import * as comprovacaoService from "application/services/comprovacaoService.js";
import { handleError } from "application/errors/errorHandler.js";

export async function listar(req, res) {
  try {
    const comprovacoes = await comprovacaoService.listarComprovacoes();

    return res.status(200).json({
      comprovacoes: comprovacoes.map((c) => {
        const {
          id_comprovacao,
          id_participacao,
          tipo_documento,
          caminho_arquivo,
          horas_cumpridas,
          status_aprovacao,
          data_envio,
        } = c;

        return {
          id_comprovacao,
          id_participacao,
          tipo_documento,
          caminho_arquivo,
          horas_cumpridas,
          status_aprovacao,
          data_envio,
        };
      }),
    });
  } catch (erro) {
    return handleError(res, erro, "comprovacaoController.listar");
  }
}

export async function criar(req, res) {
  try {
    const nova = await comprovacaoService.criarComprovacao(req.body, req.user);

    const {
      id_comprovacao,
      id_participacao,
      tipo_documento,
      caminho_arquivo,
      horas_cumpridas,
      status_aprovacao,
      data_envio,
    } = nova;

    return res.status(201).json({
      mensagem: "Comprovante enviado com sucesso.",
      comprovacao: {
        id_comprovacao,
        id_participacao,
        tipo_documento,
        caminho_arquivo,
        horas_cumpridas,
        status_aprovacao,
        data_envio,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "comprovacaoController.criar");
  }
}

export async function buscar(req, res) {
  try {
    const comprovacao = await comprovacaoService.buscarComprovacaoPorId(
      req.query.id,
    );

    const {
      id_comprovacao,
      id_participacao,
      tipo_documento,
      caminho_arquivo,
      horas_cumpridas,
      status_aprovacao,
      data_envio,
    } = comprovacao;

    return res.status(200).json({
      comprovacao: {
        id_comprovacao,
        id_participacao,
        tipo_documento,
        caminho_arquivo,
        horas_cumpridas,
        status_aprovacao,
        data_envio,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "comprovacaoController.buscar");
  }
}

export async function atualizar(req, res) {
  try {
    const comprovacao = await comprovacaoService.buscarComprovacaoPorId(
      req.query.id,
    );

    const atualizada = await comprovacaoService.atualizarStatus(
      comprovacao,
      req.body.status_aprovacao,
      req.user,
    );

    const {
      id_comprovacao,
      id_participacao,
      tipo_documento,
      caminho_arquivo,
      horas_cumpridas,
      status_aprovacao,
      data_envio,
    } = atualizada;

    return res.status(200).json({
      mensagem: "Status atualizado com sucesso.",
      comprovacao: {
        id_comprovacao,
        id_participacao,
        tipo_documento,
        caminho_arquivo,
        horas_cumpridas,
        status_aprovacao,
        data_envio,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "comprovacaoController.atualizar");
  }
}

export async function excluir(req, res) {
  try {
    const comprovacao = await comprovacaoService.buscarComprovacaoPorId(
      req.query.id,
    );

    await comprovacaoService.excluirComprovacao(comprovacao, req.user);

    return res.status(204).end();
  } catch (erro) {
    return handleError(res, erro, "comprovacaoController.excluir");
  }
}
