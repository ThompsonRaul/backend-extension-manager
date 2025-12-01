import fetchCookie from "fetch-cookie";
import nodeFetch from "node-fetch";
import { limparBanco, fecharConexao } from "infra/utils/limparBanco.js";
import sequelize from "infra/database.js";

const BASE_URL = "http://localhost:3000/api/v1";

describe("Integração - Participações e Reflexo no Aluno", () => {
  let fetchSession;
  let atividadeId;
  let participacaoId;
  let alunoId;
  let comprovacaoId;

  beforeAll(async () => {
    await limparBanco();

    const seeder = await import("infra/seeders/20251022235301-rbac-seed.js");
    const queryInterface = sequelize.getQueryInterface();
    await seeder.up(queryInterface, sequelize.constructor);
  });

  beforeEach(() => {
    fetchSession = fetchCookie(nodeFetch);
  });

  it("deve registrar professor, aluno e membro da comissão", async () => {
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
      const res = await fetchSession(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });
      expect(res.status).toBe(201);
    }
  });

  it("professor cria uma nova atividade de extensão", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "carlos@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Hackathon COLCIC",
        descricao: "Evento de programação colaborativa",
        semestre: "2025.2",
        carga_horaria_total: 40,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(201);
    atividadeId = data.atividade.id_atividade;
  });

  it("aluno se inscreve na atividade", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "joao@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/participacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_atividade: atividadeId }),
    });

    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.participacao.status_validacao).toBe("pendente");

    participacaoId = data.participacao.id_participacao;
    alunoId = data.participacao.id_aluno;
  });

  it("aluno envia um comprovante com 15h cumpridas", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "joao@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(`${BASE_URL}/comprovacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_participacao: participacaoId,
        tipo_documento: "certificado",
        caminho_arquivo: "/uploads/certificado.pdf",
        horas_cumpridas: 15,
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.comprovacao.horas_cumpridas).toBe(15);
    comprovacaoId = data.comprovacao.id_comprovacao;
  });

  it("ao validar, deve propagar horas para participação e aluno", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "maria@uesc.br", senha: "123456" }),
    });

    const res = await fetchSession(
      `${BASE_URL}/comprovacoes/${comprovacaoId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_aprovacao: "aceita" }),
      },
    );

    expect(res.status).toBe(200);

    const checkParticipacao = await fetchSession(
      `${BASE_URL}/participacoes/${participacaoId}`,
    );
    const pData = await checkParticipacao.json();

    expect(pData.participacao.horas_validadas).toBe(15);
    expect(pData.participacao.status_validacao).toBe("aprovada");

    expect(pData.participacao.aluno).toBeDefined();
    expect(pData.participacao.aluno.horas_acumuladas).toBe(15);
    expect(pData.participacao.aluno.horas_restantes).toBe(335);
  });

  it("não deve deixar horas_restantes abaixo de zero mesmo com excesso de validação", async () => {
    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "carlos@uesc.br", senha: "123456" }),
    });

    const resAtiv = await fetchSession(`${BASE_URL}/atividades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Maratona de Extensão",
        descricao: "Evento de longa duração para validação de horas",
        semestre: "2025.2",
        carga_horaria_total: 400,
      }),
    });

    expect(resAtiv.status).toBe(201);
    const dataAtiv = await resAtiv.json();
    const novaAtividadeId = dataAtiv.atividade.id_atividade;

    await fetchSession(`${BASE_URL}/auth/logout`, { method: "POST" });

    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "joao@uesc.br", senha: "123456" }),
    });

    const resPart = await fetchSession(`${BASE_URL}/participacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_atividade: novaAtividadeId }),
    });

    expect(resPart.status).toBe(201);
    const dataPart = await resPart.json();
    const novaParticipacaoId = dataPart.participacao.id_participacao;

    const comp = await fetchSession(`${BASE_URL}/comprovacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_participacao: novaParticipacaoId,
        tipo_documento: "certificado",
        caminho_arquivo: "/uploads/certificado2.pdf",
        horas_cumpridas: 400,
      }),
    });

    expect(comp.status).toBe(201);
    const compData = await comp.json();
    const comprovacaoExtraId = compData.comprovacao.id_comprovacao;

    await fetchSession(`${BASE_URL}/auth/logout`, { method: "POST" });

    await fetchSession(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "maria@uesc.br", senha: "123456" }),
    });

    const resValid = await fetchSession(
      `${BASE_URL}/comprovacoes/${comprovacaoExtraId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_aprovacao: "aceita" }),
      },
    );

    expect(resValid.status).toBe(200);

    const checkParticipacao = await fetchSession(
      `${BASE_URL}/participacoes/${novaParticipacaoId}`,
    );
    const pData = await checkParticipacao.json();

    expect(pData.participacao.aluno.horas_acumuladas).toBeGreaterThanOrEqual(
      350,
    );
    expect(pData.participacao.aluno.horas_restantes).toBe(0);
  });

  afterAll(async () => {
    await limparBanco();
    await fecharConexao();
  });
});
