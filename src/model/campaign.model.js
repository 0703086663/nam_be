import mongoose from 'mongoose';

const campaignShema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: [true, "Campaign's name is required."]
    },
    owner_id: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Campaign = mongoose.model('Campaign', campaignShema);
