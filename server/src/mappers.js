// Convert DB rows (snake_case) <-> frontend JSON (camelCase, matching src/types).

function parseJSON(v, fallback) {
  if (v == null) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
}

// users -> the frontend "Agent" shape used by Settings / agentsStore.
function userToAgent(row) {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    email: row.email,
    role: row.role,
    phone: row.phone || '',
    status: row.status,
    accessCode: row.access_code || undefined,
    stats: { activeProperties: 0, visitsThisMonth: 0, transactions: 0, commission: 0 },
  };
}

// users -> the auth "User" shape (no secrets).
function userToAuth(row) {
  const isClient = row.role === 'client';
  return {
    id: `u-${row.id}`,
    name: row.name,
    initials: row.initials,
    role: row.role,
    email: row.email,
    ...(isClient ? { clientId: row.id } : { agentId: row.id }),
  };
}

function clientToJSON(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || undefined,
    type: row.type,
    budget: (row.budget_min != null || row.budget_max != null)
      ? { min: row.budget_min ?? 0, max: row.budget_max ?? 0 }
      : undefined,
    search: row.search || undefined,
    agentId: row.agent_id,
    status: row.status,
    lastContact: row.last_contact,
    source: row.source,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    propertyPreferences: parseJSON(row.property_preferences, {}),
  };
}

function callToJSON(row) {
  return {
    id: row.id,
    agentId: row.agent_id,
    clientId: row.client_id || undefined,
    clientName: row.client_name,
    phone: row.phone || undefined,
    type: row.type,
    outcome: row.outcome,
    notes: row.notes,
    date: row.date,
    time: row.time,
  };
}

function visitToJSON(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    clientId: row.client_id,
    agentId: row.agent_id,
    date: row.date,
    time: row.time,
    status: row.status,
    crSubmitted: !!row.cr_submitted,
    notes: row.notes || undefined,
  };
}

function crToJSON(row) {
  return {
    id: row.id,
    visitId: row.visit_id,
    agentId: row.agent_id,
    clientInterest: row.client_interest,
    result: row.result,
    notes: row.notes,
    followUp: parseJSON(row.follow_up, []),
    photos: parseJSON(row.photos, []),
    submittedAt: row.submitted_at || undefined,
    validatedAt: row.validated_at || undefined,
    status: row.status,
  };
}

function propertyToJSON(row) {
  return {
    id: row.id,
    ref: row.ref,
    title: row.title,
    type: row.type,
    status: row.status,
    price: row.price,
    priceType: row.price_type,
    surface: row.surface,
    rooms: row.rooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    location: row.location,
    address: row.address,
    agentId: row.agent_id,
    photos: parseJSON(row.photos, []),
    createdAt: row.created_at,
    description: row.description || undefined,
    features: parseJSON(row.features, []),
    floor: row.floor ?? undefined,
    totalFloors: row.total_floors ?? undefined,
    parking: row.parking == null ? undefined : !!row.parking,
    furnished: row.furnished == null ? undefined : !!row.furnished,
  };
}

function documentToJSON(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    propertyId: row.property_id || undefined,
    clientId: row.client_id || undefined,
    status: row.status,
    url: row.url || undefined,
    size: row.size || '',
    createdAt: row.created_at,
    expiresAt: row.expires_at || undefined,
    signedAt: row.signed_at || undefined,
  };
}

module.exports = { userToAgent, userToAuth, clientToJSON, callToJSON, visitToJSON, crToJSON, propertyToJSON, documentToJSON };
