import { Router } from 'express';
import {
  getAllSurveys,
  getSurveyById,
  updateSurveyById
} from '../controllers/survey.controller.js';
import {
  // createFields,
  getAllFields
} from '../controllers/field.controller.js';
import {
  validateSurveyForUpdate,
  verifyFields
} from '../middleware/validate.middleware.js';

const router = Router();

router.route('/all/:campaignId').get(getAllSurveys);

router
  .route('/:id')
  .get(getSurveyById, getAllFields)
  .put(
    validateSurveyForUpdate,
    verifyFields('name', 'description'),
    updateSurveyById
  );

export default router;
