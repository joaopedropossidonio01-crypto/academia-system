import { z } from 'zod';

export const createMatriculaSchema = z.object({
  aluno_id: z.number().int().positive('ID do aluno inválido'),
  plano_id: z.number().int().positive('ID do plano inválido'),
  data_inicio: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Data de início inválida' })
    .optional(),
});

export type CreateMatriculaInput = z.infer<typeof createMatriculaSchema>;
