import * as categoriaService from "application/services/categoriaService.js";
import { handleError } from "application/errors/errorHandler.js";

export async function listar(req, res) {
  try {
    const categorias = await categoriaService.listarCategorias();

    return res.status(200).json({
      categorias: categorias.map((categoria) => {
        const { id_categoria, nome_categoria, descricao } = categoria;
        return { id_categoria, nome_categoria, descricao };
      }),
    });
  } catch (erro) {
    return handleError(res, erro, "categoriaController.listar");
  }
}

export async function criar(req, res) {
  try {
    const nova = await categoriaService.criarCategoria(req.body, req.user);

    const { id_categoria, nome_categoria, descricao } = nova;

    return res.status(201).json({
      mensagem: "Categoria criada com sucesso.",
      categoria: {
        id_categoria,
        nome_categoria,
        descricao,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "categoriaController.criar");
  }
}

export async function buscar(req, res) {
  try {
    const categoria = await categoriaService.buscarCategoriaPorId(req.query.id);

    const { id_categoria, nome_categoria, descricao } = categoria;

    return res.status(200).json({
      categoria: {
        id_categoria,
        nome_categoria,
        descricao,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "categoriaController.buscar");
  }
}

export async function atualizar(req, res) {
  try {
    const categoria = await categoriaService.buscarCategoriaPorId(req.query.id);

    const atualizada = await categoriaService.atualizarCategoria(
      categoria,
      req.body,
      req.user,
    );

    const { id_categoria, nome_categoria, descricao } = atualizada;

    return res.status(200).json({
      mensagem: "Categoria atualizada com sucesso.",
      categoria: {
        id_categoria,
        nome_categoria,
        descricao,
      },
    });
  } catch (erro) {
    return handleError(res, erro, "categoriaController.atualizar");
  }
}

export async function excluir(req, res) {
  try {
    const categoria = await categoriaService.buscarCategoriaPorId(req.query.id);

    await categoriaService.excluirCategoria(categoria, req.user);

    return res.status(204).end();
  } catch (erro) {
    return handleError(res, erro, "categoriaController.excluir");
  }
}
