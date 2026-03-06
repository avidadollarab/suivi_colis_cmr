# Activer les notifications SMS et WhatsApp sur Render

Actuellement, **aucune notification n'est envoyée** car Twilio n'est pas configuré. Voici comment activer les SMS et WhatsApp.

---

## Pourquoi ça ne marche pas ?

Sans configuration Twilio, le système fonctionne en **mode simulation** : les messages sont préparés mais pas envoyés. C'est normal.

---

## Étapes pour activer les notifications

### 1. Créer un compte Twilio (gratuit)

1. Va sur **https://www.twilio.com/try-twilio**
2. Inscris-toi (email + téléphone)
3. Tu reçois **15,50 $** de crédit gratuit

---

### 2. Récupérer les identifiants

Sur **https://console.twilio.com** :

- **Account SID** (commence par `AC...`)
- **Auth Token** (clique sur l'œil pour le voir)

---

### 3. Obtenir un numéro pour les SMS

1. Twilio → **Phone Numbers** → **Buy a number**
2. Choisis un numéro **US** avec capacité **SMS** (~1 $/mois)
3. Note le numéro, ex : `+12015551234`

---

### 4. Activer WhatsApp (sandbox gratuit)

1. Twilio → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Note le numéro sandbox, ex : `whatsapp:+14155238886`
3. **Important** : envoie le code affiché (ex : `join silver-flame`) par WhatsApp au numéro sandbox
4. Chaque destinataire qui doit recevoir des WhatsApp doit faire cette étape **une fois**

---

### 5. Ajouter les variables sur Render

1. Render → ton **Web Service** → **Environment**
2. **Add Environment Variable** pour chacune :

| Variable | Valeur |
|----------|--------|
| `TWILIO_ACCOUNT_SID` | Ton Account SID (AC...) |
| `TWILIO_AUTH_TOKEN` | Ton Auth Token |
| `TWILIO_SMS_FROM` | Ton numéro Twilio (ex : +12015551234) |
| `TWILIO_WA_FROM` | Numéro WhatsApp sandbox (ex : whatsapp:+14155238886) |

3. **Save Changes** → Render redémarre

---

### 6. Format des numéros de téléphone

Les numéros doivent être au format international :

- France : `+33612345678` ou `0612345678` (converti automatiquement)
- Cameroun : `+237699123456` ou `699123456`

---

## Email (SMTP)

Les notifications par **email** sont envoyées à l'expéditeur (client) à chaque changement de statut, si son email est renseigné.

### Configuration Gmail (exemple)

1. Active une **mot de passe d'application** sur ton compte Google : https://myaccount.google.com/apppasswords
2. Ajoute sur Render :

| Variable | Valeur |
|----------|--------|
| `SMTP_HOST` | smtp.gmail.com |
| `SMTP_PORT` | 587 |
| `SMTP_USER` | ton-email@gmail.com |
| `SMTP_PASSWORD` | Mot de passe d'application (16 caractères) |
| `SMTP_FROM` | (optionnel) ton-email@gmail.com |
| `APP_URL` | https://elisee-xpress-frontend.onrender.com |

### Autres fournisseurs

- **Outlook** : SMTP_HOST=smtp.office365.com, SMTP_PORT=587
- **OVH** : SMTP_HOST=ssl0.ovh.net, SMTP_PORT=587

---

## Vérifier que ça marche

1. Change le statut d'un colis (ex : PARTI)
2. Tu dois voir : « X notification(s) envoyée(s) »
3. Vérifie le téléphone du client/destinataire

Si tu vois « SMS/WhatsApp non configurés », les variables Twilio ne sont pas encore ajoutées sur Render.
