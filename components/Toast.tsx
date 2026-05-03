"use client";

export function Toast({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="fixed left-4 right-4 top-4 z-50 mx-auto max-w-md rounded-lg border border-ink/10 bg-ink px-4 py-3 text-sm font-medium text-white shadow-soft">
      {message}
    </div>
  );
}
