"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tsCreate = {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    };
    const tsUpdate = {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      ),
    };
    const tsDelete = {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    };

    // =========================
    // USUARIO
    // =========================
    await queryInterface.createTable("usuario", {
      id_usuario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      matricula: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      senha_hash: { type: Sequelize.STRING(255), allowNull: false },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    // =========================
    // PAPEL
    // =========================
    await queryInterface.createTable("papel", {
      id_papel: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: { type: Sequelize.STRING(50), allowNull: false },
      descricao: Sequelize.TEXT,
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    await queryInterface.addConstraint("papel", {
      fields: ["nome"],
      type: "unique",
      name: "unique_papel_nome",
    });

    // =========================
    // PERMISSAO
    // =========================
    await queryInterface.createTable("permissao", {
      id_permissao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      acao: { type: Sequelize.STRING(100), allowNull: false },
      descricao: Sequelize.TEXT,
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    await queryInterface.addConstraint("permissao", {
      fields: ["acao"],
      type: "unique",
      name: "unique_permissao_acao",
    });

    // =========================
    // USUARIO_PAPEL
    // =========================
    await queryInterface.createTable("usuario_papel", {
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "usuario", key: "id_usuario" },
        onDelete: "CASCADE",
      },
      id_papel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "papel", key: "id_papel" },
        onDelete: "CASCADE",
      },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    await queryInterface.addConstraint("usuario_papel", {
      fields: ["id_usuario", "id_papel"],
      type: "primary key",
      name: "pk_usuario_papel",
    });

    // =========================
    // PAPEL_PERMISSAO
    // =========================
    await queryInterface.createTable("papel_permissao", {
      id_papel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "papel", key: "id_papel" },
        onDelete: "CASCADE",
      },
      id_permissao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "permissao", key: "id_permissao" },
        onDelete: "CASCADE",
      },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    await queryInterface.addConstraint("papel_permissao", {
      fields: ["id_papel", "id_permissao"],
      type: "primary key",
      name: "pk_papel_permissao",
    });

    // =========================
    // AUDITORIA
    // =========================

    await queryInterface.createTable("auditoria", {
      id_auditoria: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "usuario", key: "id_usuario" },
        onDelete: "SET NULL",
      },

      entidade: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },

      id_entidade: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      acao: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      valor_anterior: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      valor_novo: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: tsCreate,
    });

    // =========================
    // ALUNO
    // =========================
    await queryInterface.createTable("aluno", {
      id_aluno: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: "usuario", key: "id_usuario" },
        onDelete: "CASCADE",
      },
      curso: { type: Sequelize.STRING(100), allowNull: false },
      semestre: { type: Sequelize.INTEGER, allowNull: false },
      status: {
        type: Sequelize.ENUM("ativo", "inativo", "formado"),
        allowNull: false,
        defaultValue: "ativo",
      },
      horas_acumuladas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      horas_restantes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 350,
      },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    // =========================
    // PROFESSOR
    // =========================
    await queryInterface.createTable("professor", {
      id_professor: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: "usuario", key: "id_usuario" },
        onDelete: "CASCADE",
      },
      area: { type: Sequelize.STRING(100), allowNull: false },
      departamento: { type: Sequelize.STRING(100), allowNull: false },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    // =========================
    // MEMBRO_COMISSAO
    // =========================
    await queryInterface.createTable("membro_comissao", {
      id_membro: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: "usuario", key: "id_usuario" },
        onDelete: "CASCADE",
      },
      portaria_designacao: { type: Sequelize.STRING(100), allowNull: false },
      funcao: {
        type: Sequelize.ENUM(
          "coordenador",
          "avaliador",
          "secretario",
          "membro",
        ),
        allowNull: false,
        defaultValue: "membro",
      },
      data_inicio: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal("CURRENT_DATE"),
      },
      data_fim: { type: Sequelize.DATEONLY, allowNull: true },
      status: {
        type: Sequelize.ENUM("ativo", "inativo"),
        allowNull: false,
        defaultValue: "ativo",
      },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    // =========================
    // CATEGORIA
    // =========================
    await queryInterface.createTable("categoria", {
      id_categoria: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome_categoria: {
        type: Sequelize.ENUM("Programa", "Projeto", "Curso", "Evento"),
        allowNull: false,
      },

      descricao: Sequelize.TEXT,
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    // =========================
    // ATIVIDADE
    // =========================
    await queryInterface.createTable("atividade_extensao", {
      id_atividade: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      titulo: { type: Sequelize.STRING(150), allowNull: false },
      descricao: Sequelize.TEXT,
      semestre: { type: Sequelize.STRING(10), allowNull: false },
      carga_horaria_total: { type: Sequelize.INTEGER, allowNull: false },
      id_categoria: {
        type: Sequelize.INTEGER,
        references: { model: "categoria", key: "id_categoria" },
        onDelete: "SET NULL",
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(
          "planejada",
          "em_andamento",
          "concluida",
          "cancelada",
        ),
        allowNull: false,
        defaultValue: "planejada",
      },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    await queryInterface.addIndex("atividade_extensao", ["semestre"], {
      name: "idx_atividade_semestre",
    });

    // =========================
    // PARTICIPAÇÃO
    // =========================
    await queryInterface.createTable("participacao", {
      id_participacao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_aluno: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "aluno", key: "id_aluno" },
        onDelete: "CASCADE",
      },
      id_atividade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "atividade_extensao", key: "id_atividade" },
        onDelete: "CASCADE",
      },
      horas_validadas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status_validacao: {
        type: Sequelize.ENUM("pendente", "aprovada", "reprovada"),
        allowNull: false,
        defaultValue: "pendente",
      },
      relatorios_comprovantes: Sequelize.TEXT,
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    await queryInterface.addConstraint("participacao", {
      fields: ["id_aluno", "id_atividade"],
      type: "unique",
      name: "unique_aluno_atividade",
    });

    // =========================
    // COMPROVAÇÃO
    // =========================
    await queryInterface.createTable("comprovacao", {
      id_comprovacao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_participacao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: "participacao", key: "id_participacao" },
        onDelete: "CASCADE",
      },
      tipo_documento: {
        type: Sequelize.ENUM("certificado", "declaracao", "outro"),
        allowNull: false,
        defaultValue: "outro",
      },
      caminho_arquivo: { type: Sequelize.STRING(255), allowNull: true },
      data_envio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      horas_cumpridas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status_aprovacao: {
        type: Sequelize.ENUM("pendente", "aceita", "rejeitada"),
        allowNull: false,
        defaultValue: "pendente",
      },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
      deletedAt: tsDelete,
    });

    // =====================================================
    // TABELA PIVÔ — RESPONSÁVEIS DA ATIVIDADE (N:N)
    // =====================================================
    await queryInterface.createTable("responsavel_atividade", {
      id_atividade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "atividade_extensao", key: "id_atividade" },
        onDelete: "CASCADE",
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "usuario", key: "id_usuario" },
        onDelete: "CASCADE",
      },
      createdAt: tsCreate,
      updatedAt: tsUpdate,
    });

    await queryInterface.addConstraint("responsavel_atividade", {
      fields: ["id_atividade", "id_usuario"],
      type: "primary key",
      name: "pk_responsavel_atividade",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("responsavel_atividade");

    await queryInterface.dropTable("comprovacao");
    await queryInterface.dropTable("participacao");
    await queryInterface.dropTable("atividade_extensao");
    await queryInterface.dropTable("categoria");
    await queryInterface.dropTable("membro_comissao");
    await queryInterface.dropTable("professor");
    await queryInterface.dropTable("aluno");
    await queryInterface.dropTable("auditoria");
    await queryInterface.dropTable("papel_permissao");
    await queryInterface.dropTable("usuario_papel");
    await queryInterface.dropTable("permissao");
    await queryInterface.dropTable("papel");
    await queryInterface.dropTable("usuario");
  },
};
