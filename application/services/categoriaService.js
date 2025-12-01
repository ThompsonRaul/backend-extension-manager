import { Categoria } from "infra/models/index.js";
import { createError } from "application/errors/errorHandler.js";
import { registrarAuditoria } from "infra/utils/registrarAuditoria.js";

export async function listarCategorias() {
  const categorias = await Categoria.findAll({
    attributes: ["id_categoria", "nome_categoria", "descricao", "createdAt"],
    order: [["nome_categoria", "ASC"]],
  });
  return categorias;
}

export async function criarCategoria({ nome_categoria, descricao }, usuario) {
  if (!nome_categoria?.trim())
    throw createError("O campo 'nome_categoria' é obrigatório.", 400);

  const existente = await Categoria.findOne({ where: { nome_categoria } });
  if (existente)
    throw createError("Já existe uma categoria com esse nome.", 409);

  const nova = await Categoria.create({
    nome_categoria: nome_categoria.trim(),
    descricao: descricao?.trim() || null,
  });

  await registrarAuditoria({
    acao: "categoria.create",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "categoria",
    id_entidade: nova.id_categoria,
    valor_anterior: null,
    valor_novo: nova.toJSON(),
    descricao: `Categoria criada (${nova.nome_categoria})`,
  });

  return nova;
}

export async function buscarCategoriaPorId(id) {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) throw createError("Categoria não encontrada.", 404);
  return categoria;
}

export async function atualizarCategoria(
  categoria,
  { nome_categoria, descricao },
  usuario,
) {
  if (
    (nome_categoria === undefined || nome_categoria === null) &&
    (descricao === undefined || descricao === null)
  ) {
    throw createError("Informe ao menos um campo para atualizar.", 400);
  }

  const valor_anterior = categoria.toJSON();

  await categoria.update({
    nome_categoria:
      typeof nome_categoria === "string" && nome_categoria.trim().length
        ? nome_categoria.trim()
        : categoria.nome_categoria,
    descricao:
      typeof descricao === "string"
        ? descricao.trim() || null
        : categoria.descricao,
  });

  await registrarAuditoria({
    acao: "categoria.update",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "categoria",
    id_entidade: categoria.id_categoria,
    valor_anterior,
    valor_novo: categoria.toJSON(),
    descricao: `Categoria atualizada (${categoria.nome_categoria})`,
  });

  return categoria;
}

export async function excluirCategoria(categoria, usuario) {
  const valor_anterior = categoria.toJSON();

  await categoria.destroy();

  await registrarAuditoria({
    acao: "categoria.delete",
    usuario: usuario?.id_usuario ? { id_usuario: usuario.id_usuario } : null,
    entidade: "categoria",
    id_entidade: categoria.id_categoria,
    valor_anterior,
    valor_novo: null,
    descricao: `Categoria removida (${categoria.nome_categoria})`,
  });
}
