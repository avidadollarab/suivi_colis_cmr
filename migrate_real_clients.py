#!/usr/bin/env python3
"""
=============================================================
  MIGRATION CLIENTS / COLIS - ELISÉE XPRESS LOG
  Script : migrate_real_clients.py
=============================================================

  Migre les clients et colis depuis une base source vers la base cible
  (SQLite ou PostgreSQL). Gère les doublons et convertit les statuts.

  USAGE LOCAL (SQLite) :
    python migrate_real_clients.py --source sqlite:///clients_source.db --target sqlite:///suivi_colis.db

  USAGE RENDER (PostgreSQL cible) :
    python migrate_real_clients.py --source sqlite:///clients_source.db --target "postgresql://user:pass@host/db"

  VARIABLES D'ENVIRONNEMENT (alternative aux arguments) :
    MIGRATE_SOURCE  : URL de la base source
    MIGRATE_TARGET  : URL de la base cible
=============================================================
"""

import argparse
import os
import re
import sys
from datetime import datetime
from urllib.parse import urlparse

# Mapping des statuts source → cible
STATUT_MAP = {
    "livre": "LIVRE",
    "livré": "LIVRE",
    "en_livraison": "ARRIVE",
    "en_transit": "PARTI",
    "en_attente": "RAMASSE",
    "ramasse": "RAMASSE",
    "ramassé": "RAMASSE",
    "en_conteneur": "EN_CONTENEUR",
    "parti": "PARTI",
    "arrive": "ARRIVE",
    "arrivé": "ARRIVE",
    # Déjà au bon format
    "RAMASSE": "RAMASSE",
    "EN_CONTENEUR": "EN_CONTENEUR",
    "PARTI": "PARTI",
    "ARRIVE": "ARRIVE",
    "LIVRE": "LIVRE",
}


def parse_db_url(url: str):
    """Parse une URL de base (sqlite ou postgresql)."""
    parsed = urlparse(url)
    scheme = (parsed.scheme or "").lower()
    if scheme == "sqlite":
        # sqlite:///path/to/file.db
        path = parsed.path or parsed.netloc
        if not path:
            path = parsed.netloc
        return {"type": "sqlite", "path": path.lstrip("/") or "suivi_colis.db"}
    if scheme in ("postgres", "postgresql"):
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return {"type": "postgres", "url": url}
    raise ValueError(f"Schéma non supporté : {scheme}")


def get_conn(config: dict):
    """Retourne une connexion selon le type de base."""
    if config["type"] == "sqlite":
        import sqlite3
        conn = sqlite3.connect(config["path"])
        conn.row_factory = sqlite3.Row
        return conn
    if config["type"] == "postgres":
        import psycopg2
        conn = psycopg2.connect(config["url"])
        conn.autocommit = False
        return conn
    raise ValueError("Type de base inconnu")


def fetchall_dict(cursor, use_postgres: bool):
    """Convertit les lignes en liste de dicts."""
    if use_postgres:
        cols = [d[0] for d in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]
    return [dict(row) for row in cursor.fetchall()]


def fetchone_dict(cursor, use_postgres: bool):
    """Convertit une ligne en dict."""
    row = cursor.fetchone()
    if row is None:
        return None
    if use_postgres:
        cols = [d[0] for d in cursor.description]
        return dict(zip(cols, row))
    return dict(row)


def placeholder(use_postgres: bool):
    return "%s" if use_postgres else "?"


def normalize_statut(s: str) -> str:
    """Convertit un statut source vers le format cible."""
    if not s:
        return "RAMASSE"
    key = str(s).strip().lower().replace(" ", "_")
    return STATUT_MAP.get(key) or STATUT_MAP.get(str(s)) or "RAMASSE"


def get_column(cursor, table: str, possible_names: list) -> str | None:
    """Détecte le nom de colonne existant parmi les candidats."""
    try:
        cursor.execute(f"SELECT * FROM {table} LIMIT 0")
        cols = [c[0].lower() for c in cursor.description]
        for name in possible_names:
            if name.lower() in cols:
                return [c for c in cursor.description if c[0].lower() == name.lower()][0][0]
    except Exception:
        pass
    return None


def infer_schema(conn, use_postgres: bool) -> dict:
    """Infère le schéma de la base source."""
    cur = conn.cursor()
    schema = {}

    # Tables
    tables = []
    if use_postgres:
        cur.execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        """)
        tables = [r[0] for r in cur.fetchall()]
    else:
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cur.fetchall()]

    # Chercher clients / colis
    clients_table = None
    colis_table = None
    hist_table = None
    dest_table = None

    for t in tables:
        tl = t.lower()
        if "client" in tl and "colis" not in tl:
            clients_table = t
        elif "colis" in tl or "shipment" in tl:
            colis_table = t
        elif "historique" in tl or "history" in tl or "statut" in tl:
            hist_table = t
        elif "destinataire" in tl or "recipient" in tl:
            dest_table = t

    schema["clients_table"] = clients_table or "clients"
    schema["colis_table"] = colis_table or "colis"
    schema["hist_table"] = hist_table
    schema["dest_table"] = dest_table or "destinataires"

    # Colonnes clients
    cur.execute(f"SELECT * FROM {schema['clients_table']} LIMIT 0")
    client_cols = [c[0] for c in cur.description]
    schema["client_nom"] = next((c for c in ["nom", "name", "last_name"] if c in client_cols), "nom")
    schema["client_prenom"] = next((c for c in ["prenom", "first_name", "prenom"] if c in client_cols), "prenom")
    schema["client_tel"] = next((c for c in ["telephone", "phone", "tel"] if c in client_cols), "telephone")
    schema["client_email"] = "email" if "email" in client_cols else None
    schema["client_adresse"] = next((c for c in ["adresse_europe", "adresse", "address"] if c in client_cols), None)
    schema["client_ville"] = next((c for c in ["ville_europe", "ville", "city"] if c in client_cols), None)
    schema["client_pays"] = next((c for c in ["pays_europe", "pays", "country"] if c in client_cols), None)

    # Colonnes colis
    cur.execute(f"SELECT * FROM {schema['colis_table']} LIMIT 0")
    colis_cols = [c[0] for c in cur.description]
    schema["colis_tracking"] = next((c for c in ["numero_suivi", "tracking_id", "numero", "tracking"] if c in colis_cols), "numero_suivi")
    schema["colis_client"] = next((c for c in ["id_client", "client_id", "customer_id"] if c in colis_cols), "id_client")
    schema["colis_dest"] = next((c for c in ["id_destinataire", "dest_id", "recipient_id"] if c in colis_cols), "id_destinataire")
    schema["colis_statut"] = next((c for c in ["statut", "status"] if c in colis_cols), "statut")
    schema["colis_description"] = "description" if "description" in colis_cols else "description"
    schema["colis_ville_recup"] = next((c for c in ["ville_recuperation", "ville_recup", "ville_ramassage", "origine"] if c in colis_cols), None)
    schema["colis_ville_dest"] = next((c for c in ["ville_destination", "ville_dest", "destination"] if c in colis_cols), None)

    return schema


def run_migration(source_config: dict, target_config: dict, dry_run: bool = False) -> dict:
    """Exécute la migration et retourne un rapport."""
    report = {
        "clients_created": 0,
        "clients_updated": 0,
        "colis_created": 0,
        "colis_updated": 0,
        "errors": [],
    }

    src_conn = get_conn(source_config)
    tgt_conn = get_conn(target_config)
    src_pg = source_config["type"] == "postgres"
    tgt_pg = target_config["type"] == "postgres"

    src_cur = src_conn.cursor()
    tgt_cur = tgt_conn.cursor()
    ph = placeholder(tgt_pg)

    # Vérifier que la base cible a les tables
    try:
        tgt_cur.execute("SELECT 1 FROM clients LIMIT 0")
    except Exception as e:
        report["errors"].append(
            f"Base cible : tables absentes. Lancez l'application une fois pour créer le schéma. Détail : {e}"
        )
        return report

    try:
        schema = infer_schema(src_conn, src_pg)
    except Exception as e:
        report["errors"].append(f"Erreur schéma source : {e}")
        return report

    # Note : la base cible doit déjà avoir les tables créées (lancer l'app une fois).

    # Lire tous les clients source
    ct = schema["clients_table"]
    cols = [schema["client_nom"], schema["client_prenom"], schema["client_tel"]]
    if schema.get("client_email"):
        cols.append(schema["client_email"])
    if schema.get("client_adresse"):
        cols.append(schema["client_adresse"])
    if schema.get("client_ville"):
        cols.append(schema["client_ville"])
    if schema.get("client_pays"):
        cols.append(schema["client_pays"])

    src_cur.execute(f"SELECT * FROM {ct}")
    clients_src = fetchall_dict(src_cur, src_pg)

    # Map id_client source -> id_client cible
    client_id_map = {}

    for cl in clients_src:
        nom = (cl.get(schema["client_nom"]) or "").strip()
        prenom = (cl.get(schema["client_prenom"]) or "").strip()
        tel = (cl.get(schema["client_tel"]) or "").strip()
        if not nom and not tel:
            continue

        # Normaliser téléphone
        tel = re.sub(r"[\s\-\.]", "", tel)
        if tel and not tel.startswith("+"):
            if tel.startswith("0") and len(tel) >= 10:
                tel = "+33" + tel[1:]
            elif len(tel) == 9 and tel.isdigit():
                tel = "+33" + tel

        email = cl.get(schema["client_email"]) if schema.get("client_email") else None
        adresse = cl.get(schema["client_adresse"]) if schema.get("client_adresse") else None
        ville = cl.get(schema["client_ville"]) if schema.get("client_ville") else None
        pays = cl.get(schema["client_pays"]) if schema.get("client_pays") else "France"

        # Vérifier doublon cible (téléphone + nom)
        tgt_cur.execute(
            f"SELECT id FROM clients WHERE telephone = {ph} AND nom = {ph}",
            (tel, nom)
        )
        existing = fetchone_dict(tgt_cur, tgt_pg)
        src_id = cl.get("id")

        if existing:
            client_id_map[src_id] = existing["id"]
            report["clients_updated"] += 1
        else:
            if not dry_run:
                tgt_cur.execute(
                    f"""INSERT INTO clients (nom, prenom, telephone, email, adresse_europe, ville_europe, pays_europe)
                        VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})""",
                    (nom, prenom, tel, email, adresse, ville, pays)
                )
                if tgt_pg:
                    tgt_cur.execute("SELECT lastval()")
                    new_id = tgt_cur.fetchone()[0]
                else:
                    new_id = tgt_cur.lastrowid
                client_id_map[src_id] = new_id
            report["clients_created"] += 1

    if not dry_run:
        tgt_conn.commit()

    # Lire destinataires source si table existe
    dest_id_map = {}
    if schema.get("dest_table"):
        try:
            src_cur.execute(f"SELECT * FROM {schema['dest_table']}")
            dests = fetchall_dict(src_cur, src_pg)
            for d in dests:
                # Créer ou récupérer destinataire cible
                nom = (d.get("nom") or "").strip()
                prenom = (d.get("prenom") or "").strip()
                tel = (d.get("telephone") or "").strip()
                ville = (d.get("ville") or "Douala").strip()
                adresse = d.get("adresse")
                quartier = d.get("quartier")
                if not nom and not prenom:
                    continue
                tgt_cur.execute(
                    f"""INSERT INTO destinataires (nom, prenom, telephone, adresse, ville, quartier)
                        VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph})""",
                    (nom, prenom, tel, adresse, ville, quartier)
                )
                if tgt_pg:
                    tgt_cur.execute("SELECT lastval()")
                    dest_id_map[d.get("id")] = tgt_cur.fetchone()[0]
                else:
                    dest_id_map[d.get("id")] = tgt_cur.lastrowid
            if not dry_run:
                tgt_conn.commit()
        except Exception as e:
            report["errors"].append(f"Destinataires : {e}")

    # Lire colis source
    colt = schema["colis_table"]
    src_cur.execute(f"SELECT * FROM {colt}")
    colis_src = fetchall_dict(src_cur, src_pg)

    for co in colis_src:
        tracking = (co.get(schema["colis_tracking"]) or "").strip().upper()
        if not tracking:
            report["errors"].append("Colis sans tracking_id ignoré")
            continue

        id_client_src = co.get(schema["colis_client"])
        id_dest_src = co.get(schema["colis_dest"])
        id_client = client_id_map.get(id_client_src)
        id_dest = dest_id_map.get(id_dest_src) if dest_id_map else None

        if not id_client:
            # Créer un client minimal si manquant
            report["errors"].append(f"Colis {tracking} : client source {id_client_src} non trouvé, ignoré")
            continue

        if not id_dest:
            # Créer destinataire minimal
            ville_dest = (co.get(schema["colis_ville_dest"]) or "Douala").strip()
            if not dry_run:
                tgt_cur.execute(
                    f"""INSERT INTO destinataires (nom, prenom, telephone, ville)
                        VALUES ({ph}, {ph}, {ph}, {ph})""",
                    ("Inconnu", "Destinataire", "+237000000000", ville_dest)
                )
                if tgt_pg:
                    tgt_cur.execute("SELECT lastval()")
                    id_dest = tgt_cur.fetchone()[0]
                else:
                    id_dest = tgt_cur.lastrowid
            else:
                id_dest = 1

        statut_src = co.get(schema["colis_statut"]) or "en_attente"
        statut = normalize_statut(statut_src)
        description = (co.get(schema["colis_description"]) or "Colis migré").strip()
        poids = co.get("poids_kg") or co.get("poids")
        nb_pieces = co.get("nombre_pieces") or co.get("nb_pieces") or 1
        now = datetime.now().isoformat()

        tgt_cur.execute(f"SELECT id, statut FROM colis WHERE numero_suivi = {ph}", (tracking,))
        existing_colis = fetchone_dict(tgt_cur, tgt_pg)

        if existing_colis:
            if not dry_run:
                tgt_cur.execute(
                    f"UPDATE colis SET statut = {ph}, id_client = {ph}, id_destinataire = {ph} WHERE numero_suivi = {ph}",
                    (statut, id_client, id_dest, tracking)
                )
            report["colis_updated"] += 1
        else:
            if not dry_run:
                tgt_cur.execute(
                    f"""INSERT INTO colis (numero_suivi, id_client, id_destinataire, description, poids_kg, nombre_pieces, statut, date_ramassage)
                        VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})""",
                    (tracking, id_client, id_dest, description, poids, nb_pieces, statut, now)
                )
                id_colis = tgt_cur.lastrowid if not tgt_pg else None
                if tgt_pg:
                    tgt_cur.execute("SELECT lastval()")
                    id_colis = tgt_cur.fetchone()[0]
                if id_colis:
                    tgt_cur.execute(
                        f"""INSERT INTO historique_statuts (id_colis, statut, commentaire, agent)
                            VALUES ({ph}, {ph}, {ph}, {ph})""",
                        (id_colis, statut, "Migration", "Script")
                    )
            report["colis_created"] += 1

    if not dry_run:
        tgt_conn.commit()

    src_conn.close()
    tgt_conn.close()
    return report


def main():
    parser = argparse.ArgumentParser(description="Migration clients/colis ELISÉE XPRESS LOG")
    parser.add_argument("--source", "-s", help="URL base source (sqlite:///... ou postgresql://...)")
    parser.add_argument("--target", "-t", help="URL base cible")
    parser.add_argument("--dry-run", action="store_true", help="Simuler sans écrire")
    args = parser.parse_args()

    source_url = args.source or os.environ.get("MIGRATE_SOURCE")
    target_url = args.target or os.environ.get("MIGRATE_TARGET")

    if not source_url or not target_url:
        print("Usage: python migrate_real_clients.py --source sqlite:///clients_source.db --target sqlite:///suivi_colis.db")
        print("Ou définir MIGRATE_SOURCE et MIGRATE_TARGET")
        sys.exit(1)

    try:
        source_config = parse_db_url(source_url)
        target_config = parse_db_url(target_url)
    except ValueError as e:
        print(f"Erreur URL : {e}")
        sys.exit(1)

    print(f"Source : {source_config}")
    print(f"Cible  : {target_config}")
    if args.dry_run:
        print("Mode DRY-RUN (simulation)")
    print()

    report = run_migration(source_config, target_config, dry_run=args.dry_run)

    print("=" * 50)
    print("RAPPORT DE MIGRATION")
    print("=" * 50)
    print(f"Clients créés   : {report['clients_created']}")
    print(f"Clients mis à jour : {report['clients_updated']}")
    print(f"Colis créés     : {report['colis_created']}")
    print(f"Colis mis à jour : {report['colis_updated']}")
    if report["errors"]:
        print("\nErreurs / avertissements :")
        for e in report["errors"]:
            print(f"  - {e}")
    print("=" * 50)


if __name__ == "__main__":
    main()
