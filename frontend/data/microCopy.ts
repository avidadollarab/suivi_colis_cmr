/**
 * Micro-copy professionnel — ELISÉE XPRESS LOG
 * Ton rassurant, logistique, inspirant confiance
 */

export const MICRO_COPY = {
  // Page d'accueil
  hero: {
    badge: "Europe · Groupage Premium · Afrique",
    title: "Votre colis entre de bonnes mains, garanti.",
    subtitle: "Suivi mis à jour en temps réel, du ramassage en Europe jusqu'à la livraison à votre porte en Afrique.",
    searchPlaceholder: "Ex : EXL-2026-00147",
    searchHint: "Entrez le numéro reçu par SMS lors du ramassage",
    searchButton: "Suivre mon colis",
    searchLabel: "Numéro de suivi",
  },

  // Bannière chargement
  loadingBanner: {
    text: "Prochain chargement :",
    date: "8 Mars 2026",
    cta: "Réservez votre place avant le 6 Mars",
  },

  // Parcours (étapes)
  parcours: {
    ramassage: { label: "Ramassage", sub: "Chez vous" },
    groupage: { label: "Groupage", sub: "Ettenheim, DE" },
    transit: { label: "En transit", sub: "Océan Atlantique" },
    port: { label: "Port d'arrivée", sub: "Douala & autres" },
    livre: { label: "Livré", sub: "À destination" },
  },

  // Services / Tarifs
  services: {
    title: "Nos tarifs Groupage Premium",
    subtitle: "Colis, fûts, véhicules, électroménager — nous nous occupons de tout.",
    popular: "POPULAIRE",
    cta: "Demander un devis",
    viewAll: "Voir tous les services",
  },

  // Pourquoi nous
  features: {
    title: "Pourquoi ELISÉE XPRESS LOG",
    subtitle: "Le Groupage Premium, c'est quoi ?",
    desc: "Un service fiable, transparent et régulier — depuis l'Allemagne vers l'Afrique.",
    suivi: {
      title: "Suivi en temps réel",
      desc: "Statut actualisé à chaque étape. Consultez l'état de votre envoi 24h/24 depuis notre site.",
    },
    alertes: {
      title: "Alertes SMS & WhatsApp",
      desc: "Notification automatique à chaque changement de statut pour vous et votre destinataire.",
    },
    departs: {
      title: "Départs réguliers",
      desc: "Des chargements planifiés régulièrement pour que vos envois n'attendent jamais trop longtemps.",
    },
    securise: {
      title: "Marchandises sécurisées",
      desc: "Vos biens sont conditionnés et protégés dans nos entrepôts avant chaque départ.",
    },
    collecte: {
      title: "Collecte à domicile",
      desc: "Nous venons chercher vos colis chez vous dans toute la région couverte par notre réseau.",
    },
    support: {
      title: "Support WhatsApp",
      desc: "Une question ? Contactez-nous sur WhatsApp — réponse rapide garantie.",
    },
  },

  // Réseau
  network: {
    label: "Notre réseau",
    title: "Nous collectons près de chez vous",
    subtitle: "Présents dans plus de 20 villes en Europe — et nous grandissons.",
    hint: "Vous ne voyez pas votre ville ? Contactez-nous — nous étudions chaque demande.",
  },

  // CTA Contact
  contact: {
    title: "Une question ? Contactez-nous",
    subtitle: "Notre équipe est disponible sur WhatsApp pour vous accompagner.",
    whatsapp: "WhatsApp",
  },

  // Page suivi
  tracking: {
    title: "Suivre un colis",
    searchPlaceholder: "Ex : EXL-2026-00147",
    notFound: {
      title: "Numéro introuvable",
      desc: "Aucun colis trouvé avec ce numéro. Vérifiez le format (EXL-AAAA-NNNNN) ou contactez notre équipe.",
      retry: "Nouvelle recherche",
      back: "Retour à l'accueil",
    },
    summary: {
      number: "Numéro de suivi",
      status: "Statut",
      eta: "Livraison prévue",
      lastUpdate: "Dernière mise à jour",
      progress: "Progression",
      description: "Description",
      weight: "Poids",
      destination: "Destination",
      client: "Client",
    },
    timeline: {
      title: "Historique du trajet",
      tooltip: "Votre colis est arrivé à l'entrepôt de",
      newSearch: "Nouvelle recherche",
    },
  },

  // Footer
  footer: {
    tagline: "Groupage & expédition Europe → Afrique",
    copyright: "© 2026 ELISÉE XPRESS LOG · Groupage & expédition Europe → Afrique",
  },

  // Accessibilité
  a11y: {
    menu: "Menu",
    searchTracking: "Rechercher un colis par numéro",
    iconTracking: "Suivi en temps réel",
    iconLocation: "Localisation",
  },
} as const;
