export const paths = {
  "/api/v1/auth/login": {
    post: {
      tags: ["Autenticação"],
      summary: "Realiza login e retorna cookie JWT de sessão",
      description:
        "Autentica o usuário com e-mail e senha, gerando um token JWT armazenado em cookie seguro. Retorna os dados do usuário logado e seus papéis.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthLoginInput" },
            examples: {
              aluno: {
                $ref: "#/components/schemas/AuthLoginInput/examples/aluno",
              },
              professor: {
                $ref: "#/components/schemas/AuthLoginInput/examples/professor",
              },
              membro_comissao: {
                $ref: "#/components/schemas/AuthLoginInput/examples/membro_comissao",
              },
              professor_membro: {
                $ref: "#/components/schemas/AuthLoginInput/examples/professor_membro",
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login bem-sucedido",
          content: {
            "application/json": {
              examples: {
                aluno: {
                  summary: "Login como Aluno",
                  value: {
                    mensagem: "Login realizado com sucesso.",
                    usuario: {
                      nome: "Carlos Aluno",
                      email: "carlos@uesc.br",
                      papeis: ["aluno"],
                    },
                  },
                },
                professor: {
                  summary: "Login como Professor",
                  value: {
                    mensagem: "Login realizado com sucesso.",
                    usuario: {
                      nome: "Ana Professora",
                      email: "ana@uesc.br",
                      papeis: ["professor"],
                    },
                  },
                },
                membro_comissao: {
                  summary: "Login como Membro da Comissão",
                  value: {
                    mensagem: "Login realizado com sucesso.",
                    usuario: {
                      nome: "Marcos Comissão",
                      email: "marcos@uesc.br",
                      papeis: ["membro_comissao"],
                    },
                  },
                },
                professor_membro: {
                  summary: "Login como Professor+Membro",
                  value: {
                    mensagem: "Login realizado com sucesso.",
                    usuario: {
                      nome: "Paula Dupla",
                      email: "paula@uesc.br",
                      papeis: ["professor", "membro_comissao"],
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Campos ausentes ou inválidos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        401: {
          description: "Credenciais inválidas",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        405: {
          description: "Método não permitido (deve ser POST)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroNaoPermitido" },
            },
          },
        },
        500: {
          description: "Erro interno no servidor",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroInterno" },
            },
          },
        },
      },
    },
  },

  "/api/v1/auth/register": {
    post: {
      tags: ["Autenticação"],
      summary: "Registra um novo usuário (Aluno, Professor, Comissão ou ambos)",
      description:
        "Cria uma nova conta no sistema. O campo `tipo` define o papel principal (ex: aluno, professor, membro_comissao ou professor_membro). " +
        "Os papéis são automaticamente vinculados às tabelas `papel` e `usuario_papel`.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UsuarioRegisterInput" },
            examples: {
              aluno: {
                $ref: "#/components/schemas/UsuarioRegisterInput/examples/aluno",
              },
              professor: {
                $ref: "#/components/schemas/UsuarioRegisterInput/examples/professor",
              },
              membro_comissao: {
                $ref: "#/components/schemas/UsuarioRegisterInput/examples/membro_comissao",
              },
              professor_membro: {
                $ref: "#/components/schemas/UsuarioRegisterInput/examples/professor_membro",
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Usuário registrado com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRegisterOutput" },
              examples: {
                aluno: {
                  summary: "Cadastro de Aluno",
                  value: {
                    mensagem: "Usuário registrado com sucesso.",
                    usuario: {
                      nome: "Carlos Aluno",
                      email: "carlos@uesc.br",
                      papeis: ["aluno"],
                    },
                  },
                },
                professor: {
                  summary: "Cadastro de Professor",
                  value: {
                    mensagem: "Usuário registrado com sucesso.",
                    usuario: {
                      nome: "Ana Professora",
                      email: "ana@uesc.br",
                      papeis: ["professor"],
                    },
                  },
                },
                membro_comissao: {
                  summary: "Cadastro de Membro da Comissão",
                  value: {
                    mensagem: "Usuário registrado com sucesso.",
                    usuario: {
                      nome: "Marcos Comissão",
                      email: "marcos@uesc.br",
                      papeis: ["membro_comissao"],
                    },
                  },
                },
                professor_membro: {
                  summary: "Cadastro de Professor e Membro da Comissão",
                  value: {
                    mensagem: "Usuário registrado com sucesso.",
                    usuario: {
                      nome: "Paula Dupla",
                      email: "paula@uesc.br",
                      papeis: ["professor", "membro_comissao"],
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Campos obrigatórios faltando ou tipo inválido",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        409: {
          description: "E-mail ou matrícula já cadastrados",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
              example: { erro: "E-mail já cadastrado no sistema." },
            },
          },
        },
        405: {
          description: "Método não permitido (deve ser POST)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroNaoPermitido" },
            },
          },
        },
        500: {
          description: "Erro interno no servidor",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroInterno" },
            },
          },
        },
      },
    },
  },

  "/api/v1/auth/logout": {
    post: {
      tags: ["Autenticação"],
      summary: "Efetua logout do usuário autenticado",
      description:
        "Limpa o cookie JWT, encerrando a sessão do usuário atual. Não requer corpo na requisição.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Logout realizado com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthLogoutOutput" },
            },
          },
        },
        401: {
          description: "Usuário não autenticado ou token expirado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroToken" },
            },
          },
        },
        405: {
          description: "Método não permitido (deve ser POST)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroNaoPermitido" },
            },
          },
        },
        500: {
          description: "Erro interno no servidor",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroInterno" },
            },
          },
        },
      },
    },
  },

  "/api/v1/usuarios": {
    get: {
      tags: ["Usuários"],
      summary: "Lista todos os usuários",
      description:
        "Retorna todos os usuários cadastrados, incluindo suas especializações. Apenas administradores ou membros da comissão podem acessar.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Lista de usuários retornada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioListOutput" },
            },
          },
        },
        403: {
          description: "Sem permissão para listar usuários.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },
  },

  "/api/v1/usuarios/{id}": {
    get: {
      tags: ["Usuários"],
      summary: "Busca um usuário pelo ID",
      description:
        "Retorna os dados de um usuário específico, incluindo suas especializações. O próprio usuário pode consultar seus dados; membros da comissão e administradores podem consultar qualquer um.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 1,
        },
      ],
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Usuário encontrado com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioBase" },
            },
          },
        },
        403: {
          description: "Sem permissão para visualizar este usuário.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        404: {
          description: "Usuário não encontrado.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    put: {
      tags: ["Usuários"],
      summary: "Atualiza dados de um usuário",
      description:
        "Permite atualizar dados básicos (`nome`, `email`, `matricula`). O próprio usuário pode editar seus dados; membros da comissão e administradores podem editar qualquer um.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 2,
        },
      ],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UsuarioUpdateInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Usuário atualizado com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioUpdateOutput" },
            },
          },
        },
        403: {
          description: "Sem permissão para atualizar este usuário.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        404: {
          description: "Usuário não encontrado.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    delete: {
      tags: ["Usuários"],
      summary: "Exclui um usuário pelo ID",
      description:
        "Remove permanentemente o usuário do sistema. Apenas administradores podem executar esta operação. O backend verifica vínculos antes de excluir.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 3,
        },
      ],
      security: [{ cookieAuth: [] }],
      responses: {
        204: {
          description: "Usuário excluído com sucesso (sem corpo de resposta).",
        },
        400: {
          description: "Não é possível remover o usuário devido a vínculos.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        403: {
          description: "Apenas administradores podem excluir usuários.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        404: {
          description: "Usuário não encontrado.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },
  },

  "/api/v1/categorias": {
    get: {
      tags: ["Categorias"],
      summary: "Lista todas as categorias",
      description:
        "Retorna todas as categorias cadastradas no sistema, ordenadas alfabeticamente pelo nome. Requer permissão `categoria.read:any`.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Lista de categorias retornada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoriaListOutput" },
            },
          },
        },
        401: {
          description: "Usuário não autenticado.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroToken" },
            },
          },
        },
        403: {
          description: "Sem permissão para listar categorias.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        500: {
          description: "Erro interno ao listar categorias.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroInterno" },
            },
          },
        },
      },
    },

    post: {
      tags: ["Categorias"],
      summary: "Cria uma nova categoria",
      description:
        "Cadastra uma nova categoria no sistema. Requer permissão `categoria.manage:any`.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoriaCreateInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Categoria criada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoriaCreateOutput" },
            },
          },
        },
        400: {
          description: "Campo obrigatório ausente ou inválido.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        409: {
          description: "Já existe uma categoria com o mesmo nome.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        500: {
          description: "Erro interno ao criar categoria.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroInterno" },
            },
          },
        },
      },
    },
  },

  "/api/v1/categorias/{id}": {
    get: {
      tags: ["Categorias"],
      summary: "Busca uma categoria pelo ID",
      description:
        "Retorna os dados completos de uma categoria específica. Requer permissão `categoria.read:any`.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 1,
        },
      ],
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Categoria encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoriaOutput" },
            },
          },
        },
        404: {
          description: "Categoria não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    put: {
      tags: ["Categorias"],
      summary: "Atualiza uma categoria existente",
      description:
        "Permite alterar o nome e/ou descrição de uma categoria. Requer permissão `categoria.manage:any`.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 3,
        },
      ],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoriaUpdateInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Categoria atualizada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoriaUpdateOutput" },
            },
          },
        },
        400: {
          description: "Nenhum campo informado para atualização.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        404: {
          description: "Categoria não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    delete: {
      tags: ["Categorias"],
      summary: "Exclui (soft delete) uma categoria pelo ID",
      description:
        "Remove logicamente uma categoria (soft delete). Requer permissão `categoria.manage:any`.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 4,
        },
      ],
      security: [{ cookieAuth: [] }],
      responses: {
        204: { description: "Categoria excluída com sucesso." },
        404: {
          description: "Categoria não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },
  },
  "/api/v1/atividades": {
    get: {
      tags: ["Atividades"],
      summary: "Lista todas as atividades de extensão",
      description:
        "Retorna todas as atividades de extensão cadastradas, podendo ser filtradas por categoria ou status. Requer permissão `atividade.read:any`.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: "categoria",
          in: "query",
          schema: { type: "integer" },
          example: 2,
          description: "Filtra atividades por ID da categoria.",
        },
        {
          name: "status",
          in: "query",
          schema: { type: "string" },
          example: "ativa",
          description: "Filtra atividades por status (ex: ativa, concluída).",
        },
      ],
      responses: {
        200: {
          description: "Lista de atividades retornada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AtividadeListOutput" },
            },
          },
        },
        401: {
          description: "Usuário não autenticado.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroToken" },
            },
          },
        },
        403: {
          description: "Sem permissão para listar atividades.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        500: {
          description: "Erro interno ao listar atividades.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroInterno" },
            },
          },
        },
      },
    },

    post: {
      tags: ["Atividades"],
      summary: "Cria uma nova atividade de extensão",
      description:
        "Cadastra uma nova atividade de extensão vinculada a uma categoria e a um professor responsável. Requer permissão `atividade.create:any` ou `atividade.create:own`.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AtividadeCreateInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Atividade criada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AtividadeCreateOutput" },
            },
          },
        },
        400: {
          description: "Campos obrigatórios ausentes ou inválidos.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        500: {
          description: "Erro interno ao criar atividade.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroInterno" },
            },
          },
        },
      },
    },
  },

  "/api/v1/atividades/{id}": {
    get: {
      tags: ["Atividades"],
      summary: "Busca uma atividade pelo ID",
      description:
        "Retorna os detalhes completos de uma atividade, incluindo categoria e professor responsável. Requer permissão `atividade.read:any`.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 5,
        },
      ],
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Atividade encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AtividadeOutput" },
            },
          },
        },
        404: {
          description: "Atividade não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    put: {
      tags: ["Atividades"],
      summary: "Atualiza uma atividade de extensão",
      description:
        "Permite editar os dados da atividade (ex: título, carga horária, categoria, status). Requer permissão `atividade.update:any` ou `atividade.update:own`.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 3,
        },
      ],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AtividadeUpdateInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Atividade atualizada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AtividadeUpdateOutput" },
            },
          },
        },
        404: {
          description: "Atividade não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    delete: {
      tags: ["Atividades"],
      summary: "Exclui uma atividade de extensão",
      description:
        "Realiza o soft delete de uma atividade. Bloqueia exclusão se houver participações vinculadas. Requer permissão `atividade.delete:any`.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 2,
        },
      ],
      security: [{ cookieAuth: [] }],
      responses: {
        204: { description: "Atividade excluída com sucesso." },
        400: {
          description:
            "Atividade possui participações vinculadas e não pode ser removida.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        404: {
          description: "Atividade não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },
  },

  "/api/v1/participacoes": {
    get: {
      tags: ["Participações"],
      summary: "Lista todas as participações registradas",
      description:
        "Retorna todas as participações cadastradas, incluindo informações do aluno e da atividade correspondente. Apenas membros da comissão ou administradores têm acesso completo.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Lista de participações retornada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParticipacaoListOutput" },
            },
          },
        },
        401: {
          description: "Usuário não autenticado.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroToken" },
            },
          },
        },
        403: {
          description: "Sem permissão para listar participações.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    post: {
      tags: ["Participações"],
      summary: "Inscreve o aluno autenticado em uma atividade",
      description:
        "Cria uma nova participação vinculando o aluno autenticado a uma atividade de extensão. Requer permissão `participacao.create:own`.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ParticipacaoCreateInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Participação criada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParticipacaoCreateOutput" },
            },
          },
        },
        400: {
          description: "Campo obrigatório ausente ou inválido.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        404: {
          description: "Aluno ou atividade não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        409: {
          description: "Aluno já inscrito nesta atividade.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },
  },

  "/api/v1/participacoes/{id}": {
    get: {
      tags: ["Participações"],
      summary: "Busca uma participação específica",
      description:
        "Retorna os detalhes de uma participação. O próprio aluno pode consultar sua participação, enquanto membros da comissão e administradores podem consultar qualquer uma.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 12,
        },
      ],
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Participação encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParticipacaoOutput" },
            },
          },
        },
        403: {
          description: "Sem permissão para visualizar esta participação.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        404: {
          description: "Participação não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    put: {
      tags: ["Participações"],
      summary: "Atualiza uma participação (validação de horas/status)",
      description:
        "Permite que membros da comissão atualizem o status ou horas validadas de uma participação. Requer permissão `participacao.manage:any`.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 8,
        },
      ],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ParticipacaoUpdateInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Participação atualizada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParticipacaoUpdateOutput" },
            },
          },
        },
        400: {
          description: "Status inválido ou campo inconsistente.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        404: {
          description: "Participação não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    delete: {
      tags: ["Participações"],
      summary: "Remove uma participação existente",
      description:
        "Remove (soft delete) uma participação específica. Requer permissão `participacao.manage:any`.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 9,
        },
      ],
      security: [{ cookieAuth: [] }],
      responses: {
        204: { description: "Participação excluída com sucesso." },
        404: {
          description: "Participação não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },
  },

  "/api/v1/comprovacoes": {
    get: {
      tags: ["Comprovações"],
      summary: "Lista todas as comprovações enviadas",
      description:
        "Retorna todos os comprovantes enviados pelos alunos. Apenas membros da comissão e administradores podem acessar.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Lista de comprovações retornada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ComprovacaoListOutput" },
            },
          },
        },
        403: {
          description: "Sem permissão para listar comprovações.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    post: {
      tags: ["Comprovações"],
      summary: "Envia comprovante de participação",
      description:
        "Permite que o aluno envie seu comprovante de participação em uma atividade. Requer permissão `comprovacao.create:own`.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ComprovacaoCreateInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Comprovante enviado com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ComprovacaoCreateOutput" },
            },
          },
        },
        400: {
          description: "Campo obrigatório ausente.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        404: {
          description: "Participação não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        409: {
          description: "Já existe comprovante para esta participação.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },
  },

  "/api/v1/comprovacoes/{id}": {
    get: {
      tags: ["Comprovações"],
      summary: "Busca uma comprovação específica",
      description:
        "Retorna os detalhes de uma comprovação. O próprio aluno pode ver seu comprovante; membros da comissão podem ver qualquer um.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          schema: { type: "integer" },
          required: true,
          example: 7,
        },
      ],
      responses: {
        200: {
          description: "Comprovação encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ComprovacaoOutput" },
            },
          },
        },
        403: {
          description: "Sem permissão para visualizar.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        404: {
          description: "Comprovação não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    put: {
      tags: ["Comprovações"],
      summary: "Atualiza o status de uma comprovação",
      description:
        "Permite que membros da comissão aprovem ou rejeitem o comprovante. Requer permissão `comprovacao.manage:any`.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          example: 5,
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ComprovacaoUpdateInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Status atualizado com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ComprovacaoUpdateOutput" },
            },
          },
        },
        400: {
          description: "Status inválido.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroValidacao" },
            },
          },
        },
        404: {
          description: "Comprovação não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },

    delete: {
      tags: ["Comprovações"],
      summary: "Remove um comprovante",
      description:
        "Remove um comprovante específico. Apenas membros da comissão podem excluir.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          schema: { type: "integer" },
          required: true,
          example: 9,
        },
      ],
      responses: {
        204: { description: "Comprovação removida com sucesso." },
        404: {
          description: "Comprovação não encontrada.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
      },
    },
  },

  "/api/v1/auditorias": {
    get: {
      tags: ["Auditoria"],
      summary: "Lista registros de auditoria",
      description:
        "Retorna registros de auditoria do sistema, permitindo filtragem por membro responsável, ação e limite de resultados. Requer permissão `auditoria.read:any`.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: "membro",
          in: "query",
          schema: { type: "integer" },
          example: 3,
          description:
            "Filtra auditorias pelo ID do membro da comissão responsável.",
        },
        {
          name: "acao",
          in: "query",
          schema: { type: "string" },
          example: "atividade.create",
          description:
            "Filtra auditorias pelo tipo de ação registrada (ex: usuario.update, participacao.validate).",
        },
        {
          name: "limite",
          in: "query",
          schema: { type: "integer" },
          example: 50,
          description:
            "Define o número máximo de registros retornados (padrão: 50).",
        },
      ],
      responses: {
        200: {
          description: "Lista de auditorias retornada com sucesso.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuditoriaListOutput" },
            },
          },
        },
        401: {
          description: "Usuário não autenticado.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroToken" },
            },
          },
        },
        403: {
          description: "Sem permissão para visualizar auditorias.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroPadrao" },
            },
          },
        },
        500: {
          description: "Erro interno ao listar auditorias.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErroInterno" },
            },
          },
        },
      },
    },
  },
};
