"use client";

import { useState } from "react";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { COMPANY } from "@/data/company";
import { IconChat, IconLocation } from "@/components/icons";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Section
      title="Contact"
      subtitle="Une question ? Un devis ? Nous sommes à votre écoute."
    >
      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto px-4 sm:px-0">
        {/* Formulaire */}
        <Card>
          <h3 className="text-lg font-bold text-primary mb-6">
            Envoyez-nous un message
          </h3>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-800 font-medium">
                Message envoyé ! Nous vous répondrons rapidement.
              </p>
              <p className="text-green-600 text-sm mt-2">
                Vous pouvez aussi nous contacter directement sur WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="jean@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="Décrivez votre demande..."
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Envoyer
              </Button>
            </form>
          )}
        </Card>

        {/* Coordonnées + WhatsApp + Carte */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-primary mb-4">
              Contact direct
            </h3>
            <a
              href={COMPANY.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-smooth mb-4"
              aria-label="Contacter par WhatsApp"
            >
              <IconChat size={28} strokeWidth={1.5} className="text-green-600" />
              <div>
                <p className="font-semibold text-gray-800">WhatsApp</p>
                <p className="text-green-700 font-mono">{COMPANY.whatsapp}</p>
              </div>
            </a>
            <div className="flex items-start gap-3">
              <IconLocation size={24} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Adresse</p>
                <p className="text-gray-600">{COMPANY.address}</p>
              </div>
            </div>
          </Card>

          {/* Carte intégrée - Google Maps iframe */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-64">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.0!2d7.9!3d48.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4790a6e0a7a7a7a7%3A0x0!2sIndustriestrasse%2015%2C%2077955%20Ettenheim%2C%20Allemagne!5e0!3m2!1sfr!2sfr!4v1709568000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Carte ELISÉE XPRESS LOG"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
