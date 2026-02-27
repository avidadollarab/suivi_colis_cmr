# 🚀 Guide de mise en ligne — SuiviColis CMR
## Hébergement gratuit sur Render.com

---

## 📁 ÉTAPE 1 — Préparer ton PC

Assure-toi d'avoir ces fichiers dans un dossier `suivi-colis/` :

```
suivi-colis/
├── app.py
├── database.py
├── requirements.txt
├── Procfile
├── .gitignore
└── templates/
    ├── base.html
    ├── index.html
    ├── suivre.html
    ├── login.html
    └── admin/
        ├── dashboard.html
        ├── nouveau_colis.html
        └── detail_colis.html
```

---

## 🐙 ÉTAPE 2 — Créer un compte GitHub (si pas encore fait)

1. Va sur → https://github.com
2. Clique **Sign up** → crée un compte gratuit
3. Vérifie ton email

---

## 📤 ÉTAPE 3 — Mettre le projet sur GitHub

### Option A : Via le site GitHub (plus simple)

1. Connecte-toi sur GitHub
2. Clique le bouton vert **"New"** (nouveau dépôt)
3. Nomme-le : `suivi-colis-cmr`
4. Laisse-le **Public** → clique **Create repository**
5. Sur la page qui apparaît, clique **"uploading an existing file"**
6. Glisse-dépose **tous tes fichiers** (app.py, database.py, requirements.txt, Procfile, .gitignore)
7. Pour les templates, tu dois créer les sous-dossiers :
   - Clique **"create new file"**
   - Tape : `templates/base.html` → colle le contenu
   - Répète pour chaque fichier template
8. Clique **Commit changes** à chaque fois

### Option B : Via Git en ligne de commande (plus rapide)

```bash
# Dans ton dossier suivi-colis/
git init
git add .
git commit -m "Premier commit - SuiviColis CMR"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/suivi-colis-cmr.git
git push -u origin main
```

---

## 🌐 ÉTAPE 4 — Déployer sur Render.com

1. Va sur → https://render.com
2. Clique **"Get Started for Free"** → crée un compte
3. Connecte ton compte **GitHub** à Render (bouton "Connect GitHub")
4. Sur le dashboard Render, clique **"New +"** → **"Web Service"**
5. Sélectionne ton dépôt **suivi-colis-cmr**
6. Configure comme suit :

| Champ | Valeur |
|-------|--------|
| Name | suivi-colis-cmr |
| Region | Frankfurt (EU Central) |
| Branch | main |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Instance Type | **Free** |

7. Avant de cliquer **Deploy**, ajoute une variable d'environnement :
   - Clique **"Advanced"** → **"Add Environment Variable"**
   - Key : `SECRET_KEY`
   - Value : tape une phrase secrète longue, ex: `monSuperSecret2024CmrColis!`
   - Ajoute aussi : `FLASK_ENV` = `production`

8. Clique **"Create Web Service"**

⏳ Render va installer les dépendances et démarrer ton app (environ 2-3 minutes).

---

## ✅ ÉTAPE 5 — Ton site est en ligne !

Render te donnera une URL du type :
```
https://suivi-colis-cmr.onrender.com
```

- **Page publique** : https://suivi-colis-cmr.onrender.com
- **Admin** : https://suivi-colis-cmr.onrender.com/admin
- **Login** : admin / admin123 ← **change ce mot de passe !**

---

## 🔑 ÉTAPE 6 — Changer le mot de passe admin

Une fois en ligne, connecte-toi à ton admin et lance cette commande
dans la console Render (onglet "Shell") :

```python
python -c "
from database import get_connection
conn = get_connection()
conn.execute(\"UPDATE agents SET mot_de_passe = 'TON_NOUVEAU_MOT_DE_PASSE' WHERE identifiant = 'admin'\")
conn.commit()
print('Mot de passe changé !')
"
```

---

## ⚠️ LIMITE DU PLAN GRATUIT RENDER

Le plan gratuit a une limitation importante :
- **Le serveur s'endort après 15 minutes d'inactivité**
- La première visite après une pause prend 30-60 secondes

💡 **Solution** : Pour éviter ça (si tu utilises le site souvent),
tu peux upgrader à 7$/mois sur Render, ou migrer vers **Railway.app**
qui a un plan gratuit sans mise en veille.

---

## 🔄 ÉTAPE 7 — Mettre à jour le site après une modification

Si tu modifies le code sur ton PC :

```bash
git add .
git commit -m "Description de ma modification"
git push
```

Render détectera automatiquement le push et redéploiera en quelques minutes.

---

## 🆘 Problèmes courants

| Problème | Solution |
|----------|----------|
| "Application error" au démarrage | Vérifie le Procfile : doit contenir `web: gunicorn app:app` |
| Page blanche | Vérifie que requirements.txt contient bien `flask` et `gunicorn` |
| Base de données vide après redémarrage | Normal avec SQLite sur Render — voir note ci-dessous |
| Login ne fonctionne pas | La DB se recrée vide, relance `inserer_donnees_test()` |

### Note importante sur la base de données

SQLite sur Render **se remet à zéro** à chaque redéploiement car le disque n'est pas persistant sur le plan gratuit.

**Options :**
- **Court terme** : Ajouter un agent admin manuellement via la console Shell de Render après chaque déploiement
- **Long terme** : Migrer vers PostgreSQL (Render en offre un gratuit) — on peut faire ça à la prochaine séance !

---

## 📞 Besoin d'aide ?

Si tu bloques à une étape, note l'étape et le message d'erreur exact,
et on le résoudra ensemble à la prochaine session.
