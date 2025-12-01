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
        return atividadeController.listar(req, res);

      case "POST":
        await new Promise((resolve) =>
          permissionMiddleware([
            "atividade.create:own",
            "atividade.create:any",
          ])(req, res, resolve),
        );
        if (res.headersSent) return;
        return atividadeController.criar(req, res);

      default:
        return handleMethodNotAllowed(
          res,
          req.method,
          "atividade.index.handler",
        );
    }
  } catch (erro) {
    return handleError(res, erro, "atividade.index.handler");
  }
}
