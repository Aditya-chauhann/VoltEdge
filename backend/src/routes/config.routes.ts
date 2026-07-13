import { Router } from 'express';
import { getPublicConfig, getPolicy } from '../controllers/config.controller';

const router = Router();

router.get('/public', getPublicConfig);
router.get('/policy/:type', getPolicy);

export default router;
