"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { fileToDataUrl } from "@/lib/store";

export function ImageInput({
  value,
  onChange,
  onError
}: {
  value?: string;
  onChange: (value?: string) => void;
  onError: (message: string) => void;
}) {
  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("Lutfen bir fotograf dosyasi secin.");
      return;
    }
    onChange(await fileToDataUrl(file));
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-ink">Fotograf</label>
      <div className="relative flex min-h-36 items-center justify-center overflow-hidden rounded-lg border border-ink/10 bg-white">
        {value ? (
          <>
            <Image src={value} alt="" fill className="object-cover" sizes="360px" unoptimized />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-soft"
              aria-label="Fotografi kaldir"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <label className="flex min-h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 text-ink/55">
            <ImagePlus size={26} />
            <span className="text-sm font-semibold">Fotograf yukle</span>
            <input className="sr-only" type="file" accept="image/*" onChange={(event) => handleFile(event.target.files?.[0])} />
          </label>
        )}
      </div>
      {value ? (
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-ink/10 bg-white px-4 text-sm font-bold text-ink">
          Degistir
          <input className="sr-only" type="file" accept="image/*" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>
      ) : null}
    </div>
  );
}
