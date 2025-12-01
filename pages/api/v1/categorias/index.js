import { authMiddleware } from "infra/middleware/authMiddleware.js";
import { permissionMiddleware } from "infra/middleware/permissionMiddleware.js";
import * as categoriaController from "application/controllers/categoriaController.js";
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
          permissionMiddleware(["categoria.read:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return categoriaController.listar(req, res);

      case "POST":
        await new Promise((resolve) =>
          permissionMiddleware(["categoria.manage:any"])(req, res, resolve),
        );
        if (res.headersSent) return;
        return categoriaController.criar(req, res);

      default:
        return handleMethodNotAllowed(
          res,
          req.method,
          "categoria.index.handler",
        );
    }
  } catch (erro) {
    return handleError(res, erro, "categoria.index.handler");
  }
}
