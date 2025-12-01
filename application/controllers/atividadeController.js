import * as atividadeService from "/application/services/atividadeService.js";
import { handleError } from "application/errors/errorHandler.js";

export async function listar(req, res) {
  try {
    const atividades = await atividadeService.listarAtividades(req.query);

    return res.status(200).json({
      atividades: atividades.map((atividade) => {
        const {
          id_atividade,
          titulo,
          descricao,
          semestre,
          carga_horaria_total,
          status,
          categoria,
          responsaveis,
        } = atividade;

        return {
          id_atividade,
          titulo,
          descricao,
          semestre: String(semestre),
          carga_horaria_total,
          status,
          categoria,
          responsaveis,
        };
      }),
    });
  } catch (erro) {
    return handleError(res, erro, "atividadeController.listar");
  }
}

export async function criar(req, res) {
  try {
    const nova = await atividadeService.criarAtividade(req.body, req.user);

    const {
      id_atividade,
      titulo,
      descricao,
      semestre,
      carga_horaria_total,
      status,
      categoria,
      responsaveis,
    } = nova;

    return res.status(201).json({
      mensagem: "Atividade criada com sucesso.",
      atividade: {
        id_atividade,
        titulo,
        descricao,
        semestre: String(semestre),
        carga_horaria_total,
        status,
        categoria,
        responsaveis,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "atividadeController.criar");
  }
}

export async function buscar(req, res) {
  try {
    const atividade = await atividadeService.buscarAtividadePorId(req.query.id);

    const {
      id_atividade,
      titulo,
      descricao,
      semestre,
      carga_horaria_total,
      status,
      categoria,
      responsaveis,
    } = atividade;

    return res.status(200).json({
      atividade: {
        id_atividade,
        titulo,
        descricao,
        semestre: String(semestre),
        carga_horaria_total,
        status,
        categoria,
        responsaveis,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "atividadeController.buscar");
  }
}

export async function atualizar(req, res) {
  try {
    const atividade = await atividadeService.buscarAtividadePorId(req.query.id);
    const atualizada = await atividadeService.atualizarAtividade(
      atividade,
      req.body,
      req.user,
    );

    const {
      id_atividade,
      titulo,
      descricao,
      semestre,
      carga_horaria_total,
      status,
      categoria,
      responsaveis,
    } = atualizada;

    return res.status(200).json({
      mensagem: "Atividade atualizada com sucesso.",
      atividade: {
        id_atividade,
        titulo,
        descricao,
        semestre: String(semestre),
        carga_horaria_total,
        status,
        categoria,
        responsaveis,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "atividadeController.atualizar");
  }
}

export async function excluir(req, res) {
  try {
    const atividade = await atividadeService.buscarAtividadePorId(req.query.id);
    await atividadeService.excluirAtividade(atividade, req.user);

    return res.status(204).end();
  } catch (erro) {
    return handleError(res, erro, "atividadeController.excluir");
  }
}
