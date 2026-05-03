import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-white/70 p-6 text-center shadow-soft">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mint text-leaf">
        <Icon size={24} />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/65">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
