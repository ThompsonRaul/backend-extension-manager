import * as statusService from "application/services/statusService.js";
import { handleError } from "application/errors/errorHandler.js";

export async function verificar(req, res) {
  try {
    const updated_at = new Date().toISOString();
    const database = await statusService.obterStatusBanco();

    return res.status(200).json({
      updated_at,
      dependencies: { database },
    });
  } catch (erro) {
    return handleError(res, erro, "statusController.verificar");
  }
}
