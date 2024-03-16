import { User } from '../model/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: 'Invalid email' });
  if (!password) return res.status(400).json({ message: 'Invalid password' });

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Wrong email' });

    bcrypt.compare(password, user.password, async (err, result) => {
      if (err) return err;

      if (!result) return res.status(404).json({ message: 'Wrong password' });

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
};

export const postRegister = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name) return res.status(400).json({ message: 'Invalid name' });
  if (!email) return res.status(400).json({ message: 'Invalid email' });
  if (!password) return res.status(400).json({ message: 'Invalid password' });

  try {
    const checkExist = await User.findOne({ email });

    if (checkExist)
      return res.status(404).json({ message: 'Email has been taken' });

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) return err;

      const user = new User({
        name,
        email,
        password: hash
      });

      await user.save();

      return res
        .status(201)
        .json({ data: user, message: 'Created successfully' });
    });
  } catch (err) {
    return res.status(500).json({ message: `Can't register right now` });
  }
};
