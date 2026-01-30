import { z } from 'zod';

export const createPlanoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100).trim(),
  preco: z.number().positive('Preço deve ser positivo').finite(),
  duracao_dias: z.number().int().positive('Duração deve ser um número inteiro positivo'),
});

export const updatePlanoSchema = createPlanoSchema.partial();

export type CreatePlanoInput = z.infer<typeof createPlanoSchema>;
export type UpdatePlanoInput = z.infer<typeof updatePlanoSchema>;
