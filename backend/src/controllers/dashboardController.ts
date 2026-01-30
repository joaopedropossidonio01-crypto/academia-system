import { Request, Response } from 'express';
import { prisma } from '../models/prisma';

export async function obterMetricas(req: Request, res: Response) {
  try {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const totalAlunosAtivos = await prisma.aluno.count({
      where: { status: 'ativo' },
    });

    const alunosComPendencia = await prisma.aluno.findMany({
      where: {
        status: 'ativo',
        matriculas: {
          some: {
            pagamentos: {
              some: {
                statusPagamento: 'pendente',
                dataVencimento: { lt: hoje },
              },
            },
          },
        },
      },
      select: { id: true },
    });
    const totalInadimplentes = alunosComPendencia.length;

    return res.json({
      totalAlunosAtivos,
      totalInadimplentes,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao obter métricas' });
  }
}
