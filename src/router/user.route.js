import { Router } from 'express';
import {
  getUserById,
  getProfile,
  postLogin,
  postRegister
} from '../controllers/user.controller.js';
import authenticateToken from '../middleware/authenicate.middleware.js';

const router = Router();

router.route('/profile').get(authenticateToken, getProfile);
router.route('/login').post(postLogin);
router.route('/register').post(postRegister);
router.route('/:userId').get(getUserById);

export default router;
