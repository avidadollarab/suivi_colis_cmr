"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiAdminColisDetail, apiAdminColisUpdate } from "@/data/api";
import { Button } from "@/components/Button";

export default function ModifierColisPage() {
  const params = useParams();
  const router = useRouter();
  const numero = String(params.numero || "");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    client_nom: "",
    client_prenom: "",
    client_telephone: "",
    client_email: "",
    client_adresse: "",
    client_ville: "",
    client_pays: "France",
    dest_nom: "",
    dest_prenom: "",
    dest_telephone: "",
    dest_ville: "",
    dest_adresse: "",
    dest_quartier: "",
    description: "",
    poids: "",
    prix: "",
    nb_pieces: "1",
    notes: "",
  });

  useEffect(() => {
    apiAdminColisDetail(numero)
      .then((data) => {
        const c = data?.colis as Record<string, unknown>;
        if (!c) return;
        setForm({
          client_nom: String(c.client_nom || ""),
          client_prenom: String(c.client_prenom || ""),
          client_telephone: String(c.client_tel || ""),
          client_email: String(c.client_email || ""),
          client_adresse: String(c.adresse_europe || ""),
          client_ville: String(c.ville_europe || ""),
          client_pays: String(c.pays_europe || "France"),
          dest_nom: String(c.dest_nom || ""),
          dest_prenom: String(c.dest_prenom || ""),
          dest_telephone: String(c.dest_tel || ""),
          dest_ville: String(c.dest_ville || ""),
          dest_adresse: String(c.dest_adresse || ""),
          dest_quartier: String(c.dest_quartier || ""),
          description: String(c.description || ""),
          poids: c.poids_kg != null ? String(c.poids_kg) : "",
          prix: c.prix_total != null ? String(c.prix_total) : "",
          nb_pieces: String(c.nombre_pieces ?? 1),
          notes: String(c.notes || ""),
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoadingData(false));
  }, [numero]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiAdminColisUpdate(numero, {
        ...form,
        poids: form.poids ? parseFloat(form.poids) : undefined,
        prix: form.prix ? parseFloat(form.prix) : undefined,
        nb_pieces: parseInt(form.nb_pieces, 10) || 1,
      });
      router.push(`/admin/colis/${numero}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/colis/${numero}`} className="text-gray-600 hover:text-primary">
          ← Retour au colis
        </Link>
        <h1 className="text-2xl font-bold text-primary">Modifier le colis {numero}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">Expéditeur (client)</h2>
            <div className="space-y-3">
              <Input label="Nom" name="client_nom" value={form.client_nom} onChange={handleChange} required />
              <Input label="Prénom" name="client_prenom" value={form.client_prenom} onChange={handleChange} required />
              <Input label="Téléphone" name="client_telephone" value={form.client_telephone} onChange={handleChange} required />
              <Input label="Email" name="client_email" type="email" value={form.client_email} onChange={handleChange} />
              <Input label="Adresse" name="client_adresse" value={form.client_adresse} onChange={handleChange} />
              <Input label="Ville" name="client_ville" value={form.client_ville} onChange={handleChange} />
              <Input label="Pays" name="client_pays" value={form.client_pays} onChange={handleChange} />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">Destinataire</h2>
            <div className="space-y-3">
              <Input label="Nom" name="dest_nom" value={form.dest_nom} onChange={handleChange} required />
              <Input label="Prénom" name="dest_prenom" value={form.dest_prenom} onChange={handleChange} required />
              <Input label="Téléphone" name="dest_telephone" value={form.dest_telephone} onChange={handleChange} required />
              <Input label="Ville" name="dest_ville" value={form.dest_ville} onChange={handleChange} required />
              <Input label="Adresse" name="dest_adresse" value={form.dest_adresse} onChange={handleChange} />
              <Input label="Quartier" name="dest_quartier" value={form.dest_quartier} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-4">
          <Input label="Description du colis" name="description" value={form.description} onChange={handleChange} required />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Poids (kg)" name="poids" type="number" step="0.1" value={form.poids} onChange={handleChange} />
            <Input label="Prix (€)" name="prix" type="number" step="0.01" value={form.prix} onChange={handleChange} />
            <Input label="Pieces" name="nb_pieces" type="number" value={form.nb_pieces} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
          <Link href={`/admin/colis/${numero}`}>
            <Button variant="glass" size="lg">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  ...props
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
        {...props}
      />
    </div>
  );
}
