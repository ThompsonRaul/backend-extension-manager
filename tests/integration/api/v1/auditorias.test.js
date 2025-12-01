import fetchCookie from "fetch-cookie";
import nodeFetch from "node-fetch";
import { limparBanco, fecharConexao } from "infra/utils/limparBanco.js";
import sequelize from "infra/database.js";

const BASE_URL = "http://localhost:3000/api/v1";

describe("Integração - Auditoria do Sistema (Registro, Permissões e Consulta)", () => {
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

  it("deve registrar administrador, professor, aluno e membro da comissão", async () => {
    const usuarios = [
      {
        nome: "Admin Master",
        email: "admin@uesc.br",
        matricula: "ADM001",
        senha: "123456",
        tipo: "admin",
      },
      {
        nome: "Carlos Professor",
        email: "carlos@uesc.br",
        matricula: "PROF001",
        senha: "123456",
        tipo: "professor",
        dados: { area: "Computação", departamento: "COLCIC" },
      },
      {
        nome: "João Aluno",
        email: "joao@uesc.br",
        matricula: "ALU001",
        senha: "123456",
        tipo: "aluno",
        dados: { curso: "Ciência da Computação", semestre: 5 },
      },
      {
        nome: "Maria Comissão",
        email: "maria@uesc.br",
        matricula: "COM001",
        senha: "123456",
        tipo: "membro_comissao",
        dados: { portaria_designacao: "Portaria 01/2025", funcao: "avaliador" },
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

  it("deve registrar uma auditoria quando um administrador excluir uma atividade", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const resCreate = await fetchSession(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Atividade para Teste de Auditoria",
        descricao: "Atividade usada para validar logs de exclusão",
        semestre: "2025.2",
        carga_horaria_total: 10,
      }),
    });

    const dataCreate = await resCreate.json();
    atividadeId = dataCreate.atividade.id_atividade;
    expect(resCreate.status).toBe(201);

    const resDelete = await fetchSession(
      `${BASE_URL}/atividades/${atividadeId}`,
      { method: "DELETE" },
    );

    expect(resDelete.status).toBe(204);

    const resAuditoria = await fetchSession(`${BASE_URL}/auditorias`);
    expect(resAuditoria.status).toBe(200);

    const dataAuditoria = await resAuditoria.json();

    const log = dataAuditoria.auditorias.find(
      (a) => a.acao === "atividade.delete",
    );

    expect(log).toBeDefined();
    expect(log.id_usuario).not.toBeNull();
  });

  it("deve impedir que um membro da comissão edite atividades", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "carlos@uesc.br", senha: "123456" }),
    });

    const resCreate = await fetchSession(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Atividade da Comissão",
        semestre: "2025.2",
        carga_horaria_total: 15,
      }),
    });

    const data = await resCreate.json();
    const id = data.atividade.id_atividade;

    await fetchSession(`${BASE_URL}/auth/logout`, { method: "POST" });

    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "maria@uesc.br", senha: "123456" }),
    });

    const resUpdate = await fetchSession(`${BASE_URL}/atividades/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao: "Tentativa não autorizada" }),
    });

    expect(resUpdate.status).toBe(403);
  });

  it("deve negar acesso a relatórios de auditoria para professor e aluno", async () => {
    const usuarios = [
      { email: "carlos@uesc.br", senha: "123456" },
      { email: "joao@uesc.br", senha: "123456" },
    ];

    for (const u of usuarios) {
      await fetchSession(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });

      const res = await fetchSession(`${BASE_URL}/auditorias`);
      expect(res.status).toBe(403);

      await fetchSession(`${BASE_URL}/auth/logout`, { method: "POST" });
    }
  });

  it("deve permitir que o administrador consulte registros de auditoria e validar dados do log", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/auditorias`);
    expect(res.status).toBe(200);

    const data = await res.json();

    const auditorias = Array.isArray(data.auditorias)
      ? data.auditorias
      : data.auditorias?.registros || [];

    expect(auditorias.length).toBeGreaterThan(0);

    const logExclusao = auditorias.find(
      (a) => a.acao?.toLowerCase() === "atividade.delete",
    );

    expect(logExclusao).toBeDefined();
    expect(logExclusao).toHaveProperty("id_auditoria");
    expect(logExclusao).toHaveProperty("acao", "atividade.delete");
    expect(logExclusao).toHaveProperty("createdAt");
    expect(logExclusao).toHaveProperty("descricao");
    expect(typeof logExclusao.descricao).toBe("string");
  });

  it("deve retornar 401 para consultas de auditoria sem autenticação", async () => {
    const res = await nodeFetch(`${BASE_URL}/auditorias`);
    expect(res.status).toBe(401);
  });

  afterAll(async () => {
    await limparBanco();
    await fecharConexao();
  });
});
