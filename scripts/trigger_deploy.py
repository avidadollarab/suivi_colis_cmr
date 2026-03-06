#!/usr/bin/env python3
"""Déclenche un déploiement sur Render via l'API."""
import os
import json
import urllib.request

def load_env():
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass
    # Charger .env manuellement si dotenv absent
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k and k not in os.environ:
                        os.environ[k] = v

load_env()

RENDER_API_BASE = "https://api.render.com/v1"

def main():
    api_key = os.environ.get("RENDER_API_KEY")
    service_id = os.environ.get("RENDER_SERVICE_ID")
    if not api_key:
        print("RENDER_API_KEY manquant. Définissez-la dans .env ou en variable d'environnement.")
        return 1
    if not service_id:
        # Essayer de trouver le service backend (Python/Flask)
        req = urllib.request.Request(
            f"{RENDER_API_BASE}/services?limit=50",
            headers={"Accept": "application/json", "Authorization": f"Bearer {api_key}"},
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        services = data if isinstance(data, list) else data.get("items", data.get("services", [data]))
        if not isinstance(services, list):
            services = [services] if services else []
        for s in services:
            name = s.get("name", s.get("service", {}).get("name", ""))
            if isinstance(name, dict):
                name = name.get("name", "")
            name = str(name).lower()
            # Chercher suivi, colis, cmr, ou le premier service web Python
            if any(x in name for x in ["suivi", "colis", "cmr", "backend"]):
                service_id = s.get("id", s.get("service", {}).get("id"))
                if service_id:
                    print(f"Service trouvé: {s.get('name', name)} ({service_id})")
                    break
        if not service_id and services:
            s = services[0]
            service_id = s.get("id", s.get("service", {}).get("id"))
            if service_id:
                print(f"Utilisation du premier service: {s.get('name', '?')} ({service_id})")
        if not service_id:
            print("RENDER_SERVICE_ID manquant. Ajoutez-le dans .env (ex: srv-xxxxx)")
            return 1

    req = urllib.request.Request(
        f"{RENDER_API_BASE}/services/{service_id}/deploys",
        data=json.dumps({"clearCache": "do_not_clear"}).encode(),
        method="POST",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    with urllib.request.urlopen(req) as resp:
        deploy = json.loads(resp.read().decode())
    print(f"Deploy déclenché: {deploy.get('id')} - statut: {deploy.get('status')}")
    return 0

if __name__ == "__main__":
    exit(main())
