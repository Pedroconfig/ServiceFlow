Segue um texto pronto para usar como `README.md`:

```md
# ServiceFlow

ServiceFlow é uma aplicação web para gestão de ordens de serviço. O sistema permite que uma empresa cadastre clientes, serviços prestados, gere ordens de serviço com itens e valores, acompanhe status e emita documentos em PDF.

## Funcionalidades

- Cadastro e login de usuários.
- Criação automática de uma empresa no registro do usuário.
- Autenticação com JWT armazenado em cookie HTTP-only.
- Recuperação de senha por e-mail com token temporário.
- Dashboard protegido para usuários autenticados.
- Cadastro, listagem, edição e remoção de clientes.
- Cadastro, listagem, edição e remoção de serviços.
- Cadastro e gerenciamento de ordens de serviço.
- Cálculo automático de subtotal e total da ordem.
- Status de ordem de serviço:
  - Aberta
  - Em andamento
  - Concluída
  - Cancelada
- Geração de PDF da ordem de serviço.
- Perfil da empresa com dados como documento, e-mail, telefone, endereço e logo.
- Separação dos dados por empresa, usando o `companyId` do usuário autenticado.

## Tecnologias Utilizadas

- **Next.js 16**: framework principal da aplicação.
- **React 19**: construção da interface.
- **TypeScript**: tipagem estática no frontend e backend.
- **App Router do Next.js**: organização das páginas, layouts e rotas API.
- **Prisma 7**: ORM para modelagem e acesso ao banco de dados.
- **PostgreSQL**: banco de dados relacional.
- **@prisma/adapter-pg**: adapter PostgreSQL usado pelo Prisma.
- **Zod**: validação dos dados recebidos nas APIs.
- **bcryptjs**: geração e comparação de hash de senhas.
- **jose**: criação e validação de tokens JWT.
- **Resend**: envio de e-mails de recuperação de senha.
- **@react-pdf/renderer**: geração de PDFs no servidor.
- **Tailwind CSS 4**: estilização da interface.
- **Lucide React**: ícones da interface.
- **ESLint**: padronização e análise estática do código.

## Estrutura do Projeto

```txt
service/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── generated/
│   └── prisma/
├── public/
│   └── image/
├── src/
│   └── app/
│       ├── (auth)/
│       ├── (protected)/
│       ├── api/
│       ├── components/
│       ├── lib/
│       ├── validations/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── Docker-compose.yaml
├── package.json
├── prisma.config.ts
├── next.config.ts
└── tsconfig.json
```

## Modelo de Dados

O banco de dados possui as principais entidades:

- **User**: usuário da aplicação.
- **Company**: empresa vinculada ao usuário.
- **Client**: clientes da empresa.
- **Service**: serviços oferecidos pela empresa.
- **ServiceOrder**: ordens de serviço.
- **ServiceOrderItem**: itens de uma ordem de serviço.
- **PasswordResetToken**: tokens usados na recuperação de senha.

Cada usuário possui uma empresa, e os clientes, serviços e ordens ficam vinculados a essa empresa. Isso garante isolamento dos dados entre contas diferentes.

## Rotas Principais

### Autenticação

- `POST /api/Auth` - cadastro de usuário.
- `POST /api/Auth/login` - login.
- `POST /api/Auth/logout` - logout.
- `GET /api/Auth/me` - usuário autenticado.
- `POST /api/Auth/forgot-password` - solicitação de recuperação de senha.
- `POST /api/Auth/reset-password` - redefinição de senha.

### Empresa

- `GET /api/company/me` - dados da empresa do usuário.
- `PATCH /api/company/me` - atualização dos dados da empresa.

### Clientes

- `GET /api/clients` - listar clientes.
- `POST /api/clients` - criar cliente.
- `GET /api/clients/[id]` - buscar cliente.
- `PATCH /api/clients/[id]` - atualizar cliente.
- `DELETE /api/clients/[id]` - remover cliente.

### Serviços

- `GET /api/services` - listar serviços.
- `POST /api/services` - criar serviço.
- `GET /api/services/[id]` - buscar serviço.
- `PATCH /api/services/[id]` - atualizar serviço.
- `DELETE /api/services/[id]` - remover serviço.

### Ordens de Serviço

- `GET /api/service-order` - listar ordens.
- `POST /api/service-order` - criar ordem.
- `GET /api/service-order/[id]` - buscar ordem.
- `PATCH /api/service-order/[id]` - atualizar descrição ou status.
- `DELETE /api/service-order/[id]` - remover ordem.
- `GET /api/service-order-pdf/[id]` - gerar PDF da ordem.

### Saúde da Aplicação

- `GET /api/health` - verifica conexão com banco e retorna contagem de empresas.

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `service/` com as variáveis abaixo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/serviceflow"
JWT_SECRET="sua_chave_secreta"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_API_KEY="sua_api_key_do_resend"
RESEND_FROM_EMAIL="email@seudominio.com"
```

## Como Executar

Instale as dependências:

```bash
npm install
```

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
```

Gere o client do Prisma:

```bash
npx prisma generate
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:3000
```

## Scripts Disponíveis

```bash
npm run dev
```

Inicia o projeto em modo desenvolvimento.

```bash
npm run build
```

Gera a versão de produção.

```bash
npm run start
```

Executa a aplicação em produção após o build.

```bash
npm run lint
```

Executa o ESLint no projeto.

## Docker

O projeto possui um `Docker-compose.yaml` para executar a aplicação em container Node.js:

```bash
docker compose up
```

O container usa a imagem `node:24.12.0-alpine`, instala as dependências com `npm ci` e inicia o ambiente de desenvolvimento com `npm run dev`.

A configuração espera uma rede Docker externa chamada:

```txt
service_network
```

## Segurança

- Senhas são armazenadas com hash usando `bcryptjs`.
- Sessões usam JWT assinado com `JWT_SECRET`.
- O token de autenticação é salvo em cookie HTTP-only.
- Rotas protegidas validam o usuário autenticado antes de acessar dados.
- Dados de clientes, serviços e ordens são filtrados pela empresa do usuário.
- Tokens de recuperação de senha são armazenados como hash e expiram em 30 minutos.

## Observações

O projeto utiliza o App Router do Next.js e concentra boa parte da regra de negócio nas rotas API dentro de `src/app/api`. A interface protegida fica em `src/app/(protected)` e as telas públicas de autenticação ficam em `src/app/(auth)`.
```
