import { Field } from '../model/field.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import baseAirtable from '../utils/baseAirtable.js';

export const deleteById = catchAsync(async (req, res, next) => {
  const _id = req.params.fieldId;

  if (!_id) throw new Error(`Field ID not provided`);

  const field = await Field.findById(_id);
  if (!field) return res.status(404).json({ error: 'Field not found' });

  baseAirtable('fields').destroy(_id, async (err, deletedRecord) => {
    if (err) return;

    await Field.deleteOne({ _id });

    return res.status(200).json({
      message: 'Field deleted successfully'
    });
  });
});

export const update = catchAsync(async (req, res, next) => {
  const _id = req.params.fieldId;

  if (!_id) return res.status(400).json({ error: 'Field ID not provided' });

  const field = await Field.findById(_id);
  if (!field) return res.status(404).json({ error: 'Field not found' });

  baseAirtable('fields').update(_id, req.body, async (err, record) => {
    if (err) return;

    const updatedField = await Field.findByIdAndUpdate(_id, req.body, {
      new: true
    });

    return res.status(200).json({
      message: 'Field updated successfully',
      data: updatedField
    });
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { name, description, type, options, survey_id } = req.body;

  if (!name || !type || !survey_id)
    return res
      .status(400)
      .json({ message: `Name, type, survey id can not be empty` });

  var field = new Field({
    name,
    description,
    type,
    options,
    survey_id,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  baseAirtable.table('fields').create(field, async (err, record) => {
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
