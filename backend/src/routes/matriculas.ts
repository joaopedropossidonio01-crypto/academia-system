import { Router } from 'express';
import * as matriculasController from '../controllers/matriculasController';
import { validarMatriculaCreate } from '../middlewares/validacao';

const router = Router();

router.post('/', validarMatriculaCreate(), matriculasController.criarMatricula);

export default router;
