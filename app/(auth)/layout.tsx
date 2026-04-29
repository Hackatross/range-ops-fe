import { Crosshair } from "@/components/illustrations/crosshair";
import { PatchEmblem } from "@/components/illustrations/patch-emblem";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden">
      {/* Background — tactical grid + faint crosshair watermark */}
      <div className="pointer-events-none absolute inset-0 -z-10 tactical-grid opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 -z-10 text-primary/20"
      >
        <Crosshair size={520} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 -z-10 text-tactical/20"
      >
        <Crosshair size={420} />
      </div>

      {/* Top brand strip */}
      <header className="flex items-center gap-3 px-6 py-5 sm:px-10">
        <PatchEmblem className="text-primary" size={36} />
        <div className="leading-none">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
            RangeOps
          </p>
          <p className="mt-0.5 text-sm font-semibold tracking-tight">
            Marksmanship Training Console
          </p>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10 sm:py-16">
        {children}
      </main>

      <footer className="border-t border-border/60 px-6 py-4 text-center font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground sm:px-10">
        Restricted access · For authorised personnel only
      </footer>
    </div>
  );
}
