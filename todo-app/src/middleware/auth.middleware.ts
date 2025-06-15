import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './error.middleware';
import { User } from '../models/user.model';

export interface AuthRequest extends Request { userId?: string; }

export async function protect(
  req: AuthRequest, res: Response, next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new ApiError(401, 'Unauthorized');
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = payload.id;
    // Optionally verify user exists:
    const user = await User.findById(req.userId);
    if (!user) throw new ApiError(401, 'Invalid token');
    next();
  } catch {
    throw new ApiError(401, 'Invalid token');
  }
}

