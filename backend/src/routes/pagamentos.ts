import { Router } from 'express';
import * as pagamentosController from '../controllers/pagamentosController';
import { validarIdParam } from '../middlewares/validacao';

const router = Router();

router.get('/', pagamentosController.listarPagamentos);
router.patch('/:id/pagar', validarIdParam, pagamentosController.marcarComoPago);

export default router;
