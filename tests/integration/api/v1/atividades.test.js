import fetchCookie from "fetch-cookie";
import nodeFetch from "node-fetch";
import { limparBanco, fecharConexao } from "infra/utils/limparBanco.js";
import sequelize from "infra/database.js";

const BASE_URL = "http://localhost:3000/api/v1";

describe("Integração - Fluxo de Atividades de Extensão (CRUD e RBAC)", () => {
  let fetchSession;
  let atividadeId;

  beforeAll(async () => {
    await limparBanco();
    const seeder = await import("infra/seeders/20251022235301-rbac-seed.js");
    const queryInterface = sequelize.getQueryInterface();
    await seeder.up(queryInterface, sequelize.constructor);
  });

  beforeEach(() => {
    fetchSession = fetchCookie(nodeFetch);
  });

  it("deve registrar um professor e um administrador com sucesso", async () => {
    const resProf = await fetchSession(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Carlos Professor",
        email: "carlos@uesc.br",
        matricula: "PROF001",
        senha: "123456",
        tipo: "professor",
        dados: { area: "Computação", departamento: "COLCIC" },
      }),
    });
    expect(resProf.status).toBe(201);

    const resAdmin = await fetchSession(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Admin Master",
        email: "admin@uesc.br",
        matricula: "ADM001",
        senha: "123456",
        tipo: "admin",
      }),
    });
    expect(resAdmin.status).toBe(201);
  });

  it("deve permitir que um professor crie uma nova atividade de extensão", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "carlos@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Oficina de Robótica Educacional",
        descricao: "Atividade prática com kits LEGO EV3",
        semestre: "2025.2",
        carga_horaria_total: 20,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data).toHaveProperty("atividade");
    atividadeId = data.atividade.id_atividade;
  });

  it("deve impedir que um aluno crie uma atividade", async () => {
    await fetchSession(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "João Aluno",
        email: "joao@uesc.br",
        matricula: "ALU001",
        senha: "123456",
        tipo: "aluno",
        dados: { curso: "Ciência da Computação", semestre: 5 },
      }),
    });

    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "joao@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Atividade Indevida",
        semestre: "2025.2",
        carga_horaria_total: 10,
      }),
    });

    expect(res.status).toBe(403);
  });

  it("deve listar atividades disponíveis para qualquer usuário autenticado", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "joao@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.atividades)).toBe(true);
  });

  it("deve permitir que o administrador atualize uma atividade existente", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades/${atividadeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao: "Atividade atualizada pelo administrador.",
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.atividade.descricao).toBe(
      "Atividade atualizada pelo administrador.",
    );
  });

  it("deve permitir que o professor responsável edite sua própria atividade", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "carlos@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades/${atividadeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao: "Edição realizada pelo professor responsável.",
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.atividade.descricao).toBe(
      "Edição realizada pelo professor responsável.",
    );
  });

  it("deve impedir que um professor exclua atividade criada por outro docente", async () => {
    await fetchSession(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Outro Professor",
        email: "outro@uesc.br",
        matricula: "PROF002",
        senha: "123456",
        tipo: "professor",
        dados: { area: "Computação", departamento: "COLCIC" },
      }),
    });

    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "outro@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades/${atividadeId}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(403);
  });

  it("deve permitir que apenas administradores removam atividades", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades/${atividadeId}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
  });

  it("deve registrar automaticamente logs de auditoria em criações e atualizações", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const resAud = await fetchSession(`${BASE_URL}/auditorias`);
    const data = await resAud.json();
    expect(resAud.status).toBe(200);
    expect(Array.isArray(data.auditorias)).toBe(true);
  });

  afterAll(async () => {
    await limparBanco();
    await fecharConexao();
  });
});
