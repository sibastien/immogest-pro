const express = require('express');
const db = require('../db');
const { protect } = require('../middleware/auth');
const { hashPassword } = require('../auth');

const router = express.Router();
router.use(protect);

// Allow users with role 'superadmin' OR admin of 'default' tenant
function requireSuperAdmin(req, res, next) {
  if (req.user && (req.user.role === 'superadmin' || (req.user.role === 'admin' && req.tenantId === 'default'))) {
    return next();
  }
  return res.status(403).json({ error: 'Accès réservé au Super-Administrateur SaaS.' });
}

router.use(requireSuperAdmin);

const PLAN_PRICES = {
  starter: 99,
  pro: 199,
  entreprise: 399,
  trial: 0,
};

// GET /api/superadmin/stats — Global SaaS statistics
router.get('/stats', (req, res) => {
  const tenants = db.prepare('SELECT * FROM tenants').all();

  const totalTenants = tenants.length;
  let activeTenants = 0;
  let trialTenants = 0;
  let suspendedTenants = 0;
  let estimatedMRR = 0;

  for (const t of tenants) {
    if (t.plan_status === 'suspended') {
      suspendedTenants++;
    } else if (t.plan === 'trial') {
      trialTenants++;
    } else {
      activeTenants++;
      estimatedMRR += PLAN_PRICES[t.plan] || 0;
    }
  }

  const totalProperties = db.prepare('SELECT COUNT(*) AS c FROM properties').get().c;
  const totalAgents = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const totalClients = db.prepare('SELECT COUNT(*) AS c FROM clients').get().c;
  const totalTransactions = db.prepare('SELECT COUNT(*) AS c FROM transactions').get().c;

  // Breakdown by plan
  const planBreakdown = {
    starter: tenants.filter((t) => t.plan === 'starter').length,
    pro: tenants.filter((t) => t.plan === 'pro').length,
    entreprise: tenants.filter((t) => t.plan === 'entreprise').length,
    trial: trialTenants,
  };

  res.json({
    totalTenants,
    activeTenants,
    trialTenants,
    suspendedTenants,
    estimatedMRR,
    totalProperties,
    totalAgents,
    totalClients,
    totalTransactions,
    planBreakdown,
  });
});

// GET /api/superadmin/tenants — List all agencies with usage counts
router.get('/tenants', (req, res) => {
  const tenants = db.prepare('SELECT * FROM tenants ORDER BY created_at DESC').all();

  const propCounts = {};
  for (const row of db.prepare('SELECT tenant_id, COUNT(*) as c FROM properties GROUP BY tenant_id').all()) {
    propCounts[row.tenant_id] = row.c;
  }

  const userCounts = {};
  for (const row of db.prepare('SELECT tenant_id, COUNT(*) as c FROM users GROUP BY tenant_id').all()) {
    userCounts[row.tenant_id] = row.c;
  }

  const clientCounts = {};
  for (const row of db.prepare('SELECT tenant_id, COUNT(*) as c FROM clients GROUP BY tenant_id').all()) {
    clientCounts[row.tenant_id] = row.c;
  }

  const enriched = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    plan: t.plan || 'trial',
    planStatus: t.plan_status || 'active',
    trialEndsAt: t.trial_ends_at,
    ownerEmail: t.owner_email,
    createdAt: t.created_at,
    usage: {
      properties: propCounts[t.id] || 0,
      agents: userCounts[t.id] || 0,
      clients: clientCounts[t.id] || 0,
    },
  }));

  res.json(enriched);
});

// POST /api/superadmin/tenants — Manually provision an agency
router.post('/tenants', (req, res) => {
  const { agencyName, adminName, email, password, phone, plan } = req.body;

  if (!agencyName?.trim()) return res.status(400).json({ error: "Nom de l'agence requis." });
  if (!email?.trim() || !email.includes('@')) return res.status(400).json({ error: 'Email valide requis.' });

  const baseSlug = agencyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'agence';

  let slug = baseSlug;
  let counter = 1;
  while (db.prepare('SELECT id FROM tenants WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const chosenPlan = ['starter', 'pro', 'entreprise', 'trial'].includes(plan) ? plan : 'pro';

  db.prepare(`
    INSERT INTO tenants (id, name, slug, plan, plan_status, trial_ends_at, owner_email, created_at)
    VALUES (@id, @name, @slug, @plan, 'active', NULL, @owner_email, @created_at)
  `).run({
    id: tenantId,
    name: agencyName.trim(),
    slug,
    plan: chosenPlan,
    owner_email: email.trim().toLowerCase(),
    created_at: now,
  });

  const name = (adminName || 'Administrateur').trim();
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  const defaultPassword = password && password.length >= 6 ? password : 'password123';

  db.prepare(`
    INSERT INTO users (id, tenant_id, name, initials, email, role, phone, status, access_code, password_hash, created_at)
    VALUES (@id, @tenant_id, @name, @initials, @email, 'admin', @phone, 'disponible', NULL, @password_hash, @created_at)
  `).run({
    id: userId,
    tenant_id: tenantId,
    name,
    initials,
    email: email.trim().toLowerCase(),
    phone: (phone || '').trim(),
    password_hash: hashPassword(defaultPassword),
    created_at: now,
  });

  res.status(201).json({
    id: tenantId,
    name: agencyName.trim(),
    slug,
    plan: chosenPlan,
    ownerEmail: email.trim().toLowerCase(),
    initialPassword: defaultPassword,
  });
});

// PUT /api/superadmin/tenants/:id — Update agency plan, status, or details
router.put('/tenants/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Agence introuvable.' });

  const { name, plan, planStatus, trialEndsAt } = req.body;

  const validPlans = ['starter', 'pro', 'entreprise', 'trial'];
  const validStatuses = ['active', 'suspended', 'canceled'];

  const updatedPlan = validPlans.includes(plan) ? plan : existing.plan;
  const updatedStatus = validStatuses.includes(planStatus) ? planStatus : existing.plan_status;
  const updatedName = name && name.trim() ? name.trim() : existing.name;
  const updatedTrial = trialEndsAt !== undefined ? trialEndsAt : existing.trial_ends_at;

  db.prepare(`
    UPDATE tenants
    SET name = @name, plan = @plan, plan_status = @plan_status, trial_ends_at = @trial_ends_at
    WHERE id = @id
  `).run({
    id: req.params.id,
    name: updatedName,
    plan: updatedPlan,
    plan_status: updatedStatus,
    trial_ends_at: updatedTrial,
  });

  const updated = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/superadmin/tenants/:id — Delete agency (cannot delete default)
router.delete('/tenants/:id', (req, res) => {
  if (req.params.id === 'default') {
    return res.status(400).json({ error: 'Impossible de supprimer le tenant principal par défaut.' });
  }

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Agence introuvable.' });

  // Delete all tenant-scoped data in a transaction
  const deleteTx = db.transaction(() => {
    db.prepare('DELETE FROM properties WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM clients WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM users WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM calls WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM visits WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM day_blocks WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM transactions WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM documents WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM comptes_rendus WHERE tenant_id = ?').run(req.params.id);
    db.prepare('DELETE FROM tenants WHERE id = ?').run(req.params.id);
  });

  deleteTx();
  res.json({ ok: true, message: `Agence ${tenant.name} supprimée.` });
});

module.exports = router;
