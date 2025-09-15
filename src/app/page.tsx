import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Procesa tus comprobantes UBL 2.1 <span className="text-muted-foreground">en tu navegador</span>
        </h1>
        <p className="text-muted-foreground">
          Carga XML o ZIP, parsea y guarda localmente en IndexedDB. Sin backend, sin subir datos a servidores.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/upload"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cargar archivos
          </Link>
          <Link
            href="/documents"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Ver documentos
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: puedes alternar claro/oscuro desde la esquina superior derecha.
        </p>
      </div>
    </div>
  );
}
