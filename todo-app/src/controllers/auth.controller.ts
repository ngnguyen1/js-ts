import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { ApiError } from '../middleware/error.middleware';

const signToken = (id: string) => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN as string;

  return jwt.sign(
    { id }, secret, { expiresIn: 60 * 60});
}

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(400, 'Email already in use');
  const user = await User.create({ email, password });
  res.status(201).json({ success: true, data: { token: signToken(user._id) } });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }
  res.json({ success: true, data: { token: signToken(user._id) } });
}

