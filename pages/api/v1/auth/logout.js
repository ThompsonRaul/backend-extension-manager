import { logout } from "application/controllers/authController.js";
import {
  handleMethodNotAllowed,
  handleError,
} from "application/errors/errorHandler.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return handleMethodNotAllowed(res, req.method, "auth.logout");
    return logout(req, res);
  } catch (erro) {
    return handleError(res, erro, "auth.logout");
  }
}
