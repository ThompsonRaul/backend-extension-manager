# 🧩 backend-extension-manager

![Node.js](https://img.shields.io/badge/Node.js-20.11-green)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![MariaDB](https://img.shields.io/badge/MariaDB-11.8-blue)
![Docker](https://img.shields.io/badge/Docker-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 🚀 Visão Geral

**Sistema de Gerenciamento de Atividades de Extensão — COLCIC/UESC** feito em **Next.js (Pages API)** com **Sequelize**, **MariaDB** e **Docker**, implementando **autenticação JWT**, **RBAC**, **auditoria automática** e **testes de integração (Jest)**.

---

## 🎯 Objetivo do Projeto

Modernizar e automatizar o gerenciamento das atividades de extensão do COLCIC/UESC, promovendo rastreabilidade, segurança, controle institucional e conformidade com as resoluções CONSEPE vigentes, através de uma arquitetura backend escalável e auditável.

---

## 📂 Estrutura de Diretórios

```
application/
  controllers/        → Controladores HTTP das rotas
  services/           → Regras de negócio (camada de domínio)
  errors/             → Manipulação padronizada de erros

infra/
  config/             → Configurações de ambiente e Sequelize
  middleware/         → authMiddleware, permissionMiddleware
  migrations/         → Criação do banco
  models/             → Entidades Sequelize
  seeders/            → Dados iniciais (RBAC)
  utils/              → Registrar auditoria, limpar banco
  compose.yaml        → Docker Compose
  database.js         → Conexão MariaDB

lib/swagger/
  getApiDocsV1.js     → Configuração Swagger
  paths.js            → Paths da API
  schemas.js          → Esquemas de resposta/entrada

pages/api/v1/
  atividades/
  auditorias/
  auth/
  categorias/
  comprovacoes/
  participacoes/
  status/
  usuarios/
  openapi.js          → Exposição do Swagger JSON

tests/integration/
  api/v1/             → Testes de integração por módulo

README.md

```

---

## ⚙️ Requisitos

- **Node.js:** ≥ 20.11
- **NPM:** ≥ 10.8
- **Docker**

---

## 🧩 Configuração de Ambiente

Adeque o arquivo `.env.development` ao seu caso:

```env
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mariadb

MARIADB_DATABASE=colcic
MARIADB_USER=colcic_user
MARIADB_PASSWORD=colcic_pass
MARIADB_ROOT_PASSWORD=root

JWT_SECRET=uma-secret-bem-grande-e-aleatoria
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
```

---

## 🐳 Inicialização do Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Subir containers, iniciar o ambiente e iniciar servidor de desenvolvimento
npm run dev

# 3. Rodar migrations e seeders
npx sequelize db:migrate
npx sequelize db:seed:all

```

Após a inicialização do ambiente, a API estará acessível localmente em: http://localhost:3000/api/v1

---

## 📡 Endpoints Principais

| Método | Rota              | Descrição               |
| ------ | ----------------- | ----------------------- |
| POST   | /auth/login       | Autenticação do usuário |
| GET    | /atividades       | Listar atividades       |
| POST   | /participacoes    | Inscrever aluno         |
| POST   | /comprovacoes     | Enviar comprovante      |
| PATCH  | /comprovacoes/:id | Validar comprovante     |
| GET    | /auditorias       | Consultar auditoria     |

---

## 🧱 Arquitetura

| Camada         | Local                     | Função                                              |
| -------------- | ------------------------- | --------------------------------------------------- |
| **Controller** | `application/controllers` | Entrada da requisição, validação inicial e resposta |
| **Service**    | `application/services`    | Regra de negócio, validações, transações            |
| **Model**      | `infra/models`            | ORM Sequelize (entidades e associações)             |
| **Middleware** | `infra/middleware`        | Autenticação, permissões, auditoria                 |
| **Pages API**  | `pages/api/v1`            | Rotas REST                                          |
| **Swagger**    | `lib/swagger`             | Documentação automática                             |

---

## 🔐 Fluxo de Autenticação

1. `POST /api/v1/auth/login` → gera JWT com `id_usuario` e `papeis`.
2. Token armazenado em **cookie HTTP-only**.
3. `authMiddleware` valida e injeta `req.user` nas rotas protegidas.
4. `permissionMiddleware` filtra ações por papel e permissão.

---

## 🧭 RBAC — Controle de Acesso

| Papel               | Permissões Principais                         | Escopo   |
| ------------------- | --------------------------------------------- | -------- |
| **aluno**           | criar/visualizar participações e comprovações | próprio  |
| **professor**       | gerenciar atividades                          | próprias |
| **membro_comissao** | validar comprovantes e participações          | global   |
| **admin**           | controle total do sistema                     | global   |

> Controle implementado por `usuario_papel`,`papel`, `papel_permissao` e `permissao`.

---

## 🧾 Auditoria de Ações

Toda operação crítica dispara `registrarAuditoria.js`.

Campos principais:

| Campo        | Descrição            |
| ------------ | -------------------- |
| acao         | insert/update/delete |
| tabela       | entidade alterada    |
| id_entidade  | PK afetada           |
| id_usuario   | autor                |
| antes/depois | diffs JSON           |

---

## 🧪 Testes de Integração

Cobrem:

- Autenticação (`auth.test.js`);
- RBAC (`categorias.test.js`, `atividades.test.js`);
- Auditoria (`auditorias.test.js`);
- CRUDs principais (`comprovacoes`, `participacoes`).

> `limparBanco.js` garante isolamento entre execuções.

---

## 🧰 Scripts NPM

| Comando                 | Descrição                                        |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Inicia containers Docker e sobe servidor Next.js |
| `npm run test`          | Executa todos os testes                          |
| `npm run test:watch`    | Roda Jest em modo observador                     |
| `npm run services:down` | Remove containers                                |
| `npm run lint:fix`      | Corrige formatação com Prettier                  |

---

## ⚙️ Validação e Erros

- **Validação:** campos obrigatórios e formatos padrão (`semestre`, `email`, etc.);
- **Respostas padronizadas:** `{ erro, detalhes, codigo }`;
- **Códigos HTTP:** 400, 401, 403, 404, 409, 500.

---

## 🧭 Exemplo de Uso (Postman)

### 🔹 Login

```json
POST /api/v1/auth/login
{
  "email": "prof@uesc.br",
  "senha": "123456"
}
```

### 🔹 Criar Categoria

```json
POST /api/v1/categorias
{
  "nome_categoria": "Extensão em TI"
}
```

---

## ✅ Boas Práticas Aplicadas

- Arquitetura em camadas (MVC + Service)
- RBAC baseado em permissões
- Auditoria automática
- Soft delete em todas as entidades
- Testes de integração isolados
- Padrão RESTful

---

## 🧩 Ferramentas e Referências

- [Docker Compose](./infra/compose.yaml)
- [Modelos Sequelize](./infra/models)
- [Middlewares de Segurança](./infra/middleware)
- [Testes de Integração](./tests/integration)
- [Swagger Docs](./lib/swagger/getApiDocsV1.js)
- UESC. _Resolução CONSEPE nº 16/2022_.
- UESC. _Resolução CONSEPE nº 20/2022_.
- [Sequelize ORM](https://sequelize.org)
- [Next.js Documentation](https://nextjs.org/docs)
- [Jest Testing Framework](https://jestjs.io)

---

## 👨‍💻 Autor

**Thompson Raul dos Santos Vieira**  
Estudante de Ciência da Computação — UESC

---

## 📜 Licença

Distribuído sob a licença **MIT**.  
Consulte o arquivo `LICENSE` para mais informações.
