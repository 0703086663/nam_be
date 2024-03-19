import { Router } from 'express';
import { getAllCampaigns } from '../controllers/campaign.controller.js';
import { getAllSurveys } from '../controllers/survey.controller.js';
const router = Router();

router.route('/:campaignId/surveys').get(getAllSurveys);
router.route('/').get(getAllCampaigns);

export default router;
