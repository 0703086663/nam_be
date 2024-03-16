import { catchAsync } from '../utils/catchAsync.js';
import { Campaign } from '../model/campaign.model.js';
import { airtableAxios } from '../utils/transferData.js';
import dotenv from 'dotenv';
import Airtable from 'airtable';
import { Survey } from '../model/survey.model.js';
import { Field } from '../model/field.model.js';
import { Response } from '../model/response.model.js';

dotenv.config();

// export const createCampaign = catchAsync(async (req, res, next) => {
//   let start_time = req.body.start_time;
//   let end_time = req.body.end_time;
//   delete req.body.start_time;
//   delete req.body.end_time;
//   req.body.tables = [
//     {
//       fields: [
//         {
//           name: 'Default',
//           type: 'singleLineText'
//         }
//       ],
//       name: 'Default'
//     }
//   ];
//   req.body.workspaceId = process.env.WORKSPACE_ID;
//   try {
//     const result = await airtableAxios.post('/meta/bases', req.body);
//     const campaign = await Campaign.create({
//       _id: result.data.id,
//       name: req.body.name,
//       start_time: start_time,
//       end_time: end_time
//     });
//     res.status(201).json({
//       status: 'success',
//       data: {
//         campaign
//       }
//     });
//   } catch (err) {
//     res.status(parseInt(err.response.status)).json({
//       data: {
//         err
//       }
//     });
//   }
// });

export const getAllCampaigns = catchAsync(async (req, res, next) => {
  let result = await airtableAxios.get('/meta/bases');
  let bases = result.data.bases;

  console.log(result);

  for (let base of bases) {
    let campaign = await Campaign.findById(base.id);
    if (!campaign) {
      await Campaign.create({
        _id: base.id,
        name: base.name,
        permissionLevel: base.permissionLevel
      });
    }
    if (campaign && campaign.name !== base.name) {
      await Campaign.findByIdAndUpdate(base.id, { name: base.name });
    }
  }

  let campaigns = await Campaign.find({}, { __v: false });
  let listBaseId = bases.map((base) => base.id);
  let delFlag = false;
  for (let campaign of campaigns) {
    if (!listBaseId.includes(campaign._id)) {
      delFlag = true;
      await Campaign.findByIdAndDelete(campaign._id);
      let surveys = await Survey.find({ campaign_id: campaign._id });
      let listSurveyIds = surveys.map((survey) => survey._id);
      for (let id of listSurveyIds) {
        await Survey.deleteMany({ _id: id });
        await Field.deleteMany({ survey_id: id });
        await Response.deleteMany({ survey_id: id });
      }
    }
  }
  if (delFlag) {
    campaigns = await Campaign.find({}, { __v: false });
  }
  res.status(200).json({
    status: 'success',
    data: {
      campaigns
    }
  });
});
