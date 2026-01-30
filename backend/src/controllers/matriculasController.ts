import { Request, Response } from 'express';
import { prisma } from '../models/prisma';
import { MatriculaCreateInput } from '../middlewares/validacao';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function criarMatricula(req: Request, res: Response) {
  try {
    const body = req.body as MatriculaCreateInput;
    const dataInicio = new Date(body.dataInicio);
    dataInicio.setHours(0, 0, 0, 0);

    const plano = await prisma.plano.findUnique({ where: { id: body.planoId } });
    if (!plano) return res.status(404).json({ error: 'Plano não encontrado' });

    const aluno = await prisma.aluno.findUnique({ where: { id: body.alunoId } });
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });

    const duracaoDias = plano.duracaoDias;
    const dataFim = addDays(dataInicio, duracaoDias);

    const matricula = await prisma.matricula.create({
      data: {
        alunoId: body.alunoId,
        planoId: body.planoId,
        dataInicio,
        dataFim,
      },
    });

    const numMensalidades = Math.max(1, Math.ceil(duracaoDias / 30));
    const valorMensal = Number(plano.preco) / numMensalidades;
    const pagamentos = [];
    for (let i = 0; i < numMensalidades; i++) {
      const dataVencimento = addDays(dataInicio, 30 * (i + 1));
      pagamentos.push({
        matriculaId: matricula.id,
        valor: valorMensal,
        dataVencimento,
        statusPagamento: 'pendente' as const,
      });
    }
    await prisma.pagamento.createMany({ data: pagamentos });

    const matriculaComRelacoes = await prisma.matricula.findUnique({
      where: { id: matricula.id },
      include: { aluno: true, plano: true, pagamentos: true },
    });
    return res.status(201).json(matriculaComRelacoes);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao criar matrícula' });
  }
}
