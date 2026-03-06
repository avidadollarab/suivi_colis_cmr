"""
=============================================================
  SYSTÈME DE SUIVI DE COLIS - FRANCE → CAMEROUN
  Fichier : app.py
  Description : Application web Flask
=============================================================
"""

import os
try:
    from dotenv import load_dotenv
    load_dotenv()  # Charge .env pour Twilio en local
except ImportError:
    pass  # python-dotenv non installé, variables d'env manuelles
from flask import Flask, render_template, request, redirect, url_for, session, flash, make_response, jsonify
from database import (
    initialiser,
    ajouter_client, ajouter_destinataire,
    enregistrer_colis, mettre_a_jour_statut, consulter_colis,
    tous_les_colis, tous_les_clients, tous_les_destinataires,
    get_agent, marquer_paye,
    get_client_by_id, get_colis_by_client
)
from notifications import envoyer_notifications, apercu_message, twilio_configure

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "cmr-suivi-secret-local-2024")
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0


@app.after_request
def no_cache_dev(response):
    """Désactive le cache en dev pour voir les changements immédiatement."""
    if os.environ.get("FLASK_ENV") != "production":
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


LABELS_STATUT = {
    'RAMASSE':      '📦 Ramasse en Europe',
    'EN_CONTENEUR': '🏭 Depose au conteneur',
    'PARTI':        '🚢 Parti de France',
    'ARRIVE':       '🇨🇲 Arrive au Cameroun',
    'LIVRE':        '✅ Livre',
}

COULEURS_STATUT = {
    'RAMASSE':      'orange',
    'EN_CONTENEUR': 'blue',
    'PARTI':        'purple',
    'ARRIVE':       'teal',
    'LIVRE':        'green',
}


def agent_connecte():
    return session.get("agent_id") is not None


# ----------------------------------------------------------
# HEALTH CHECK (pour vérifier le déploiement)
# ----------------------------------------------------------

@app.route("/health")
def health():
    """Vérifie que l'app et la base fonctionnent."""
    try:
        from database import get_connection, USE_POSTGRES
        conn = get_connection()
        conn.close()
        db_type = "postgresql" if USE_POSTGRES else "sqlite"
        return jsonify({"ok": True, "database": db_type})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# ----------------------------------------------------------
# PAGES PUBLIQUES
# ----------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/suivre", methods=["GET", "POST"])
def suivre():
    numero = (request.args.get("numero") or request.form.get("numero", "")).strip().upper()
    resultat = None
    erreur = None

    if numero:
        resultat = consulter_colis(numero)
        if not resultat:
            erreur = f"Aucun colis trouve avec le numero {numero}."
        else:
            resultat["labels"] = LABELS_STATUT
            resultat["couleurs"] = COULEURS_STATUT
            resultat["etapes_ordonnees"] = ['RAMASSE', 'EN_CONTENEUR', 'PARTI', 'ARRIVE', 'LIVRE']

    return render_template("suivre.html", numero=numero, resultat=resultat, erreur=erreur)


# ----------------------------------------------------------
# AUTHENTIFICATION
# ----------------------------------------------------------

@app.route("/admin/login", methods=["GET", "POST"])
def login():
    next_url = request.args.get("next") or request.form.get("next")
    if request.method == "POST":
        agent = get_agent(request.form["identifiant"], request.form["mot_de_passe"])
        if agent:
            session["agent_id"]   = agent["id"]
            session["agent_nom"]  = f"{agent['prenom']} {agent['nom']}"
            session["agent_role"] = agent["role"]
            flash("Bienvenue ! Vous etes connecte.", "success")
            if next_url and next_url.startswith("/"):
                return redirect(next_url)
            return redirect(url_for("admin_dashboard"))
        else:
            flash("Identifiant ou mot de passe incorrect.", "danger")
    return render_template("login.html", next_url=next_url)


@app.route("/admin/logout")
def logout():
    session.clear()
    flash("Vous etes deconnecte.", "info")
    return redirect(url_for("index"))


# ----------------------------------------------------------
# INTERFACE ADMIN
# ----------------------------------------------------------

@app.route("/admin")
def admin_dashboard():
    if not agent_connecte():
        return redirect(url_for("login"))

    colis = tous_les_colis()
    stats = {
        "total":        len(colis),
        "ramasse":      sum(1 for c in colis if c["statut"] == "RAMASSE"),
        "en_conteneur": sum(1 for c in colis if c["statut"] == "EN_CONTENEUR"),
        "parti":        sum(1 for c in colis if c["statut"] == "PARTI"),
        "arrive":       sum(1 for c in colis if c["statut"] == "ARRIVE"),
        "livre":        sum(1 for c in colis if c["statut"] == "LIVRE"),
        "non_paye":     sum(1 for c in colis if not c["est_paye"]),
    }
    return render_template("admin/dashboard.html",
                           colis=colis, stats=stats,
                           labels=LABELS_STATUT, couleurs=COULEURS_STATUT,
                           twilio_ok=twilio_configure())


@app.route("/admin/colis/nouveau", methods=["GET", "POST"])
def nouveau_colis():
    if not agent_connecte():
        return redirect(url_for("login"))

    client_prefill = None
    client_id_param = request.args.get("client_id")
    if client_id_param:
        try:
            client_prefill = get_client_by_id(int(client_id_param))
        except (ValueError, TypeError):
            pass

    if request.method == "POST":
        f = request.form
        id_client = ajouter_client(
            nom=f["client_nom"], prenom=f["client_prenom"],
            telephone=f["client_telephone"], email=f.get("client_email"),
            adresse=f.get("client_adresse"), ville=f.get("client_ville"),
            pays=f.get("client_pays", "France")
        )
        id_dest = ajouter_destinataire(
            nom=f["dest_nom"], prenom=f["dest_prenom"],
            telephone=f["dest_telephone"], ville=f["dest_ville"],
            adresse=f.get("dest_adresse"), quartier=f.get("dest_quartier")
        )
        poids  = float(f["poids"]) if f.get("poids") else None
        prix   = float(f["prix"])  if f.get("prix")  else None
        pieces = int(f.get("nb_pieces", 1))

        numero = enregistrer_colis(
            id_client=id_client, id_destinataire=id_dest,
            description=f["description"], poids=poids,
            nb_pieces=pieces, prix=prix, notes=f.get("notes")
        )
        flash(f"Colis enregistre ! Numero : {numero}", "success")
        return redirect(url_for("admin_dashboard"))

    return render_template("admin/nouveau_colis.html",
                           clients=tous_les_clients(),
                           destinataires=tous_les_destinataires(),
                           client_prefill=client_prefill,
                           labels=LABELS_STATUT)


@app.route("/client/<int:client_id>")
def fiche_client(client_id):
    """Page client : fiche + historique des colis (accès par lien partagé)."""
    client = get_client_by_id(client_id)
    if not client:
        flash("Client introuvable.", "danger")
        return redirect(url_for("index"))

    colis_list = get_colis_by_client(client_id)
    return render_template("fiche_client.html",
                          client=client,
                          colis_list=colis_list,
                          labels=LABELS_STATUT,
                          couleurs=COULEURS_STATUT)


@app.route("/admin/colis/<numero_suivi>")
def detail_colis(numero_suivi):
    if not agent_connecte():
        return redirect(url_for("login"))

    resultat = consulter_colis(numero_suivi)
    if not resultat:
        flash("Colis introuvable.", "danger")
        return redirect(url_for("admin_dashboard"))

    resultat["labels"]          = LABELS_STATUT
    resultat["couleurs"]        = COULEURS_STATUT
    resultat["etapes_ordonnees"] = ['RAMASSE', 'EN_CONTENEUR', 'PARTI', 'ARRIVE', 'LIVRE']
    resultat["statuts_valides"]  = list(LABELS_STATUT.keys())

    return render_template("admin/detail_colis.html",
                           resultat=resultat, numero=numero_suivi)


@app.route("/admin/colis/<numero_suivi>/statut", methods=["POST"])
def changer_statut(numero_suivi):
    if not agent_connecte():
        return redirect(url_for("login"))

    nouveau_statut = request.form["statut"]

    succes = mettre_a_jour_statut(
        numero_suivi,
        nouveau_statut,
        commentaire=request.form.get("commentaire"),
        agent=session.get("agent_nom", "Admin"),
        localisation=request.form.get("localisation")
    )

    if succes:
        flash(f"Statut mis a jour : {LABELS_STATUT[nouveau_statut]}", "success")

        # --- Envoi automatique des notifications SMS + WhatsApp ---
        colis = consulter_colis(numero_suivi)
        if colis:
            c = colis["colis"]
            try:
                resultats = envoyer_notifications(
                    numero_suivi       = numero_suivi,
                    nouveau_statut     = nouveau_statut,
                    tel_expediteur     = c["client_tel"],
                    tel_destinataire   = c["dest_tel"],
                    ville_destinataire = c["dest_ville"]
                )
                nb = resultats["sms"] + resultats["whatsapp"] + resultats["simules"]
                if nb > 0:
                    flash(f"📱 {nb} notification(s) envoyee(s) au client et destinataire.", "info")
                elif not twilio_configure():
                    flash("⚠️ SMS/WhatsApp non configurés. Ajoutez TWILIO_* sur Render (voir GUIDE_TWILIO.md)", "warning")
                elif resultats.get("erreurs", 0) > 0:
                    flash("⚠️ Statut mis à jour mais erreur lors de l'envoi des notifications.", "warning")
            except Exception as e:
                flash(f"⚠️ Statut mis a jour mais erreur notifications : {e}", "warning")
        # ----------------------------------------------------------
    else:
        flash("Erreur lors de la mise a jour.", "danger")

    return redirect(url_for("detail_colis", numero_suivi=numero_suivi))


# ----------------------------------------------------------
# ROUTE TRACK (QR CODE - AGENT OU CLIENT)
# ----------------------------------------------------------

@app.route("/track/<tracking_id>")
def track(tracking_id):
    """Page unique pour le QR colis : agent connecte = vue edition, sinon = vue client (lecture seule)."""
    numero = tracking_id.strip().upper()
    resultat = consulter_colis(numero)
    if not resultat:
        flash(f"Colis introuvable : {numero}", "danger")
        return redirect(url_for("suivre"))

    resultat["labels"] = LABELS_STATUT
    resultat["couleurs"] = COULEURS_STATUT
    resultat["etapes_ordonnees"] = ['RAMASSE', 'EN_CONTENEUR', 'PARTI', 'ARRIVE', 'LIVRE']
    resultat["statuts_valides"] = list(LABELS_STATUT.keys())

    if agent_connecte():
        return render_template("track_agent.html", resultat=resultat, numero=numero, labels=LABELS_STATUT)
    return render_template("track_client.html", resultat=resultat, numero=numero, labels=LABELS_STATUT)


@app.route("/track/<tracking_id>/statut", methods=["POST"])
def track_changer_statut(tracking_id):
    """Mise a jour statut depuis la page scan agent (QR)."""
    if not agent_connecte():
        flash("Connexion requise pour modifier le statut.", "danger")
        return redirect(url_for("login", next=url_for("track", tracking_id=tracking_id)))

    nouveau_statut = request.form.get("statut")
    if not nouveau_statut:
        flash("Statut requis.", "danger")
        return redirect(url_for("track", tracking_id=tracking_id))

    succes = mettre_a_jour_statut(
        tracking_id,
        nouveau_statut,
        commentaire=request.form.get("commentaire"),
        agent=session.get("agent_nom", "Admin"),
        localisation=request.form.get("localisation")
    )

    if succes:
        flash(f"Statut mis a jour : {LABELS_STATUT[nouveau_statut]}", "success")
        colis = consulter_colis(tracking_id)
        if colis:
            c = colis["colis"]
            try:
                resultats = envoyer_notifications(
                    numero_suivi=tracking_id,
                    nouveau_statut=nouveau_statut,
                    tel_expediteur=c["client_tel"],
                    tel_destinataire=c["dest_tel"],
                    ville_destinataire=c["dest_ville"]
                )
                nb = resultats["sms"] + resultats["whatsapp"] + resultats["simules"]
                if nb > 0:
                    flash(f"📱 {nb} notification(s) envoyee(s).", "info")
                elif not twilio_configure():
                    flash("⚠️ SMS/WhatsApp non configurés. Ajoutez TWILIO_* sur Render.", "warning")
            except Exception as e:
                flash(f"⚠️ Notifications : {e}", "warning")
    else:
        flash("Erreur lors de la mise a jour.", "danger")

    return redirect(url_for("track", tracking_id=tracking_id))


@app.route("/admin/colis/<numero_suivi>/etiquette")
def etiquette_colis(numero_suivi):
    """Etiquette imprimable avec QR code (URL track)."""
    if not agent_connecte():
        return redirect(url_for("login", next=url_for("etiquette_colis", numero_suivi=numero_suivi)))

    resultat = consulter_colis(numero_suivi)
    if not resultat:
        flash("Colis introuvable.", "danger")
        return redirect(url_for("admin_dashboard"))

    resultat["labels"] = LABELS_STATUT
    resultat["couleurs"] = COULEURS_STATUT
    return render_template("etiquette_colis.html", resultat=resultat, numero=numero_suivi, labels=LABELS_STATUT)


@app.route("/api/shipments/<numero_suivi>/status", methods=["POST"])
def api_changer_statut(numero_suivi):
    """API REST pour mise a jour statut (agents uniquement)."""
    if not agent_connecte():
        return jsonify({"error": "Non autorise"}), 401

    data = request.get_json() or {}
    nouveau_statut = data.get("statut") or request.form.get("statut")
    if not nouveau_statut:
        return jsonify({"error": "statut requis"}), 400

    succes = mettre_a_jour_statut(
        numero_suivi,
        nouveau_statut,
        commentaire=data.get("commentaire") or request.form.get("commentaire"),
        agent=session.get("agent_nom", "Admin"),
        localisation=data.get("localisation") or request.form.get("localisation")
    )

    if not succes:
        return jsonify({"error": "Mise a jour impossible"}), 400

    resultat = consulter_colis(numero_suivi)
    return jsonify({"ok": True, "statut": nouveau_statut, "colis": resultat["colis"]})


@app.route("/admin/colis/<numero_suivi>/paiement", methods=["POST"])
def paiement(numero_suivi):
    if not agent_connecte():
        return redirect(url_for("login"))
    marquer_paye(numero_suivi)
    flash("Paiement enregistre.", "success")
    return redirect(url_for("detail_colis", numero_suivi=numero_suivi))


# ----------------------------------------------------------
# LANCEMENT
# ----------------------------------------------------------

if __name__ == "__main__":
    initialiser()
    print("\nServeur demarre !")
    print("  Page publique : http://localhost:5000")
    print("  Admin         : http://localhost:5000/admin")
    print("  Login         : admin / admin123\n")
    debug = os.environ.get("FLASK_ENV") != "production"
    app.run(debug=debug, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

# Point d'entree Gunicorn
initialiser()
