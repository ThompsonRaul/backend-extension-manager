import fetchCookie from "fetch-cookie";
import nodeFetch from "node-fetch";
import { limparBanco, fecharConexao } from "infra/utils/limparBanco.js";
import sequelize from "infra/database.js";

const BASE_URL = "http://localhost:3000/api/v1";

describe("Integração - Exclusão segura de Usuários e Alunos", () => {
  let fetchSession;
  let alunoId, adminId, atividadeId, participacaoId;

  beforeAll(async () => {
    await limparBanco();
    const seeder = await import("infra/seeders/20251022235301-rbac-seed.js");
    const queryInterface = sequelize.getQueryInterface();
    await seeder.up(queryInterface, sequelize.constructor);
  });

  beforeEach(() => {
    fetchSession = fetchCookie(nodeFetch);
  });

  it("deve registrar um aluno, um professor e um admin", async () => {
    const aluno = await fetchSession(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Lucas Aluno",
        email: "lucas@uesc.br",
        matricula: "ALU100",
        senha: "123456",
        tipo: "aluno",
        dados: { curso: "Engenharia de Computação", semestre: 7 },
      }),
    });
    expect(aluno.status).toBe(201);

    const prof = await fetchSession(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Paula Professora",
        email: "paula@uesc.br",
        matricula: "PROF100",
        senha: "123456",
        tipo: "professor",
        dados: { area: "Computação", departamento: "COLCIC" },
      }),
    });
    expect(prof.status).toBe(201);

    const admin = await fetchSession(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Admin Geral",
        email: "admin@uesc.br",
        matricula: "ADM100",
        senha: "123456",
        tipo: "admin",
      }),
    });
    expect(admin.status).toBe(201);
  });

  it("deve permitir que o professor crie uma atividade", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "paula@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Projeto de Extensão em Robótica",
        semestre: "2025.2",
        carga_horaria_total: 30,
      }),
    });

    const data = await res.json();
    atividadeId = data.atividade.id_atividade;
    expect(res.status).toBe(201);
  });

  it("deve inscrever o aluno na atividade", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "lucas@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/participacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_atividade: atividadeId }),
    });
    const data = await res.json();
    participacaoId = data.participacao.id_participacao;
    expect(res.status).toBe(201);
  });

  it("deve impedir exclusão de aluno com participações vinculadas", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const resUsers = await fetchSession(`${BASE_URL}/usuarios`);
    const dataUsers = await resUsers.json();
    alunoId = dataUsers.usuarios.find(
      (u) => u.email === "lucas@uesc.br",
    ).id_usuario;

    const res = await fetchSession(`${BASE_URL}/usuarios/${alunoId}`, {
      method: "DELETE",
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.erro).toMatch(/participações vinculadas/i);
  });

  it("deve impedir exclusão de atividade com alunos vinculados", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades/${atividadeId}`, {
      method: "DELETE",
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.erro).toMatch(/há alunos vinculados/i);
  });

  it("deve permitir exclusão após remoção de participações", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const resDelPart = await fetchSession(
      `${BASE_URL}/participacoes/${participacaoId}`,
      {
        method: "DELETE",
      },
    );
    expect([200, 204]).toContain(resDelPart.status);

    const resAtv = await fetchSession(`${BASE_URL}/atividades/${atividadeId}`, {
      method: "DELETE",
    });
    expect(resAtv.status).toBe(204);

    const resUser = await fetchSession(`${BASE_URL}/usuarios/${alunoId}`, {
      method: "DELETE",
    });
    expect(resUser.status).toBe(204);
  });

  afterAll(async () => {
    await limparBanco();
    await fecharConexao();
  });
});
