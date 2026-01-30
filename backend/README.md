# Backend - API Sistema de Gestão de Academias

API REST com **Express**, **Prisma** e **MySQL**, organizada em arquitetura **MVC**.

## Configuração

1. Copie `.env.example` para `.env` e ajuste a conexão MySQL:
   ```
   DATABASE_URL="mysql://usuario:senha@localhost:3306/academia_db"
   PORT=3001
   ```

2. Instale as dependências e gere o cliente Prisma:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev   # ou use o script scripts/init-db.sql no MySQL
   ```

3. Inicie o servidor:
   ```bash
   npm run dev
   ```

A API ficará disponível em `http://localhost:3001`.

## Estrutura (MVC)

- **`src/controllers/`** – Lógica de resposta (alunos, planos, matrículas, pagamentos, dashboard)
- **`src/models/`** – Cliente Prisma (acesso ao banco)
- **`src/routes/`** – Definição dos endpoints
- **`src/middlewares/validacao.ts`** – Validação de entrada com Zod (segurança/consistência)

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/alunos` | Lista alunos (query: `?status=ativo` ou `inativo`) |
| GET | `/alunos/:id` | Obtém um aluno |
| POST | `/alunos` | Cria aluno (body: nome, cpf, email, dataNascimento, status?) |
| PUT | `/alunos/:id` | Atualiza aluno |
| DELETE | `/alunos/:id` | Remove aluno |
| GET | `/planos` | Lista planos |
| GET | `/planos/:id` | Obtém um plano |
| POST | `/planos` | Cria plano (body: nome, preco, duracaoDias) |
| PUT | `/planos/:id` | Atualiza plano |
| DELETE | `/planos/:id` | Remove plano |
| POST | `/matriculas` | Cria matrícula (body: alunoId, planoId, dataInicio). **data_fim** é calculada pela duração do plano; mensalidades são criadas automaticamente. |
| GET | `/pagamentos` | Lista pagamentos (query: `?matriculaId`, `?status=pendente|pago`) |
| PATCH | `/pagamentos/:id/pagar` | Marca mensalidade como paga |
| GET | `/dashboard/metrics` | Retorna `{ totalAlunosAtivos, totalInadimplentes }` |

## Segurança e validação

- Entrada validada com **Zod** (tipos, tamanhos, CPF, e-mail, datas).
- Respostas de erro padronizadas (400 para validação, 404 para não encontrado, 409 para conflito).
- IDs numéricos validados nos parâmetros de rota.
