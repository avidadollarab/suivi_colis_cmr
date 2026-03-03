# 🐘 Migration vers PostgreSQL sur Render

## Pourquoi PostgreSQL ?

Avec **SQLite**, les données sont perdues à chaque redéploiement sur Render (disque éphémère).

Avec **PostgreSQL**, les données sont **permanentes** : colis, clients, agents — tout est conservé.

---

## Les 3 étapes

### ÉTAPE 1 — Mettre à jour les fichiers sur GitHub

Les fichiers `database.py`, `requirements.txt` et `app.py` sont déjà compatibles PostgreSQL.

Si tu as des modifications locales, pousse-les sur GitHub :

```powershell
cd "c:\Users\Admin\Documents\Suivi_colis"
git add database.py requirements.txt app.py
git commit -m "Migration PostgreSQL - donnees permanentes"
git push
```

**Vérifications :**
- `requirements.txt` doit contenir `psycopg2-binary`
- `database.py` utilise `DATABASE_URL` quand elle est définie
- En local (sans `DATABASE_URL`), SQLite reste utilisé automatiquement

---

### ÉTAPE 2 — Créer la base PostgreSQL sur Render

1. Va sur [render.com](https://render.com) → connecte-toi
2. Clique sur **"New +"** (en haut à droite)
3. Sélectionne **"PostgreSQL"**
4. Configure :
   - **Name** : `suivi-colis-db` (ou un nom de ton choix)
   - **Region** : Frankfurt (EU Central) — même région que ton Web Service
   - **PostgreSQL Version** : 16 (ou la plus récente)
   - **Plan** : **Free**
5. Clique sur **"Create Database"**
6. Attends 1 à 2 minutes que la base soit créée
7. Dans le dashboard de ta base, trouve **"Internal Database URL"**
8. Clique sur **"Copy"** pour copier l’URL (elle ressemble à `postgres://user:password@host/dbname`)

---

### ÉTAPE 3 — Lier la base à ton Web Service

1. Va dans ton **Web Service** (suivi-colis-cmr)
2. Onglet **"Environment"**
3. Clique sur **"Add Environment Variable"**
4. **Key** : `DATABASE_URL`
5. **Value** : colle l’URL copiée à l’étape 2 (Internal Database URL)
6. Clique sur **"Save Changes"**

Render redémarre automatiquement ton application. Attends 1 à 2 minutes.

---

## ✅ C’est terminé !

- Tes données sont maintenant **permanentes**
- Les colis, clients et agents ne seront plus perdus aux redéploiements
- En local, tu continues d’utiliser SQLite (aucune config nécessaire)

---

## 🔍 Vérifier que ça fonctionne

1. Ouvre ton site : `https://suivi-colis-cmr.onrender.com`
2. Connecte-toi à l’admin : `admin` / `admin123`
3. Crée un colis de test
4. Redéploie ton Web Service (ou attends un redéploiement)
5. Vérifie que le colis est toujours là ✅

---

## ⚠️ En cas de problème

| Problème | Solution |
|----------|----------|
| "Application error" au démarrage | Vérifie que `DATABASE_URL` est bien définie dans Environment |
| "relation does not exist" | Les tables sont créées au premier démarrage — redémarre une fois |
| Toujours SQLite en prod | Vérifie que l’URL copiée est l’**Internal** Database URL (pas External) |
| Connexion refusée | Mets le Web Service et la base dans la **même région** (Frankfurt) |

---

## 📞 Besoin d’aide ?

Si tu bloques, note l’étape et le message d’erreur exact.
