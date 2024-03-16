import { Router } from 'express';
import { postLogin, postRegister } from '../controllers/user.controller.js';

const router = Router();

router.route('/login').post(postLogin);
router.route('/register').post(postRegister);

export default router;
