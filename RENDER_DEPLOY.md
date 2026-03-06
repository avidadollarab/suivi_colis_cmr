# Déploiement sur Render — Checklist

## ✅ Ce qui est déjà fait

- Code poussé sur GitHub
- Base PostgreSQL créée (données permanentes)
- `database.py` utilise automatiquement `DATABASE_URL` en production

---

## 🔧 À vérifier sur Render

### 1. Web Service connecté au dépôt

1. Va sur [dashboard.render.com](https://dashboard.render.com)
2. Ouvre ton **Web Service** (suivi-colis ou similaire)
3. **Settings** → **Build & Deploy** :
   - **Repository** : ton repo GitHub doit être connecté
   - **Branch** : `main`
   - **Auto-Deploy** : **Yes**

### 2. Lier la base PostgreSQL au Web Service

1. Dans ton **Web Service** → onglet **Environment**
2. Vérifie que **DATABASE_URL** existe
   - Si **non** : **Add Environment Variable**
     - Key : `DATABASE_URL`
     - Value : copie l’**Internal Database URL** de ta base PostgreSQL
   - Si **oui** : rien à faire

**Où trouver l’URL :**
- Clique sur ta base **PostgreSQL** dans le dashboard
- Section **Connections** → **Internal Database URL** → Copy

### 3. Déclencher un déploiement

1. Dans ton **Web Service** → onglet **Manual Deploy**
2. Clique sur **Deploy latest commit**
3. Attends 2–3 minutes

---

## 📋 Variables d’environnement recommandées

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Oui | Internal URL de ta base PostgreSQL |
| `SECRET_KEY` | Recommandé | Clé secrète Flask (ex. chaîne aléatoire) |
| `TWILIO_ACCOUNT_SID` | Optionnel | Pour SMS |
| `TWILIO_AUTH_TOKEN` | Optionnel | Pour SMS |
| `TWILIO_PHONE_NUMBER` | Optionnel | Pour SMS |

---

## ⚠️ En cas de problème

- **"Application error"** : vérifie les logs (onglet **Logs** du Web Service)
- **"relation does not exist"** : les tables sont créées au 1er démarrage → redémarre une fois
- **Données perdues** : vérifie que `DATABASE_URL` est bien définie (sans elle, SQLite est utilisé et les données sont éphémères)
