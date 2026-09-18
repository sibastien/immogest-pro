const { verifyToken } = require('../auth');

// Requires a valid Bearer token.
// Attaches req.user = { id, role, agentId, tenantId }
// and req.tenantId as a shortcut for every route.
function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié.' });
  try {
    req.user = verifyToken(token);
    // Fallback to 'default' for tokens issued before multi-tenancy.
    req.tenantId = req.user.tenantId || 'default';
    next();
  } catch {
    return res.status(401).json({ error: 'Session expirée ou invalide.' });
  }
}

// Restricts a route to the given roles.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }
    next();
  };
}

module.exports = { protect, requireRole };
