import { authMiddleware } from "infra/middleware/authMiddleware.js";
import { permissionMiddleware } from "infra/middleware/permissionMiddleware.js";
import * as usuarioController from "application/controllers/usuarioController.js";
import {
  handleError,
  handleMethodNotAllowed,
} from "application/errors/errorHandler.js";

export default async function handler(req, res) {
  try {
    await new Promise((resolve) => authMiddleware(req, res, resolve));
    if (res.headersSent) return;

    switch (req.method) {
      case "GET": {
        await new Promise((resolve) =>
          permissionMiddleware(["usuario.read:any"])(req, res, resolve),
        );
        if (res.headersSent) return;

        return usuarioController.listar(req, res);
      }

      default:
        return handleMethodNotAllowed(res, req.method, "usuarios.handler");
    }
  } catch (erro) {
    return handleError(res, erro, "usuarios.handler");
  }
}
