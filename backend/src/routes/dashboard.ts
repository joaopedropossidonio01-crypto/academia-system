import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/metrics', dashboardController.obterMetricas);

export default router;
