import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/ConditionalLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ELISÉE XPRESS LOG | Suivi de colis & Groupage Premium",
  description:
    "Suivez vos colis en temps réel. Groupage Premium France → Afrique. Collecte Saarland, Alsace, Suisse, Allemagne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
