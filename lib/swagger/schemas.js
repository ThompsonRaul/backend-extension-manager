export const schemas = {
  AuthLoginInput: {
    type: "object",
    required: ["email", "senha"],
    properties: {
      email: {
        type: "string",
        example: "ana@uesc.br",
        description: "E-mail cadastrado do usuário.",
      },
      senha: {
        type: "string",
        example: "654321",
        description: "Senha em texto simples (será validada no backend).",
      },
    },
    examples: {
      aluno: {
        summary: "Login como Aluno",
        value: { email: "carlos@uesc.br", senha: "123456" },
      },
      professor: {
        summary: "Login como Professor",
        value: { email: "ana@uesc.br", senha: "654321" },
      },
      membro_comissao: {
        summary: "Login como Membro da Comissão",
        value: {
          email: "marcos@uesc.br",
          senha: "123123",
        },
      },
      professor_membro: {
        summary: "Login como Professor+Membro",
        value: {
          email: "paula@uesc.br",
          senha: "789789",
        },
      },
    },
  },

  AuthLoginOutput: {
    type: "object",
    properties: {
      mensagem: { type: "string", example: "Login realizado com sucesso." },
      usuario: { $ref: "#/components/schemas/UsuarioResumo" },
    },
  },

  UsuarioRegisterInput: {
    type: "object",
    required: ["nome", "email", "senha", "tipo", "matricula"],
    properties: {
      nome: { type: "string", example: "João da Silva" },
      email: { type: "string", example: "joao@uesc.br" },
      matricula: { type: "string", example: "ALU001" },
      senha: { type: "string", example: "123456" },
      tipo: {
        type: "string",
        enum: ["aluno", "professor", "membro_comissao", "professor_membro"],
        example: "aluno",
        description:
          "Define o tipo de usuário a ser criado. O campo determina os papéis vinculados automaticamente:\n\n" +
          "- **aluno** → cria usuário com papel 'aluno' e dados de curso/semestre;\n" +
          "- **professor** → cria usuário com papel 'professor';\n" +
          "- **membro_comissao** → cria usuário com papel 'membro_comissao';\n" +
          "- **professor_membro** → cria usuário com ambos os papéis 'professor' e 'membro_comissao'.",
      },
      dados: {
        type: "object",
        nullable: true,
        example: {
          curso: "Engenharia de Computação",
          semestre: 7,
        },
        description:
          "Dados adicionais específicos de alunos (curso e semestre). Ignorado para outros tipos de usuário.",
      },
    },
    examples: {
      aluno: {
        summary: "Criação de Aluno",
        value: {
          nome: "Carlos Aluno",
          email: "carlos@uesc.br",
          matricula: "ALU2025001",
          senha: "123456",
          tipo: "aluno",
          dados: { curso: "Ciência da Computação", semestre: 5 },
        },
      },
      professor: {
        summary: "Criação de Professor",
        value: {
          nome: "Ana Professora",
          email: "ana@uesc.br",
          matricula: "PROF002",
          senha: "654321",
          tipo: "professor",
          dados: { area: "Engenharia de Software", departamento: "DCET" },
        },
      },
      membro_comissao: {
        summary: "Criação de Membro da Comissão",
        value: {
          nome: "Marcos Comissão",
          email: "marcos@uesc.br",
          matricula: "COM001",
          senha: "123123",
          tipo: "membro_comissao",
          dados: { portaria_designacao: "PORT123/2025", funcao: "membro" },
        },
      },
      professor_membro: {
        summary: "Criação de Professor e Membro da Comissão",
        value: {
          nome: "Paula Dupla",
          email: "paula@uesc.br",
          matricula: "PROFCOM01",
          senha: "789789",
          tipo: ["professor", "membro_comissao"],
          dados: {
            area: "Extensão Universitária",
            departamento: "DCET",
            portaria_designacao: "PORT456/2025",
            funcao: "coordenador",
          },
        },
      },
    },
  },

  AuthRegisterOutput: {
    type: "object",
    properties: {
      mensagem: { type: "string", example: "Usuário registrado com sucesso." },
      usuario: { $ref: "#/components/schemas/UsuarioResumo" },
    },
  },

  AuthLogoutOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Logout realizado com sucesso.",
      },
    },
  },

  UsuarioResumo: {
    type: "object",
    description:
      "Representação simplificada de usuário usada em login, registro e auditoria.",
    properties: {
      id_usuario: { type: "integer", example: 1 },
      nome: { type: "string", example: "Ana Professora" },
      email: { type: "string", example: "ana@uesc.br" },
      papeis: {
        type: "array",
        items: { type: "string" },
        example: ["professor", "membro_comissao"],
      },
    },
  },

  UsuarioBase: {
    type: "object",
    description: "Representação completa de um usuário no sistema.",
    properties: {
      id_usuario: { type: "integer", example: 1 },
      nome: { type: "string", example: "Paula Dupla" },
      email: { type: "string", example: "paula@uesc.br" },
      matricula: { type: "string", example: "PROFCOM01" },
      papeis: {
        type: "array",
        items: { type: "string" },
        example: ["professor", "membro_comissao"],
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-11-10T15:30:22.000Z",
      },
      especializacao: {
        type: "object",
        nullable: true,
        description:
          "Informações específicas conforme o papel principal do usuário.",
        oneOf: [
          {
            title: "Professor e Membro da Comissão",
            properties: {
              tipo: { type: "string", example: "professor_membro" },
              dados: {
                type: "object",
                properties: {
                  area: { type: "string", example: "Extensão Universitária" },
                  departamento: { type: "string", example: "DCET" },
                  funcao: { type: "string", example: "coordenadora" },
                  status: { type: "string", example: "ativo" },
                  portaria_designacao: {
                    type: "string",
                    example: "PORT456/2025",
                  },
                },
              },
            },
          },
          {
            title: "Aluno",
            properties: {
              tipo: { type: "string", example: "aluno" },
              dados: {
                type: "object",
                properties: {
                  curso: { type: "string", example: "Ciência da Computação" },
                  semestre: { type: "integer", example: 7 },
                  horas_acumuladas: { type: "integer", example: 120 },
                  horas_restantes: { type: "integer", example: 60 },
                },
              },
            },
          },
          {
            title: "Professor",
            properties: {
              tipo: { type: "string", example: "professor" },
              dados: {
                type: "object",
                properties: {
                  area: { type: "string", example: "Engenharia de Software" },
                  departamento: { type: "string", example: "DCET" },
                },
              },
            },
          },
          {
            title: "Membro da Comissão",
            properties: {
              tipo: { type: "string", example: "membro_comissao" },
              dados: {
                type: "object",
                properties: {
                  funcao: { type: "string", example: "coordenadora" },
                  status: { type: "string", example: "ativo" },
                  portaria_designacao: {
                    type: "string",
                    example: "PORT456/2025",
                  },
                },
              },
            },
          },
        ],
      },
    },
  },

  UsuarioListOutput: {
    type: "object",
    description: "Retorno da listagem de usuários.",
    properties: {
      total: { type: "integer", example: 1 },
      usuarios: {
        type: "array",
        items: { $ref: "#/components/schemas/UsuarioBase" },
      },
    },
  },

  UsuarioDetalheOutput: {
    type: "object",
    description: "Retorno da busca de usuário por ID.",
    properties: {
      usuario: { $ref: "#/components/schemas/UsuarioBase" },
      especializacao: { type: "object" },
    },
  },

  UsuarioUpdateInput: {
    type: "object",
    required: [],
    properties: {
      nome: { type: "string", example: "Novo Nome" },
      email: { type: "string", example: "novo@uesc.br" },
      matricula: { type: "string", example: "NOVO123" },
    },
  },

  UsuarioUpdateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Usuário atualizado com sucesso.",
      },
      usuario: { $ref: "#/components/schemas/UsuarioBase" },
    },
  },

  CategoriaBase: {
    type: "object",
    properties: {
      id_categoria: { type: "integer", example: 1 },
      nome_categoria: { type: "string", example: "Eventos" },
      descricao: {
        type: "string",
        nullable: true,
        example: "Categoria voltada a eventos acadêmicos e científicos.",
      },
    },
  },

  CategoriaListOutput: {
    type: "object",
    properties: {
      categorias: {
        type: "array",
        items: { $ref: "#/components/schemas/CategoriaBase" },
      },
    },
  },

  CategoriaOutput: {
    type: "object",
    properties: {
      categoria: { $ref: "#/components/schemas/CategoriaBase" },
    },
  },

  CategoriaCreateInput: {
    type: "object",
    required: ["nome_categoria"],
    properties: {
      nome_categoria: {
        type: "string",
        example: "Eventos",
        description: "Nome da categoria (obrigatório e único).",
      },
      descricao: {
        type: "string",
        example: "Categoria voltada a eventos acadêmicos e científicos.",
      },
    },
  },

  CategoriaCreateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Categoria criada com sucesso.",
      },
      categoria: { $ref: "#/components/schemas/CategoriaBase" },
    },
  },

  CategoriaUpdateInput: {
    type: "object",
    properties: {
      nome_categoria: {
        type: "string",
        example: "Minicursos",
      },
      descricao: {
        type: "string",
        example: "Categoria para minicursos de curta duração.",
      },
    },
  },

  CategoriaUpdateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Categoria atualizada com sucesso.",
      },
      categoria: { $ref: "#/components/schemas/CategoriaBase" },
    },
  },

  AtividadeBase: {
    type: "object",
    properties: {
      id_atividade: { type: "integer", example: 10 },
      titulo: { type: "string", example: "Semana de Extensão e Cultura 2025" },
      descricao: {
        type: "string",
        nullable: true,
        example:
          "Evento que reúne projetos de extensão e apresentações culturais.",
      },
      semestre: { type: "integer", example: 2025.1 },
      carga_horaria_total: { type: "integer", example: 40 },
      status: {
        type: "string",
        example: "ativa",
        description:
          "Pode assumir valores como: planejada, em andamento, concluida, cancelada.",
      },
      id_categoria: { type: "integer", example: 3 },
      categoria: {
        type: "object",
        nullable: true,
        properties: {
          nome_categoria: { type: "string", example: "Eventos Acadêmicos" },
        },
      },
      id_professor_responsavel: { type: "integer", example: 7 },
      professor: {
        type: "object",
        nullable: true,
        properties: { id_professor: { type: "integer", example: 7 } },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-11-12T14:30:00.000Z",
      },
    },
  },

  AtividadeListOutput: {
    type: "object",
    properties: {
      atividades: {
        type: "array",
        items: { $ref: "#/components/schemas/AtividadeBase" },
      },
    },
  },

  AtividadeOutput: {
    type: "object",
    properties: {
      atividade: { $ref: "#/components/schemas/AtividadeBase" },
    },
  },

  AtividadeCreateInput: {
    type: "object",
    required: ["titulo", "semestre", "carga_horaria_total"],
    properties: {
      titulo: {
        type: "string",
        example: "Minicurso de Desenvolvimento Web com Node.js",
      },
      descricao: {
        type: "string",
        example: "Minicurso voltado a estudantes iniciantes em backend.",
      },
      semestre: {
        type: "integer",
        example: 2025.1,
        description: "Identificação do semestre da atividade (ex: 2025.1).",
      },
      carga_horaria_total: {
        type: "integer",
        example: 20,
        description: "Carga horária total da atividade (em horas).",
      },
      id_categoria: {
        type: "integer",
        example: 1,
        description: "Categoria à qual a atividade pertence.",
      },
    },
  },

  AtividadeCreateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Atividade criada com sucesso.",
      },
      atividade: { $ref: "#/components/schemas/AtividadeBase" },
    },
  },

  AtividadeUpdateInput: {
    type: "object",
    properties: {
      titulo: { type: "string", example: "Minicurso de React" },
      descricao: {
        type: "string",
        example: "Atualização do minicurso para versão mais recente do React.",
      },
      semestre: { type: "integer", example: 2025.2 },
      carga_horaria_total: { type: "integer", example: 25 },
      status: { type: "string", example: "concluída" },
      id_categoria: { type: "integer", example: 1 },
    },
  },

  AtividadeUpdateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Atividade atualizada com sucesso.",
      },
      atividade: { $ref: "#/components/schemas/AtividadeBase" },
    },
  },

  ParticipacaoBase: {
    type: "object",
    properties: {
      id_participacao: { type: "integer", example: 15 },
      id_aluno: { type: "integer", example: 4 },
      id_atividade: { type: "integer", example: 10 },
      horas_validadas: { type: "integer", example: 12 },
      status_validacao: {
        type: "string",
        example: "pendente",
        description: "Status da validação: pendente, aprovada ou reprovada.",
      },
      aluno: {
        type: "object",
        nullable: true,
        properties: {
          id_aluno: { type: "integer", example: 4 },
          curso: { type: "string", example: "Ciência da Computação" },
          horas_acumuladas: { type: "integer", example: 80 },
          horas_restantes: { type: "integer", example: 40 },
        },
      },
      atividade_extensao: {
        type: "object",
        nullable: true,
        properties: {
          id_atividade: { type: "integer", example: 10 },
          titulo: { type: "string", example: "Semana da Computação 2025" },
          carga_horaria_total: { type: "integer", example: 20 },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-11-12T15:00:00.000Z",
      },
    },
  },

  ParticipacaoListOutput: {
    type: "object",
    properties: {
      participacoes: {
        type: "array",
        items: { $ref: "#/components/schemas/ParticipacaoBase" },
      },
    },
  },

  ParticipacaoOutput: {
    type: "object",
    properties: {
      participacao: { $ref: "#/components/schemas/ParticipacaoBase" },
    },
  },

  ParticipacaoCreateInput: {
    type: "object",
    required: ["id_atividade"],
    properties: {
      id_atividade: {
        type: "integer",
        example: 10,
        description:
          "ID da atividade de extensão na qual o aluno deseja se inscrever.",
      },
    },
  },

  ParticipacaoCreateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Inscrição realizada com sucesso.",
      },
      participacao: { $ref: "#/components/schemas/ParticipacaoBase" },
    },
  },

  ParticipacaoUpdateInput: {
    type: "object",
    properties: {
      status_validacao: {
        type: "string",
        enum: ["pendente", "aprovada", "reprovada"],
        example: "aprovada",
        description: "Status da validação da participação.",
      },
      horas_validadas: {
        type: "integer",
        example: 10,
        description: "Quantidade de horas validadas pela comissão.",
      },
    },
  },

  ParticipacaoUpdateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Participação atualizada com sucesso.",
      },
      participacao: { $ref: "#/components/schemas/ParticipacaoBase" },
    },
  },

  ComprovacaoBase: {
    type: "object",
    properties: {
      id_comprovacao: { type: "integer", example: 12 },
      id_participacao: { type: "integer", example: 4 },
      tipo_documento: {
        type: "string",
        example: "certificado",
        description:
          "Tipo de documento enviado (certificado, declaração, etc.)",
      },
      caminho_arquivo: {
        type: "string",
        nullable: true,
        example: "/uploads/certificados/arquivo123.pdf",
      },
      horas_cumpridas: {
        type: "integer",
        example: 8,
        description: "Horas cumpridas informadas pelo aluno.",
      },
      status_aprovacao: {
        type: "string",
        enum: ["pendente", "aceita", "rejeitada"],
        example: "pendente",
      },
      participacao: {
        type: "object",
        nullable: true,
        properties: {
          id_participacao: { type: "integer", example: 4 },
          status_validacao: { type: "string", example: "pendente" },
          horas_validadas: { type: "integer", example: 10 },
          aluno: {
            type: "object",
            nullable: true,
            properties: {
              id_aluno: { type: "integer", example: 7 },
              curso: { type: "string", example: "Ciência da Computação" },
            },
          },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-11-12T15:00:00.000Z",
      },
    },
  },

  ComprovacaoListOutput: {
    type: "object",
    properties: {
      comprovacoes: {
        type: "array",
        items: { $ref: "#/components/schemas/ComprovacaoBase" },
      },
    },
  },

  ComprovacaoOutput: {
    type: "object",
    properties: {
      comprovacao: { $ref: "#/components/schemas/ComprovacaoBase" },
    },
  },

  ComprovacaoCreateInput: {
    type: "object",
    required: ["id_participacao", "horas_cumpridas"],
    properties: {
      id_participacao: {
        type: "integer",
        example: 1,
        description: "ID da participação vinculada ao comprovante.",
      },
      tipo_documento: {
        type: "string",
        example: "certificado",
      },
      caminho_arquivo: {
        type: "string",
        example: "/uploads/comprovantes/documento.pdf",
        nullable: true,
      },
      horas_cumpridas: {
        type: "integer",
        example: 6,
        description: "Horas cumpridas informadas pelo aluno.",
      },
    },
  },

  ComprovacaoCreateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Comprovante enviado com sucesso.",
      },
      comprovacao: { $ref: "#/components/schemas/ComprovacaoBase" },
    },
  },

  ComprovacaoUpdateInput: {
    type: "object",
    required: ["status_aprovacao"],
    properties: {
      status_aprovacao: {
        type: "string",
        enum: ["pendente", "aceita", "rejeitada"],
        example: "aceita",
      },
    },
  },

  ComprovacaoUpdateOutput: {
    type: "object",
    properties: {
      mensagem: {
        type: "string",
        example: "Status atualizado com sucesso.",
      },
      comprovacao: { $ref: "#/components/schemas/ComprovacaoBase" },
    },
  },

  AuditoriaBase: {
    type: "object",
    properties: {
      id_auditoria: { type: "integer", example: 12 },

      acao: {
        type: "string",
        example: "insert",
        description: "Identificador da ação executada no sistema.",
      },
      data_acao: {
        type: "string",
        format: "date-time",
        example: "2025-11-13T10:33:54.000Z",
        description: "Data/hora em que a ação ocorreu.",
      },
      membro_responsavel: {
        type: "integer",
        example: 2,
        description: "ID do membro da comissão responsável pela ação.",
      },
      detalhes: {
        type: "string",
        nullable: true,
        example:
          "Atividade criada: Minicurso de Desenvolvimento Web com Node.js (ID 1).",
      },

      membro: {
        type: "object",
        nullable: true,
        properties: {
          id_membro: { type: "integer", example: 2 },
          funcao: { type: "string", example: "coordenador" },
          status: { type: "string", example: "ativo" },
          usuario: {
            type: "object",
            properties: {
              nome: { type: "string", example: "Paula Dupla" },
              email: { type: "string", example: "paula@uesc.br" },
            },
          },
        },
      },
    },
  },

  AuditoriaListOutput: {
    type: "object",
    properties: {
      total: { type: "integer", example: 34 },
      auditorias: {
        type: "array",
        items: { $ref: "#/components/schemas/AuditoriaBase" },
      },
    },
  },

  // ==============================================================
  // ❗ ERROS PADRÕES
  // ==============================================================

  ErroPadrao: {
    type: "object",
    properties: {
      erro: {
        type: "string",
        example: "Não é possível remover: há participações vinculadas.",
      },
    },
  },

  ErroValidacao: {
    type: "object",
    properties: {
      erro: { type: "string", example: "Dados inválidos." },
      detalhes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Campo 'email' é obrigatório.",
            },
            path: { type: "string", example: "email" },
          },
        },
      },
    },
  },

  ErroToken: {
    type: "object",
    properties: {
      erro: {
        type: "string",
        example: "Token inválido ou expirado.",
      },
    },
  },

  ErroNaoPermitido: {
    type: "object",
    properties: {
      erro: {
        type: "string",
        example: "Método DELETE não permitido neste endpoint.",
      },
    },
  },

  ErroInterno: {
    type: "object",
    properties: {
      erro: {
        type: "string",
        example: "Erro interno no servidor.",
      },
    },
  },
};
