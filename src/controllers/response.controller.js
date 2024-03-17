import Airtable from 'airtable';
import { Survey } from '../model/survey.model.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import _ from 'lodash';
import { Response } from '../model/response.model.js';
import airtableAxios from '../utils/transferData.js';

// Initialize Airtable client
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.API_KEY
});

export const getAllRecords = catchAsync(async (req, res, next) => {
  let surveyId = req.params.surveyId;
  let survey = await Survey.findById(surveyId);
  if (!survey) {
    return next(new AppError('Survey not found', 404));
  }
  let base = Airtable.base(survey.campaign_id);
  base(survey.name)
    .select({})
    .all(async (err, records) => {
      if (err) {
        return next(new AppError('Error fetching records', 500));
      }
      let responses = records.map((record) => record._rawJson);
      for (let response of responses) {
        let responseExist = await Response.findById(response.id);
        if (!responseExist) {
          let newResponse = structuredClone(response);
          delete newResponse.id;
          newResponse._id = response.id;
          newResponse.survey_id = surveyId;
          await Response.create(newResponse);
        }
        if (
          responseExist &&
          !_.isEqual(responseExist.fields, response.fields)
        ) {
          await Response.findByIdAndUpdate(response.id, {
            fields: response.fields
          });
        }
      }
      let responsesDB = await Response.find(
        { survey_id: surveyId },
        { __v: false }
      );
      let listResponseIds = responses.map((res) => res.id);
      let delFlag = false;
      for (let response of responsesDB) {
        if (!listResponseIds.includes(response._id)) {
          delFlag = true;
          await Response.findByIdAndDelete(response._id);
        }
      }
      if (delFlag) {
        responsesDB = await Response.find(
          { survey_id: surveyId },
          { __v: false }
        );
      }
      res.status(200).json({
        status: 'success',
        data: {
          responses: responsesDB
        }
      });
    });
});

export const getResponseById = catchAsync(async (req, res, next) => {
  let responseId = req.params.responseId;
  let response = await Response.findById(responseId);
  if (!response) {
    return next(new AppError('Response not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      response
    }
  });
});
// https://api.airtable.com/v0/{baseId}/{tableIdOrName}/{recordId}
export const getResponseByIdAndDelete = catchAsync(async (req, res, next) => {
  let recordId = req.params.responseId;
  let response = await Response.findById(recordId).populate('survey_id');
  if (!response) {
    return next(new AppError('Response not found', 404));
  }
  let surveyId = response.survey_id._id;
  let baseId = response.survey_id.campaign_id;
  console.log(surveyId, baseId, recordId);
  const result = await airtableAxios.delete(
    `/${baseId}/${surveyId}/${recordId}`
  );
  await Response.findByIdAndDelete(recordId);
  if (!result) {
    return next(new AppError('Response not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      result: result.data
    }
  });
});
