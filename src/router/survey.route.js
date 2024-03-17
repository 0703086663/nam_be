import { Router } from 'express';
import {
  deleteById,
  update,
  create,
  getSurveyById,
  getAll
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

// router.route('/all/:campaignId').get(getAllSurveys);

// router
//   .route('/:id')
//   .get(getSurveyById, getAllFields)
//   .put(
//     validateSurveyForUpdate,
//     verifyFields('name', 'description'),
//     updateSurveyById
//   );

router.route('/delete/:surveyId').delete(deleteById);
router.route('/update/:surveyId').patch(update);
router.route('/create').post(create);
router.route('/:surveyId').get(getSurveyById);
router.route('/').get(getAll);

export default router;
