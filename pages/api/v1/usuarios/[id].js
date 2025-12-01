import bcrypt from "bcrypt";
import {
  buscarUsuarioPorId,
  atualizarUsuario,
  excluirUsuario,
} from "application/services/usuarioService.js";
import { Usuario } from "infra/models/index.js";
import { authMiddleware } from "infra/middleware/authMiddleware.js";
import { permissionMiddleware } from "infra/middleware/permissionMiddleware.js";
import {
  createError,
  handleError,
  handleMethodNotAllowed,
} from "application/errors/errorHandler.js";

export default async function handler(req, res) {
  try {
    await new Promise((resolve) => authMiddleware(req, res, resolve));
    if (res.headersSent) return;

    const { id } = req.query;

    const recurso = await Usuario.findByPk(id, {
      attributes: ["id_usuario", "nome", "email", "matricula", "senha_hash"],
    });
    if (!recurso) throw createError("Usuário não encontrado.", 404);

    req.recurso = recurso.toJSON();

    switch (req.method) {
      case "GET": {
        await new Promise((resolve) =>
          permissionMiddleware(["usuario.read"])(req, res, resolve),
        );
        if (res.headersSent) return;

        const usuario = await buscarUsuarioPorId(id);
        return res.status(200).json(usuario);
      }

      case "PUT": {
        await new Promise((resolve) =>
          permissionMiddleware(["usuario.update"])(req, res, resolve),
        );
        if (res.headersSent) return;

        const usuario = recurso;
        const usuarioLogado = req.user;

        const { senha_atual, nova_senha } = req.body;

        const ehProprioUsuario =
          usuarioLogado.id_usuario === usuario.id_usuario;
        const ehAluno = usuarioLogado.papeis.includes("aluno");

        if (ehAluno && ehProprioUsuario) {
          if (!senha_atual || !nova_senha)
            throw createError("Informe senha atual e nova senha.", 400);

          const senhaValida = await bcrypt.compare(
            senha_atual,
            usuario.senha_hash,
          );

          if (!senhaValida) throw createError("Senha atual incorreta.", 401);

          const novaHash = await bcrypt.hash(nova_senha, 10);
          await usuario.update({ senha_hash: novaHash });

          return res.status(200).json({ msg: "Senha atualizada com sucesso." });
        }

        const atualizado = await atualizarUsuario(
          usuario,
          req.body,
          usuarioLogado,
        );

        return res.status(200).json(atualizado);
      }

      case "DELETE": {
        await new Promise((resolve) =>
          permissionMiddleware(["usuario.delete"])(req, res, resolve),
        );
        if (res.headersSent) return;

        await excluirUsuario(recurso, req.user);
        return res.status(204).end();
      }

      default:
        return handleMethodNotAllowed(res, req.method, "usuarios/[id].handler");
    }
  } catch (erro) {
    return handleError(res, erro, "usuarios/[id].handler");
  }
}
