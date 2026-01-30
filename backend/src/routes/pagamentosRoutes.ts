import { Router } from 'express';
import * as pagamentosController from '../controllers/pagamentosController';

const router = Router();

router.get('/', pagamentosController.listarPagamentos);
router.patch('/:id/pagar', pagamentosController.marcarComoPago);

export default router;
