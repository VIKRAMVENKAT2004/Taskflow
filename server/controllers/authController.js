import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, httpError } from '../middleware/error.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const dto = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
  const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'member' });
  res.status(201).json({ token: sign(user._id), user: dto(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Invalid email or password');
  res.json({ token: sign(user._id), user: dto(user) });
});

export const me = asyncHandler(async (req, res) => res.json({ user: dto(req.user) }));
