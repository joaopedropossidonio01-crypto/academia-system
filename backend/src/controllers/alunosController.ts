import { Request, Response } from 'express';
import { prisma } from '../models/prisma';
import { AlunoCreateInput, AlunoUpdateInput } from '../middlewares/validacao';

// Interfaces ajustadas para o TypeScript não reclamar
interface AlunoInputComPlano extends AlunoCreateInput {
  plano: string; 
}

interface AlunoUpdateComPlano extends AlunoUpdateInput {
  plano?: string;
}

export async function listarAlunos(req: Request, res: Response) {
  try {
    const { status } = req.query;
    const where = status ? { status: status as 'ativo' | 'inativo' } : {};
    const alunos = await prisma.aluno.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { matriculas: { include: { plano: true } } },
    });
    return res.json(alunos);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao listar alunos' });
  }
}

export async function obterAluno(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: { matriculas: { include: { plano: true, pagamentos: true } } },
    });
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
    return res.json(aluno);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao obter aluno' });
  }
}

export async function criarAluno(req: Request, res: Response) {
  try {
    const body = req.body as AlunoInputComPlano;
    const dataNascimento = new Date(body.dataNascimento);
    const aluno = await prisma.aluno.create({
      data: {
        nome: body.nome,
        cpf: body.cpf.replace(/\D/g, '').slice(0, 11),
        email: body.email,
        dataNascimento,
        status: (body.status ?? 'ativo') as 'ativo' | 'inativo',
        plano: body.plano, 
      },
    });
    return res.status(201).json(aluno);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2002') return res.status(409).json({ error: 'CPF ou e-mail já cadastrado' });
    console.error(e);
    return res.status(500).json({ error: 'Erro ao criar aluno' });
  }
}

export async function atualizarAluno(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body as AlunoUpdateComPlano;
    const data: Record<string, unknown> = {};
    
    if (body.nome !== undefined) data.nome = body.nome;
    if (body.email !== undefined) data.email = body.email;
    if (body.dataNascimento !== undefined) data.dataNascimento = new Date(body.dataNascimento);
    if (body.status !== undefined) data.status = body.status;
    if (body.cpf !== undefined) data.cpf = body.cpf.replace(/\D/g, '').slice(0, 11);
    if (body.plano !== undefined) data.plano = body.plano;

    const aluno = await prisma.aluno.update({
      where: { id },
      data: data as Parameters<typeof prisma.aluno.update>[0]['data'],
    });
    return res.json(aluno);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return res.status(404).json({ error: 'Aluno não encontrado' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'CPF ou e-mail já cadastrado' });
    console.error(e);
    return res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
}

// ESTA ERA A FUNÇÃO QUE FALTAVA PARA CORRIGIR O ERRO NAS ROTAS:
export async function excluirAluno(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.aluno.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2025') return res.status(404).json({ error: 'Aluno não encontrado' });
    // P2003 acontece se tentar apagar aluno que tem matricula ativa (proteção do banco)
    if (err.code === 'P2003') return res.status(409).json({ error: 'Aluno possui matrículas vinculadas' });
    console.error(e);
    return res.status(500).json({ error: 'Erro ao excluir aluno' });
  }
}