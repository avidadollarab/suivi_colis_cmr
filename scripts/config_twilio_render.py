#!/usr/bin/env python3
"""
Script de configuration Twilio pour le backend déployé sur Render.

Utilisation :
  1. Mode interactif (recommandé) :
     python scripts/config_twilio_render.py

  2. Avec variables d'environnement :
     RENDER_API_KEY=xxx RENDER_SERVICE_ID=xxx TWILIO_ACCOUNT_SID=xxx ... python scripts/config_twilio_render.py

  3. Générer un fichier .env pour copier-coller sur Render :
     python scripts/config_twilio_render.py --env-only
"""

import os
import sys
import json
import argparse

# Charge .env si disponible
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Variables Twilio requises
TWILIO_VARS = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_SMS_FROM",
    "TWILIO_WA_FROM",
]

RENDER_API_BASE = "https://api.render.com/v1"


def get_input(prompt, default="", secret=False):
    """Demande une valeur à l'utilisateur."""
    if default:
        prompt = f"{prompt} [{default}]"
    prompt += ": "
    if secret:
        try:
            import getpass
            val = getpass.getpass(prompt)
        except Exception:
            val = input(prompt)
    else:
        val = input(prompt)
    return val.strip() or default


def collect_twilio_credentials():
    """Collecte les identifiants Twilio de manière interactive."""
    print("\n=== Configuration Twilio ===\n")
    print("Récupère ces infos sur https://console.twilio.com")
    print("  - Account SID (commence par AC...)")
    print("  - Auth Token (clique sur l'œil pour le voir)")
    print("  - Numéro SMS : Phone Numbers → Buy a number (US, SMS)")
    print("  - WhatsApp : Messaging → Try it out → Send WhatsApp (sandbox)\n")

    creds = {}
    for var in TWILIO_VARS:
        secret = "TOKEN" in var or "AUTH" in var
        default = os.environ.get(var, "")
        label = var.replace("TWILIO_", "")
        if var == "TWILIO_SMS_FROM":
            label = "Numéro SMS (ex: +12015551234)"
        elif var == "TWILIO_WA_FROM":
            label = "WhatsApp sandbox (ex: whatsapp:+14155238886)"
        creds[var] = get_input(label, default, secret=secret)
    return creds


def render_list_services(api_key):
    """Liste les services Render."""
    import urllib.request
    req = urllib.request.Request(
        f"{RENDER_API_BASE}/services?limit=50",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    return data


def render_get_env_vars(api_key, service_id):
    """Récupère les variables d'environnement du service."""
    import urllib.request
    req = urllib.request.Request(
        f"{RENDER_API_BASE}/services/{service_id}/env-vars",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    return data


def render_update_env_vars(api_key, service_id, new_vars):
    """
    Met à jour les variables d'environnement du service Render.
    Ajoute/met à jour les variables Twilio sans écraser les autres.
    new_vars: dict {key: value}
    """
    import urllib.request
    # Récupère les variables actuelles pour les fusionner
    env_list = []
    try:
        current = render_get_env_vars(api_key, service_id)
        for e in current:
            if "key" not in e:
                continue
            k = e["key"]
            if k in new_vars:
                env_list.append({"key": k, "value": str(new_vars[k])})
            elif "generateValue" in e and e["generateValue"]:
                env_list.append({"key": k, "generateValue": True})
            elif "value" in e:
                env_list.append({"key": k, "value": str(e["value"])})
    except Exception:
        pass
    # Ajoute les nouvelles variables Twilio non présentes
    for k, v in new_vars.items():
        if not any(x.get("key") == k for x in env_list):
            env_list.append({"key": k, "value": str(v)})
    body = json.dumps({"envVars": env_list}).encode()
    url = f"{RENDER_API_BASE}/services/{service_id}/env-vars"
    req = urllib.request.Request(
        url,
        data=body,
        method="PATCH",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def main():
    parser = argparse.ArgumentParser(description="Configure Twilio sur Render")
    parser.add_argument("--env-only", action="store_true", help="Génère uniquement les variables pour .env")
    parser.add_argument("--no-render", action="store_true", help="Ne pas envoyer sur Render, seulement afficher")
    args = parser.parse_args()

    # Collecte des identifiants Twilio
    creds = {}
    if all(os.environ.get(v) for v in TWILIO_VARS):
        for v in TWILIO_VARS:
            creds[v] = os.environ[v]
        print("Identifiants Twilio chargés depuis l'environnement.")
    else:
        creds = collect_twilio_credentials()

    if not all(creds.get(v) for v in ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]):
        print("\nErreur : TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN sont requis.")
        sys.exit(1)

    if not creds.get("TWILIO_SMS_FROM") and not creds.get("TWILIO_WA_FROM"):
        print("\nAttention : au moins TWILIO_SMS_FROM ou TWILIO_WA_FROM doit être défini pour envoyer des messages.")

    # Mode --env-only : affiche les variables pour copier sur Render
    if args.env_only:
        print("\n=== Variables à ajouter sur Render ===\n")
        print("Dashboard Render → Web Service suivi-colis-cmr → Environment → Add Environment Variable\n")
        for k, v in creds.items():
            if v:
                display = "***" if "TOKEN" in k or "AUTH" in k else v
                print(f"  {k}={display}")
        print("\nCopie ces variables une par une sur Render, puis redémarre le service.")
        return

    # Envoi sur Render
    api_key = os.environ.get("RENDER_API_KEY")
    service_id = os.environ.get("RENDER_SERVICE_ID")

    if not api_key:
        api_key = get_input(
            "Clé API Render (Account Settings → API Keys)",
            secret=True
        )
    if not service_id:
        if api_key:
            try:
                services = render_list_services(api_key)
                backend = next((s for s in services if "suivi" in s.get("name", "").lower() or "colis" in s.get("name", "").lower()), None)
                if backend:
                    service_id = backend.get("id")
                    print(f"Service trouvé : {backend.get('name')} (ID: {service_id})")
                if not service_id:
                    print("Services disponibles :")
                    for s in services:
                        print(f"  - {s.get('name')} : {s.get('id')}")
            except Exception as e:
                print(f"Erreur API Render : {e}")
        if not service_id:
            service_id = get_input("ID du service backend (Dashboard → URL ou API)")

    if not api_key or not service_id:
        print("\nImpossible d'envoyer sur Render. Utilise --env-only pour afficher les variables.")
        return

    env_dict = {k: v for k, v in creds.items() if v}

    if args.no_render:
        print("\nVariables qui seraient envoyées :")
        for k, v in env_dict.items():
            display = "***" if "TOKEN" in k or "AUTH" in k else v
            print(f"  {k}={display}")
        return

    try:
        render_update_env_vars(api_key, service_id, env_dict)
        print("\nVariables Twilio mises à jour sur Render.")
        print("Le service va redémarrer automatiquement.")
    except Exception as e:
        print(f"\nErreur lors de la mise à jour : {e}")
        print("Tu peux ajouter les variables manuellement sur le Dashboard Render.")
        print("Lance avec --env-only pour afficher les valeurs.")


if __name__ == "__main__":
    main()
