import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmergencyButton from "@/components/EmergencyButton";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ALERTE VIOLENCE - Violentomètre Numérique | LNDF Niger",
  description: "Première plateforme numérique d'autodiagnostic des violences en Afrique de l'Ouest. Évaluez votre situation de manière anonyme et confidentielle.",
  keywords: ["violences", "femmes", "diagnostic", "aide", "Niger", "Afrique", "LNDF", "violentomètre"],
  authors: [{ name: "Ligue Nigérienne des Droits des Femmes" }],
  openGraph: {
    title: "ALERTE VIOLENCE - Violentomètre Numérique",
    description: "Première plateforme numérique d'autodiagnostic des violences en Afrique de l'Ouest.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={manrope.variable}>
      <body className="antialiased">
        {/* Background Decorations */}
        <div className="bg-decoration w-96 h-96 bg-[#f6cbb6] top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
        <div className="bg-decoration w-80 h-80 bg-[#e5e7eb] bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        <div className="bg-decoration w-64 h-64 bg-[#f2b79f] top-1/2 right-1/4" />
        
        <Header />
        <main className="pt-[80px] min-h-screen">
          {children}
        </main>
        <Footer />
        <EmergencyButton />
      </body>
    </html>
  );
}
