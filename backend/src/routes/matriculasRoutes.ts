import { Router } from 'express';
import * as matriculasController from '../controllers/matriculasController';

const router = Router();

router.post('/', matriculasController.criarMatricula);
router.get('/', matriculasController.listarMatriculas);

export default router;
