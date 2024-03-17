import Airtable from 'airtable';
import { Campaign } from '../model/campaign.model.js';
import { Field } from '../model/field.model.js';
import { Survey } from '../model/survey.model.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import airtableAxios from '../utils/transferData.js';
import { Response } from '../model/response.model.js';

// export const createSurvey = catchAsync(async (req, res, next) => {
//   const survey = await Survey.create({
//     name: req.body.name,
//     start_time: req.body.start_time,
//     end_time: req.body.end_time,
//     campaign_id: req.body.campaign_id
//   });
//   req.body.id = survey._id.toString();
//   req.body.created_time = new Date(survey.created_time).getTime();
//   req.body.status = survey.status;
//   next();
// });

export const getAllSurveys = catchAsync(async (req, res, next) => {
  let campaignId = req.params.campaignId;
  const result = await airtableAxios.get(`/meta/bases/${campaignId}/tables`);
  const tables = result.data.tables;
  for (let survey of tables) {
    let surveyExist = await Survey.findById(survey.id);
    if (!surveyExist) {
      let newSurvey = {
        _id: survey.id,
        name: survey.name,
        campaign_id: campaignId
      };
      survey.description && (newSurvey.description = survey.description);
      await Survey.create(newSurvey);
    }
    if (surveyExist && surveyExist.name !== survey.name) {
      await Survey.findByIdAndUpdate(survey.id, { name: survey.name });
    }
    if (surveyExist && surveyExist.description !== survey.description) {
      await Survey.findByIdAndUpdate(survey.id, {
        description: survey.description
      });
    }
  }
  let surveys = await Survey.find(
    { campaign_id: campaignId },
    { __v: false, campaign_id: false }
  );
  let listTableId = tables.map((table) => table.id);
  let delFlag = false;
  for (let survey of surveys) {
    if (!listTableId.includes(survey._id)) {
      delFlag = true;
      await Survey.findByIdAndDelete(survey._id);
      await Field.deleteMany({ survey_id: survey._id });
      await Response.deleteMany({ survey_id: survey._id });
    }
  }
  if (delFlag) {
    surveys = await Survey.find(
      { campaign_id: campaignId },
      { __v: false, campaign_id: false }
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      surveys
    }
  });
});

export const getSurveyById = catchAsync(async (req, res, next) => {
  let surveyId = req.params.id;
  let surveyDB = await Survey.findById(surveyId, { __v: false });
  if (!surveyDB) {
    return next(new AppError('Survey not found', 404));
  }
  let campaignId = surveyDB.campaign_id;
  let result = await airtableAxios.get(`/meta/bases/${campaignId}/tables`);
  let tables = result.data.tables;
  let survey = tables.find((table) => table.id === surveyId);
  req.body.survey = survey;
  req.body.surveyDB = {
    _id: surveyDB._id,
    name: survey.name,
    description: survey.description
  };
  next();
});

// https://api.airtable.com/v0/meta/bases/{baseId}/tables/{tableIdOrName}
export const updateSurveyById = catchAsync(async (req, res, next) => {
  let surveyId = req.params.id;
  let survey = await Survey.findById(surveyId);
  if (!survey) {
    return next(new AppError('Survey not found', 404));
  }
  let campaignId = survey.campaign_id;
  await airtableAxios.patch(
    `/meta/bases/${campaignId}/tables/${surveyId}`,
    req.body
  );
  let surveyDB = await Survey.findByIdAndUpdate(surveyId, req.body, {
    new: true,
    runValidators: true,
    projection: {
      __v: false
    }
  });
  res.status(200).json({
    status: 'success',
    data: {
      survey: surveyDB
    }
  });
});
