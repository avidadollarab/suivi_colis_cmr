"""
=============================================================
  SYSTÈME DE SUIVI DE COLIS - FRANCE → CAMEROUN
  Fichier : notifications.py
  Description : Envoi SMS et WhatsApp via Twilio
               (bilingue français / anglais)
=============================================================

  VARIABLES D'ENVIRONNEMENT REQUISES sur Render :
  - TWILIO_ACCOUNT_SID   → ton Account SID Twilio
  - TWILIO_AUTH_TOKEN    → ton Auth Token Twilio
  - TWILIO_SMS_FROM      → ton numéro Twilio ex: +12015551234
  - TWILIO_WA_FROM       → ex: whatsapp:+14155238886 (sandbox Twilio)

  En local : crée un fichier .env ou définis ces variables
  manuellement pour tester.
=============================================================
"""

import os
import sys

# Fix encodage Windows pour les emojis dans la console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ----------------------------------------------------------
# MESSAGES BILINGUES PAR STATUT
# Clé = statut, valeur = (message français, message anglais)
# {numero} et {ville} seront remplacés dynamiquement
# ----------------------------------------------------------

MESSAGES_EXPEDITEUR = {
    # Le client qui a envoyé le colis depuis l'Europe
    "RAMASSE": (
        "📦 Bonjour ! Votre colis {numero} a bien été ramassé. "
        "Vous recevrez des mises à jour par SMS/email à chaque étape. "
        "Suivez-le : {url}\n\n"
        "📦 Hello! Your parcel {numero} has been picked up. "
        "You will receive updates by SMS/email at each step. Track it: {url}",

        "📦 Hello! Your parcel {numero} has been picked up. Track: {url}"
    ),
    "EN_CONTENEUR": (
        "📦 Bonjour ! Votre colis {numero} a été déposé dans le conteneur "
        "et sera prochainement acheminé vers le Cameroun. Suivez : {url}\n\n"
        "📦 Hello! Your parcel {numero} has been loaded into the container. Track: {url}",

        "📦 Hello! Your parcel {numero} has been loaded. Track: {url}"
    ),
    "PARTI": (
        "🚢 Bonne nouvelle ! Votre colis {numero} a quitté la France. "
        "En transit vers le Cameroun (3-5 semaines). Suivez : {url}\n\n"
        "🚢 Good news! Your parcel {numero} has left France. Track: {url}",

        "🚢 Your parcel {numero} left France. Track: {url}"
    ),
    "ARRIVE": (
        "🇨🇲 Votre colis {numero} est arrivé au port de Douala ! Suivez : {url}\n\n"
        "🇨🇲 Your parcel {numero} has arrived at Douala port. Track: {url}",

        "🇨🇲 Your parcel {numero} arrived at Douala. Track: {url}"
    ),
    "LIVRE": (
        "✅ Votre colis {numero} a été livré à {ville} ! Merci.\n\n"
        "✅ Your parcel {numero} delivered in {ville}! Thank you.",

        "✅ Your parcel {numero} delivered in {ville}!"
    ),
}

MESSAGES_DESTINATAIRE = {
    # La personne qui reçoit au Cameroun
    "ARRIVE": (
        "🇨🇲 Un colis {numero} vous est destiné, arrivé à Douala. Livraison à {ville} bientôt. Suivez : {url}\n\n"
        "🇨🇲 Parcel {numero} for you arrived at Douala. Track: {url}",

        "🇨🇲 Parcel {numero} arrived. Track: {url}"
    ),
    "LIVRE": (
        "✅ Votre colis {numero} vous a été remis. Merci !\n\n"
        "✅ Your parcel {numero} has been delivered. Enjoy!",

        "✅ Your parcel {numero} delivered. Enjoy!"
    ),
}


# ----------------------------------------------------------
# INITIALISATION TWILIO
# ----------------------------------------------------------

def twilio_configure():
    """Retourne True si Twilio est configuré pour envoi réel."""
    sid = os.environ.get("TWILIO_ACCOUNT_SID")
    tok = os.environ.get("TWILIO_AUTH_TOKEN")
    sms = os.environ.get("TWILIO_SMS_FROM")
    wa = os.environ.get("TWILIO_WA_FROM")
    return bool(sid and tok and (sms or wa))


def _normaliser_tel(tel):
    """Normalise un numéro de téléphone pour Twilio (format E.164)."""
    if not tel:
        return ""
    tel = str(tel).replace(" ", "").replace("-", "").replace(".", "").strip()
    if not tel:
        return ""
    if tel.startswith("+"):
        return tel
    if tel.startswith("00"):
        return "+" + tel[2:]
    if tel.startswith("33") and len(tel) == 11:
        return "+" + tel
    if tel.startswith("237") and len(tel) >= 12:
        return "+" + tel
    if tel.startswith("0") and len(tel) == 10:
        return "+33" + tel[1:]
    if tel.startswith("6") and len(tel) == 9 and tel.isdigit():
        return "+237" + tel
    if len(tel) == 9 and tel.isdigit():
        return "+33" + tel
    return "+" + tel if tel.startswith("3") or tel.startswith("2") else tel


def _get_twilio_client():
    """
    Retourne un client Twilio si les variables sont configurées.
    Retourne None si Twilio n'est pas configuré (mode test local).
    """
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token  = os.environ.get("TWILIO_AUTH_TOKEN")

    if not account_sid or not auth_token:
        print("[NOTIF] Twilio non configuré — mode simulation activé.")
        return None

    try:
        from twilio.rest import Client
        return Client(account_sid, auth_token)
    except ImportError:
        print("[NOTIF] ⚠️  Package twilio non installé (pip install twilio).")
        return None
    except Exception as e:
        print(f"[NOTIF] ⚠️  Erreur connexion Twilio : {e}")
        return None


def _email_configure():
    """Retourne True si l'email SMTP est configuré."""
    host = os.environ.get("SMTP_HOST")
    user = os.environ.get("SMTP_USER")
    pwd = os.environ.get("SMTP_PASSWORD")
    return bool(host and user and pwd)


def _envoyer_email(destinataire, sujet, corps_texte):
    """
    Envoie un email via SMTP.
    Variables : SMTP_HOST, SMTP_PORT (587), SMTP_USER, SMTP_PASSWORD, SMTP_FROM (optionnel)
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER")
    pwd = os.environ.get("SMTP_PASSWORD")
    from_addr = os.environ.get("SMTP_FROM") or user

    if not user or not pwd:
        print("[NOTIF] Email non configuré (SMTP_USER/SMTP_PASSWORD)")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = sujet
        msg["From"] = from_addr
        msg["To"] = destinataire

        msg.attach(MIMEText(corps_texte, "plain", "utf-8"))

        with smtplib.SMTP(host, port) as server:
            server.starttls()
            server.login(user, pwd)
            server.sendmail(from_addr, [destinataire], msg.as_string())
        print(f"[NOTIF] ✅ Email envoyé → {destinataire}")
        return True
    except Exception as e:
        print(f"[NOTIF] ❌ Erreur email → {destinataire} : {e}")
        return False


def _envoyer_message(client, canal, from_number, to_number, texte):
    """
    Envoie un message via SMS ou WhatsApp.
    canal : 'sms' ou 'whatsapp'
    """
    try:
        if canal == "whatsapp":
            # WhatsApp nécessite le préfixe "whatsapp:"
            to_wa  = f"whatsapp:{to_number}"
            from_wa = from_number  # déjà au format whatsapp:+1...
            msg = client.messages.create(
                body=texte,
                from_=from_wa,
                to=to_wa
            )
        else:
            msg = client.messages.create(
                body=texte,
                from_=from_number,
                to=to_number
            )
        print(f"[NOTIF] ✅ {canal.upper()} envoyé → {to_number} (SID: {msg.sid})")
        return True

    except Exception as e:
        print(f"[NOTIF] ❌ Erreur envoi {canal} → {to_number} : {e}")
        return False


# ----------------------------------------------------------
# FONCTION PRINCIPALE
# ----------------------------------------------------------

def _get_track_url(numero_suivi):
    """URL de suivi du colis (frontend)."""
    base = os.environ.get("APP_URL", "https://elisee-xpress-frontend.onrender.com")
    return f"{base.rstrip('/')}/track/{numero_suivi}"


def envoyer_notifications(numero_suivi, nouveau_statut,
                           tel_expediteur, tel_destinataire,
                           ville_destinataire, email_expediteur=None):
    """
    Envoie les notifications SMS + WhatsApp + Email à l'expéditeur
    et/ou au destinataire selon le statut.

    Paramètres :
        numero_suivi       : ex "CMR-2026-00012"
        nouveau_statut     : ex "PARTI"
        tel_expediteur     : ex "+33612345678"
        tel_destinataire   : ex "+237699123456"
        ville_destinataire : ex "Douala"
        email_expediteur   : ex "client@email.com" (optionnel)

    Retourne : dict avec le nombre de messages envoyés
    """

    resultats = {"sms": 0, "whatsapp": 0, "email": 0, "simules": 0, "erreurs": 0}

    # Prépare les variables de remplacement dans les messages
    vars_msg = {
        "numero": numero_suivi,
        "ville":  ville_destinataire or "",
        "url":    _get_track_url(numero_suivi),
    }

    # Initialise Twilio
    client          = _get_twilio_client()
    sms_from        = os.environ.get("TWILIO_SMS_FROM")
    wa_from         = os.environ.get("TWILIO_WA_FROM")
    mode_simulation = client is None

    # ----------------------------------------------------------
    # Construit la liste des envois à faire
    # Format : (destinataire_type, telephone, texte_fr_en)
    # ----------------------------------------------------------
    envois = []

    # 1. Message à l'expéditeur (France) — SMS/WhatsApp
    if nouveau_statut in MESSAGES_EXPEDITEUR and tel_expediteur:
        texte_bilingue = MESSAGES_EXPEDITEUR[nouveau_statut][0].format(**vars_msg)
        envois.append(("expéditeur", tel_expediteur, texte_bilingue))

    # 2. Message au destinataire (Cameroun)
    if nouveau_statut in MESSAGES_DESTINATAIRE and tel_destinataire:
        texte_bilingue = MESSAGES_DESTINATAIRE[nouveau_statut][0].format(**vars_msg)
        envois.append(("destinataire", tel_destinataire, texte_bilingue))

    if not envois and not (nouveau_statut in MESSAGES_EXPEDITEUR and email_expediteur):
        print(f"[NOTIF] Aucun message défini pour le statut '{nouveau_statut}' — rien envoyé.")
        return resultats

    # ----------------------------------------------------------
    # Envoi EMAIL à l'expéditeur (si configuré)
    # ----------------------------------------------------------
    if nouveau_statut in MESSAGES_EXPEDITEUR and email_expediteur:
        email = str(email_expediteur).strip()
        if email and "@" in email:
            sujet = f"ELISÉE XPRESS — Colis {numero_suivi} : {nouveau_statut}"
            corps = MESSAGES_EXPEDITEUR[nouveau_statut][0].format(**vars_msg)
            if _email_configure():
                if _envoyer_email(email, sujet, corps):
                    resultats["email"] += 1
                else:
                    resultats["erreurs"] += 1
            else:
                print(f"[NOTIF SIMULATION] Email → {email}\n{corps[:200]}...")
                resultats["simules"] += 1

    # ----------------------------------------------------------
    # Envoie les messages SMS / WhatsApp
    # ----------------------------------------------------------
    for (qui, telephone, texte) in envois:
        telephone = _normaliser_tel(telephone)
        if not telephone or not telephone.startswith("+"):
            print(f"[NOTIF] ⚠️ Numéro invalide ignoré : {telephone}")
            continue

        if mode_simulation:
            # Mode simulation : affiche le message sans l'envoyer
            print(f"\n[NOTIF SIMULATION] ------------------------------")
            print(f"  Vers       : {qui} ({telephone})")
            print(f"  Statut     : {nouveau_statut}")
            print(f"  Message    :\n{texte}")
            print(f"-------------------------------------------------\n")
            resultats["simules"] += 2  # SMS + WhatsApp simulés
            continue

        # Envoi SMS réel
        if sms_from:
            ok = _envoyer_message(client, "sms", sms_from, telephone, texte)
            if ok:
                resultats["sms"] += 1
            else:
                resultats["erreurs"] += 1

        # Envoi WhatsApp réel
        if wa_from:
            ok = _envoyer_message(client, "whatsapp", wa_from, telephone, texte)
            if ok:
                resultats["whatsapp"] += 1
            else:
                resultats["erreurs"] += 1

    return resultats


# ----------------------------------------------------------
# APERÇU DES MESSAGES (pour l'interface admin)
# ----------------------------------------------------------

def apercu_message(statut, numero_suivi, ville_destinataire, destinataire="expediteur"):
    """
    Retourne le texte du message qui sera envoyé,
    sans l'envoyer. Utile pour afficher un aperçu dans l'admin.
    """
    vars_msg = {
        "numero": numero_suivi,
        "ville": ville_destinataire or "",
        "url": _get_track_url(numero_suivi),
    }
    catalogue = MESSAGES_EXPEDITEUR if destinataire == "expediteur" else MESSAGES_DESTINATAIRE
    if statut not in catalogue:
        return None
    return catalogue[statut][0].format(**vars_msg)


# ----------------------------------------------------------
# TEST LOCAL
# ----------------------------------------------------------
if __name__ == "__main__":
    print("=== TEST NOTIFICATIONS (mode simulation) ===\n")

    # Simule tous les statuts qui déclenchent une notif
    statuts_test = ["EN_CONTENEUR", "PARTI", "ARRIVE", "LIVRE"]

    for statut in statuts_test:
        print(f"\n{'='*50}")
        print(f"  STATUT : {statut}")
        print(f"{'='*50}")
        envoyer_notifications(
            numero_suivi       = "CMR-2026-00012",
            nouveau_statut     = statut,
            tel_expediteur     = "+33612345678",
            tel_destinataire   = "+237699123456",
            ville_destinataire = "Douala"
        )
