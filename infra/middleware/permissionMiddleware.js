import "infra/models/index.js";
import { Usuario, Papel, Permissao } from "infra/models/index.js";

export function permissionMiddleware(requiredItems = []) {
  return async (req, res, next) => {
    try {
      if (!req.user?.id_usuario || !req.user?.papeis?.length) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
      }

      const userId = req.user.id_usuario;
      const userRoles = req.user.papeis;

      if (requiredItems.some((item) => userRoles.includes(item))) {
        return next();
      }

      const usuario = await Usuario.findByPk(userId, {
        include: [
          {
            model: Papel,
            as: "papeis",
            include: [{ model: Permissao, as: "permissoes" }],
          },
        ],
      });

      if (!usuario) {
        return res.status(401).json({ erro: "Usuário não encontrado." });
      }

      const permissoesUsuario = new Set(
        usuario.papeis.flatMap((p) => p.permissoes.map((perm) => perm.acao)),
      );

      for (const baseItem of requiredItems) {
        if (!baseItem.includes(".")) continue;

        const ownAction = `${baseItem}:own`;
        const anyAction = `${baseItem}:any`;

        if (permissoesUsuario.has(anyAction)) return next();

        if (permissoesUsuario.has(ownAction)) {
          const recurso = req.recurso;
          if (recurso) {
            const idOwner =
              recurso.id_usuario ??
              recurso.id_professor_responsavel ??
              recurso.id_aluno ??
              recurso.id_membro ??
              null;

            if (idOwner && idOwner === userId) return next();
          }
        }

        if (permissoesUsuario.has(baseItem)) return next();
      }

      return res.status(403).json({
        erro: "Acesso negado. Permissão insuficiente.",
        detalhe: { requiredItems },
      });
    } catch (erro) {
      console.error("Erro no permissionMiddleware:", erro);
      return res.status(500).json({ erro: "Erro interno no middleware." });
    }
  };
}
