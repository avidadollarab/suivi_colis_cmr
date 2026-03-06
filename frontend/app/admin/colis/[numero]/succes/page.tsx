"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { getTrackUrl } from "@/data/api";
import { Button } from "@/components/Button";
import { IconCheck, IconQr, IconPrinter } from "@/components/icons";

export default function ColisSuccesPage() {
  const params = useParams();
  const numero = String(params.numero || "").trim().toUpperCase();
  const trackUrl = getTrackUrl(numero);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-200 text-green-700 mb-4">
          <IconCheck size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-primary">Colis enregistré</h1>
        <p className="text-xl font-mono font-bold text-gray-800 mt-2">{numero}</p>
        <p className="text-gray-600 mt-2">
          Imprimez l&apos;étiquette ou partagez le QR code avec le client.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
          <div className="text-sm font-bold uppercase text-gray-500 mb-2 flex items-center justify-center gap-2">
            <IconQr size={16} strokeWidth={2} />
            QR Suivi client
          </div>
          <p className="text-xs text-gray-600 mb-4">Le client scanne pour suivre son colis en temps réel</p>
          <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
            <QRCodeSVG value={trackUrl} size={160} level="M" />
          </div>
          <p className="text-xs text-gray-500 mt-3 font-mono break-all">{trackUrl}</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-primary p-6 text-center">
          <div className="text-sm font-bold uppercase text-primary mb-2 flex items-center justify-center gap-2">
            <IconQr size={16} strokeWidth={2} />
            QR Mise à jour agent
          </div>
          <p className="text-xs text-gray-600 mb-4">L&apos;agent scanne pour mettre à jour le statut (connecté)</p>
          <div className="flex justify-center p-4 bg-primary/5 rounded-xl">
            <QRCodeSVG value={trackUrl} size={160} level="M" />
          </div>
          <p className="text-xs text-gray-500 mt-3">Même URL — interface adaptée si agent connecté</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link href={`/admin/colis/${numero}/etiquette`}>
          <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
            <IconPrinter size={20} strokeWidth={2} />
            Imprimer l&apos;étiquette
          </Button>
        </Link>
        <Link href={`/track/${numero}`} target="_blank">
          <Button variant="gold" size="lg" className="inline-flex items-center gap-2">
            <IconQr size={20} strokeWidth={2} />
            Ouvrir suivi / Scan
          </Button>
        </Link>
        <Link href={`/admin/colis/${numero}`}>
          <Button variant="glass" size="lg">
            Détail du colis
          </Button>
        </Link>
        <Link href="/admin">
          <Button variant="glass" size="lg">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
