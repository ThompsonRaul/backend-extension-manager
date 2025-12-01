import * as auditoriaService from "application/services/auditoriaService.js";
import { handleError } from "application/errors/errorHandler.js";

export async function listar(req, res) {
  try {
    const auditorias = await auditoriaService.listarAuditoriasFiltradas(
      req.query,
    );

    return res.status(200).json({
      total: auditorias.length,
      auditorias,
    });
  } catch (erro) {
    return handleError(res, erro, "auditoriaController.listar");
  }
}
