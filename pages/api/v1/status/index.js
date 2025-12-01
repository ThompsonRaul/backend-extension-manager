import { verificar } from "application/controllers/statusController.js";
import {
  handleError,
  handleMethodNotAllowed,
} from "application/errors/errorHandler.js";

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        return verificar(req, res);
      default:
        return handleMethodNotAllowed(res, req.method, "status.handler");
    }
  } catch (erro) {
    return handleError(res, erro, "status.handler");
  }
}
