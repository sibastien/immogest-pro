// One-off seed: creates the initial administrator login.
// Idempotent — if an admin already exists, it does nothing (your credentials are safe).
// Run:  node src/seed.js
const crypto = require('crypto');
const db = require('./db');
const { hashPassword } = require('./auth');

function randomFrom(alphabet, len) {
  return Array.from({ length: len }, () => alphabet[crypto.randomInt(alphabet.length)]).join('');
}

const existingAdmin = db.prepare("SELECT email FROM users WHERE role = 'admin' LIMIT 1").get();
if (existingAdmin) {
  console.log('\nUn administrateur existe déjà :', existingAdmin.email);
  console.log('Aucune modification. (Supprimez la base pour repartir de zéro.)\n');
  process.exit(0);
}

const lower = 'abcdefghijkmnpqrstuvwxyz';
const pwdSet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%&*';
const email = `admin.${randomFrom(lower, 6)}@beeimob.tn`;
const password = randomFrom(pwdSet, 14);

db.prepare(`
  INSERT INTO users (id, name, initials, email, role, phone, status, access_code, password_hash, created_at)
  VALUES (@id, @name, @initials, @email, 'admin', '', 'disponible', NULL, @password_hash, @created_at)
`).run({
  id: 'u-admin',
  name: 'Administrateur',
  initials: 'AD',
  email,
  password_hash: hashPassword(password),
  created_at: new Date().toISOString(),
});

console.log('\n=====================================================');
console.log('  COMPTE ADMINISTRATEUR CRÉÉ — notez ces identifiants');
console.log('  (ils ne seront plus jamais affichés)');
console.log('-----------------------------------------------------');
console.log('  Email        :', email);
console.log('  Mot de passe :', password);
console.log('=====================================================\n');
