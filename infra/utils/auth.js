import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "infra/config/config.js";

const { secret, expiresIn } = config.jwt;
const { saltRounds } = config.bcrypt;

if (!secret && config.app.env === "development") {
  console.warn("[auth.js] JWT_SECRET não definido! Usando valor temporário.");
}

export async function gerarHashSenha(senha) {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(senha, salt);
}

export async function verificarSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

export function gerarToken(payload) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verificarToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}
