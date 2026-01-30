import { Router } from 'express';
import alunos from './alunos';
import planos from './planos';
import matriculas from './matriculas';
import pagamentos from './pagamentos';
import dashboard from './dashboard';

const router = Router();

router.use('/alunos', alunos);
router.use('/planos', planos);
router.use('/matriculas', matriculas);
router.use('/pagamentos', pagamentos);
router.use('/dashboard', dashboard);

export default router;
