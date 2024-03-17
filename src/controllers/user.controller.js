import { User } from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import baseAirtable from '../utils/baseAirtable.js';
import { v4 as uuidv4 } from 'uuid';
import { catchAsync } from '../utils/catchAsync.js';

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

      var token = jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: '24h' });

      return res.status(200).json({
        data: {
          ...user._doc,
          token
        },
        message: `Login successful`
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

  try {
    const checkExist = await User.findOne({ email });

    if (checkExist)
      return res.status(400).json({ message: 'Email has been taken' });

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) return err;

      const user = new User({
        _id: uuidv4(),
        name,
        email,
        password: hash
      });

      baseAirtable.table('users').create(user);

      await user.save();

      return res
        .status(201)
        .json({ data: user, message: 'Created successfully' });
    });
  } catch (err) {
    return res.status(500).json({ message: `Can't register right now` });
  }
});
