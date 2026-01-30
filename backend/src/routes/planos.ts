import { Router } from 'express';
import * as planosController from '../controllers/planosController';
import { validarPlanoCreate, validarPlanoUpdate, validarIdParam } from '../middlewares/validacao';

const router = Router();

router.get('/', planosController.listarPlanos);
router.get('/:id', validarIdParam, planosController.obterPlano);
router.post('/', validarPlanoCreate(), planosController.criarPlano);
router.put('/:id', validarIdParam, validarPlanoUpdate(), planosController.atualizarPlano);
router.delete('/:id', validarIdParam, planosController.excluirPlano);

export default router;
