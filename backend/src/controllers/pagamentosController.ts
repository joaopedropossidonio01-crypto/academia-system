import { Request, Response } from 'express';
import { prisma } from '../models/prisma';

export async function marcarComoPago(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const pagamento = await prisma.pagamento.findUnique({ where: { id } });
    if (!pagamento) return res.status(404).json({ error: 'Pagamento não encontrado' });
    if (pagamento.statusPagamento === 'pago') {
      return res.status(400).json({ error: 'Mensalidade já está paga' });
    }
    const atualizado = await prisma.pagamento.update({
      where: { id },
      data: { statusPagamento: 'pago' },
      include: { matricula: { include: { aluno: true, plano: true } } },
    });
    return res.json(atualizado);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return res.status(404).json({ error: 'Pagamento não encontrado' });
    console.error(e);
    return res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
}

export async function listarPagamentos(req: Request, res: Response) {
  try {
    const { matriculaId, status } = req.query;
    const where: { matriculaId?: number; statusPagamento?: 'pendente' | 'pago' } = {};
    if (matriculaId) where.matriculaId = parseInt(String(matriculaId), 10);
    if (status === 'pendente' || status === 'pago') where.statusPagamento = status;
    const pagamentos = await prisma.pagamento.findMany({
      where,
      orderBy: { dataVencimento: 'asc' },
      include: { matricula: { include: { aluno: true, plano: true } } },
    });
    return res.json(pagamentos);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
}
