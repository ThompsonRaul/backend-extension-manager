export function createError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isAppError = true;
  return err;
}

export function handleError(res, error, context = "") {
  const status = error.statusCode || 500;
  const origem = context ? `[${context}]` : "";
  console.error(`${origem} ${error.message}`);

  if (error.isAppError) {
    return res.status(status).json({ erro: error.message });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      erro: "Dados inválidos.",
      detalhes: error.errors,
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }

  return res.status(500).json({
    erro: "Erro interno no servidor.",
  });
}

export function handleMethodNotAllowed(res, method, context = "") {
  console.warn(`[${context}] Método não permitido: ${method}`);
  return res
    .status(405)
    .json({ erro: `Método ${method} não permitido neste endpoint.` });
}

export function handleNotFound(res, context = "") {
  console.warn(`[${context}] Rota não encontrada.`);
  return res.status(404).json({ erro: "Rota não encontrada." });
}
