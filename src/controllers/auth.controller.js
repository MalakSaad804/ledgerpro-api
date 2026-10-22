const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

exports.register = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'name, email and password are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid email' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' });
  }
  if (await User.findOne({ email: String(email).toLowerCase() })) {
    return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Email already registered' });
  }
  // role is NEVER read from the body: public signup is always "customer"
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'email and password are required' });
  }
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  const ok = user && (await bcrypt.compare(String(password), user.password));
  if (!ok) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' });
  }
  res.json({ token: signToken(user), role: user.role, name: user.name });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'NOT_FOUND', message: 'User no longer exists' });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

// admin only: create a staff account
exports.createStaff = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || String(password).length < 8 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Valid name, email and password (8+ chars) required' });
  }
  if (await User.findOne({ email: String(email).toLowerCase() })) {
    return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Email already registered' });
  }
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: 'staff' });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
};
