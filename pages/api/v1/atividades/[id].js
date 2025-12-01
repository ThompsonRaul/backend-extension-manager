import { authMiddleware } from "infra/middleware/authMiddleware.js";
import { permissionMiddleware } from "infra/middleware/permissionMiddleware.js";
import * as atividadeController from "application/controllers/atividadeController.js";
import {
  handleError,
  handleMethodNotAllowed,
} from "application/errors/errorHandler.js";

export default async function handler(req, res) {
  try {
    await new Promise((resolve) => authMiddleware(req, res, resolve));
    if (res.headersSent) return;

    switch (req.method) {
      case "GET":
        await new Promise((resolve) =>
          permissionMiddleware(["atividade.read:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return atividadeController.buscar(req, res);

      case "PUT":
        await new Promise((resolve) =>
          permissionMiddleware([
            "atividade.update:own",
            "atividade.update:any",
          ])(req, res, resolve),
        );
        if (res.headersSent) return;
        return atividadeController.atualizar(req, res);

      case "DELETE":
        await new Promise((resolve) =>
          permissionMiddleware(["atividade.delete:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return atividadeController.excluir(req, res);

      default:
        return handleMethodNotAllowed(res, req.method, "atividade.id.handler");
    }
  } catch (erro) {
    return handleError(res, erro, "atividade.id.handler");
  }
}
