import { BottomNav } from "./BottomNav";

export function AppShell({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="safe-bottom mx-auto min-h-screen w-full max-w-md px-4 pt-5">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-leaf">Fizik Tedavi</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-ink">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-ink/65">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0 pt-2">{action}</div> : null}
      </header>
      {children}
      <BottomNav />
    </main>
  );
}
