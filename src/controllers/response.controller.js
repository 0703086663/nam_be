import { catchAsync } from '../utils/catchAsync.js';
import { Response } from '../model/response.model.js';
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

export const deleteById = catchAsync(async (req, res, next) => {
  const _id = req.params.responseId;

  if (!_id) throw new Error(`Response ID not provided`);

  const response = await Response.findById(_id);
  if (!response) return res.status(404).json({ error: 'Response not found' });

  baseAirtable('responses').destroy(_id, async (err) => {
    if (err) {
      console.error('Error deleting fields from Airtable:', err);
      throw new Error('Internal server error');
    }

    await Response.deleteOne({ _id });

    return res
      .status(200)
      .json({ success: true, message: 'Deleted successfully' });
  });
});
