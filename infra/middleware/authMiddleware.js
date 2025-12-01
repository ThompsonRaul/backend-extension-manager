import jwt from "jsonwebtoken";
import "infra/models/index.js";
import { Usuario, Papel, UsuarioPapel } from "infra/models/index.js";

export async function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ erro: "Usuário não autenticado." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id_usuario;

    const usuario = await Usuario.findByPk(userId, {
      include: [{ model: Papel, through: UsuarioPapel, as: "papeis" }],
    });

    if (!usuario)
      return res.status(401).json({ erro: "Usuário não encontrado." });

    req.user = {
      id_usuario: usuario.id_usuario,
      papeis: usuario.papeis.map((p) => p.nome),
    };

    next();
  } catch (erro) {
    console.error("Erro no authMiddleware:", erro);
    return res.status(403).json({ erro: "Token inválido ou expirado." });
  }
}
