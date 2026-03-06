"""
Seed des 26 clients fidèles — fonctionne en local (SQLite) et sur Render (PostgreSQL).
Usage: python seed_clients.py
Avec DATABASE_URL défini → PostgreSQL (prod Render)
Sans DATABASE_URL → SQLite (suivi_colis.db)
"""
import json
import os

def run():
    from database import initialiser, get_connection, p

    seed_path = os.path.join(os.path.dirname(__file__), "clients_seed.json")
    if not os.path.exists(seed_path):
        print(f"Fichier introuvable: {seed_path}")
        return

    initialiser()
    with open(seed_path, "r", encoding="utf-8") as f:
        clients = json.load(f)

    conn = get_connection()
    cursor = conn.cursor()
    ph = p()
    added = 0

    for c in clients:
        nom = c.get("nom", "")
        prenom = c.get("prenom", "")
        telephone = str(c.get("telephone", "0000000000") or "0000000000")
        email = c.get("email")
        rue = c.get("rue", "")
        ville = c.get("ville", "")
        code_postal = c.get("code_postal", "")
        pays = c.get("pays", "France")
        adresse = f"{rue}, {code_postal} {ville}".strip(", ")
        if not adresse.strip():
            adresse = None

        # Éviter les doublons (nom + téléphone)
        cursor.execute(f"SELECT id FROM clients WHERE nom = {ph} AND telephone = {ph}", (nom, telephone))
        if cursor.fetchone():
            continue

        cursor.execute(f"""
            INSERT INTO clients (nom, prenom, telephone, email, adresse_europe, ville_europe, pays_europe)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
        """, (nom, prenom, telephone, email, adresse, ville, pays))
        added += 1

    conn.commit()
    conn.close()
    print(f"Seed terminé: {added} clients ajoutés.")
    if os.environ.get("DATABASE_URL"):
        print("(Base PostgreSQL Render)")
    else:
        print("(Base SQLite locale)")

if __name__ == "__main__":
    run()
