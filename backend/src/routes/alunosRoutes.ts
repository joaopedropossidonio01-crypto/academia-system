import { Router } from 'express';
import * as alunosController from '../controllers/alunosController';

const router = Router();

router.get('/', alunosController.listarAlunos);
router.get('/:id', alunosController.obterAluno);
router.post('/', alunosController.criarAluno);
router.put('/:id', alunosController.atualizarAluno);
router.delete('/:id', alunosController.excluirAluno);

export default router;
