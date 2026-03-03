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
    "EN_CONTENEUR": (
        "📦 Bonjour ! Votre colis {numero} a été déposé dans le conteneur "
        "et sera prochainement acheminé vers le Cameroun. "
        "Suivez-le sur notre site.\n\n"
        "📦 Hello! Your parcel {numero} has been loaded into the container "
        "and will soon be shipped to Cameroon. Track it on our website.",

        "📦 Hello! Your parcel {numero} has been loaded into the container "
        "and will soon be shipped to Cameroon."
    ),
    "PARTI": (
        "🚢 Bonne nouvelle ! Votre colis {numero} a quitté la France. "
        "Il est actuellement en transit vers le Cameroun. "
        "Durée estimée : 3 à 5 semaines.\n\n"
        "🚢 Good news! Your parcel {numero} has left France. "
        "It is currently in transit to Cameroon. "
        "Estimated time: 3 to 5 weeks.",

        "🚢 Good news! Your parcel {numero} has left France. "
        "Currently in transit to Cameroon."
    ),
    "ARRIVE": (
        "🇨🇲 Votre colis {numero} est arrivé au port de Douala, Cameroun ! "
        "La livraison au destinataire sera organisée prochainement. "
        "Merci de votre confiance.\n\n"
        "🇨🇲 Your parcel {numero} has arrived at the port of Douala, Cameroon! "
        "Delivery to the recipient will be arranged shortly.",

        "🇨🇲 Your parcel {numero} has arrived at Douala port, Cameroon!"
    ),
    "LIVRE": (
        "✅ Votre colis {numero} a été livré avec succès à {ville} ! "
        "Merci de nous avoir fait confiance pour cet envoi.\n\n"
        "✅ Your parcel {numero} has been successfully delivered in {ville}! "
        "Thank you for trusting us with this shipment.",

        "✅ Your parcel {numero} has been successfully delivered in {ville}!"
    ),
}

MESSAGES_DESTINATAIRE = {
    # La personne qui reçoit au Cameroun
    "ARRIVE": (
        "🇨🇲 Bonjour ! Un colis {numero} vous est destiné et vient d'arriver "
        "au port de Douala. La livraison à {ville} sera organisée bientôt. "
        "Restez disponible.\n\n"
        "🇨🇲 Hello! A parcel {numero} for you has just arrived "
        "at Douala port. Delivery to {ville} will be arranged soon. "
        "Please stay available.",

        "🇨🇲 Hello! Parcel {numero} for you arrived at Douala port. "
        "Delivery to {ville} coming soon."
    ),
    "LIVRE": (
        "✅ Bonjour ! Votre colis {numero} vous a été remis. "
        "Nous espérons que vous êtes satisfait(e). Bonne réception !\n\n"
        "✅ Hello! Your parcel {numero} has been delivered to you. "
        "We hope you are satisfied. Enjoy!",

        "✅ Hello! Your parcel {numero} has been delivered. Enjoy!"
    ),
}


# ----------------------------------------------------------
# INITIALISATION TWILIO
# ----------------------------------------------------------

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

def envoyer_notifications(numero_suivi, nouveau_statut,
                           tel_expediteur, tel_destinataire,
                           ville_destinataire):
    """
    Envoie les notifications SMS + WhatsApp à l'expéditeur
    et/ou au destinataire selon le statut.

    Paramètres :
        numero_suivi       : ex "CMR-2026-00012"
        nouveau_statut     : ex "PARTI"
        tel_expediteur     : ex "+33612345678"
        tel_destinataire   : ex "+237699123456"
        ville_destinataire : ex "Douala"

    Retourne : dict avec le nombre de messages envoyés
    """

    resultats = {"sms": 0, "whatsapp": 0, "simules": 0, "erreurs": 0}

    # Prépare les variables de remplacement dans les messages
    vars_msg = {
        "numero": numero_suivi,
        "ville":  ville_destinataire,
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

    # 1. Message à l'expéditeur (France)
    if nouveau_statut in MESSAGES_EXPEDITEUR and tel_expediteur:
        texte_bilingue = MESSAGES_EXPEDITEUR[nouveau_statut][0].format(**vars_msg)
        envois.append(("expéditeur", tel_expediteur, texte_bilingue))

    # 2. Message au destinataire (Cameroun)
    if nouveau_statut in MESSAGES_DESTINATAIRE and tel_destinataire:
        texte_bilingue = MESSAGES_DESTINATAIRE[nouveau_statut][0].format(**vars_msg)
        envois.append(("destinataire", tel_destinataire, texte_bilingue))

    if not envois:
        print(f"[NOTIF] Aucun message défini pour le statut '{nouveau_statut}' — rien envoyé.")
        return resultats

    # ----------------------------------------------------------
    # Envoie les messages
    # ----------------------------------------------------------
    for (qui, telephone, texte) in envois:

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
    vars_msg = {"numero": numero_suivi, "ville": ville_destinataire}
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
