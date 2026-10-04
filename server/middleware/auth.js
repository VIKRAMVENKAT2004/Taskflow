import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, httpError } from './error.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw httpError(401, 'Not authenticated');
  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Invalid or expired token');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'User no longer exists');
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(httpError(403, 'Forbidden: admin access required'));
