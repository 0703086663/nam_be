import { Router } from 'express';
import {
  deleteById,
  update,
  create,
  getSurveyById,
  getAll,
  getAllFields,
  getAllResponses
} from '../controllers/survey.controller.js';

const router = Router();

router.route('/delete/:surveyId').delete(deleteById);
router.route('/update/:surveyId').patch(update);
router.route('/create').post(create);
router.route('/:surveyId').get(getSurveyById);
router.route('/:surveyId/fields').get(getAllFields);
router.route('/:surveyId/responses').get(getAllResponses);
router.route('/').get(getAll);

export default router;
