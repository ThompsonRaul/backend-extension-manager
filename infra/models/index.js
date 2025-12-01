import Usuario from "./usuario.js";
import Aluno from "./aluno.js";
import Professor from "./professor.js";
import MembroComissao from "./membroComissao.js";

import Papel from "./papel.js";
import Permissao from "./permissao.js";
import UsuarioPapel from "./usuarioPapel.js";
import PapelPermissao from "./papelPermissao.js";

import Categoria from "./categoria.js";
import AtividadeExtensao from "./atividadeExtensao.js";
import Participacao from "./participacao.js";
import Comprovacao from "./comprovacao.js";

import Auditoria from "./auditoria.js";

import ResponsavelAtividade from "./responsavelAtividade.js";

// ==================================================
// RBAC
// ==================================================
Usuario.belongsToMany(Papel, {
  through: UsuarioPapel,
  as: "papeis",
  foreignKey: "id_usuario",
  otherKey: "id_papel",
});

Papel.belongsToMany(Usuario, {
  through: UsuarioPapel,
  as: "usuarios",
  foreignKey: "id_papel",
  otherKey: "id_usuario",
});

Papel.belongsToMany(Permissao, {
  through: PapelPermissao,
  as: "permissoes",
  foreignKey: "id_papel",
  otherKey: "id_permissao",
});

Permissao.belongsToMany(Papel, {
  through: PapelPermissao,
  as: "papeis",
  foreignKey: "id_permissao",
  otherKey: "id_papel",
});

// ==================================================
// ESPECIALIZAÇÕES DE USUÁRIO
// ==================================================
Aluno.belongsTo(Usuario, { foreignKey: "id_aluno", as: "usuario" });
Professor.belongsTo(Usuario, { foreignKey: "id_professor", as: "usuario" });
MembroComissao.belongsTo(Usuario, { foreignKey: "id_membro", as: "usuario" });

// ==================================================
// CATEGORIA ↔ ATIVIDADE (1:N)
// ==================================================
Categoria.hasMany(AtividadeExtensao, {
  foreignKey: "id_categoria",
  as: "atividades",
});

AtividadeExtensao.belongsTo(Categoria, {
  foreignKey: "id_categoria",
  as: "categoria",
});

// ==================================================
// ATIVIDADE — RESPONSÁVEIS (N:N)
// ==================================================
AtividadeExtensao.belongsToMany(Usuario, {
  as: "responsaveis",
  through: ResponsavelAtividade,
  foreignKey: "id_atividade",
  otherKey: "id_usuario",
});

Usuario.belongsToMany(AtividadeExtensao, {
  as: "atividades_responsavel",
  through: ResponsavelAtividade,
  foreignKey: "id_usuario",
  otherKey: "id_atividade",
});

// ==================================================
// PARTICIPAÇÃO
// ==================================================
Participacao.belongsTo(Aluno, {
  foreignKey: "id_aluno",
  as: "aluno",
});

Participacao.belongsTo(AtividadeExtensao, {
  foreignKey: "id_atividade",
  as: "atividade",
});

// ==================================================
// COMPROVAÇÃO
// ==================================================
Comprovacao.belongsTo(Participacao, {
  foreignKey: "id_participacao",
  as: "participacao",
});

// ==================================================
// AUDITORIA
// ==================================================

Auditoria.belongsTo(Usuario, {
  foreignKey: "id_usuario",
  as: "usuario",
});

Usuario.hasMany(Auditoria, {
  foreignKey: "id_usuario",
  as: "auditorias",
});

export {
  Usuario,
  Aluno,
  Professor,
  MembroComissao,
  Papel,
  Permissao,
  UsuarioPapel,
  PapelPermissao,
  Categoria,
  AtividadeExtensao,
  Participacao,
  Comprovacao,
  Auditoria,
  ResponsavelAtividade,
};
