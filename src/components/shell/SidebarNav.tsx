"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/upload", label: "Cargar archivos", icon: Upload },
  { href: "/documents", label: "Documentos", icon: FileText },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-64 shrink-0 border-r bg-sidebar">
      <div className="px-4 py-4">
        <div className="text-lg font-semibold">Procesador XML</div>
        <div className="text-xs text-muted-foreground">SUNAT UBL 2.1</div>
      </div>
      <nav className="px-2 py-2 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted",
                active ? "bg-muted font-medium" : "text-foreground"
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
