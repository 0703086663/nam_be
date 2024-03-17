import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: [true, "Survey's name is required."]
    },
    description: {
      type: String
    },
    campaign_id: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Survey = mongoose.model('Survey', surveySchema);
