import { catchAsync } from '../utils/catchAsync.js';
import { Campaign } from '../model/campaign.model.js';
import airtableAxios from '../utils/transferData.js';
import { Survey } from '../model/survey.model.js';
import { Field } from '../model/field.model.js';
import { Response } from '../model/response.model.js';
import { v4 as uuidv4 } from 'uuid';
import baseAirtable from '../utils/baseAirtable.js';

export const getAll = catchAsync(async (req, res, next) => {
  // TODO: Get all fields and response if needed
  const records = await baseAirtable.table('campaigns').select().all();

  const data = records.map((record) => record.fields);

  return res.status(200).json({
    message: 'success',
    data
  });
  // let result = await airtableAxios.get('/meta/bases');
  // let bases = result.data.bases;
  // for (let base of bases) {
  //   let campaign = await Campaign.findById(base.id);
  //   if (!campaign) {
  //     await Campaign.create({
  //       _id: base.id,
  //       name: base.name,
  //       permissionLevel: base.permissionLevel
  //     });
  //   }
  //   if (campaign && campaign.name !== base.name) {
  //     await Campaign.findByIdAndUpdate(base.id, { name: base.name });
  //   }
  // }
  // let campaigns = await Campaign.find({}, { __v: false });
  // let listBaseId = bases.map((base) => base.id);
  // let delFlag = false;
  // for (let campaign of campaigns) {
  //   if (!listBaseId.includes(campaign._id)) {
  //     delFlag = true;
  //     await Campaign.findByIdAndDelete(campaign._id);
  //     let surveys = await Survey.find({ campaign_id: campaign._id });
  //     let listSurveyIds = surveys.map((survey) => survey._id);
  //     for (let id of listSurveyIds) {
  //       await Survey.deleteMany({ _id: id });
  //       await Field.deleteMany({ survey_id: id });
  //       await Response.deleteMany({ survey_id: id });
  //     }
  //   }
  // }
  // if (delFlag) {
  //   campaigns = await Campaign.find({}, { __v: false });
  // }
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     campaigns
  //   }
  // });
});

export const create = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { user } = req.user;

  if (!name) return res.status(400).json({ message: `Name can not be empty` });

  const campaign = new Campaign({
    _id: uuidv4(),
    name,
    owner_id: user._id.toString()
  });

  baseAirtable.table('campaigns').create(campaign);

  await campaign.save();

  return res
    .status(201)
    .json({ data: campaign, message: 'Created successfully' });
});

export const update = catchAsync(async (req, res, next) => {
  const _id = req.params.campaignId;

  if (!_id) throw new Error(`Campaign ID not provided`);

  await baseAirtable('campaigns').update(_id, ...req.body);

  const updatedCampaign = await Campaign.findByIdAndUpdate(_id, req.body);

  return res.json({
    message: 'Campaign updated successfully',
    campaign: updatedCampaign
  });
});

export const deleteById = catchAsync(async (req, res, next) => {
  const campaignId = req.params.campaignId;
});
