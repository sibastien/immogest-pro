const express = require('express');
const db = require('../db');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const PLAN_LIMITS = {
  starter: { properties: 15, agents: 2, storage: '1 Go' },
  trial: { properties: 50, agents: 10, storage: '5 Go' },
  pro: { properties: 100, agents: 15, storage: '20 Go' },
  entreprise: { properties: Infinity, agents: Infinity, storage: 'Illimité' },
};

// GET /api/tenant — details & usage stats for current agency
router.get('/', (req, res) => {
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.tenantId);
  if (!tenant) return res.status(404).json({ error: 'Agence introuvable.' });

  const propertiesCount = db.prepare('SELECT COUNT(*) AS c FROM properties WHERE tenant_id = ?').get(req.tenantId).c;
  const agentsCount = db.prepare('SELECT COUNT(*) AS c FROM users WHERE tenant_id = ?').get(req.tenantId).c;
  const clientsCount = db.prepare('SELECT COUNT(*) AS c FROM clients WHERE tenant_id = ?').get(req.tenantId).c;
  const transactionsCount = db.prepare('SELECT COUNT(*) AS c FROM transactions WHERE tenant_id = ?').get(req.tenantId).c;

  const currentPlan = tenant.plan || 'trial';
  const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.starter;

  res.json({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    plan: currentPlan,
    planStatus: tenant.plan_status || 'active',
    trialEndsAt: tenant.trial_ends_at,
    ownerEmail: tenant.owner_email,
    phone: tenant.phone || '',
    whatsapp: tenant.whatsapp || tenant.phone || '',
    address: tenant.address || '',
    logo: tenant.logo || '',
    createdAt: tenant.created_at,
    usage: {
      properties: propertiesCount,
      agents: agentsCount,
      clients: clientsCount,
      transactions: transactionsCount,
    },
    limits,
  });
});

// PUT /api/tenant — update agency details (admin only)
router.put('/', requireRole('admin'), (req, res) => {
  const { name, phone, whatsapp, address, logo } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Le nom de l'agence est requis." });

  db.prepare(`
    UPDATE tenants 
    SET name = @name,
        phone = COALESCE(@phone, phone),
        whatsapp = COALESCE(@whatsapp, whatsapp),
        address = COALESCE(@address, address),
        logo = COALESCE(@logo, logo)
    WHERE id = @id
  `).run({
    id: req.tenantId,
    name: name.trim(),
    phone: phone !== undefined ? String(phone).trim() : null,
    whatsapp: whatsapp !== undefined ? String(whatsapp).trim() : null,
    address: address !== undefined ? String(address).trim() : null,
    logo: logo !== undefined ? String(logo).trim() : null,
  });

  const updated = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.tenantId);
  res.json({
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    plan: updated.plan,
    planStatus: updated.plan_status,
    trialEndsAt: updated.trial_ends_at,
    ownerEmail: updated.owner_email,
    phone: updated.phone || '',
    whatsapp: updated.whatsapp || '',
    address: updated.address || '',
    logo: updated.logo || '',
  });
});

// POST /api/tenant/plan — switch plan (admin only)
router.post('/plan', requireRole('admin'), (req, res) => {
  const { plan } = req.body;
  const allowed = ['starter', 'pro', 'entreprise'];
  if (!allowed.includes(plan)) {
    return res.status(400).json({ error: 'Plan invalide.' });
  }

  db.prepare("UPDATE tenants SET plan = ?, plan_status = 'active', trial_ends_at = NULL WHERE id = ?").run(plan, req.tenantId);
  res.json({ ok: true, plan });
});

module.exports = router;
