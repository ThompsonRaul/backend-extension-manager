import { authMiddleware } from "infra/middleware/authMiddleware.js";
import { permissionMiddleware } from "infra/middleware/permissionMiddleware.js";
import * as comprovacaoController from "application/controllers/comprovacaoController.js";
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
            "comprovacao.read:own",
            "comprovacao.manage:any",
          ])(req, res, resolve),
        );
        if (res.headersSent) return;
        return comprovacaoController.buscar(req, res);

      case "PUT":
        await new Promise((resolve) =>
          permissionMiddleware(["comprovacao.manage:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return comprovacaoController.atualizar(req, res);

      case "DELETE":
        await new Promise((resolve) =>
          permissionMiddleware(["comprovacao.manage:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return comprovacaoController.excluir(req, res);

      default:
        return handleMethodNotAllowed(
          res,
          req.method,
          "comprovacao.id.handler",
        );
    }
  } catch (erro) {
    return handleError(res, erro, "comprovacao.id.handler");
  }
}
