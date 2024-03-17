import { Router } from 'express';
import { deleteById, update, create } from '../controllers/field.controller.js';

const router = Router();

router.route('/create').post(create);
router.route('/update/:fieldId').patch(update);
router.route('/delete/:fieldId').delete(deleteById);

export default router;
