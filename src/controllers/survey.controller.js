import { Survey } from '../model/survey.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import baseAirtable from '../utils/baseAirtable.js';

// TODO: Delete fields, reponses
export const deleteById = catchAsync(async (req, res, next) => {
  const _id = req.params.surveyId;

  if (!_id) throw new Error(`Survey ID not provided`);

  const survey = await Survey.findById(_id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });

  baseAirtable('surveys').destroy(_id, async (err, deletedRecord) => {
    if (err) return;

    await Survey.deleteOne({ _id });

    return res.status(200).json({
      message: 'Survey deleted successfully'
    });
  });
});

export const update = catchAsync(async (req, res, next) => {
  const _id = req.params.surveyId;

  if (!_id) return res.status(400).json({ error: 'Survey ID not provided' });

  const survey = await Survey.findById(_id);
  if (!survey) return res.status(404).json({ error: 'Survey not found' });

  baseAirtable('surveys').update(_id, req.body, async (err, record) => {
    if (err) return;

    const updatedSurvey = await Survey.findByIdAndUpdate(_id, req.body, {
      new: true
    });

    return res.status(200).json({
      message: 'Survey updated successfully',
      data: updatedSurvey
    });
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { name, description, campaign_id } = req.body;

  if (!name) return res.status(400).json({ message: `Name can not be empty` });

  var survey = new Survey({
    name,
    description,
    campaign_id,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  baseAirtable.table('surveys').create(survey, async (err, record) => {
    if (err) {
      return err;
    }

    survey._doc = { ...survey._doc, _id: record.getId() };
    await survey.save();

    return res
      .status(201)
      .json({ data: survey, message: 'Created successfully' });
  });
});

export const getSurveyById = catchAsync(async (req, res, next) => {
  const _id = req.params.surveyId;

  const survey = await Survey.findById(_id);

  baseAirtable('surveys').find(_id, function (err, record) {
    if (err) return err;

    return res.status(200).json({ message: 'Successfully', data: survey });
  });
});

export const getAll = catchAsync(async (req, res, next) => {
  const records = await baseAirtable.table('surveys').select().all();

  const data = records.map((record) => record.fields);

  return res.status(200).json({
    message: 'success',
    data
  });
});

export const getAllFields = catchAsync(async (req, res, next) => {
  const _id = req.params.surveyId;

  baseAirtable('fields')
    .select({
      filterByFormula: `{survey_id} = "${_id}"`
    })
    .all(function (err, records) {
      if (err) return;

      const data = records.map((record) => record.fields);

      return res.status(200).json({ message: 'Successfully', data });
    });
});
