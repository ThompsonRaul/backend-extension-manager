import { authMiddleware } from "infra/middleware/authMiddleware.js";
import { permissionMiddleware } from "infra/middleware/permissionMiddleware.js";
import * as participacaoController from "application/controllers/participacaoController.js";
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
          permissionMiddleware(["participacao.manage:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return participacaoController.listar(req, res);

      case "POST":
        await new Promise((resolve) =>
          permissionMiddleware(["participacao.create:own"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return participacaoController.criar(req, res);

      default:
        return handleMethodNotAllowed(
          res,
          req.method,
          "participacao.index.handler",
        );
    }
  } catch (erro) {
    return handleError(res, erro, "participacao.index.handler");
  }
}
