const express = require('express');
const db = require('../db');
const { verifyPassword, normalizeCode, signToken } = require('../auth');
const { protect } = require('../middleware/auth');
const { userToAuth } = require('../mappers');

const router = express.Router();

// POST /api/auth/login  { email, password }
router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  const row = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(email);
  if (!row) return res.status(401).json({ error: 'Compte introuvable pour cet email.' });

  // Agents authenticate with a case-insensitive access code; password users with their password.
  const candidate = row.access_code ? normalizeCode(password) : password;
  if (!verifyPassword(candidate, row.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const user = userToAuth(row);
  const token = signToken(user.role === 'client'
    ? { id: row.id, role: row.role, agentId: null }
    : { id: row.id, role: row.role, agentId: row.id });
  res.json({ token, user });
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  res.json({ user: userToAuth(row) });
});

module.exports = router;
