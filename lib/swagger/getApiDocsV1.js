import { createSwaggerSpec } from "next-swagger-doc";
import { schemas } from "./schemas";
import { paths } from "./paths";

export function getApiDocsV1() {
  return createSwaggerSpec({
    definition: {
      openapi: "3.0.3",
      info: {
        title: "📚 BaaS COLCIC — Extensão Universitária (UESC)",
        version: "1.1.0",
        description: `
API RESTful construída com **Next.js 15 + Sequelize + MariaDB**, 
voltada à gestão de atividades de extensão do **COLCIC/UESC**.

Principais características:
- RBAC completo (Admin, Professor, Aluno, Comissão)
- Auditoria automática de ações
- Soft delete em todas as entidades
- Autenticação JWT via cookie seguro
        `,
        contact: {
          name: "Equipe COLCIC",
          email: "colcic@uesc.br",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Ambiente de desenvolvimento",
        },
        {
          url: "https://colcic-api.vercel.app",
          description: "Produção",
        },
      ],
      tags: [
        {
          name: "Autenticação",
          description: "Login, registro e controle de sessão",
        },
        { name: "Usuários", description: "Gestão de contas e papéis (RBAC)" },
        {
          name: "Categorias",
          description: "Gerenciamento de categorias de atividades",
        },
        { name: "Atividades", description: "CRUD de atividades e categorias" },
        {
          name: "Participações",
          description: "Inscrições e controle de horas",
        },
        {
          name: "Comprovações",
          description: "Envio e avaliação de documentos",
        },
        {
          name: "Auditorias",
          description: "Logs de ações e histórico do sistema",
        },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "token",
            description: "JWT armazenado em cookie HTTPOnly seguro",
          },
        },
        schemas,
      },
      paths,
    },
  });
}
