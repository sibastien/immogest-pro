// Reset (or set) the administrator password — use when you forgot it.
// The stored password is hashed and cannot be recovered, so we overwrite it.
//
// Usage from the server/ folder:
//   node src/reset-admin.js                 -> generates a new random password
//   node src/reset-admin.js "MonNouveauMDP" -> sets the password you choose
const crypto = require('crypto');
const db = require('./db');
const { hashPassword } = require('./auth');

const admin = db.prepare("SELECT id, email FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1").get();
if (!admin) {
  console.log('\nAucun compte administrateur trouvé. Lancez d\'abord : node src/seed.js\n');
  process.exit(1);
}

const pwdSet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%&*';
const password = process.argv[2]
  || Array.from({ length: 14 }, () => pwdSet[crypto.randomInt(pwdSet.length)]).join('');

db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), admin.id);

console.log('\n=====================================================');
console.log('  MOT DE PASSE ADMINISTRATEUR RÉINITIALISÉ');
console.log('-----------------------------------------------------');
console.log('  Email        :', admin.email);
console.log('  Mot de passe :', password);
console.log('=====================================================\n');
