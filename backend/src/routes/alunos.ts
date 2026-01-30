import { Router } from 'express';
import * as alunosController from '../controllers/alunosController';
import { validarAlunoCreate, validarAlunoUpdate, validarIdParam } from '../middlewares/validacao';

const router = Router();

router.get('/', alunosController.listarAlunos);
router.get('/:id', validarIdParam, alunosController.obterAluno);
router.post('/', validarAlunoCreate(), alunosController.criarAluno);
router.put('/:id', validarIdParam, validarAlunoUpdate(), alunosController.atualizarAluno);
router.delete('/:id', validarIdParam, alunosController.excluirAluno);

export default router;
