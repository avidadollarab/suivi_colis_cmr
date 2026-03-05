/**
 * Configuration du chatbot FAQ — ELISÉE XPRESS LOG
 * Modifier ce fichier pour ajouter/modifier des questions et réponses.
 */

export const CHATBOT_CONFIG = {
  whatsapp: "+41774428549",
  whatsappUrl: "https://wa.me/41774428549",

  welcomeMessage:
    "Bonjour ! Je suis l'assistant ELISÉE XPRESS LOG. Comment puis-je vous aider ?",

  fallbackMessage:
    "Je ne suis pas sûr de pouvoir répondre précisément à cette question. Vous pouvez contacter notre équipe au +41774428549 (WhatsApp) pour une réponse personnalisée.",

  /** Intents : mots-clés pour le matching (au moins un doit matcher) */
  intents: [
    {
      id: "delais",
      keywords: ["délai", "delai", "livraison", "combien de temps", "durée"],
      response:
        "Les délais de livraison varient selon la destination : environ 4 à 6 semaines depuis l'Europe jusqu'au Cameroun. Nous organisons des départs réguliers pour optimiser les délais. Contactez-nous pour une estimation précise.",
    },
    {
      id: "suivi",
      keywords: [
        "suivre",
        "suivi",
        "où est",
        "ou est",
        "ou est mon",
        "où est mon",
        "colis",
        "envoi",
        "tracking",
        "comment suivre",
        "numero",
        "numéro",
      ],
      response:
        "Pour suivre votre envoi, rendez-vous sur notre site et entrez votre numéro de suivi (format EXL-AAAA-NNNNN) dans la barre de recherche. Vous recevrez aussi des mises à jour par SMS et WhatsApp à chaque étape.",
    },
    {
      id: "documents",
      keywords: ["document", "papier", "nécessaire", "fournir", "pièce", "piece"],
      response:
        "Les documents nécessaires dépendent du type d'envoi (colis, véhicule, fût). En général : pièce d'identité, facture ou liste de contenu. Notre équipe vous indiquera précisément ce dont vous avez besoin lors de la demande de devis.",
    },
    {
      id: "assurance",
      keywords: ["assurance", "assuré", "assurer", "couvrir"],
      response:
        "Oui, nous proposons des options d'assurance pour vos envois. Les détails et tarifs vous seront communiqués lors de votre demande de devis personnalisé.",
    },
    {
      id: "paiement",
      keywords: ["paiement", "payer", "mode de paiement", "virement", "espèces", "carte"],
      response:
        "Nous acceptons le virement bancaire et les espèces. Les modalités de paiement vous seront précisées lors de la confirmation de votre envoi. Pas de paiement en ligne pour l'instant.",
    },
    {
      id: "zones",
      keywords: [
        "zone",
        "ville",
        "cameroun",
        "douala",
        "yaoundé",
        "yaounde",
        "livrez",
        "livraison",
      ],
      response:
        "Nous livrons dans les principales villes du Cameroun (Douala, Yaoundé, etc.) et étudions chaque demande pour les autres destinations. Contactez-nous pour vérifier la disponibilité dans votre zone.",
    },
    {
      id: "vehicules",
      keywords: ["véhicule", "vehicule", "voiture", "g1", "g2", "g3", "auto"],
      response:
        "Oui, nous transportons des véhicules (G1 citadine, G2 SUV/monospace, G3 berline) de l'Europe vers le Cameroun. Tarifs à partir de 1000€. Demandez un devis pour une estimation personnalisée.",
    },
    {
      id: "localisation",
      keywords: [
        "où",
        "ou",
        "situé",
        "europe",
        "allemagne",
        "adresse",
        "localisation",
      ],
      response:
        "Nous sommes basés à Ettenheim, en Allemagne (Industriestrasse 15). Nous collectons dans toute la région : Saarland, Alsace, Suisse, Allemagne. Consultez notre page Réseau pour plus de villes.",
    },
    {
      id: "devis",
      keywords: ["devis", "prix", "tarif", "combien", "coût", "cout"],
      response:
        "Pour obtenir un devis, contactez-nous sur WhatsApp au +41774428549 ou utilisez le bouton « Demander un devis » sur notre site. Indiquez le type d'envoi (colis, véhicule, fût) et nous vous répondrons rapidement.",
    },
  ] as const,

  /** Boutons rapides affichés au démarrage */
  quickButtons: [
    { label: "Suivre mon envoi", intentId: "suivi" },
    { label: "Délais de livraison", intentId: "delais" },
    { label: "Obtenir un devis", intentId: "devis" },
    { label: "Transport de véhicules", intentId: "vehicules" },
    { label: "Documents nécessaires", intentId: "documents" },
  ],
} as const;

export type IntentId = (typeof CHATBOT_CONFIG.intents)[number]["id"];
