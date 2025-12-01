import fetchCookie from "fetch-cookie";
import nodeFetch from "node-fetch";
import { limparBanco, fecharConexao } from "infra/utils/limparBanco.js";
import sequelize from "infra/database.js";

const BASE_URL = "http://localhost:3000/api/v1";

describe("Integração - Autenticação e Registro de Usuários", () => {
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

  it("deve registrar um usuário do tipo administrador com sucesso", async () => {
    const res = await fetchSession(`${BASE_URL}/auth/register`, {
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

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toHaveProperty("usuario");
    expect(data.usuario.email).toBe("admin@uesc.br");
  });

  it("deve registrar um usuário do tipo professor com sucesso", async () => {
    const res = await fetchSession(`${BASE_URL}/auth/register`, {
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

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.usuario.nome).toBe("Carlos Professor");
  });

  it("deve registrar um usuário do tipo aluno com sucesso", async () => {
    const res = await fetchSession(`${BASE_URL}/auth/register`, {
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

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.usuario.email).toBe("joao@uesc.br");
  });

  it("deve impedir registro com e-mail duplicado", async () => {
    const res = await fetchSession(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Outro Admin",
        email: "admin@uesc.br",
        matricula: "ADM999",
        senha: "123456",
        tipo: "admin",
      }),
    });

    expect(res.status).toBe(409);
  });

  it("deve realizar login com credenciais válidas e armazenar cookie de sessão", async () => {
    const res = await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@uesc.br",
        senha: "123456",
      }),
    });

    expect(res.status).toBe(200);

    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeTruthy();

    const data = await res.json();
    expect(data).toHaveProperty("usuario");
    expect(data.usuario.email).toBe("admin@uesc.br");
  });

  it("deve permitir novo login do mesmo usuário e impedir login de outro usuário enquanto autenticado", async () => {
    const primeiroLogin = await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@uesc.br",
        senha: "123456",
      }),
    });

    expect(primeiroLogin.status).toBe(200);
    const cookie = primeiroLogin.headers.get("set-cookie");
    expect(cookie).toBeTruthy();

    const mesmoUsuarioLogin = await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@uesc.br",
        senha: "123456",
      }),
    });

    expect(mesmoUsuarioLogin.status).toBe(200);
    const dataMesmo = await mesmoUsuarioLogin.json();
    expect(dataMesmo.usuario.email).toBe("admin@uesc.br");
    expect(dataMesmo.usuario.papeis).toContain("admin");
    expect(dataMesmo.mensagem).toMatch(/sessão já ativa/i);

    const outroUsuarioLogin = await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "carlos@uesc.br",
        senha: "123456",
      }),
    });

    expect(outroUsuarioLogin.status).toBe(400);
    const dataOutro = await outroUsuarioLogin.json();
    expect(dataOutro.erro).toMatch(/já existe.*autenticado/i);

    const resLogout = await fetchSession(`${BASE_URL}/auth/logout`, {
      method: "POST",
    });
    expect(resLogout.status).toBe(200);
  });

  it("deve rejeitar login com credenciais incorretas", async () => {
    const res = await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@uesc.br",
        senha: "senha_incorreta",
      }),
    });

    expect(res.status).toBe(401);
  });

  it("deve permitir acesso a rota autenticada após login", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@uesc.br",
        senha: "123456",
      }),
    });

    const res = await fetchSession(`${BASE_URL}/usuarios`);
    expect(res.status).toBe(200);
  });

  it("deve negar acesso a rota protegida sem autenticação", async () => {
    const res = await fetchSession(`${BASE_URL}/usuarios`);
    expect(res.status).toBe(401);
  });

  it("deve encerrar sessão e remover cookie de autenticação", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@uesc.br",
        senha: "123456",
      }),
    });

    const resLogout = await fetchSession(`${BASE_URL}/auth/logout`, {
      method: "POST",
    });

    expect(resLogout.status).toBe(200);
  });

  it("deve confirmar que todos os usuários possuem seus papéis corretos via API", async () => {
    const loginAdmin = await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@uesc.br",
        senha: "123456",
      }),
    });
    expect(loginAdmin.status).toBe(200);
    const dataAdmin = await loginAdmin.json();
    expect(dataAdmin.usuario.email).toBe("admin@uesc.br");
    expect(dataAdmin.usuario.papeis).toContain("admin");

    const logoutAdmin = await fetchSession(`${BASE_URL}/auth/logout`, {
      method: "POST",
    });
    expect(logoutAdmin.status).toBe(200);

    const loginProf = await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "carlos@uesc.br",
        senha: "123456",
      }),
    });
    expect(loginProf.status).toBe(200);
    const dataProf = await loginProf.json();
    expect(dataProf.usuario.email).toBe("carlos@uesc.br");
    expect(dataProf.usuario.papeis).toContain("professor");

    const logoutProf = await fetchSession(`${BASE_URL}/auth/logout`, {
      method: "POST",
    });
    expect(logoutProf.status).toBe(200);

    const loginAluno = await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "joao@uesc.br",
        senha: "123456",
      }),
    });
    expect(loginAluno.status).toBe(200);
    const dataAluno = await loginAluno.json();
    expect(dataAluno.usuario.email).toBe("joao@uesc.br");
    expect(dataAluno.usuario.papeis).toContain("aluno");
  });

  afterAll(async () => {
    await limparBanco();
    await fecharConexao();
  });
});
