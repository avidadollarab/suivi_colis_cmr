# Plan de déploiement — Frontend Next.js + Backend Flask

**Projet :** Suivi_colis / ELISÉE XPRESS LOG  
**Objectif :** Interface principale = design Next.js (bleu/or), données = API Flask existante, base PostgreSQL inchangée (26 clients).

---

## 1. Architecture recommandée

### Option A : Frontend et backend séparés (recommandé)

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│  Frontend Next.js (Vercel)      │     │  Backend Flask (Render)          │
│  https://ex-log.vercel.app      │────▶│  https://suivi-colis-cmr.         │
│  Design bleu/or                 │ API │  onrender.com                    │
│                                 │     │  API + PostgreSQL (26 clients)   │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

**Avantages :** Simple, évolutif, déploiements indépendants, pas de risque pour la base.

---

### Option B : Reverse proxy (même domaine)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Serveur unique (ex. Nginx ou Vercel rewrites)                            │
│  https://ex-log.com/          → Frontend Next.js (static)                │
│  https://ex-log.com/api/*     → Proxy vers suivi-colis-cmr.onrender.com  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Avantages :** Une seule URL, pas de CORS. **Inconvénients :** Configuration plus complexe, nécessite un serveur ou des rewrites Vercel.

**Recommandation :** Option A (plus rapide à mettre en place).

---

## 2. Configuration du frontend Next.js

### Option A — Déploiement sur Vercel

| Paramètre | Valeur |
|-----------|--------|
| **Framework** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (défaut) |
| **Output Directory** | `.next` (défaut) |
| **Install Command** | `npm install` (défaut) |

**Variables d'environnement :**

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `NEXT_PUBLIC_API_URL` | `https://suivi-colis-cmr.onrender.com` | Production, Preview |

---

### Option A — Déploiement sur Render (2e Web Service)

| Paramètre | Valeur |
|-----------|--------|
| **Runtime** | Node |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npx next start` |
| **Plan** | Free |

**Variables d'environnement :**

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://suivi-colis-cmr.onrender.com` |

---

### Option B — Vercel avec rewrites (même domaine)

Si tu veux que `https://ex-log.com/api/*` soit proxy vers Flask :

**Fichier : `frontend/vercel.json`**

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://suivi-colis-cmr.onrender.com/api/:path*"
    }
  ]
}
```

Puis dans `frontend/data/api.ts`, utilise une URL relative :

```typescript
const API_BASE = typeof window !== "undefined"
  ? ""  // même domaine → /api/...
  : (process.env.NEXT_PUBLIC_API_URL || "https://suivi-colis-cmr.onrender.com");
```

---

## 3. Connexion à l'API Flask

### Fichier actuel : `frontend/data/api.ts`

**Code actuel :**

```typescript
const API_BASE =
  (typeof process !== "undefined" && (process as NodeJS.Process).env?.NEXT_PUBLIC_API_URL) ||
  "https://suivi-colis-cmr.onrender.com";
```

**Comportement :**
- **Production (Vercel/Render) :** utilise `NEXT_PUBLIC_API_URL` si défini, sinon `https://suivi-colis-cmr.onrender.com`
- **Développement local :** idem. Pour pointer vers Flask local, crée `frontend/.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Fichier : `frontend/.env.example` (déjà présent)

```
NEXT_PUBLIC_API_URL=https://suivi-colis-cmr.onrender.com
```

### Vérification des appels API

Le frontend appelle :
- `GET {API_BASE}/api/suivi/{numero}` pour le suivi colis

Avec `NEXT_PUBLIC_API_URL=https://suivi-colis-cmr.onrender.com`, les requêtes vont vers :
- `https://suivi-colis-cmr.onrender.com/api/suivi/CMR-2026-00001`

---

## 4. CORS et sécurité

### Configuration actuelle (Flask)

```python
CORS(app, origins=["*"], supports_credentials=False)
```

**Effet :** Tout domaine peut appeler l’API. C’est suffisant pour un frontend sur Vercel ou un 2e service Render.

### Recommandation : restreindre les origines (production)

**Fichier : `app.py`**

**Code actuel :**
```python
CORS(app, origins=["*"], supports_credentials=False)
```

**Code recommandé (plus sécurisé) :**

```python
# Origines autorisées pour le frontend
CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS",
    "https://suivi-colis-cmr.onrender.com,http://localhost:3000"
).split(",")
CORS(app, origins=[o.strip() for o in CORS_ORIGINS if o.strip()], supports_credentials=False)
```

**Variable d’environnement sur Render :**

```text
CORS_ORIGINS=https://ton-frontend.vercel.app,https://suivi-colis-cmr.onrender.com,http://localhost:3000
```

**Si tu gardes `origins=["*"]` :** ça fonctionne, mais tout site peut appeler ton API. Acceptable pour un MVP.

---

## 5. Déploiement (commandes & paramètres)

### Commandes locales

```bash
# 1. Vérifier le build frontend
cd frontend
npm install
npm run build

# 2. Tester en local (Flask sur le port 5000)
# Terminal 1 : backend
cd ..
python app.py

# Terminal 2 : frontend
cd frontend
NEXT_PUBLIC_API_URL=http://localhost:5000 npm run dev
# → http://localhost:3000
```

### Déploiement Vercel (Option A)

1. Va sur [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Importe le repo GitHub `avidadollarab/suivi_colis_cmr`
3. **Root Directory** : `frontend` → **Edit** → `frontend`
4. **Environment Variables** :
   - `NEXT_PUBLIC_API_URL` = `https://suivi-colis-cmr.onrender.com`
5. **Deploy**

### Déploiement Render (Option A — 2e service)

1. Render → **New +** → **Web Service**
2. Connecte le repo `avidadollarab/suivi_colis_cmr`
3. **Root Directory** : `frontend`
4. **Build Command** : `npm install && npm run build`
5. **Start Command** : `npx next start`
6. **Environment** : `NEXT_PUBLIC_API_URL` = `https://suivi-colis-cmr.onrender.com`
7. **Create Web Service**

---

## 6. Vérifications pour ne pas perdre les 26 clients

### Avant tout déploiement

| Vérification | Commande / URL | Résultat attendu |
|--------------|----------------|------------------|
| Backend OK | `https://suivi-colis-cmr.onrender.com/health` | `{"ok": true, "database": "postgresql"}` |
| API suivi | `https://suivi-colis-cmr.onrender.com/api/suivi/CMR-2026-00001` | JSON d’un colis ou 404 |
| Admin | `https://suivi-colis-cmr.onrender.com/admin` | Liste des colis |
| `DATABASE_URL` | Render → Web Service backend → Environment | Doit pointer vers ta base PostgreSQL (Internal URL) |

### Ce qui ne doit pas changer

- **`DATABASE_URL`** du backend Render : ne pas la modifier
- **Aucun script** avec `DROP TABLE`, `TRUNCATE` ou `DELETE FROM` sans `WHERE`
- **`migrate_real_clients.py`** : ne fait que des `INSERT`, pas de suppression

### Vérification directe en base (optionnel)

Avec l’**External Database URL** de ta base PostgreSQL :

```bash
psql "postgresql://USER:PASS@HOST/DB" -c "SELECT COUNT(*) FROM clients;"
# Attendu : 26
```

### Checklist après déploiement du frontend

| Étape | Action |
|-------|--------|
| 1 | Ouvrir l’URL du frontend (Vercel ou Render) |
| 2 | Tester le suivi avec un numéro réel (ex. CMR-2026-00001) |
| 3 | Vérifier que les données s’affichent correctement |
| 4 | Aller sur `https://suivi-colis-cmr.onrender.com/admin` |
| 5 | Vérifier que la liste des colis et clients est inchangée |

---

## 7. Fichiers à modifier (résumé)

### Frontend — Aucune modification obligatoire

Le code actuel est déjà configuré. Il suffit de :

1. Déployer le dossier `frontend/` sur Vercel ou Render
2. Définir `NEXT_PUBLIC_API_URL=https://suivi-colis-cmr.onrender.com`

### Backend — CORS (optionnel)

**Fichier : `app.py`**

Si tu veux restreindre les origines CORS :

```python
# Remplacer la ligne actuelle :
# CORS(app, origins=["*"], supports_credentials=False)

# Par :
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()] if CORS_ORIGINS != "*" else ["*"]
CORS(app, origins=origins, supports_credentials=False)
```

Puis sur Render : `CORS_ORIGINS=https://ton-frontend.vercel.app,http://localhost:3000`

---

## 8. Récapitulatif

| Élément | Valeur |
|---------|--------|
| **Backend URL** | `https://suivi-colis-cmr.onrender.com` |
| **API suivi** | `GET /api/suivi/<numero>` |
| **Variable frontend** | `NEXT_PUBLIC_API_URL` |
| **Base de données** | PostgreSQL Render — ne pas modifier `DATABASE_URL` |
| **26 clients** | Conservés tant que `DATABASE_URL` et les scripts restent inchangés |
