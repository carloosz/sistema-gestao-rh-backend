# 🚀 RH+ Backend

> Sistema Web de Gestão de Recursos Humanos - API Backend

## 📖 Sobre

O backend do RH+ é uma API RESTful construída com Strapi.io que gerencia:

- ✅ Autenticação e autorização de usuários
- ✅ CRUD completo de colaboradores
- ✅ Sistema de solicitações com controle de status
- ✅ Geração de dados para relatórios
- ✅ Integração com serviço de e-mail (Brevo API)
- ✅ Conformidade com LGPD

## 🛠️ Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- **[Node.js](https://nodejs.org/)** - v18.x ou superior
- **[Strapi.io](https://strapi.io/)** - v4.x (Headless CMS)
- **[PostgreSQL](https://www.postgresql.org/)** - v14.x (Banco de dados)
- **[Brevo API](https://www.brevo.com/)** - Serviço de envio de e-mails

## 📦 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (v18.x ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (v14.x ou superior)
- [Git](https://git-scm.com/)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/carloosz/sistema-gestao-rh-backend.git
cd sistema-gestao-rh-backend
```

### 2. Instake as dependências

```bash
# Usando npm
npm install

# Ou usando yarn
yarn install
```

### 3. Configure o banco de dados

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE rh_mais;
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Server
HOST=0.0.0.0
PORT=1337
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
JWT_SECRET=

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=rh_mais
DATABASE_USERNAME=sauusuario
DATABASE_PASSWORD=suasenha
DATABASE_SSL=false

# Brevo API (E-mail)
BREVO_API_KEY=sua-chave-api-brevo
BREVO_SENDER_EMAIL=seu-email-´ra-testar
BREVO_SENDER_NAME=RH+

# URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:1337/admin

# Node Environment
NODE_ENV=development
```

### 2. Gerar Secrets

Para gerar os secrets necessários, execute:

```bash
# Gera secrets aleatórios
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Execute este comando 5 vezes e use os valores para:
- APP_KEYS
- API_TOKEN_SALT
- ADMIN_JWT_SECRET
- TRANSFER_TOKEN_SALT
- JWT_SECRET

## 🚀 Executando o Projeto

### Modo Desenvolvimento

```bash
# Usando npm
npm run develop

# Ou usando yarn
yarn develop
```

O servidor estará rodando em: `http://localhost:1337`

Painel administrativo: `http://localhost:1337/admin`
