"""
=============================================================
  SYSTÈME DE SUIVI DE COLIS - FRANCE → CAMEROUN
  Fichier : database.py
  Description : Base de données — compatible PostgreSQL (prod)
                et SQLite (développement local)
=============================================================

  LOGIQUE DE CONNEXION :
  - Si la variable d'environnement DATABASE_URL est définie
    → on utilise PostgreSQL (Render en production)
  - Sinon → on utilise SQLite (ton PC en local)

  Tu n'as RIEN à changer : ça bascule automatiquement.
=============================================================
"""

import os
import sqlite3
from datetime import datetime

# -------------------------------------------------------
# Détection automatique : PostgreSQL ou SQLite ?
# -------------------------------------------------------
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Render donne une URL qui commence par "postgres://"
    # mais psycopg2 a besoin de "postgresql://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    USE_POSTGRES = True
    import psycopg
    print("Connecte a PostgreSQL (production)")
else:
    USE_POSTGRES = False
    DB_SQLITE = "suivi_colis.db"
    print("Mode SQLite (local)")


# -------------------------------------------------------
# CONNEXION UNIVERSELLE
# -------------------------------------------------------
def get_connection():
    if USE_POSTGRES:
        conn = psycopg.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    else:
        conn = sqlite3.connect(DB_SQLITE)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn


def fetchall(cursor):
    """Liste de dicts depuis n'importe quel curseur."""
    if USE_POSTGRES:
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    else:
        return [dict(row) for row in cursor.fetchall()]


def fetchone(cursor):
    """Un dict depuis n'importe quel curseur."""
    if USE_POSTGRES:
        row = cursor.fetchone()
        if row is None:
            return None
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))
    else:
        row = cursor.fetchone()
        return dict(row) if row else None


def p():
    """Placeholder : %s pour PostgreSQL, ? pour SQLite."""
    return "%s" if USE_POSTGRES else "?"


# -------------------------------------------------------
# CREATION DES TABLES
# -------------------------------------------------------
def creer_base_de_donnees():
    conn = get_connection()
    cursor = conn.cursor()

    if USE_POSTGRES:
        auto = "SERIAL PRIMARY KEY"
        now_default = "DEFAULT NOW()"
    else:
        auto = "INTEGER PRIMARY KEY AUTOINCREMENT"
        now_default = "DEFAULT (datetime('now'))"

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS clients (
            id             {auto},
            nom            TEXT NOT NULL,
            prenom         TEXT NOT NULL,
            telephone      TEXT NOT NULL,
            email          TEXT,
            adresse_europe TEXT,
            ville_europe   TEXT,
            pays_europe    TEXT DEFAULT 'France',
            date_creation  TEXT {now_default}
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS destinataires (
            id        {auto},
            nom       TEXT NOT NULL,
            prenom    TEXT NOT NULL,
            telephone TEXT NOT NULL,
            adresse   TEXT,
            ville     TEXT NOT NULL,
            quartier  TEXT
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS colis (
            id              {auto},
            numero_suivi    TEXT NOT NULL UNIQUE,
            id_client       INTEGER NOT NULL,
            id_destinataire INTEGER NOT NULL,
            description     TEXT NOT NULL,
            poids_kg        REAL,
            nombre_pieces   INTEGER DEFAULT 1,
            statut          TEXT NOT NULL DEFAULT 'RAMASSE',
            prix_total      REAL,
            est_paye        INTEGER DEFAULT 0,
            date_creation   TEXT {now_default},
            date_ramassage  TEXT,
            date_conteneur  TEXT,
            date_depart     TEXT,
            date_arrivee    TEXT,
            date_livraison  TEXT,
            notes           TEXT
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS historique_statuts (
            id          {auto},
            id_colis    INTEGER NOT NULL,
            statut      TEXT NOT NULL,
            commentaire TEXT,
            agent       TEXT,
            localisation TEXT,
            date_action TEXT {now_default}
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS conteneurs (
            id               {auto},
            numero_conteneur TEXT NOT NULL UNIQUE,
            date_fermeture   TEXT,
            date_depart      TEXT,
            date_arrivee     TEXT,
            port_depart      TEXT DEFAULT 'Le Havre',
            port_arrivee     TEXT DEFAULT 'Douala',
            statut           TEXT DEFAULT 'EN_PREPARATION',
            notes            TEXT,
            date_creation    TEXT {now_default}
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS colis_conteneur (
            id_colis     INTEGER NOT NULL,
            id_conteneur INTEGER NOT NULL,
            date_ajout   TEXT {now_default},
            PRIMARY KEY (id_colis, id_conteneur)
        )
    """)

    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS agents (
            id           {auto},
            nom          TEXT NOT NULL,
            prenom       TEXT NOT NULL,
            role         TEXT NOT NULL,
            identifiant  TEXT NOT NULL UNIQUE,
            mot_de_passe TEXT NOT NULL,
            actif        INTEGER DEFAULT 1,
            date_creation TEXT {now_default}
        )
    """)

    conn.commit()
    conn.close()
    print("Tables creees (ou deja existantes).")


# -------------------------------------------------------
# GENERATION NUMERO DE SUIVI
# -------------------------------------------------------
def generer_numero_suivi():
    conn = get_connection()
    cursor = conn.cursor()
    annee = datetime.now().year
    ph = p()
    cursor.execute(
        f"SELECT COUNT(*) FROM colis WHERE numero_suivi LIKE {ph}",
        (f"CMR-{annee}-%",)
    )
    row = cursor.fetchone()
    compte = row[0] if USE_POSTGRES else row[0]
    conn.close()
    return f"CMR-{annee}-{(compte + 1):05d}"


# -------------------------------------------------------
# FONCTIONS METIER
# -------------------------------------------------------

def ajouter_client(nom, prenom, telephone, email=None, adresse=None, ville=None, pays="France"):
    conn = get_connection()
    cursor = conn.cursor()
    ph = p()
    if USE_POSTGRES:
        cursor.execute(
            f"INSERT INTO clients (nom,prenom,telephone,email,adresse_europe,ville_europe,pays_europe) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph},{ph},{ph}) RETURNING id",
            (nom, prenom, telephone, email, adresse, ville, pays)
        )
        id_client = cursor.fetchone()[0]
    else:
        cursor.execute(
            f"INSERT INTO clients (nom,prenom,telephone,email,adresse_europe,ville_europe,pays_europe) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph},{ph},{ph})",
            (nom, prenom, telephone, email, adresse, ville, pays)
        )
        id_client = cursor.lastrowid
    conn.commit()
    conn.close()
    return id_client


def ajouter_destinataire(nom, prenom, telephone, ville, adresse=None, quartier=None):
    conn = get_connection()
    cursor = conn.cursor()
    ph = p()
    if USE_POSTGRES:
        cursor.execute(
            f"INSERT INTO destinataires (nom,prenom,telephone,adresse,ville,quartier) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph},{ph}) RETURNING id",
            (nom, prenom, telephone, adresse, ville, quartier)
        )
        id_dest = cursor.fetchone()[0]
    else:
        cursor.execute(
            f"INSERT INTO destinataires (nom,prenom,telephone,adresse,ville,quartier) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph},{ph})",
            (nom, prenom, telephone, adresse, ville, quartier)
        )
        id_dest = cursor.lastrowid
    conn.commit()
    conn.close()
    return id_dest


def enregistrer_colis(id_client, id_destinataire, description,
                      poids=None, nb_pieces=1, prix=None, notes=None):
    conn = get_connection()
    cursor = conn.cursor()
    ph = p()
    numero = generer_numero_suivi()
    now = datetime.now().isoformat()

    if USE_POSTGRES:
        cursor.execute(
            f"INSERT INTO colis (numero_suivi,id_client,id_destinataire,description,"
            f"poids_kg,nombre_pieces,statut,prix_total,notes,date_ramassage) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph},{ph},'RAMASSE',{ph},{ph},{ph}) RETURNING id",
            (numero, id_client, id_destinataire, description, poids, nb_pieces, prix, notes, now)
        )
        id_colis = cursor.fetchone()[0]
    else:
        cursor.execute(
            f"INSERT INTO colis (numero_suivi,id_client,id_destinataire,description,"
            f"poids_kg,nombre_pieces,statut,prix_total,notes,date_ramassage) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph},{ph},'RAMASSE',{ph},{ph},{ph})",
            (numero, id_client, id_destinataire, description, poids, nb_pieces, prix, notes, now)
        )
        id_colis = cursor.lastrowid

    cursor.execute(
        f"INSERT INTO historique_statuts (id_colis,statut,commentaire,agent) "
        f"VALUES ({ph},{ph},{ph},{ph})",
        (id_colis, 'RAMASSE', 'Colis enregistre et ramasse', 'Systeme')
    )
    conn.commit()
    conn.close()
    print(f"Colis enregistre : {numero}")
    return numero


def mettre_a_jour_statut(numero_suivi, nouveau_statut,
                          commentaire=None, agent=None, localisation=None):
    statuts_valides = ['RAMASSE', 'EN_CONTENEUR', 'PARTI', 'ARRIVE', 'LIVRE']
    if nouveau_statut not in statuts_valides:
        return False

    conn = get_connection()
    cursor = conn.cursor()
    ph = p()

    cursor.execute(f"SELECT id FROM colis WHERE numero_suivi = {ph}", (numero_suivi,))
    row = fetchone(cursor)
    if not row:
        conn.close()
        return False

    id_colis = row["id"]
    now = datetime.now().isoformat()

    colonne_date = {
        'EN_CONTENEUR': 'date_conteneur',
        'PARTI':        'date_depart',
        'ARRIVE':       'date_arrivee',
        'LIVRE':        'date_livraison',
    }.get(nouveau_statut)

    if colonne_date:
        cursor.execute(
            f"UPDATE colis SET statut={ph}, {colonne_date}={ph} WHERE numero_suivi={ph}",
            (nouveau_statut, now, numero_suivi)
        )
    else:
        cursor.execute(
            f"UPDATE colis SET statut={ph} WHERE numero_suivi={ph}",
            (nouveau_statut, numero_suivi)
        )

    cursor.execute(
        f"INSERT INTO historique_statuts (id_colis,statut,commentaire,agent,localisation) "
        f"VALUES ({ph},{ph},{ph},{ph},{ph})",
        (id_colis, nouveau_statut, commentaire, agent, localisation)
    )
    conn.commit()
    conn.close()
    return True


def consulter_colis(numero_suivi):
    conn = get_connection()
    cursor = conn.cursor()
    ph = p()

    cursor.execute(f"""
        SELECT
            c.numero_suivi, c.description, c.poids_kg, c.nombre_pieces,
            c.statut, c.date_ramassage, c.date_conteneur, c.date_depart,
            c.date_arrivee, c.date_livraison, c.date_creation, c.notes,
            c.prix_total, c.est_paye,
            cl.nom        AS client_nom,
            cl.prenom     AS client_prenom,
            cl.telephone  AS client_tel,
            d.nom         AS dest_nom,
            d.prenom      AS dest_prenom,
            d.telephone   AS dest_tel,
            d.ville       AS dest_ville,
            d.quartier    AS dest_quartier
        FROM colis c
        JOIN clients cl      ON c.id_client = cl.id
        JOIN destinataires d ON c.id_destinataire = d.id
        WHERE c.numero_suivi = {ph}
    """, (numero_suivi,))

    colis = fetchone(cursor)
    if not colis:
        conn.close()
        return None

    cursor.execute(f"""
        SELECT statut, commentaire, agent, localisation, date_action
        FROM historique_statuts
        WHERE id_colis = (SELECT id FROM colis WHERE numero_suivi = {ph})
        ORDER BY date_action ASC
    """, (numero_suivi,))

    historique = fetchall(cursor)
    conn.close()
    return {"colis": colis, "historique": historique}


# -------------------------------------------------------
# FONCTIONS POUR L'INTERFACE ADMIN
# -------------------------------------------------------

def tous_les_colis():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.numero_suivi, c.statut, c.description, c.poids_kg,
               c.date_creation, c.prix_total, c.est_paye,
               cl.nom AS client_nom, cl.prenom AS client_prenom,
               d.ville AS dest_ville
        FROM colis c
        JOIN clients cl ON c.id_client = cl.id
        JOIN destinataires d ON c.id_destinataire = d.id
        ORDER BY c.date_creation DESC
    """)
    result = fetchall(cursor)
    conn.close()
    return result


def tous_les_clients():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clients ORDER BY nom")
    result = fetchall(cursor)
    conn.close()
    return result


def tous_les_destinataires():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM destinataires ORDER BY nom")
    result = fetchall(cursor)
    conn.close()
    return result


def get_agent(identifiant, mot_de_passe):
    conn = get_connection()
    cursor = conn.cursor()
    ph = p()
    cursor.execute(
        f"SELECT * FROM agents WHERE identifiant={ph} AND mot_de_passe={ph} AND actif=1",
        (identifiant, mot_de_passe)
    )
    agent = fetchone(cursor)
    conn.close()
    return agent


def marquer_paye(numero_suivi):
    conn = get_connection()
    cursor = conn.cursor()
    ph = p()
    cursor.execute(f"UPDATE colis SET est_paye=1 WHERE numero_suivi={ph}", (numero_suivi,))
    conn.commit()
    conn.close()


def creer_agent_admin():
    """Cree l'agent admin par defaut s'il n'existe pas."""
    conn = get_connection()
    cursor = conn.cursor()
    ph = p()
    cursor.execute(f"SELECT id FROM agents WHERE identifiant={ph}", ("admin",))
    if not fetchone(cursor):
        cursor.execute(
            f"INSERT INTO agents (nom,prenom,role,identifiant,mot_de_passe) "
            f"VALUES ({ph},{ph},{ph},{ph},{ph})",
            ("Admin", "Systeme", "ADMIN", "admin", "admin123")
        )
        conn.commit()
        print("Agent admin cree : admin / admin123")
    conn.close()


def initialiser():
    """Demarre la base : tables + admin."""
    creer_base_de_donnees()
    creer_agent_admin()


# -------------------------------------------------------
# TEST LOCAL
# -------------------------------------------------------
if __name__ == "__main__":
    initialiser()
    id_c = ajouter_client("Test", "Client", "+33600000000", ville="Paris")
    id_d = ajouter_destinataire("Test", "Dest", "+237699000000", "Douala")
    num  = enregistrer_colis(id_c, id_d, "Test colis", poids=5.0, prix=20.0)
    mettre_a_jour_statut(num, "EN_CONTENEUR", commentaire="Test conteneur")
    r = consulter_colis(num)
    print(f"Colis : {r['colis']['numero_suivi']} | Statut : {r['colis']['statut']}")
    print("Tout fonctionne !")
