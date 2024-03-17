import { User } from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import baseAirtable from '../utils/baseAirtable.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getUserById = catchAsync(async (req, res) => {
  const _id = req.params.userId;

  const user = await User.findById(_id);

  baseAirtable('users').find(_id, function (err, record) {
    if (err) return err;

    return res.status(200).json({ message: 'Successfully', data: user });
  });
});

export const getProfile = catchAsync(async (req, res) => {
  const _id = req.user.user._id;

  const user = await User.findById(_id);

  baseAirtable('users').find(_id, function (err, record) {
    if (err) return err;

    return res.status(200).json({ message: 'Successfully', data: user });
  });
});

export const postLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: 'Email can not be null' });
  if (!password)
    return res.status(400).json({ message: 'Password can not be null' });

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Email is not existed' });

    bcrypt.compare(password, user.password, async (err, result) => {
      if (err) return err;

      if (!result) return res.status(400).json({ message: 'Wrong password' });

      var token = jwt.sign({ user }, process.env.JWT_KEY);

      return res.status(200).json({
        data: {
          ...user._doc,
          token
        },
        message: `Login successfully`
      });
    });
  } catch (err) {
    return res.status(500).json({ message: `Can't login right now` });
  }
});

export const postRegister = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name) return res.status(400).json({ message: 'Name can not be null' });
  if (!email) return res.status(400).json({ message: 'Email can not be null' });
  if (!password)
    return res.status(400).json({ message: 'Password can not be null' });

  const checkExist = await User.findOne({ email });

  if (checkExist)
    return res.status(400).json({ message: 'Email has been taken' });

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) return err;

    const user = new User({
      name,
      email,
      password: hash,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    baseAirtable.table('users').create(user, async (err, record) => {
      if (err) return err;

      user._doc = { ...user._doc, _id: record.getId() };

      await user.save();

      return res
        .status(201)
        .json({ data: user, message: 'Register successfully' });
    });
  });
});
