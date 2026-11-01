const express = require('express');
const db = require('../db');
const { verifyPassword, normalizeCode, signToken, hashPassword } = require('../auth');
const { protect } = require('../middleware/auth');
const { userToAuth } = require('../mappers');

const router = express.Router();

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'agence';
}

function tenantToJSON(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    plan: row.plan || 'trial',
    planStatus: row.plan_status || 'active',
    trialEndsAt: row.trial_ends_at || null,
    ownerEmail: row.owner_email,
    phone: row.phone || '',
    whatsapp: row.whatsapp || row.phone || '',
    address: row.address || '',
    logo: row.logo || '',
    createdAt: row.created_at,
  };
}

// POST /api/auth/login  { email, password, agencySlug? }
router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const agencySlug = String(req.body.agencySlug || '').trim().toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  let row;
  if (agencySlug) {
    const tenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(agencySlug);
    if (!tenant) return res.status(404).json({ error: 'Agence introuvable.' });
    row = db.prepare('SELECT * FROM users WHERE lower(email) = ? AND tenant_id = ?').get(email, tenant.id);
  } else {
    // If not specified, find user (if unique) or fallback to latest active
    const rows = db.prepare('SELECT * FROM users WHERE lower(email) = ?').all(email);
    if (rows.length === 0) return res.status(401).json({ error: 'Compte introuvable pour cet email.' });
    row = rows[0];
  }

  if (!row) return res.status(401).json({ error: 'Compte introuvable pour cet email.' });

  // Agents authenticate with a case-insensitive access code; password users with their password.
  const candidate = row.access_code ? normalizeCode(password) : password;
  if (!verifyPassword(candidate, row.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(row.tenant_id || 'default');
  const user = userToAuth(row);
  const token = signToken({
    id: row.id,
    role: row.role,
    agentId: user.role === 'client' ? null : row.id,
    tenantId: row.tenant_id || 'default',
  });

  res.json({ token, user, tenant: tenantToJSON(tenant) });
});

// POST /api/auth/register — Onboarding for new agencies (SaaS)
router.post('/register', (req, res) => {
  const { agencyName, name, email, password, phone } = req.body;

  if (!agencyName?.trim()) return res.status(400).json({ error: "Nom de l'agence requis." });
  if (!name?.trim()) return res.status(400).json({ error: 'Votre nom complet est requis.' });
  if (!email?.trim() || !email.includes('@')) return res.status(400).json({ error: 'Email valide requis.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });

  const cleanEmail = email.trim().toLowerCase();
  const baseSlug = slugify(agencyName);
  let slug = baseSlug;
  let counter = 1;

  while (db.prepare('SELECT id FROM tenants WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  // Create tenant
  db.prepare(`
    INSERT INTO tenants (id, name, slug, plan, plan_status, trial_ends_at, owner_email, phone, whatsapp, created_at)
    VALUES (@id, @name, @slug, 'trial', 'active', @trial_ends_at, @owner_email, @phone, @whatsapp, @created_at)
  `).run({
    id: tenantId,
    name: agencyName.trim(),
    slug,
    trial_ends_at: trialEnd,
    owner_email: cleanEmail,
    phone: (phone || '').trim(),
    whatsapp: (phone || '').trim(),
    created_at: now,
  });

  // Calculate initials
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  // Create agency owner (Admin)
  db.prepare(`
    INSERT INTO users (id, tenant_id, name, initials, email, role, phone, status, access_code, password_hash, created_at)
    VALUES (@id, @tenant_id, @name, @initials, @email, 'admin', @phone, 'en_ligne', NULL, @password_hash, @created_at)
  `).run({
    id: userId,
    tenant_id: tenantId,
    name: name.trim(),
    initials,
    email: cleanEmail,
    phone: (phone || '').trim(),
    password_hash: hashPassword(password),
    created_at: now,
  });

  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const tenantRow = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId);
  const user = userToAuth(userRow);
  const token = signToken({
    id: userId,
    role: 'admin',
    agentId: userId,
    tenantId,
  });

  res.status(201).json({
    token,
    user,
    tenant: tenantToJSON(tenantRow),
    message: 'Agence créée avec succès !',
  });
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'Utilisateur introuvable.' });

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.tenantId || row.tenant_id || 'default');
  res.json({
    user: userToAuth(row),
    tenant: tenantToJSON(tenant),
  });
});

module.exports = router;
