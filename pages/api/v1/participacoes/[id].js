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
          permissionMiddleware([
            "participacao.read:own",
            "participacao.manage:any",
          ])(req, res, resolve),
        );
        if (res.headersSent) return;
        return participacaoController.buscar(req, res);

      case "PUT":
        await new Promise((resolve) =>
          permissionMiddleware(["participacao.manage:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return participacaoController.atualizar(req, res);

      case "DELETE":
        await new Promise((resolve) =>
          permissionMiddleware(["participacao.manage:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return participacaoController.excluir(req, res);

      default:
        return handleMethodNotAllowed(
          res,
          req.method,
          "participacao.id.handler",
        );
    }
  } catch (erro) {
    return handleError(res, erro, "participacao.id.handler");
  }
}
