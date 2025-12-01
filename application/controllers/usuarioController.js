import * as usuarioService from "application/services/usuarioService.js";
import { handleError } from "application/errors/errorHandler.js";

export async function listar(req, res) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    return res.status(200).json({ total: usuarios.length, usuarios });
  } catch (erro) {
    return handleError(res, erro, "usuarioController.listar");
  }
}

export async function buscar(req, res) {
  try {
    const { usuario, dados } = await usuarioService.buscarUsuarioPorId(
      req.query.id,
    );

    return res.status(200).json({ usuario: dados });
  } catch (erro) {
    return handleError(res, erro, "usuarioController.buscar");
  }
}

export async function atualizar(req, res) {
  try {
    const encontrado = await usuarioService.buscarUsuarioPorId(req.query.id);

    const atualizado = await usuarioService.atualizarUsuario(
      encontrado.usuario,
      req.body,
    );

    const { dados } = await usuarioService.buscarUsuarioPorId(
      atualizado.id_usuario,
    );

    return res.status(200).json({
      mensagem: "Usuário atualizado com sucesso.",
      usuario: dados,
    });
  } catch (erro) {
    return handleError(res, erro, "usuarioController.atualizar");
  }
}

export async function excluir(req, res) {
  try {
    await usuarioService.excluirUsuario(req.query.id);
    return res.status(204).end();
  } catch (erro) {
    return handleError(res, erro, "usuarioController.excluir");
  }
}
