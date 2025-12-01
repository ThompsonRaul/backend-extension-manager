import {
  Usuario,
  Papel,
  UsuarioPapel,
  Aluno,
  Participacao,
  Professor,
  MembroComissao,
} from "infra/models/index.js";

import { createError } from "application/errors/errorHandler.js";

export async function buscarUsuarioPorId(id) {
  const usuario = await Usuario.findByPk(id, {
    include: [
      {
        model: Papel,
        through: UsuarioPapel,
        as: "papeis",
        attributes: ["nome"],
      },
    ],
  });

  if (!usuario) throw createError("Usuário não encontrado.", 404);

  const papeis = usuario.papeis.map((p) => p.nome);
  const especializacoes = [];

  if (papeis.includes("aluno")) {
    const dados = await Aluno.findByPk(usuario.id_usuario, {
      attributes: ["curso", "semestre", "horas_acumuladas", "horas_restantes"],
    });
    if (dados) especializacoes.push({ tipo: "aluno", dados });
  }

  if (papeis.includes("professor")) {
    const dados = await Professor.findByPk(usuario.id_usuario, {
      attributes: ["area", "departamento"],
    });
    if (dados) especializacoes.push({ tipo: "professor", dados });
  }

  if (papeis.includes("membro_comissao")) {
    const dados = await MembroComissao.findByPk(usuario.id_usuario, {
      attributes: ["funcao", "status", "portaria_designacao"],
    });
    if (dados) especializacoes.push({ tipo: "membro_comissao", dados });
  }

  return {
    id_usuario: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    matricula: usuario.matricula,
    papeis,
    especializacoes,
  };
}

export async function listarUsuarios() {
  const usuarios = await Usuario.findAll({
    include: [
      {
        model: Papel,
        through: UsuarioPapel,
        as: "papeis",
        attributes: ["nome"],
      },
    ],
    order: [["id_usuario", "ASC"]],
  });

  const resposta = [];

  for (const u of usuarios) {
    const papeis = u.papeis.map((p) => p.nome);
    const especializacoes = [];

    if (papeis.includes("aluno")) {
      const dados = await Aluno.findByPk(u.id_usuario, {
        attributes: [
          "curso",
          "semestre",
          "horas_acumuladas",
          "horas_restantes",
        ],
      });
      if (dados) especializacoes.push({ tipo: "aluno", dados });
    }

    if (papeis.includes("professor")) {
      const dados = await Professor.findByPk(u.id_usuario, {
        attributes: ["area", "departamento"],
      });
      if (dados) especializacoes.push({ tipo: "professor", dados });
    }

    if (papeis.includes("membro_comissao")) {
      const dados = await MembroComissao.findByPk(u.id_usuario, {
        attributes: ["funcao", "status", "portaria_designacao"],
      });
      if (dados) especializacoes.push({ tipo: "membro_comissao", dados });
    }

    resposta.push({
      id_usuario: u.id_usuario,
      nome: u.nome,
      email: u.email,
      matricula: u.matricula,
      papeis,
      especializacoes,
    });
  }

  return resposta;
}

export async function atualizarUsuario(usuarioModel, dados) {
  const { nome, email, matricula } = dados;

  if (!nome && !email && !matricula) {
    throw createError("Informe ao menos um campo para atualização.", 400);
  }

  try {
    await usuarioModel.update({
      nome: nome ?? usuarioModel.nome,
      email: email ?? usuarioModel.email,
      matricula: matricula ?? usuarioModel.matricula,
    });

    return usuarioModel;
  } catch (err) {
    if (err.original?.code === "ER_DUP_ENTRY") {
      throw createError(
        "Email ou matrícula já estão em uso por outro usuário.",
        409,
      );
    }

    throw err;
  }
}

export async function excluirUsuario(usuarioModel) {
  if (!usuarioModel) throw createError("Usuário não encontrado.", 404);

  const aluno = await Aluno.findByPk(usuarioModel.id_usuario);

  if (aluno) {
    const vinculos = await Participacao.count({
      where: { id_aluno: usuarioModel.id_usuario },
    });

    if (vinculos > 0) {
      throw createError(
        "Não é possível remover o aluno: há participações vinculadas.",
        400,
      );
    }
  }

  await usuarioModel.destroy();
}
