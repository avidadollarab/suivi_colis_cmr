# Créer le Web Service sur Render (étape par étape)

Si tu ne vois **rien** sur Render, c’est probablement qu’aucun **Web Service** n’a encore été créé. Voici comment le faire.

---

## Étape 1 : Connexion

1. Va sur **https://dashboard.render.com**
2. Connecte-toi (ou crée un compte)

---

## Étape 2 : Créer un Web Service

1. Clique sur le bouton bleu **"New +"** (en haut à droite)
2. Choisis **"Web Service"**
3. Render te demande de connecter un dépôt Git :
   - Si GitHub n’est pas connecté : **"Connect account"** → autorise Render
   - Choisis le dépôt **avidadollarab/suivi_colis_cmr** (ou le nom exact de ton repo)

---

## Étape 3 : Configurer le service

Remplis les champs comme suit :

| Champ | Valeur |
|-------|--------|
| **Name** | `suivi-colis-cmr` (ou un autre nom) |
| **Region** | **Frankfurt (EU Central)** |
| **Branch** | `main` |
| **Runtime** | **Python 3** |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |
| **Plan** | **Free** |

---

## Étape 4 : Lier la base PostgreSQL

1. Dans la section **Environment** (avant de créer) :
   - Clique sur **"Add Environment Variable"**
   - **Key** : `DATABASE_URL`
   - **Value** : colle l’**Internal Database URL** de ta base PostgreSQL

2. **Où trouver cette URL ?**
   - Dans le menu de gauche : **PostgreSQL** (ou **Databases**)
   - Clique sur ta base (ex. `suivi-colis-db`)
   - Section **Connections** → **Internal Database URL** → **Copy**

3. Si tu n’as pas encore de base PostgreSQL :
   - **New +** → **PostgreSQL**
   - Name : `suivi-colis-db`
   - Region : **Frankfurt**
   - Create Database
   - Attends 1–2 minutes, puis copie l’Internal Database URL

---

## Étape 5 : Créer le service

1. Clique sur **"Create Web Service"**
2. Render va :
   - Cloner le repo
   - Exécuter `pip install -r requirements.txt`
   - Démarrer `gunicorn app:app`
3. Attends 3–5 minutes (premier déploiement)

---

## Étape 6 : Vérifier

1. En haut de la page du service, tu vois une URL du type :
   - `https://suivi-colis-cmr.onrender.com`
2. Clique dessus ou copie-la dans ton navigateur
3. Tu dois voir la page d’accueil SuiviColis

---

## En cas de problème

### "Application failed to respond"
- Onglet **Logs** : regarde les erreurs
- Vérifie que `DATABASE_URL` est bien définie
- Vérifie que la base et le service sont dans la **même région** (Frankfurt)

### Page blanche ou erreur 502
- Attends 1–2 minutes de plus (le plan Free met l’app en veille)
- Rafraîchis la page

### "Repository not found"
- Vérifie que le repo GitHub est **public** ou que Render a accès
- Vérifie le nom du repo : `avidadollarab/suivi_colis_cmr`
