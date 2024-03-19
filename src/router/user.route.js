import { Router } from 'express';
import {
  getUserById,
  postLogin,
  postRegister
} from '../controllers/user.controller.js';
import authenticateToken from '../middleware/authenicate.middleware.js';

const router = Router();

router.route('/login').post(postLogin);
router.route('/register').post(postRegister);
router.route('/:userId').get(authenticateToken, getUserById);

export default router;
