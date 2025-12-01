import { listar } from "application/controllers/auditoriaController.js";
import { authMiddleware } from "infra/middleware/authMiddleware.js";
import { permissionMiddleware } from "infra/middleware/permissionMiddleware.js";
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
          permissionMiddleware(["auditoria.read:any"])(req, res, resolve),
        );
        if (res.headersSent) return;

        return listar(req, res);

      default:
        return handleMethodNotAllowed(res, req.method, "auditoria.handler");
    }
  } catch (erro) {
    return handleError(res, erro, "auditoria.handler");
  }
}
