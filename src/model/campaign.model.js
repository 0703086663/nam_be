import mongoose from 'mongoose';

const campaignShema = new mongoose.Schema({
  _id: {
    type: String,
    required: [true, "Campaign's id is required."]
  },
  name: {
    type: String,
    required: [true, "Campaign's name is required."]
  },
  permissionLevel: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

export const Campaign = mongoose.model('Campaign', campaignShema);
