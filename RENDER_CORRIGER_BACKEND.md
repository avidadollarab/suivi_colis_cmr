# Corriger Render : afficher le backend Flask (admin, QR, suivi)

Tu vois le site Next.js (chatbot) au lieu du backend Flask. Voici comment corriger.

---

## Sur Render : modifier la configuration

1. Va sur **https://dashboard.render.com**
2. Clique sur ton **Web Service**
3. Onglet **Settings** (menu de gauche)
4. Section **Build & Deploy**

### Modifier ces champs :

| Champ | Valeur à mettre |
|-------|-----------------|
| **Root Directory** | *(laisser vide)* |
| **Runtime** | **Python 3** |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |

5. Clique sur **Save Changes**
6. Render va redéployer automatiquement (attends 2–3 min)

---

## Vérifier

Après le redéploiement, en visitant ton URL tu devrais voir :

- Page d’accueil avec barre de recherche de suivi
- Bouton **« Connexion équipe / Admin »**
- Navbar avec **« Suivre un colis »** et **« Espace équipe »**

Le chatbot Next.js ne sera plus affiché — c’est normal, le backend Flask sert ses propres pages.
