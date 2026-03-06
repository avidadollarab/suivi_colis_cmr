# Vérifier que les vrais clients sont enregistrés

Pour s'assurer que les 26 clients de `suivi_colis.db` sont bien dans la base PostgreSQL de Render :

---

## Option 1 : Via l'interface admin

1. Connecte-toi à **https://suivi-colis-cmr.onrender.com/admin**
2. Identifiants : `admin` / `admin123`
3. Vérifie la liste des colis sur le dashboard
4. Si tu vois des colis avec des clients réels → les données sont là

---

## Option 2 : Migration depuis suivi_colis.db

Si la base Render est vide, exécute la migration :

```bash
cd Suivi_colis

# Avec l'External Database URL de ta base PostgreSQL Render
python migrate_real_clients.py --source "sqlite:///c:/Users/Admin/Downloads/suivi_colis.db" --target "postgresql://USER:PASS@HOST/DB"
```

**Où trouver l'URL PostgreSQL :**
- Render → ta base **PostgreSQL** → **Connections** → **External Database URL**
- Copie l'URL complète

**Important :** Utilise l'**External** URL (pas Internal) car tu exécutes le script depuis ton PC.

---

## Option 3 : Vérifier via l'API

```bash
# Teste un numéro de suivi connu
curl "https://suivi-colis-cmr.onrender.com/api/suivi/CMR-2026-00001"
```

Si tu reçois du JSON avec les infos du colis → les données sont en base.
