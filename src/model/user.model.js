import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: [true, 'Name is required.']
    },
    email: {
      type: String,
      required: [true, 'Email is required.']
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
