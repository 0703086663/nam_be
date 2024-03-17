import mongoose from 'mongoose';

export const validTypes = ['singleLineText', 'singleSelect', 'multipleSelects'];

const fieldSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: [true, "Field's question text is required."]
    },
    type: {
      type: String,
      enum: validTypes,
      required: [true, "Field's type is required."]
    },
    description: {
      type: String
    },
    options: {
      type: String
    },
    survey_id: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Field = mongoose.model('Field', fieldSchema);
