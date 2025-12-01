"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const papeis = [
      {
        nome: "aluno",
        descricao:
          "Usuário aluno — pode se inscrever, enviar comprovantes e acompanhar progresso.",
      },
      {
        nome: "professor",
        descricao: "Professor responsável por atividades de extensão.",
      },
      {
        nome: "membro_comissao",
        descricao:
          "Membro da comissão de extensão — avalia e valida participações.",
      },
      {
        nome: "admin",
        descricao: "Administrador geral do sistema.",
      },
    ].map((p) => ({ ...p, createdAt: now, updatedAt: now }));

    await queryInterface.bulkInsert("papel", papeis);

    const permissoes = [
      {
        acao: "usuario.read:own",
        descricao: "Ver seus próprios dados de usuário",
      },
      {
        acao: "usuario.update:own",
        descricao: "Atualizar seus próprios dados de usuário",
      },
      { acao: "usuario.read:any", descricao: "Ler qualquer usuário" },
      { acao: "usuario.update:any", descricao: "Editar qualquer usuário" },
      { acao: "usuario.delete:any", descricao: "Excluir usuários" },

      {
        acao: "atividade.create:own",
        descricao: "Criar atividade como responsável",
      },
      { acao: "atividade.read:any", descricao: "Ver qualquer atividade" },
      { acao: "atividade.update:own", descricao: "Editar atividades próprias" },
      { acao: "atividade.update:any", descricao: "Editar qualquer atividade" },
      { acao: "atividade.delete:any", descricao: "Excluir qualquer atividade" },

      {
        acao: "participacao.create:own",
        descricao: "Inscrever-se em atividade de extensão",
      },
      {
        acao: "participacao.read:own",
        descricao: "Visualizar suas próprias participações",
      },
      {
        acao: "participacao.manage:any",
        descricao: "Gerenciar participações de alunos",
      },

      {
        acao: "comprovacao.create:own",
        descricao: "Enviar comprovante de participação",
      },
      {
        acao: "comprovacao.read:own",
        descricao: "Visualizar suas próprias comprovações",
      },
      {
        acao: "comprovacao.manage:any",
        descricao: "Gerenciar comprovações de alunos",
      },

      {
        acao: "categoria.read:any",
        descricao: "Listar categorias de extensão",
      },
      {
        acao: "categoria.manage:any",
        descricao: "Gerenciar categorias de extensão",
      },

      { acao: "auditoria.read:any", descricao: "Visualizar logs de auditoria" },

      { acao: "admin.access", descricao: "Acessar painel administrativo" },
      {
        acao: "admin.manage_roles",
        descricao: "Gerenciar papéis e permissões",
      },
    ].map((p) => ({ ...p, createdAt: now, updatedAt: now }));

    await queryInterface.bulkInsert("permissao", permissoes);

    async function vincular(papel, acoes) {
      await queryInterface.sequelize.query(`
        INSERT INTO papel_permissao (id_papel, id_permissao, createdAt, updatedAt)
        SELECT p.id_papel, pr.id_permissao, NOW(), NOW()
        FROM papel p
        JOIN permissao pr ON pr.acao IN (${acoes.map((a) => `'${a}'`).join(", ")})
        WHERE p.nome = '${papel}';
      `);
    }

    await vincular("aluno", [
      "usuario.read:own",
      "usuario.update:own",
      "atividade.read:any",
      "participacao.create:own",
      "participacao.read:own",
      "comprovacao.create:own",
      "comprovacao.read:own",
      "categoria.read:any",
    ]);

    await vincular("professor", [
      "usuario.read:own",
      "usuario.update:own",
      "atividade.create:own",
      "atividade.update:own",
      "atividade.read:any",
      "categoria.read:any",
    ]);

    await vincular("membro_comissao", [
      "usuario.read:any",
      "usuario.update:own",
      "atividade.read:any",
      "participacao.manage:any",
      "comprovacao.manage:any",
      "categoria.manage:any",
      "categoria.read:any",
      "auditoria.read:any",
    ]);

    await vincular(
      "admin",
      permissoes.map((p) => p.acao),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("papel_permissao", null, {});
    await queryInterface.bulkDelete("permissao", null, {});
    await queryInterface.bulkDelete("papel", null, {});
  },
};
