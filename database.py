"""
=============================================================
  SYSTÈME DE SUIVI DE COLIS - FRANCE → CAMEROUN
  Fichier : database.py
  Description : Création et gestion de la base de données
=============================================================
"""

import sqlite3
import os
from datetime import datetime

# Nom du fichier de base de données
DB_NAME = "suivi_colis.db"


def get_connection():
    """Retourne une connexion à la base de données."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # Permet d'accéder aux colonnes par nom
    conn.execute("PRAGMA foreign_keys = ON")  # Active les clés étrangères
    return conn


def creer_base_de_donnees():
    """Crée toutes les tables de la base de données."""
    conn = get_connection()
    cursor = conn.cursor()

    # ----------------------------------------------------------
    # TABLE : clients
    # Stocke les informations des personnes qui envoient des colis
    # ----------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            nom             TEXT NOT NULL,
            prenom          TEXT NOT NULL,
            telephone       TEXT NOT NULL,
            email           TEXT,
            adresse_europe  TEXT,          -- Adresse en Europe (pour le ramassage)
            ville_europe    TEXT,
            pays_europe     TEXT DEFAULT 'France',
            date_creation   TEXT DEFAULT (datetime('now'))
        )
    """)

    # ----------------------------------------------------------
    # TABLE : destinataires
    # Stocke les informations des personnes qui reçoivent au Cameroun
    # ----------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS destinataires (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            nom             TEXT NOT NULL,
            prenom          TEXT NOT NULL,
            telephone       TEXT NOT NULL,  -- Numéro camerounais
            adresse         TEXT,           -- Adresse au Cameroun
            ville           TEXT NOT NULL,  -- Ex: Douala, Yaoundé, Bafoussam...
            quartier        TEXT            -- Quartier / zone de livraison
        )
    """)

    # ----------------------------------------------------------
    # TABLE : colis
    # Le cœur du système - un enregistrement par colis
    # ----------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS colis (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_suivi        TEXT NOT NULL UNIQUE,   -- Ex: CMR-2024-00147
            id_client           INTEGER NOT NULL,
            id_destinataire     INTEGER NOT NULL,

            -- Description du contenu
            description         TEXT NOT NULL,          -- Ex: "Vêtements, chaussures"
            poids_kg            REAL,                   -- Poids en kilogrammes
            nombre_pieces       INTEGER DEFAULT 1,      -- Nombre de colis/cartons

            -- Statut actuel
            statut              TEXT NOT NULL DEFAULT 'RAMASSE',
            -- Valeurs possibles :
            --   RAMASSE      → Colis récupéré en Europe
            --   EN_CONTENEUR → Déposé dans le conteneur
            --   PARTI        → Conteneur parti de France
            --   ARRIVE       → Arrivé au port (Douala)
            --   LIVRE        → Remis au destinataire

            -- Informations commerciales
            prix_total          REAL,                   -- Prix facturé au client (€)
            est_paye            INTEGER DEFAULT 0,      -- 0 = non payé, 1 = payé

            -- Dates clés
            date_creation       TEXT DEFAULT (datetime('now')),
            date_ramassage      TEXT,
            date_conteneur      TEXT,
            date_depart         TEXT,
            date_arrivee        TEXT,
            date_livraison      TEXT,

            -- Notes internes
            notes               TEXT,

            -- Clés étrangères
            FOREIGN KEY (id_client)       REFERENCES clients(id),
            FOREIGN KEY (id_destinataire) REFERENCES destinataires(id)
        )
    """)

    # ----------------------------------------------------------
    # TABLE : historique_statuts
    # Garde une trace de CHAQUE changement de statut
    # (comme le journal de bord du colis)
    # ----------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS historique_statuts (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            id_colis        INTEGER NOT NULL,
            statut          TEXT NOT NULL,          -- Nouveau statut
            commentaire     TEXT,                   -- Note optionnelle
            agent           TEXT,                   -- Qui a fait la mise à jour
            localisation    TEXT,                   -- Ex: "Paris", "Port de Douala"
            date_action     TEXT DEFAULT (datetime('now')),

            FOREIGN KEY (id_colis) REFERENCES colis(id)
        )
    """)

    # ----------------------------------------------------------
    # TABLE : conteneurs
    # Pour regrouper plusieurs colis dans un même conteneur
    # ----------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conteneurs (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_conteneur    TEXT NOT NULL UNIQUE,   -- Ex: MSCU1234567
            date_fermeture      TEXT,                   -- Quand le conteneur a été scellé
            date_depart         TEXT,                   -- Date de départ du port
            date_arrivee        TEXT,                   -- Date d'arrivée estimée / réelle
            port_depart         TEXT DEFAULT 'Le Havre',
            port_arrivee        TEXT DEFAULT 'Douala',
            statut              TEXT DEFAULT 'EN_PREPARATION',
            -- EN_PREPARATION → Ouvert, on peut encore ajouter des colis
            -- FERME          → Scellé, plus d'ajout possible
            -- EN_MER         → En transit
            -- ARRIVE          → Au port de destination
            notes               TEXT,
            date_creation       TEXT DEFAULT (datetime('now'))
        )
    """)

    # ----------------------------------------------------------
    # TABLE : colis_conteneur
    # Liaison entre colis et conteneur (un colis = un conteneur)
    # ----------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS colis_conteneur (
            id_colis        INTEGER NOT NULL,
            id_conteneur    INTEGER NOT NULL,
            date_ajout      TEXT DEFAULT (datetime('now')),

            PRIMARY KEY (id_colis, id_conteneur),
            FOREIGN KEY (id_colis)      REFERENCES colis(id),
            FOREIGN KEY (id_conteneur)  REFERENCES conteneurs(id)
        )
    """)

    # ----------------------------------------------------------
    # TABLE : agents
    # Les membres de ton équipe qui gèrent le système
    # ----------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            nom             TEXT NOT NULL,
            prenom          TEXT NOT NULL,
            role            TEXT NOT NULL,
            -- Valeurs : ADMIN, CHAUFFEUR, GESTIONNAIRE_CONTENEUR, LIVREUR_CMR
            identifiant     TEXT NOT NULL UNIQUE,   -- Login
            mot_de_passe    TEXT NOT NULL,           -- Mot de passe (à hasher en prod !)
            actif           INTEGER DEFAULT 1,
            date_creation   TEXT DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Base de données créée avec succès !")


# ----------------------------------------------------------
# FONCTIONS UTILITAIRES
# ----------------------------------------------------------

def generer_numero_suivi():
    """
    Génère un numéro de suivi unique.
    Format : CMR-AAAA-NNNNN
    Exemple : CMR-2024-00147
    """
    conn = get_connection()
    cursor = conn.cursor()

    annee = datetime.now().year

    # Compte combien de colis existent cette année
    cursor.execute("""
        SELECT COUNT(*) FROM colis
        WHERE numero_suivi LIKE ?
    """, (f"CMR-{annee}-%",))

    compte = cursor.fetchone()[0]
    conn.close()

    # Génère le numéro avec 5 chiffres (ex: 00001, 00147)
    numero = f"CMR-{annee}-{(compte + 1):05d}"
    return numero


def ajouter_client(nom, prenom, telephone, email=None, adresse=None, ville=None, pays="France"):
    """Ajoute un nouveau client et retourne son ID."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO clients (nom, prenom, telephone, email, adresse_europe, ville_europe, pays_europe)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (nom, prenom, telephone, email, adresse, ville, pays))

    id_client = cursor.lastrowid
    conn.commit()
    conn.close()
    return id_client


def ajouter_destinataire(nom, prenom, telephone, ville, adresse=None, quartier=None):
    """Ajoute un destinataire au Cameroun et retourne son ID."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO destinataires (nom, prenom, telephone, adresse, ville, quartier)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (nom, prenom, telephone, adresse, ville, quartier))

    id_dest = cursor.lastrowid
    conn.commit()
    conn.close()
    return id_dest


def enregistrer_colis(id_client, id_destinataire, description, poids=None, nb_pieces=1, prix=None, notes=None):
    """
    Enregistre un nouveau colis avec le statut initial RAMASSE.
    Retourne le numéro de suivi généré.
    """
    conn = get_connection()
    cursor = conn.cursor()

    numero = generer_numero_suivi()
    now = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO colis 
            (numero_suivi, id_client, id_destinataire, description, 
             poids_kg, nombre_pieces, statut, prix_total, notes, date_ramassage)
        VALUES (?, ?, ?, ?, ?, ?, 'RAMASSE', ?, ?, ?)
    """, (numero, id_client, id_destinataire, description, poids, nb_pieces, prix, notes, now))

    id_colis = cursor.lastrowid

    # Ajouter la première entrée dans l'historique
    cursor.execute("""
        INSERT INTO historique_statuts (id_colis, statut, commentaire, agent)
        VALUES (?, 'RAMASSE', 'Colis enregistré et ramassé', 'Système')
    """, (id_colis,))

    conn.commit()
    conn.close()

    print(f"✅ Colis enregistré ! Numéro de suivi : {numero}")
    return numero


def mettre_a_jour_statut(numero_suivi, nouveau_statut, commentaire=None, agent=None, localisation=None):
    """
    Met à jour le statut d'un colis.
    Met aussi à jour la date correspondante dans la table colis.
    """
    statuts_valides = ['RAMASSE', 'EN_CONTENEUR', 'PARTI', 'ARRIVE', 'LIVRE']

    if nouveau_statut not in statuts_valides:
        print(f"❌ Statut invalide. Valeurs acceptées : {statuts_valides}")
        return False

    conn = get_connection()
    cursor = conn.cursor()

    # Vérifie que le colis existe
    cursor.execute("SELECT id FROM colis WHERE numero_suivi = ?", (numero_suivi,))
    colis = cursor.fetchone()

    if not colis:
        print(f"❌ Colis introuvable : {numero_suivi}")
        conn.close()
        return False

    now = datetime.now().isoformat()

    # Détermine quelle colonne de date mettre à jour
    colonne_date = {
        'EN_CONTENEUR': 'date_conteneur',
        'PARTI':        'date_depart',
        'ARRIVE':       'date_arrivee',
        'LIVRE':        'date_livraison',
    }.get(nouveau_statut)

    # Met à jour le statut et la date
    if colonne_date:
        cursor.execute(f"""
            UPDATE colis SET statut = ?, {colonne_date} = ?
            WHERE numero_suivi = ?
        """, (nouveau_statut, now, numero_suivi))
    else:
        cursor.execute("UPDATE colis SET statut = ? WHERE numero_suivi = ?",
                       (nouveau_statut, numero_suivi))

    # Ajoute une ligne dans l'historique
    cursor.execute("""
        INSERT INTO historique_statuts (id_colis, statut, commentaire, agent, localisation)
        VALUES (?, ?, ?, ?, ?)
    """, (colis['id'], nouveau_statut, commentaire, agent, localisation))

    conn.commit()
    conn.close()
    print(f"✅ Statut mis à jour : {numero_suivi} → {nouveau_statut}")
    return True


def consulter_colis(numero_suivi):
    """
    Récupère toutes les informations d'un colis par son numéro de suivi.
    C'est cette fonction qui sera appelée depuis le site web.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Récupère les infos du colis avec client et destinataire
    cursor.execute("""
        SELECT 
            c.numero_suivi,
            c.description,
            c.poids_kg,
            c.nombre_pieces,
            c.statut,
            c.date_ramassage,
            c.date_conteneur,
            c.date_depart,
            c.date_arrivee,
            c.date_livraison,
            c.date_creation,
            c.notes,

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
        WHERE c.numero_suivi = ?
    """, (numero_suivi,))

    colis = cursor.fetchone()

    if not colis:
        conn.close()
        return None

    # Récupère l'historique des statuts
    cursor.execute("""
        SELECT statut, commentaire, agent, localisation, date_action
        FROM historique_statuts
        WHERE id_colis = (SELECT id FROM colis WHERE numero_suivi = ?)
        ORDER BY date_action ASC
    """, (numero_suivi,))

    historique = cursor.fetchall()
    conn.close()

    return {
        "colis": dict(colis),
        "historique": [dict(h) for h in historique]
    }


# ----------------------------------------------------------
# INIT ADMIN (pour Render : DB vide au démarrage)
# ----------------------------------------------------------

def inserer_admin_si_vide():
    """Insère l'admin par défaut si la table agents est vide (nécessaire sur Render)."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM agents")
        if cursor.fetchone()[0] == 0:
            conn.execute("""
                INSERT INTO agents (nom, prenom, role, identifiant, mot_de_passe)
                VALUES ('Admin', 'Système', 'ADMIN', 'admin', 'admin123')
            """)
            conn.commit()
    except Exception:
        pass  # Table peut ne pas exister encore
    finally:
        conn.close()


# ----------------------------------------------------------
# DONNÉES DE TEST (pour vérifier que tout fonctionne)
# ----------------------------------------------------------

def inserer_donnees_test():
    """Insère des données de test pour vérifier le système."""
    print("\n📦 Insertion de données de test...")

    # Créer un agent
    conn = get_connection()
    conn.execute("""
        INSERT OR IGNORE INTO agents (nom, prenom, role, identifiant, mot_de_passe)
        VALUES ('Admin', 'Système', 'ADMIN', 'admin', 'admin123')
    """)
    conn.commit()
    conn.close()

    # Créer un client
    id_client = ajouter_client(
        nom="Nguemo",
        prenom="Paul",
        telephone="+33 6 12 34 56 78",
        email="paul.nguemo@email.com",
        adresse="15 rue des Lilas",
        ville="Paris"
    )

    # Créer un destinataire
    id_dest = ajouter_destinataire(
        nom="Nguemo",
        prenom="Marie",
        telephone="+237 699 123 456",
        ville="Douala",
        quartier="Akwa"
    )

    # Enregistrer un colis
    num1 = enregistrer_colis(
        id_client=id_client,
        id_destinataire=id_dest,
        description="Vêtements, chaussures et produits cosmétiques",
        poids=15.5,
        nb_pieces=2,
        prix=45.00
    )

    # Simuler l'avancement du colis
    mettre_a_jour_statut(num1, 'EN_CONTENEUR',
                         commentaire="Déposé dans le conteneur N°MSCU1234567",
                         agent="Jean Dupont",
                         localisation="Entrepôt Paris Nord")

    mettre_a_jour_statut(num1, 'PARTI',
                         commentaire="Conteneur chargé sur le navire MSC BRILLIANT",
                         agent="Jean Dupont",
                         localisation="Port du Havre")

    # Ajouter un deuxième colis (encore en ramassage)
    id_client2 = ajouter_client("Biya", "Ernest", "+33 7 98 76 54 32", ville="Lyon")
    id_dest2 = ajouter_destinataire("Biya", "Sylvie", "+237 677 654 321", "Yaoundé", quartier="Bastos")

    num2 = enregistrer_colis(
        id_client=id_client2,
        id_destinataire=id_dest2,
        description="Électronique : téléphone, tablette, câbles",
        poids=3.2,
        nb_pieces=1,
        prix=25.00
    )

    print(f"\n🎉 Données de test insérées !")
    print(f"   Colis 1 : {num1} (statut : PARTI)")
    print(f"   Colis 2 : {num2} (statut : RAMASSE)")
    return num1, num2


# ----------------------------------------------------------
# POINT D'ENTRÉE : Exécuter ce fichier directement
# ----------------------------------------------------------

if __name__ == "__main__":
    print("=" * 55)
    print("  INITIALISATION DE LA BASE DE DONNÉES")
    print("  Système de suivi France → Cameroun")
    print("=" * 55)

    # 1. Créer les tables
    creer_base_de_donnees()

    # 2. Insérer des données de test
    num1, num2 = inserer_donnees_test()

    # 3. Tester la consultation
    print("\n🔍 Test de consultation du colis", num1)
    print("-" * 40)
    resultat = consulter_colis(num1)

    if resultat:
        c = resultat["colis"]
        print(f"Numéro      : {c['numero_suivi']}")
        print(f"Description : {c['description']}")
        print(f"Statut      : {c['statut']}")
        print(f"Expéditeur  : {c['client_prenom']} {c['client_nom']}")
        print(f"Destinataire: {c['dest_prenom']} {c['dest_nom']} ({c['dest_ville']})")
        print(f"\nHistorique :")
        for h in resultat["historique"]:
            print(f"  [{h['date_action'][:16]}] {h['statut']} - {h['commentaire']}")

    print("\n✅ Tout fonctionne ! Base de données prête.")
    print(f"   Fichier créé : {DB_NAME}")
