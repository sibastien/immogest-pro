// Run: node src/make-superadmin.js [email]
// Example: node src/make-superadmin.js admin@immogest.pro

const db = require('./db');

const emailArg = process.argv[2];

if (!emailArg) {
  // If no email passed, promote the first admin
  const firstAdmin = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!firstAdmin) {
    console.error('Aucun utilisateur administrateur trouvé dans la base.');
    process.exit(1);
  }
  db.prepare("UPDATE users SET role = 'superadmin' WHERE id = ?").run(firstAdmin.id);
  console.log(`✓ L'utilisateur ${firstAdmin.email} est désormais SUPERADMIN de la plateforme.`);
  process.exit(0);
}

const user = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(emailArg.trim().toLowerCase());
if (!user) {
  console.error(`Utilisateur avec l'email "${emailArg}" introuvable.`);
  process.exit(1);
}

db.prepare("UPDATE users SET role = 'superadmin' WHERE id = ?").run(user.id);
console.log(`✓ L'utilisateur ${user.email} (${user.name}) est désormais SUPERADMIN de la plateforme.`);
