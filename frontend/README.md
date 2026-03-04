# ELISÉE XPRESS LOG — Site vitrine & suivi de colis

Site Next.js 14 avec React, TypeScript et Tailwind CSS.

## Structure des fichiers

```
frontend/
├── app/
│   ├── layout.tsx          # Layout global (Header, Footer)
│   ├── page.tsx             # Accueil + champ suivi
│   ├── globals.css
│   ├── tracking/page.tsx    # Résultat suivi colis
│   ├── services/page.tsx    # Services & tarifs
│   ├── network/page.tsx     # Villes desservies
│   ├── contact/page.tsx     # Formulaire + WhatsApp + carte
│   └── faq/page.tsx         # Accordéon FAQ
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Section.tsx
│   ├── Logo.tsx             # Logo SVG ELISÉE XPRESS LOG
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── TrackingSearch.tsx   # Champ recherche numéro
│   ├── TrackingResult.tsx   # Carte récap + frise chronologique
│   ├── Timeline.tsx         # Frise des étapes
│   └── NextLoadingBanner.tsx
├── data/
│   ├── mockShipments.ts     # Données mock pour le suivi
│   ├── company.ts           # Infos métier (services, villes, contact)
│   └── faq.ts               # Questions fréquentes
├── public/                  # Images, favicon
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Lancer le projet

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Numéros de suivi mock

Pour tester le suivi, utilisez :
- **EXL2026001** — Colis en transit (arrivé)
- **EXL2026002** — Colis livré
- **EXL2026003** — Colis parti de France
- **EXL2026004** — Colis ramassé

## Intégration avec le backend Flask

Pour connecter le suivi au backend existant (`app.py`), remplacer l'appel dans `getShipmentByNumber` par une requête API vers votre endpoint Flask (ex. `/api/colis/<numero>`).
