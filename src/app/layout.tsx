import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Procesador XML UBL - Facturas Electrónicas Perú",
    template: "%s | Procesador XML UBL"
  },
  description: "Procesa y visualiza documentos UBL 2.1 de SUNAT en tu navegador. Herramienta gratuita para facturas electrónicas, boletas y notas. Almacenamiento local con IndexedDB.",
  keywords: ["UBL", "XML", "SUNAT", "facturas electrónicas", "Perú", "comprobantes", "IndexedDB", "local-first"],
  authors: [{ name: "Jorge Zavala" }],
  creator: "Jorge Zavala",
  publisher: "Jorge Zavala",
  metadataBase: new URL("https://procesador-xml.vercel.app"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://procesador-xml.vercel.app",
    title: "Procesador XML UBL - Facturas Electrónicas Perú",
    description: "Procesa documentos UBL 2.1 localmente en tu navegador. Sin servidores, sin subida de datos.",
    siteName: "Procesador XML UBL"
  },
  twitter: {
    card: "summary_large_image",
    title: "Procesador XML UBL - Facturas Electrónicas Perú",
    description: "Procesa documentos UBL 2.1 localmente. Sin servidores, almacenamiento IndexedDB.",
    creator: "@jorgezavala"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
