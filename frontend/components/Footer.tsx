import Link from "next/link";
import { COMPANY } from "@/data/company";

export function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3 text-gold">
              ELISÉE XPRESS LOG
            </h3>
            <p className="text-white/90 text-sm">
              Groupage Premium · Acheminement international
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Liens utiles</h4>
            <ul className="space-y-2 text-sm text-white/90">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-gold transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/network"
                  className="hover:text-gold transition-colors"
                >
                  Réseau
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-gold transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <a
              href={COMPANY.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/90 hover:text-gold transition-colors mb-2"
            >
              <span className="text-green-400">●</span> WhatsApp {COMPANY.whatsapp}
            </a>
            <p className="text-sm text-white/80">{COMPANY.address}</p>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/80">
          © 2026 ELISÉE XPRESS LOG · Groupage & expédition 🇪🇺 Europe → 🌍 Afrique
        </div>
      </div>
    </footer>
  );
}
