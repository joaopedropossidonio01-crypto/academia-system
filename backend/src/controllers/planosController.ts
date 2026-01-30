import { Request, Response } from 'express';
import { prisma } from '../models/prisma';
import { PlanoCreateInput, PlanoUpdateInput } from '../middlewares/validacao';

export async function listarPlanos(req: Request, res: Response) {
  try {
    const planos = await prisma.plano.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { matriculas: true } } },
    });
    return res.json(planos);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao listar planos' });
  }
}

export async function obterPlano(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const plano = await prisma.plano.findUnique({
      where: { id },
      include: { matriculas: { include: { aluno: true } } },
    });
    if (!plano) return res.status(404).json({ error: 'Plano não encontrado' });
    return res.json(plano);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao obter plano' });
  }
}

export async function criarPlano(req: Request, res: Response) {
  try {
    const body = req.body as PlanoCreateInput;
    const plano = await prisma.plano.create({
      data: {
        nome: body.nome,
        preco: body.preco,
        duracaoDias: body.duracaoDias,
      },
    });
    return res.status(201).json(plano);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao criar plano' });
  }
}

export async function atualizarPlano(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body as PlanoUpdateInput;
    const plano = await prisma.plano.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && { nome: body.nome }),
        ...(body.preco !== undefined && { preco: body.preco }),
        ...(body.duracaoDias !== undefined && { duracaoDias: body.duracaoDias }),
      },
    });
    return res.json(plano);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return res.status(404).json({ error: 'Plano não encontrado' });
    console.error(e);
    return res.status(500).json({ error: 'Erro ao atualizar plano' });
  }
}

export async function excluirPlano(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.plano.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return res.status(404).json({ error: 'Plano não encontrado' });
    if (err.code === 'P2003') return res.status(409).json({ error: 'Plano possui matrículas vinculadas' });
    console.error(e);
    return res.status(500).json({ error: 'Erro ao excluir plano' });
  }
}
