import { Router } from 'express';
import * as planosController from '../controllers/planosController';

const router = Router();

router.get('/', planosController.listarPlanos);
router.get('/:id', planosController.obterPlano);
router.post('/', planosController.criarPlano);
router.put('/:id', planosController.atualizarPlano);
router.delete('/:id', planosController.excluirPlano);

export default router;
