import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const alunoCreateSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150).trim(),
  cpf: z.string().regex(CPF_REGEX, 'CPF inválido (use 11 dígitos ou formato XXX.XXX.XXX-XX)'),
  email: z.string().email('E-mail inválido').max(150),
  dataNascimento: z.string().refine((d) => !isNaN(Date.parse(d)), 'Data de nascimento inválida'),
  status: z.enum(['ativo', 'inativo']).optional().default('ativo'),
  // ADICIONADO AQUI: Agora o validador permite que o plano passe
  plano: z.string().optional().default('Mensal'), 
});

export const alunoUpdateSchema = alunoCreateSchema.partial();

export const planoCreateSchema = z.object({
  nome: z.string().min(2).max(100).trim(),
  preco: z.number().positive('Preço deve ser positivo'),
  duracaoDias: z.number().int().positive('Duração deve ser positiva (dias)'),
});

export const planoUpdateSchema = planoCreateSchema.partial();

export const matriculaCreateSchema = z.object({
  alunoId: z.number().int().positive('ID do aluno inválido'),
  planoId: z.number().int().positive('ID do plano inválido'),
  dataInicio: z.string().refine((d) => !isNaN(Date.parse(d)), 'Data de início inválida'),
});

export const pagamentoPagarSchema = z.object({
  id: z.number().int().positive(),
});

export type AlunoCreateInput = z.infer<typeof alunoCreateSchema>;
export type AlunoUpdateInput = z.infer<typeof alunoUpdateSchema>;
export type PlanoCreateInput = z.infer<typeof planoCreateSchema>;
export type PlanoUpdateInput = z.infer<typeof planoUpdateSchema>;
export type MatriculaCreateInput = z.infer<typeof matriculaCreateSchema>;

function validar(schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === 'body' ? req.body : source === 'params' ? req.params : req.query;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const err = parsed.error as ZodError;
      const messages = err.flatten().fieldErrors;
      return res.status(400).json({
        error: 'Dados inválidos',
        details: messages,
      });
    }
    // IMPORTANTE: Aqui o parsed.data contém apenas os campos validados
    if (source === 'body') (req as Request & { body: unknown }).body = parsed.data;
    else if (source === 'params') req.params = parsed.data as Record<string, string>;
    next();
  };
}

export const validarAlunoCreate = () => validar(alunoCreateSchema);
export const validarAlunoUpdate = () => validar(alunoUpdateSchema);
export const validarPlanoCreate = () => validar(planoCreateSchema);
export const validarPlanoUpdate = () => validar(planoUpdateSchema);
export const validarMatriculaCreate = () => validar(matriculaCreateSchema);
const idParamSchema = z.object({ id: z.string().refine((v) => /^\d+$/.test(v), 'ID deve ser numérico') });
export const validarIdParam = (req: Request, res: Response, next: NextFunction) => {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ error: 'ID inválido', details: parsed.error.flatten().fieldErrors });
  next();
};