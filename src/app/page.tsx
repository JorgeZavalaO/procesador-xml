import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Procesador XML UBL - Facturas Electrónicas Perú | Local-First",
  description: "Procesa y visualiza documentos UBL 2.1 de SUNAT en tu navegador. Carga XML de facturas, boletas y notas electrónicas sin subir datos a servidores. Almacenamiento local con IndexedDB.",
  keywords: [
    "UBL 2.1",
    "facturas electrónicas",
    "SUNAT",
    "XML parser",
    "procesador UBL",
    "facturas Perú",
    "IndexedDB",
    "local-first",
    "comprobantes electrónicos"
  ],
  authors: [{ name: "Jorge Zavala" }],
  creator: "Jorge Zavala",
  publisher: "Jorge Zavala",
  openGraph: {
    title: "Procesador XML UBL - Facturas Electrónicas Perú",
    description: "Procesa documentos UBL 2.1 localmente en tu navegador. Sin servidores, sin subida de datos.",
    url: "https://procesador-xml.vercel.app",
    siteName: "Procesador XML UBL",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Procesador XML UBL - Facturas Electrónicas"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Procesador XML UBL - Facturas Electrónicas Perú",
    description: "Procesa documentos UBL 2.1 localmente. Sin servidores, almacenamiento IndexedDB.",
    images: ["/og-image.png"],
    creator: "@jorgezavala"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "https://procesador-xml.vercel.app"
  }
};

export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Procesador XML UBL 2.1
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Herramienta gratuita para procesar y visualizar facturas electrónicas, boletas y notas de SUNAT.
            <span className="font-medium text-foreground"> Funciona completamente en tu navegador</span>, sin subir datos a servidores externos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Carga Rápida</h3>
            <p className="text-sm text-muted-foreground">Arrastra y suelta archivos XML o ZIP. Procesamiento instantáneo con Web Workers.</p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Almacenamiento Local</h3>
            <p className="text-sm text-muted-foreground">Tus datos quedan en tu dispositivo. IndexedDB para persistencia offline.</p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Visualización Completa</h3>
            <p className="text-sm text-muted-foreground">Ve detalles completos: emisor, receptor, líneas, impuestos, leyendas y más.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Cargar Archivos XML
          </Link>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ver Documentos
          </Link>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Compatible con facturas, boletas, notas de crédito y débito según estándares SUNAT UBL 2.1
          </p>
          <p className="text-xs text-muted-foreground">
            💡 Puedes cambiar entre tema claro y oscuro desde la esquina superior derecha
          </p>
        </div>
      </div>
    </div>
  );
}
