import { catchAsync } from '../utils/catchAsync.js';
import { Campaign } from '../model/campaign.model.js';
import baseAirtable from '../utils/baseAirtable.js';
import deleteRelated from '../utils/deleteRelated.js';

export const getAllSurvey = catchAsync(async (req, res, next) => {
  const _id = req.params.campaignId;

  baseAirtable('surveys')
    .select({
      filterByFormula: `{campaign_id} = "${_id}"`
    })
    .all(function (err, records) {
      if (err) return;

      const data = records.map((record) => record.fields);

      return res.status(200).json({ message: 'Successfully', data });
    });
});

export const getAll = catchAsync(async (req, res, next) => {
  const records = await baseAirtable.table('campaigns').select().all();

  const data = records.map((record) => record.fields);

  return res.status(200).json({
    message: 'success',
    data
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { user } = req.user;

  if (!name) return res.status(400).json({ message: `Name can not be empty` });

  var campaign = new Campaign({
    name,
    owner_id: user._id.toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  });

  baseAirtable.table('campaigns').create(campaign, async (err, record) => {
    if (err) {
      return err;
    }

    campaign._doc = { ...campaign._doc, _id: record.getId() };
    await campaign.save();

    return res
      .status(201)
      .json({ data: campaign, message: 'Created successfully' });
  });
});

export const update = catchAsync(async (req, res, next) => {
  const _id = req.params.campaignId;
  const owner = req.user.user;

  if (!_id) return res.status(400).json({ error: 'Campaign ID not provided' });

  const campaign = await Campaign.findById(_id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  if (campaign.owner_id !== owner._id)
    return res
      .status(403)
      .json({ error: 'You are not allowed to update this campaign' });

  baseAirtable('campaigns').update(_id, req.body, async (err, record) => {
    if (err) return;

    const updatedCampaign = await Campaign.findByIdAndUpdate(_id, req.body, {
      new: true
    });

    return res.status(200).json({
      message: 'Campaign updated successfully',
      data: updatedCampaign
    });
  });
});

export const deleteById = catchAsync(async (req, res, next) => {
  const _id = req.params.campaignId;
  const owner = req.user.user;
  if (!_id) throw new Error(`Campaign ID not provided`);

  const campaign = await Campaign.findById(_id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  if (campaign.owner_id !== owner._id)
    return res
      .status(403)
      .json({ error: 'You are not allowed to delete this campaign' });

  try {
    baseAirtable('campaigns').destroy(_id, async (err, deletedRecord) => {
      if (err) return;

      await Campaign.deleteOne({ _id });

      baseAirtable('surveys')
        .select({
          filterByFormula: `{campaign_id} = "${_id}"`
        })
        .eachPage((records) => {
          const surveyIds = records.map((record) => record.id);

          if (surveyIds.length > 0) {
            baseAirtable('surveys').destroy(surveyIds, async (err) => {
              if (err) {
                console.error('Error deleting surveys from Airtable:', err);
                return reject(err);
              }

              result = await deleteRelated(_id);
            });
          }
        });

      return res.status(200).json({ message: 'Deleted successfully' });
    });
  } catch (err) {
    console.error(err);
    return new Error(err);
  }
});
