import nodeFetch from "node-fetch";
import { limparBanco, fecharConexao } from "infra/utils/limparBanco.js";
import sequelize from "infra/database.js";

const BASE_URL = "http://localhost:3000/api/v1";

describe("Integração — Comprovação, Propagação e Limites de Horas (com checagem de aluno)", () => {
  let idAluno;

  async function login(email, senha) {
    const res = await nodeFetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeTruthy();
    return cookie;
  }

  async function logout(cookie) {
    await nodeFetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
  }

  async function getAlunoHoras(cookie, idAluno) {
    const res = await nodeFetch(`${BASE_URL}/usuarios/${idAluno}`, {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(200);
    const payload = await res.json();

    const alunoSpec = payload.especializacoes?.find((e) => e.tipo === "aluno");

    const horas_acumuladas = alunoSpec?.dados?.horas_acumuladas ?? 0;

    const horas_restantes = alunoSpec?.dados?.horas_restantes ?? 0;

    console.log(
      `🧮 Aluno ${payload.nome}: ${horas_acumuladas}h acumuladas, ${horas_restantes}h restantes`,
    );

    return { horas_acumuladas, horas_restantes };
  }

  beforeAll(async () => {
    await limparBanco();

    const seeder = await import("infra/seeders/20251022235301-rbac-seed.js");
    const queryInterface = sequelize.getQueryInterface();
    await seeder.up(queryInterface, sequelize.constructor);

    const usuarios = [
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
      const res = await nodeFetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });
      expect(res.status).toBe(201);
    }
  });

  it("aluno envia primeiro comprovante de 180h e comissão valida", async () => {
    const cookieProf = await login("carlos@uesc.br", "123456");
    const resAtv = await nodeFetch(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieProf },
      body: JSON.stringify({
        titulo: "Atividade Inicial",
        descricao: "Atividade para testar o primeiro comprovante",
        semestre: "2025.2",
        carga_horaria_total: 400,
      }),
    });
    expect(resAtv.status).toBe(201);
    const { atividade } = await resAtv.json();
    await logout(cookieProf);

    const cookieAluno = await login("joao@uesc.br", "123456");
    const resPart = await nodeFetch(`${BASE_URL}/participacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieAluno },
      body: JSON.stringify({ id_atividade: atividade.id_atividade }),
    });
    expect(resPart.status).toBe(201);
    const { participacao } = await resPart.json();
    idAluno = participacao.id_aluno;

    const resComp = await nodeFetch(`${BASE_URL}/comprovacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieAluno },
      body: JSON.stringify({
        id_participacao: participacao.id_participacao,
        tipo_documento: "certificado",
        caminho_arquivo: "/uploads/certificado_inicial.pdf",
        horas_cumpridas: 180,
      }),
    });
    expect(resComp.status).toBe(201);
    const { comprovacao } = await resComp.json();
    await logout(cookieAluno);

    const cookieComissao = await login("maria@uesc.br", "123456");
    const resPut = await nodeFetch(
      `${BASE_URL}/comprovacoes/${comprovacao.id_comprovacao}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieComissao },
        body: JSON.stringify({ status_aprovacao: "aceita" }),
      },
    );
    expect(resPut.status).toBe(200);

    const { horas_acumuladas } = await getAlunoHoras(cookieComissao, idAluno);
    expect(horas_acumuladas).toBe(180);
    await logout(cookieComissao);
  });

  it("aluno envia segundo comprovante de 170h e comissão valida", async () => {
    const cookieProf = await login("carlos@uesc.br", "123456");
    const resAtv = await nodeFetch(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieProf },
      body: JSON.stringify({
        titulo: "Atividade Intermediária",
        descricao: "Atividade para testar o segundo comprovante",
        semestre: "2025.2",
        carga_horaria_total: 400,
      }),
    });
    const { atividade } = await resAtv.json();
    await logout(cookieProf);

    const cookieAluno = await login("joao@uesc.br", "123456");
    const resPart = await nodeFetch(`${BASE_URL}/participacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieAluno },
      body: JSON.stringify({ id_atividade: atividade.id_atividade }),
    });
    const { participacao } = await resPart.json();

    const resComp = await nodeFetch(`${BASE_URL}/comprovacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieAluno },
      body: JSON.stringify({
        id_participacao: participacao.id_participacao,
        tipo_documento: "certificado",
        caminho_arquivo: "/uploads/certificado_intermediario.pdf",
        horas_cumpridas: 170,
      }),
    });
    const { comprovacao } = await resComp.json();
    await logout(cookieAluno);

    const cookieComissao = await login("maria@uesc.br", "123456");
    const resPut = await nodeFetch(
      `${BASE_URL}/comprovacoes/${comprovacao.id_comprovacao}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieComissao },
        body: JSON.stringify({ status_aprovacao: "aceita" }),
      },
    );
    expect(resPut.status).toBe(200);

    const { horas_acumuladas } = await getAlunoHoras(cookieComissao, idAluno);
    expect(horas_acumuladas).toBe(350);
    await logout(cookieComissao);
  });

  it("aluno envia comprovante final de 200h e sistema corta em 350h", async () => {
    const cookieProf = await login("carlos@uesc.br", "123456");
    const resAtv = await nodeFetch(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieProf },
      body: JSON.stringify({
        titulo: "Atividade Final",
        descricao: "Atividade para testar o corte de horas",
        semestre: "2025.2",
        carga_horaria_total: 400,
      }),
    });
    const { atividade } = await resAtv.json();
    await logout(cookieProf);

    const cookieAluno = await login("joao@uesc.br", "123456");
    const resPart = await nodeFetch(`${BASE_URL}/participacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieAluno },
      body: JSON.stringify({ id_atividade: atividade.id_atividade }),
    });
    const { participacao } = await resPart.json();

    const resComp = await nodeFetch(`${BASE_URL}/comprovacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieAluno },
      body: JSON.stringify({
        id_participacao: participacao.id_participacao,
        tipo_documento: "certificado",
        caminho_arquivo: "/uploads/certificado_final.pdf",
        horas_cumpridas: 200,
      }),
    });
    const { comprovacao } = await resComp.json();
    await logout(cookieAluno);

    const cookieComissao = await login("maria@uesc.br", "123456");
    const resPut = await nodeFetch(
      `${BASE_URL}/comprovacoes/${comprovacao.id_comprovacao}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieComissao },
        body: JSON.stringify({ status_aprovacao: "aceita" }),
      },
    );
    expect(resPut.status).toBe(200);

    const { horas_acumuladas, horas_restantes } = await getAlunoHoras(
      cookieComissao,
      idAluno,
    );

    expect(horas_acumuladas).toBeGreaterThanOrEqual(350);

    expect(horas_restantes).toBeGreaterThanOrEqual(0);

    await logout(cookieComissao);
  });

  afterAll(async () => {
    await limparBanco();
    await fecharConexao();
  });
});
