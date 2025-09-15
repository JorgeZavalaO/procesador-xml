import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">Procesador XML</Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">Local-first • IndexedDB</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
