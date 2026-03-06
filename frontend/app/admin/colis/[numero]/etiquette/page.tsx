"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { apiAdminColisDetail, getTrackUrl } from "@/data/api";

export default function EtiquettePage() {
  const params = useParams();
  const numero = String(params.numero || "");
  const [data, setData] = useState<{
    colis: Record<string, unknown>;
    historique: Array<Record<string, unknown>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiAdminColisDetail(numero)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [numero]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        {error || "Colis introuvable"}
      </div>
    );
  }

  const c = data.colis;
  const trackUrl = getTrackUrl(numero);
  const LABELS: Record<string, string> = {
    RAMASSE: "Ramassé",
    EN_CONTENEUR: "En conteneur",
    PARTI: "Parti",
    ARRIVE: "Arrivé",
    LIVRE: "Livré",
  };

  return (
    <div>
      <div className="no-print flex gap-3 mb-6 flex-wrap">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-gold text-primary font-semibold rounded-xl hover:bg-gold-dark"
        >
          🖨 Imprimer
        </button>
        <Link
          href={`/track/${numero}`}
          className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90"
        >
          📱 Suivi / Scan
        </Link>
        <Link
          href={`/admin/colis/${numero}`}
          className="px-5 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl"
        >
          ← Retour
        </Link>
      </div>

      <div className="max-w-[190mm] mx-auto space-y-8 print:space-y-0">
        {/* Étiquette principale */}
        <div className="border-2 border-primary rounded-xl overflow-hidden bg-white">
          <div className="bg-primary text-white px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">ELISÉE <span className="text-gold">XPRESS</span> LOG</div>
              <div className="text-white/70 text-xs">🇪🇺 Europe → 🇨🇲 Cameroun</div>
            </div>
            <div className="font-mono font-bold text-gold bg-gold/20 px-3 py-1 rounded-lg">
              {numero}
            </div>
          </div>
          <div className="grid grid-cols-[1fr,120px]">
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-gray-500">📤 Expéditeur</div>
                <div className="font-bold text-sm">{String(c.client_prenom || "")} {String(c.client_nom || "")}</div>
                <div className="text-xs text-gray-600">{String(c.client_tel || "")}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-gray-500">📍 Destinataire</div>
                <div className="font-bold text-sm">{String(c.dest_prenom || "")} {String(c.dest_nom || "")}</div>
                <div className="text-xs text-gray-600">
                  {String(c.dest_ville || "")}
                  {c.dest_quartier ? ` · ${String(c.dest_quartier)}` : ""} · {String(c.dest_tel || "")}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-500">📦 Contenu</div>
                  <div className="text-xs font-semibold">{String(c.description || "")}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-500">⚖️ Poids / Pièces</div>
                  <div className="text-xs font-semibold">
                    {c.poids_kg != null ? String(c.poids_kg) : "—"} kg · {c.nombre_pieces != null ? Number(c.nombre_pieces) : 1} pcs
                  </div>
                </div>
              </div>
            </div>
            <div className="border-l-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-2">
              <div className="text-[10px] font-bold uppercase text-primary mb-1">📱 SCAN SUIVI</div>
              <QRCodeSVG value={trackUrl} size={90} level="M" />
              <div className="text-[10px] text-gray-500 mt-1">Agent ou client</div>
            </div>
          </div>
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Statut : {LABELS[String(c.statut || "")] || String(c.statut)}
          </div>
        </div>

        {/* Talon client */}
        <div className="border-2 border-gold rounded-xl overflow-hidden bg-white">
          <div className="bg-gold text-primary px-4 py-2 flex justify-between items-center">
            <span className="font-bold text-sm">✂ TALON CLIENT — À conserver</span>
            <span className="font-mono font-bold text-sm">{numero}</span>
          </div>
          <div className="grid grid-cols-[1fr,90px] p-4 gap-4 items-center">
            <div className="text-xs leading-relaxed">
              <strong>SuiviColis CMR</strong><br />
              Colis : {String(c.description || "")}<br />
              Destinataire : {String(c.dest_prenom || "")} {String(c.dest_nom || "")} · {String(c.dest_ville || "")}<br />
              Déposé le : {String((c.date_creation || "").toString().slice(0, 10))}
            </div>
            <div className="flex flex-col items-center">
              <QRCodeSVG value={trackUrl} size={75} level="M" />
              <div className="text-[10px] text-gray-500 font-semibold mt-1">Scannez pour suivre</div>
            </div>
          </div>
          <div className="bg-gold/20 py-2 text-center text-xs font-semibold text-gray-700">
            Scannez le QR code pour suivre votre colis en temps réel
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
