import { Router } from 'express';
import { create } from '../controllers/response.controller.js';

const router = Router();

router.route('/create').post(create);

export default router;
