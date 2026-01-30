import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. CONFIGURAÇÃO DE SEGURANÇA (CORS) LIBERADA ---
app.use(cors({
  origin: '*', // Isso libera o acesso para a Vercel e qualquer outro lugar
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. LOG DE ESPIONAGEM ---
// Isso vai mostrar nos logs do Render toda vez que alguém tentar entrar
app.use((req, _res, next) => {
  console.log(`[REQUEST RECEBIDO] Metodo: ${req.method} | Rota: ${req.path}`);
  next();
});

// Rota Raiz (para quando você clicar no link do Render não dar erro)
app.get('/', (_req, res) => {
  res.send('API do Sistema Academia está ONLINE 🚀');
});

app.use(routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});