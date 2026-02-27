"""
=============================================================
  SYSTÈME DE SUIVI DE COLIS - FRANCE → CAMEROUN
  Fichier : app.py
  Description : Application web Flask
=============================================================
"""

from flask import Flask, render_template, request, redirect, url_for, session, flash
from database import (
    get_connection, creer_base_de_donnees, inserer_admin_si_vide,
    ajouter_client, ajouter_destinataire,
    enregistrer_colis, mettre_a_jour_statut, consulter_colis
)
import os

app = Flask(__name__)

# En production, la clé vient d'une variable d'environnement (définie sur Render)
# En local, on utilise une clé par défaut
import os
app.secret_key = os.environ.get("SECRET_KEY", "cmr-suivi-secret-local-2024")


# ----------------------------------------------------------
# FONCTIONS HELPERS
# ----------------------------------------------------------

def agent_connecte():
    """Vérifie si un agent est connecté."""
    return session.get("agent_id") is not None

def tous_les_colis():
    """Récupère tous les colis pour l'interface admin."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            c.numero_suivi, c.statut, c.description, c.poids_kg,
            c.date_creation, c.prix_total, c.est_paye,
            cl.nom AS client_nom, cl.prenom AS client_prenom,
            d.ville AS dest_ville
        FROM colis c
        JOIN clients cl ON c.id_client = cl.id
        JOIN destinataires d ON c.id_destinataire = d.id
        ORDER BY c.date_creation DESC
    """)
    colis = cursor.fetchall()
    conn.close()
    return [dict(c) for c in colis]

def tous_les_clients():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clients ORDER BY nom")
    clients = [dict(c) for c in cursor.fetchall()]
    conn.close()
    return clients

def tous_les_destinataires():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM destinataires ORDER BY nom")
    dests = [dict(d) for d in cursor.fetchall()]
    conn.close()
    return dests

LABELS_STATUT = {
    'RAMASSE':      '📦 Ramassé en Europe',
    'EN_CONTENEUR': '🏭 Déposé au conteneur',
    'PARTI':        '🚢 Parti de France',
    'ARRIVE':       '🇨🇲 Arrivé au Cameroun',
    'LIVRE':        '✅ Livré',
}

COULEURS_STATUT = {
    'RAMASSE':      'orange',
    'EN_CONTENEUR': 'blue',
    'PARTI':        'purple',
    'ARRIVE':       'teal',
    'LIVRE':        'green',
}


# ----------------------------------------------------------
# PAGE PUBLIQUE : Suivi de colis (accessible à tous)
# ----------------------------------------------------------

@app.route("/")
def index():
    """Page d'accueil avec la barre de recherche."""
    return render_template("index.html")


@app.route("/suivre", methods=["GET", "POST"])
def suivre():
    """Page de suivi d'un colis par numéro."""
    numero = request.args.get("numero") or request.form.get("numero", "").strip().upper()
    resultat = None
    erreur = None

    if numero:
        resultat = consulter_colis(numero)
        if not resultat:
            erreur = f"Aucun colis trouvé avec le numéro « {numero} »."
        else:
            # Ajouter les labels et couleurs pour l'affichage
            resultat["labels"] = LABELS_STATUT
            resultat["couleurs"] = COULEURS_STATUT
            resultat["etapes_ordonnees"] = ['RAMASSE', 'EN_CONTENEUR', 'PARTI', 'ARRIVE', 'LIVRE']

    return render_template("suivre.html", numero=numero, resultat=resultat, erreur=erreur)


# ----------------------------------------------------------
# AUTHENTIFICATION ADMIN
# ----------------------------------------------------------

@app.route("/admin/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        identifiant = request.form["identifiant"]
        mot_de_passe = request.form["mot_de_passe"]

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM agents WHERE identifiant = ? AND mot_de_passe = ? AND actif = 1
        """, (identifiant, mot_de_passe))
        agent = cursor.fetchone()
        conn.close()

        if agent:
            session["agent_id"] = agent["id"]
            session["agent_nom"] = f"{agent['prenom']} {agent['nom']}"
            session["agent_role"] = agent["role"]
            flash("Bienvenue ! Vous êtes connecté.", "success")
            return redirect(url_for("admin_dashboard"))
        else:
            flash("Identifiant ou mot de passe incorrect.", "danger")

    return render_template("login.html")


@app.route("/admin/logout")
def logout():
    session.clear()
    flash("Vous êtes déconnecté.", "info")
    return redirect(url_for("index"))


# ----------------------------------------------------------
# INTERFACE ADMIN
# ----------------------------------------------------------

@app.route("/admin")
def admin_dashboard():
    if not agent_connecte():
        return redirect(url_for("login"))

    colis = tous_les_colis()

    # Statistiques rapides
    stats = {
        "total": len(colis),
        "ramasse":      sum(1 for c in colis if c["statut"] == "RAMASSE"),
        "en_conteneur": sum(1 for c in colis if c["statut"] == "EN_CONTENEUR"),
        "parti":        sum(1 for c in colis if c["statut"] == "PARTI"),
        "arrive":       sum(1 for c in colis if c["statut"] == "ARRIVE"),
        "livre":        sum(1 for c in colis if c["statut"] == "LIVRE"),
        "non_paye":     sum(1 for c in colis if not c["est_paye"]),
    }

    return render_template("admin/dashboard.html",
                           colis=colis, stats=stats,
                           labels=LABELS_STATUT, couleurs=COULEURS_STATUT)


@app.route("/admin/colis/nouveau", methods=["GET", "POST"])
def nouveau_colis():
    if not agent_connecte():
        return redirect(url_for("login"))

    if request.method == "POST":
        f = request.form

        # Créer ou retrouver le client
        id_client = ajouter_client(
            nom=f["client_nom"],
            prenom=f["client_prenom"],
            telephone=f["client_telephone"],
            email=f.get("client_email"),
            adresse=f.get("client_adresse"),
            ville=f.get("client_ville"),
            pays=f.get("client_pays", "France")
        )

        # Créer ou retrouver le destinataire
        id_dest = ajouter_destinataire(
            nom=f["dest_nom"],
            prenom=f["dest_prenom"],
            telephone=f["dest_telephone"],
            ville=f["dest_ville"],
            adresse=f.get("dest_adresse"),
            quartier=f.get("dest_quartier")
        )

        # Enregistrer le colis
        poids = float(f["poids"]) if f.get("poids") else None
        prix = float(f["prix"]) if f.get("prix") else None
        pieces = int(f.get("nb_pieces", 1))

        numero = enregistrer_colis(
            id_client=id_client,
            id_destinataire=id_dest,
            description=f["description"],
            poids=poids,
            nb_pieces=pieces,
            prix=prix,
            notes=f.get("notes")
        )

        flash(f"✅ Colis enregistré avec succès ! Numéro : {numero}", "success")
        return redirect(url_for("admin_dashboard"))

    clients = tous_les_clients()
    destinataires = tous_les_destinataires()
    return render_template("admin/nouveau_colis.html",
                           clients=clients, destinataires=destinataires)


@app.route("/admin/colis/<numero_suivi>")
def detail_colis(numero_suivi):
    if not agent_connecte():
        return redirect(url_for("login"))

    resultat = consulter_colis(numero_suivi)
    if not resultat:
        flash("Colis introuvable.", "danger")
        return redirect(url_for("admin_dashboard"))

    resultat["labels"] = LABELS_STATUT
    resultat["couleurs"] = COULEURS_STATUT
    resultat["etapes_ordonnees"] = ['RAMASSE', 'EN_CONTENEUR', 'PARTI', 'ARRIVE', 'LIVRE']
    resultat["statuts_valides"] = list(LABELS_STATUT.keys())

    return render_template("admin/detail_colis.html", resultat=resultat, numero=numero_suivi)


@app.route("/admin/colis/<numero_suivi>/statut", methods=["POST"])
def changer_statut(numero_suivi):
    if not agent_connecte():
        return redirect(url_for("login"))

    nouveau_statut = request.form["statut"]
    commentaire = request.form.get("commentaire")
    localisation = request.form.get("localisation")
    agent = session.get("agent_nom", "Admin")

    succes = mettre_a_jour_statut(numero_suivi, nouveau_statut,
                                   commentaire=commentaire,
                                   agent=agent,
                                   localisation=localisation)
    if succes:
        flash(f"✅ Statut mis à jour : {LABELS_STATUT[nouveau_statut]}", "success")
    else:
        flash("❌ Erreur lors de la mise à jour du statut.", "danger")

    return redirect(url_for("detail_colis", numero_suivi=numero_suivi))


@app.route("/admin/colis/<numero_suivi>/paiement", methods=["POST"])
def marquer_paiement(numero_suivi):
    if not agent_connecte():
        return redirect(url_for("login"))

    conn = get_connection()
    conn.execute("UPDATE colis SET est_paye = 1 WHERE numero_suivi = ?", (numero_suivi,))
    conn.commit()
    conn.close()

    flash("✅ Paiement enregistré.", "success")
    return redirect(url_for("detail_colis", numero_suivi=numero_suivi))


# ----------------------------------------------------------
# LANCEMENT
# ----------------------------------------------------------

if __name__ == "__main__":
    creer_base_de_donnees()
    print("\n🚀 Serveur démarré !")
    print("   → Page publique : http://localhost:5000")
    print("   → Admin         : http://localhost:5000/admin")
    print("   → Login admin   : admin / admin123\n")
    debug = os.environ.get("FLASK_ENV") != "production"
    app.run(debug=debug, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

# Appelé aussi par Gunicorn au démarrage en production
creer_base_de_donnees()
inserer_admin_si_vide()
