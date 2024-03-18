import { Router } from 'express';
import { create, deleteById } from '../controllers/response.controller.js';

const router = Router();

router.route('/create').post(create);
router.route('/delete/:responseId').delete(deleteById);

export default router;
