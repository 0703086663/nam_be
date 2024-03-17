import { Router } from 'express';
import {
  deleteById,
  update,
  create,
  getAll
} from '../controllers/campaign.controller.js';

const router = Router();

router.route('/delete/:campaignId').delete(deleteById);
router.route('/update/:campaignId').patch(update);
router.route('/create').post(create);
router.route('/').get(getAll);

export default router;
