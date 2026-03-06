"use client";

import Link from "next/link";
import { AdminClientSearch } from "@/components/AdminClientSearch";

export default function AdminClientsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-600 hover:text-primary">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-primary">Clients</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <AdminClientSearch />
      </div>
    </div>
  );
}
