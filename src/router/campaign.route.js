import { Router } from 'express';
import {
  deleteById,
  update,
  create,
  getAll,
  getAllSurvey
} from '../controllers/campaign.controller.js';

const router = Router();

router.route('/delete/:campaignId').delete(deleteById);
router.route('/update/:campaignId').patch(update);
router.route('/create').post(create);
router.route('/:campaignId/surveys').get(getAllSurvey);
router.route('/').get(getAll);

export default router;
