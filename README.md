# ImmoGest Pro

Application de gestion complète pour agences immobilières (gestion des biens, clients, visites, transactions, planning agents et rôles multi-utilisateurs).

## Structure du projet

Le projet est organisé en deux dossiers principaux :

```
immogest-pro/
├── frontend/             # Application Web React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── package.json
├── backend/              # API REST Express + SQLite (better-sqlite3) + JWT
│   ├── src/
│   ├── data/             # Base de données SQLite (générée automatiquement)
│   ├── uploads/          # Fichiers uploadés (photos, documents)
│   ├── .env              # Configuration locale (PORT, JWT_SECRET, DB_PATH)
│   └── package.json
└── package.json          # Scripts d'orchestration racine
```

## Démarrage rapide (Local)

### 1. Installation des dépendances

À la racine du projet :

```bash
npm run install:all
```

*(Ou séparément : `cd backend && npm install` puis `cd frontend && npm install`)*

### 2. Initialiser la base de données (Seed)

Cette commande crée la base SQLite et génère les identifiants du premier compte administrateur :

```bash
npm run seed
```

> ⚠️ **Important** : Notez bien l'email et le mot de passe générés lors du premier lancement !

### 3. Lancer le projet

Pour lancer à la fois le backend (port `4000`) et le frontend (port `5173`) :

```bash
npm run dev
```

Rendez-vous ensuite sur :
- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **Backend Health Check** : [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## Commandes disponibles

| Commande | Action |
|----------|--------|
| `npm run dev` | Démarre simultanément le backend et le frontend |
| `npm run dev:frontend` | Démarre uniquement l'interface frontend (`localhost:5173`) |
| `npm run dev:backend` | Démarre uniquement le serveur backend (`localhost:4000`) |
| `npm run install:all` | Installe les modules de la racine, du frontend et du backend |
| `npm run seed` | Initialise la base et crée l'administrateur initial |
| `npm run build` | Compile le frontend TypeScript + Vite pour la production |

---

## Rôles & Espaces

L'application supporte 5 espaces avec accès par rôle :
- `/admin` : Administration générale, équipe, transactions, catalogue complet.
- `/coordinatrice` : Dispatch des prospects, planning et validation des comptes rendus.
- `/agent-bureau` : Suivi commercial, appels, prospects et catalogue.
- `/agent-terrain` : Visites, comptes rendus géolocalisés, clients assignés.
- `/client` : Espace client (suivi des dossiers, visites et documents).
