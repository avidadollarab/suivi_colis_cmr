#!/usr/bin/env python3
"""
Envoie un SMS de test via Twilio pour vérifier la configuration.

Usage :
  python scripts/test_twilio_sms.py +33612345678

Les variables TWILIO_* doivent être définies (dans .env ou l'environnement).
"""

import os
import sys

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_twilio_sms.py +33612345678")
        print("  Le numéro doit être au format international (ex: +33, +237)")
        sys.exit(1)

    to_number = sys.argv[1].strip()
    if not to_number.startswith("+"):
        to_number = "+" + to_number

    sid = os.environ.get("TWILIO_ACCOUNT_SID")
    token = os.environ.get("TWILIO_AUTH_TOKEN")
    sms_from = os.environ.get("TWILIO_SMS_FROM")

    if not sid or not token:
        print("Erreur : TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN requis.")
        print("Définis-les ou charge un .env (pip install python-dotenv)")
        sys.exit(1)
    if not sms_from:
        print("Erreur : TWILIO_SMS_FROM requis (ton numéro Twilio)")
        sys.exit(1)

    try:
        from twilio.rest import Client
    except ImportError:
        print("Installe twilio : pip install twilio")
        sys.exit(1)

    client = Client(sid, token)
    msg = (
        "Test ELISEE XPRESS — Votre configuration Twilio fonctionne. "
        "Les notifications SMS seront envoyées à chaque mise à jour de colis."
    )

    try:
        m = client.messages.create(body=msg, from_=sms_from, to=to_number)
        print(f"SMS envoyé avec succès ! SID: {m.sid}")
        print(f"Tu devrais recevoir le message sur {to_number}")
    except Exception as e:
        print(f"Erreur : {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
