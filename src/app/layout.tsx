import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmergencyButton from "@/components/EmergencyButton";
import TrackingProvider from "@/components/TrackingProvider";
import { AuthProvider } from "@/components/AuthProvider";

const manrope = localFont({
  src: "../../public/fonts/manrope-latin.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  icons: {
    icon: { url: "/brand/favicon-ligue.png?v=2", type: "image/png", sizes: "512x512" },
    apple: { url: "/brand/favicon-ligue.png?v=2", sizes: "512x512" },
  },
  title: "Sister for Sister - Violentomètre Numérique | Ligue Nigérienne des Droits des Femmes",
  description: "Première plateforme numérique d'autodiagnostic des violences au Niger. Évaluez votre situation de manière anonyme et confidentielle.",
  keywords: ["violences", "femmes", "diagnostic", "aide", "Niger", "Afrique", "Ligue Nigérienne des Droits des Femmes", "violentomètre"],
  authors: [{ name: "Ligue Nigérienne des Droits des Femmes" }],
  openGraph: {
    title: "Sister for Sister - Violentomètre Numérique",
    description: "Première plateforme numérique d'autodiagnostic des violences au Niger.",
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
        
        <AuthProvider>
          <Header />
          <TrackingProvider />
          <main className="pt-[80px] min-h-screen">
            {children}
          </main>
          <Footer />
          <EmergencyButton />
        </AuthProvider>
      </body>
    </html>
  );
}
