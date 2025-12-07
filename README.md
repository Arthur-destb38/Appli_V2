# 🦍 Gorillax V2 — API FastAPI + App Expo

Application mobile (Expo/React Native) + API FastAPI pour créer, suivre et partager des séances d'entraînement.

---

## 🚀 Déploiement rapide (1 commande)

```bash
git clone [votre-repo]
cd V2
./deploy.sh
```

**C'est tout !** Le script s'occupe de tout :
- ✅ Détecte votre OS (Mac/Linux/Windows)
- ✅ Vérifie les prérequis (Python, Node, pnpm)
- ✅ Installe les dépendances
- ✅ Lance l'API + l'app mobile

### Options du script

```bash
./deploy.sh              # Installation complète + lancement
./deploy.sh --install    # Installation uniquement (sans lancer)
./deploy.sh --api-only   # Lance seulement l'API
./deploy.sh --app-only   # Lance seulement l'app mobile
./deploy.sh --help       # Affiche l'aide
```

---

## 📋 Prérequis

| Outil | Version | Installation |
|-------|---------|--------------|
| **Python** | 3.10+ | [python.org](https://python.org) |
| **Node.js** | 20 LTS | [nodejs.org](https://nodejs.org) |
| **pnpm** | 8+ | `npm install -g pnpm` |

> **Note** : Le script `deploy.sh` vérifie automatiquement ces prérequis et installe pnpm si nécessaire.

---

## 📁 Structure du projet

```
V2/
├── deploy.sh          # 🚀 Script de déploiement automatisé
├── api/               # 🐍 API FastAPI (Python)
│   ├── src/api/       # Code source de l'API
│   ├── scripts/       # Scripts utilitaires (seed, reset)
│   └── migrations/    # Migrations Alembic
├── app/               # 📱 App Mobile (Expo/React Native)
│   ├── app/           # Écrans et navigation
│   └── src/           # Composants, hooks, services
└── docs/              # 📚 Documentation
```

---

## 🔧 Installation manuelle (alternative)

Si vous préférez installer manuellement :

### 1) API FastAPI

```bash
cd api
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install fastapi uvicorn sqlmodel sqlalchemy pydantic alembic python-dotenv
```

### 2) App Expo

```bash
cd app
pnpm install
```

---

## ▶️ Lancement manuel

### API (Terminal 1)

```bash
cd api
.venv/bin/uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

### App Mobile (Terminal 2)

```bash
cd app
EXPO_PUBLIC_API_URL=http://[VOTRE_IP]:8000 EXPO_DEV_SERVER_PORT=8081 pnpm start -- --clear
```

> **Tip** : Remplacez `[VOTRE_IP]` par votre IP locale (`ipconfig getifaddr en0` sur Mac)

---

## 🔐 Authentification (API)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/auth/register` | POST | Inscription `{username, password}` |
| `/auth/login` | POST | Connexion `{username, password}` |
| `/auth/refresh` | POST | Rafraîchir le token (Bearer refresh_token) |
| `/auth/me` | GET | Profil utilisateur (Bearer access_token) |
| `/auth/logout` | POST | Déconnexion (Bearer refresh_token) |

**Exemple :**

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"secret123"}'
```

---

## 📱 Build APK (EAS)

```bash
cd app
pnpm dlx eas-cli build -p android --profile preview --clear-cache --non-interactive
```

---

## 🐛 Dépannage

| Problème | Solution |
|----------|----------|
| Port 8000 occupé | `lsof -i :8000` puis `kill <PID>` |
| Port 8081 occupé | `lsof -i :8081` puis `kill <PID>` |
| Expo erreur port 65536 | Utilisez Node 20 LTS |
| pnpm non trouvé | `npm install -g pnpm` |
| App ne se connecte pas à l'API | Vérifiez que vous êtes sur le même réseau Wi-Fi |

---

## 📚 Documentation additionnelle

- [Roadmap du projet](docs/Roadmap.md)
- [Architecture](docs/arborescence.md)
- [Étapes de développement](docs/)

---

## 🛠️ Commandes utiles

```bash
# Lancer tout
./deploy.sh

# API seule
./deploy.sh --api-only

# Vérifier l'API
curl http://localhost:8000/health

# Documentation Swagger
open http://localhost:8000/docs

# Reset la base de données
cd api && .venv/bin/python scripts/reset_db.py
```

---

## 📄 Licence

Projet personnel - Gorillax 🦍
