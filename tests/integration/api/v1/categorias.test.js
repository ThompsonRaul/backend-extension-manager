import fetchCookie from "fetch-cookie";
import nodeFetch from "node-fetch";
import { limparBanco, fecharConexao } from "infra/utils/limparBanco.js";
import sequelize from "infra/database.js";

const BASE_URL = "http://localhost:3000/api/v1";

describe("Integração - Categorias de Extensão (versão detalhada)", () => {
  let fetchSession;

  beforeAll(async () => {
    await limparBanco();

    const seeder = await import("infra/seeders/20251022235301-rbac-seed.js");
    const queryInterface = sequelize.getQueryInterface();
    await seeder.up(queryInterface, sequelize.constructor);
  });

  beforeEach(() => {
    fetchSession = fetchCookie(nodeFetch);
  });

  it("deve registrar admin e aluno para os testes seguintes", async () => {
    const usuarios = [
      {
        nome: "Admin Master",
        email: "admin@uesc.br",
        matricula: "ADM001",
        senha: "123456",
        tipo: "admin",
      },
      {
        nome: "João Aluno",
        email: "joao@uesc.br",
        matricula: "ALU001",
        senha: "123456",
        tipo: "aluno",
        dados: { curso: "Computação", semestre: 3 },
      },
    ];

    for (const u of usuarios) {
      const res = await fetchSession(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });
      expect(res.status).toBe(201);
    }
  });

  it("deve impedir que o admin crie uma categoria fora das opções oficiais", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome_categoria: "Educação Ambiental" }),
    });

    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.erro || data.mensagem).toBeDefined();
  });

  it("deve permitir que o admin crie uma categoria válida (Programa, Projeto, Curso ou Evento)", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome_categoria: "Projeto" }),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data).toHaveProperty("mensagem");
    expect(data).toHaveProperty("categoria");
    expect(data.categoria).toHaveProperty("nome_categoria", "Projeto");
  });

  it("deve impedir que um aluno crie uma categoria", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "joao@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome_categoria: "Evento" }),
    });

    expect(res.status).toBe(403);
  });

  it("deve impedir duplicidade de categorias", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome_categoria: "Projeto" }),
    });

    expect(res.status).toBe(409);
  });

  it("deve listar todas as categorias disponíveis", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/categorias`, {
      method: "GET",
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.categorias)).toBe(true);
    expect(data.categorias[0]).toHaveProperty("nome_categoria");
  });

  it("deve impedir que um aluno exclua uma categoria", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "joao@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/categorias/1`, {
      method: "DELETE",
    });

    expect(res.status).toBe(403);
  });

  it("deve permitir que o admin exclua uma categoria existente", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/categorias/1`, {
      method: "DELETE",
    });

    expect([200, 204]).toContain(res.status);

    const check = await fetchSession(`${BASE_URL}/categorias`, {
      method: "GET",
    });
    const data = await check.json();

    const existe = Array.isArray(data.categorias)
      ? data.categorias.find((c) => c.id_categoria === 1)
      : data.find((c) => c.id_categoria === 1);

    expect(existe).toBeUndefined();
  });

  afterAll(async () => {
    await limparBanco();
    await fecharConexao();
  });
});
