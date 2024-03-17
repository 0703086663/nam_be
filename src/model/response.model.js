import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: [true, 'Content is required.']
    },
    survey_id: {
      type: String,
      required: true
    },
    field_id: {
      type: String,
      required: true
    },
    owner_id: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Response = mongoose.model('Response', responseSchema);
