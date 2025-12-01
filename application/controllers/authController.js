import * as authService from "application/services/authService.js";

export async function login(req, res) {
  try {
    const { email, senha } = req.body;
    const tokenExistente = req.cookies?.token || null;

    const resultado = await authService.login({ email, senha, tokenExistente });

    if (resultado.sessaoAtiva) {
      return res.status(200).json({
        mensagem: "Sessão já ativa.",
        usuario: resultado.usuarioAutenticado,
      });
    }

    res.setHeader(
      "Set-Cookie",
      `token=${resultado.tokenJWT}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",
      usuario: resultado.usuarioAutenticado,
    });
  } catch (erro) {
    const status = erro.statusCode || 500;
    return res.status(status).json({
      erro: erro.message || "Erro no login.",
    });
  }
}

export async function logout(req, res) {
  try {
    const { cookie, mensagem } = await authService.logout(req.user);

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({ mensagem });
  } catch (erro) {
    const status = erro.statusCode || 500;
    return res.status(status).json({
      erro: erro.message || "Erro no logout.",
    });
  }
}

export async function register(req, res) {
  try {
    const resultado = await authService.register(req.body);

    return res.status(201).json({
      mensagem: resultado.mensagem,
      usuario: resultado.usuario,
    });
  } catch (erro) {
    const status = erro.statusCode || 500;
    return res.status(status).json({
      erro: erro.message || "Erro no registro.",
    });
  }
}
