import { z } from 'zod';

const CPF_REGEX = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

export const createAlunoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(150).trim(),
  cpf: z.string().refine((v) => CPF_REGEX.test(v) && v.replace(/\D/g, '').length === 11, {
    message: 'CPF inválido',
  }),
  email: z.string().email('E-mail inválido').max(150).toLowerCase().trim(),
  data_nascimento: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: 'Data de nascimento inválida',
  }),
  status: z.enum(['ativo', 'inativo']).optional().default('ativo'),
});

export const updateAlunoSchema = createAlunoSchema.partial();

export type CreateAlunoInput = z.infer<typeof createAlunoSchema>;
export type UpdateAlunoInput = z.infer<typeof updateAlunoSchema>;
