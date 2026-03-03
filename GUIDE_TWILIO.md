# 📱 Guide Twilio — SMS + WhatsApp
## Activer les notifications automatiques sur ton site

---

## Comment ça fonctionne

À chaque fois que ton équipe change le statut d'un colis dans l'interface admin,
le système envoie automatiquement un message **SMS** ET **WhatsApp** :

| Statut | Expéditeur (France) | Destinataire (Cameroun) |
|--------|--------------------|-----------------------|
| 📦 EN_CONTENEUR | ✅ Oui | ❌ Non |
| 🚢 PARTI | ✅ Oui | ❌ Non |
| 🇨🇲 ARRIVE | ✅ Oui | ✅ Oui |
| ✅ LIVRE | ✅ Oui | ✅ Oui |

Les messages sont **bilingues français + anglais** dans un seul SMS.

---

## ÉTAPE 1 — Créer un compte Twilio

1. Va sur → https://www.twilio.com/try-twilio
2. Crée un compte gratuit (email + téléphone)
3. Twilio te crédite automatiquement **15,50$** de départ
   - SMS vers France : ~0,07$/SMS
   - SMS vers Cameroun : ~0,06$/SMS
   - WhatsApp : ~0,005$/message (très bon marché)

---

## ÉTAPE 2 — Récupérer tes identifiants

Sur le dashboard Twilio (https://console.twilio.com) :

1. Copie ton **Account SID** (commence par `AC...`)
2. Copie ton **Auth Token** (clique sur l'œil pour le révéler)

---

## ÉTAPE 3 — Obtenir un numéro SMS

1. Dans le menu Twilio → **Phone Numbers** → **Buy a number**
2. Choisis un numéro avec la capacité **SMS** ✅
3. Préfère un numéro **US** (moins cher, ~1$/mois)
4. Note ton numéro, ex : `+12015551234`

---

## ÉTAPE 4 — Activer WhatsApp (Sandbox)

Le **Sandbox WhatsApp** est gratuit et permet de tester sans validation Meta.

1. Dans Twilio → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Note le numéro sandbox, ex : `whatsapp:+14155238886`
3. Pour activer le sandbox pour un numéro :
   - Envoie le code affiché (ex: `join silver-flame`) par WhatsApp au numéro sandbox
   - Chaque personne qui veut recevoir des WhatsApp doit faire cette étape **une seule fois**

> ⚠️ Pour la production (vrais clients), tu devras demander un accès WhatsApp Business
> à Twilio (~quelques semaines de validation Meta). Le sandbox suffit pour commencer.

---

## ÉTAPE 5 — Configurer les variables sur Render

Va sur ton **Web Service** Render → onglet **Environment** → ajoute ces 4 variables :

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `TWILIO_ACCOUNT_SID` | Ton Account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Ton Auth Token | `your_auth_token_here` |
| `TWILIO_SMS_FROM` | Ton numéro Twilio | `+12015551234` |
| `TWILIO_WA_FROM` | Numéro WhatsApp sandbox | `whatsapp:+14155238886` |

Clique **Save Changes** → Render redémarre automatiquement.

---

## ÉTAPE 6 — Tester

1. Connecte-toi à ton admin
2. Ouvre un colis
3. Change le statut en **"PARTI"**
4. Tu devrais voir dans l'interface :
   - ✅ Flash vert : "Statut mis à jour"
   - 📱 Flash bleu : "X notification(s) envoyée(s)"
5. Vérifie ton téléphone → le SMS et/ou WhatsApp arrive !

---

## Tester en local (sur ton PC)

Pour tester sans Render, crée un fichier `.env` dans ton dossier :

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxx
TWILIO_SMS_FROM=+12015551234
TWILIO_WA_FROM=whatsapp:+14155238886
```

Puis installe `python-dotenv` et ajoute en haut de `app.py` :
```python
from dotenv import load_dotenv
load_dotenv()
```

> ⚠️ N'oublie pas d'ajouter `.env` dans ton `.gitignore` !
> Ne publie jamais tes clés Twilio sur GitHub.

---

## Sans Twilio : mode simulation automatique

Si les variables Twilio **ne sont pas définies**, le système fonctionne
quand même normalement — les messages sont juste affichés dans les logs
au lieu d'être envoyés. Tu ne perds aucune fonctionnalité.

---

## Récapitulatif — état du projet après cette session

| Fichier | Rôle |
|---------|------|
| `notifications.py` | Module d'envoi SMS + WhatsApp (nouveau) |
| `app.py` | Intègre les notifications au changement de statut |
| `requirements.txt` | Ajout de `twilio==9.3.6` |

```
Projet complet :
suivi-colis/
├── app.py              ← Flask + routes + notifications intégrées
├── database.py         ← SQLite (local) / PostgreSQL (production)
├── notifications.py    ← SMS + WhatsApp bilingue (NOUVEAU)
├── requirements.txt    ← flask, gunicorn, psycopg2, twilio
├── Procfile
├── .gitignore
└── templates/          ← toutes les pages HTML
```
