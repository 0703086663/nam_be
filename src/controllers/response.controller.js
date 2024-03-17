import Airtable from 'airtable';
import { Survey } from '../model/survey.model.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import _ from 'lodash';
import { Response } from '../model/response.model.js';
import airtableAxios from '../utils/transferData.js';
import baseAirtable from '../utils/baseAirtable.js';

export const create = catchAsync(async (req, res, next) => {
  const { content, survey_id, field_id } = req.body;

  if (!content || !survey_id || !field_id)
    return res
      .status(400)
      .json({ message: `Content, survey id, field id can not be empty` });

  var field = new Response({
    content,
    survey_id,
    field_id,
    owner_id: req.user.user._id,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  baseAirtable.table('responses').create(field, async (err, record) => {
    if (err) {
      console.error(err);
      return err;
    }

    field._doc = { ...field._doc, _id: record.getId() };
    await field.save();

    return res
      .status(201)
      .json({ data: field, message: 'Created successfully' });
  });
});
