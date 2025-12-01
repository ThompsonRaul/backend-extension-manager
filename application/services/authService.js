import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sequelize from "infra/database.js";
import { config } from "infra/config/config.js";
import {
  Usuario,
  UsuarioPapel,
  Papel,
  Aluno,
  Professor,
  MembroComissao,
} from "infra/models/index.js";
import { createError } from "application/errors/errorHandler.js";
import { registrarAuditoria } from "infra/utils/registrarAuditoria.js";

const { jwt: jwtConfig, bcrypt: bcryptConfig } = config;

export async function login({ email, senha, tokenExistente }) {
  if (!email || !senha)
    throw createError("Email e senha são obrigatórios.", 400);

  if (tokenExistente) {
    try {
      const payload = jwt.verify(tokenExistente, jwtConfig.secret);
      const usuario = await Usuario.findByPk(payload.id_usuario, {
        include: { model: Papel, as: "papeis" },
      });

      if (usuario?.email === email.toLowerCase()) {
        await registrarAuditoria({
          acao: "auth.login_sucesso",
          usuario: { id_usuario: usuario.id_usuario },
          entidade: "usuario",
          id_entidade: usuario.id_usuario,
          valor_novo: {
            email: usuario.email,
            papeis: payload.papeis,
            via_token_existente: true,
          },
          descricao: "Sessão já ativa via token existente.",
        });

        return {
          sessaoAtiva: true,
          usuarioAutenticado: {
            nome: usuario.nome,
            email: usuario.email,
            papeis: payload.papeis,
          },
        };
      }

      throw createError("Já existe um usuário autenticado.", 400);
    } catch (err) {
      if (!["TokenExpiredError", "JsonWebTokenError"].includes(err.name))
        throw err;
    }
  }

  const usuario = await Usuario.findOne({
    where: { email: email.toLowerCase() },
    include: { model: Papel, through: UsuarioPapel, as: "papeis" },
  });

  if (!usuario) {
    await registrarAuditoria({
      acao: "auth.login_falha",
      entidade: "auth",
      descricao: `Tentativa de login — usuário ${email} não encontrado.`,
    });

    throw createError("Usuário não encontrado.", 404);
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaValida) {
    await registrarAuditoria({
      acao: "auth.login_falha",
      usuario: { id_usuario: usuario.id_usuario },
      entidade: "usuario",
      id_entidade: usuario.id_usuario,
      descricao: `Tentativa de login — senha incorreta para ${email}.`,
    });

    throw createError("Senha incorreta.", 401);
  }

  const papeis = usuario.papeis.map((p) => p.nome);

  const tokenJWT = jwt.sign(
    { id_usuario: usuario.id_usuario, papeis },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn },
  );

  await registrarAuditoria({
    acao: "auth.login_sucesso",
    usuario: { id_usuario: usuario.id_usuario },
    entidade: "usuario",
    id_entidade: usuario.id_usuario,
    valor_novo: {
      email: usuario.email,
      papeis,
    },
    descricao: "Login realizado com sucesso.",
  });

  return {
    tokenJWT,
    usuarioAutenticado: {
      nome: usuario.nome,
      email: usuario.email,
      papeis,
    },
  };
}

export async function logout(usuario) {
  const cookie = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
    config.app.isProduction ? "; Secure" : ""
  }`;

  if (usuario?.id_usuario) {
    await registrarAuditoria({
      acao: "auth.logout",
      usuario: { id_usuario: usuario.id_usuario },
      entidade: "usuario",
      id_entidade: usuario.id_usuario,
      descricao: "Usuário realizou logout.",
    });
  }

  return { cookie, mensagem: "Logout realizado com sucesso." };
}

export async function register({
  nome,
  email,
  senha,
  matricula,
  tipo,
  dados = {},
}) {
  if (!nome || !email || !senha || !tipo)
    throw createError("Campos obrigatórios auscentes.", 400);

  const transacao = await sequelize.transaction();
  try {
    const usuarioExistente = await Usuario.findOne({
      where: { email: email.toLowerCase() },
      transaction: transacao,
    });
    if (usuarioExistente) throw createError("Email já cadastrado.", 409);

    if (matricula) {
      const matriculaExistente = await Usuario.findOne({
        where: { matricula },
        transaction: transacao,
      });

      if (matriculaExistente)
        throw createError("Matrícula já cadastrada.", 409);
    }

    const senhaHash = await bcrypt.hash(senha, bcryptConfig.saltRounds);

    const novoUsuario = await Usuario.create(
      {
        nome,
        email: email.toLowerCase(),
        matricula: matricula || null,
        senha_hash: senhaHash,
      },
      { transaction: transacao },
    );

    const tiposPapeis = Array.isArray(tipo) ? tipo : [tipo];

    if (tiposPapeis.includes("aluno") && tiposPapeis.length > 1)
      throw createError("Aluno não pode acumular outros papéis.", 400);

    if (
      tiposPapeis.includes("membro_comissao") &&
      tiposPapeis.length > 1 &&
      !tiposPapeis.includes("professor")
    )
      throw createError(
        "Membro da comissão só pode acumular papel de professor.",
        400,
      );

    for (const nomePapel of tiposPapeis) {
      const papel = await Papel.findOne({
        where: { nome: nomePapel },
        transaction: transacao,
      });

      if (!papel) throw createError(`Papel '${nomePapel}' inválido.`, 400);

      await UsuarioPapel.create(
        { id_usuario: novoUsuario.id_usuario, id_papel: papel.id_papel },
        { transaction: transacao },
      );
    }

    if (tiposPapeis.includes("aluno")) {
      if (!dados.curso)
        throw createError("Campo 'curso' é obrigatório para alunos.", 400);

      await Aluno.create(
        {
          id_aluno: novoUsuario.id_usuario,
          curso: dados.curso,
          semestre: dados.semestre || 1,
        },
        { transaction: transacao },
      );
    }

    if (tiposPapeis.includes("professor")) {
      await Professor.create(
        {
          id_professor: novoUsuario.id_usuario,
          area: dados.area || null,
          departamento: dados.departamento || null,
        },
        { transaction: transacao },
      );
    }

    if (tiposPapeis.includes("membro_comissao")) {
      if (!dados.portaria_designacao)
        throw createError("Campo 'portaria_designacao' é obrigatório.", 400);

      await MembroComissao.create(
        {
          id_membro: novoUsuario.id_usuario,
          portaria_designacao: dados.portaria_designacao,
          funcao: dados.funcao || "membro",
        },
        { transaction: transacao },
      );
    }

    await transacao.commit();

    const usuarioCriado = await Usuario.findByPk(novoUsuario.id_usuario, {
      attributes: ["id_usuario", "nome", "email", "matricula"],
      include: [
        {
          model: Papel,
          as: "papeis",
          attributes: ["nome"],
          through: { attributes: [] },
        },
      ],
    });

    const papeisArray = usuarioCriado.papeis.map((p) => p.nome);

    await registrarAuditoria({
      acao: "usuario.register",
      usuario: { id_usuario: novoUsuario.id_usuario },
      entidade: "usuario",
      id_entidade: novoUsuario.id_usuario,
      valor_novo: {
        nome: usuarioCriado.nome,
        email: usuarioCriado.email,
        matricula: usuarioCriado.matricula,
        papeis: papeisArray,
      },
      descricao: "Criação de novo usuário no sistema.",
    });

    return {
      mensagem: "Usuário registrado com sucesso.",
      usuario: {
        nome: usuarioCriado.nome,
        email: usuarioCriado.email,
        matricula: usuarioCriado.matricula,
        papeis: papeisArray,
      },
    };
  } catch (err) {
    if (!transacao.finished) await transacao.rollback();
    throw err.isAppError ? err : createError("Erro interno no registro.", 500);
  }
}
