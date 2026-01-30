# Sistema de Gestão de Academias

Protótipo Full Stack: Backend (Node.js + TypeScript + Prisma + MySQL) e Frontend (React + Vite + TypeScript + Tailwind + Lucide + Axios).

## Estrutura

```
Academia_System/
├── backend/          # API Node.js + Express + Prisma
│   ├── prisma/       # schema.prisma
│   ├── scripts/      # init-db.sql (MySQL)
│   └── src/
├── frontend/         # React + Vite + Tailwind
│   └── src/
└── README.md
```

## Banco de Dados (MySQL)

- **Banco:** `academia_db`
- **Tabelas:** planos, alunos, matriculas, pagamentos (normalizadas, PK/FK)

### Criar o banco

```bash
mysql -u root -p < backend/scripts/init-db.sql
```

Ou execute o conteúdo de `backend/scripts/init-db.sql` no MySQL Workbench/CLI.

## Backend

```bash
cd backend
cp .env.example .env   # Ajuste DATABASE_URL e PORT
npm install
npx prisma generate
npm run dev
```

API em `http://localhost:3001` (ou PORT do .env).

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App em `http://localhost:5173`. O proxy envia `/api` para o backend.

## Variáveis de ambiente (backend)

Crie `backend/.env`:

- `DATABASE_URL`: conexão MySQL (ex: `mysql://usuario:senha@localhost:3306/academia_db`)
- `PORT`: porta do servidor (ex: 3001)
