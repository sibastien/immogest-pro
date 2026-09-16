const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

function verifyPassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compareSync(plain, hash);
}

// Agents log in with an access code; normalize casing so it is case-insensitive.
function normalizeCode(code) {
  return String(code ?? '').trim().toUpperCase();
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, agentId: user.agentId ?? null },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { hashPassword, verifyPassword, normalizeCode, signToken, verifyToken, JWT_SECRET };
