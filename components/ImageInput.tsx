"use client";

import Image from "next/image";
import { Camera, ImagePlus, X } from "lucide-react";
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
    if (!file) {
      onError("Fotograf secilemedi. Telefon tarayici ayarlarindan fotograf/kamera iznini kontrol edin.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      onError("Lutfen bir fotograf dosyasi secin.");
      return;
    }
    try {
      onChange(await fileToDataUrl(file));
    } catch {
      onError("Fotograf okunamadi. Baska bir fotograf deneyin.");
    }
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
          <div className="flex min-h-36 w-full flex-col items-center justify-center gap-3 p-4 text-ink/55">
            <ImagePlus size={26} />
            <span className="text-sm font-semibold">Fotograf ekle</span>
            <ImageActions onFile={handleFile} />
          </div>
        )}
      </div>
      {value ? (
        <ImageActions onFile={handleFile} />
      ) : null}
    </div>
  );
}

function ImageActions({ onFile }: { onFile: (file?: File) => void }) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onFile(event.target.files?.[0]);
    event.target.value = "";
  }

  return (
    <div className="grid w-full grid-cols-2 gap-2">
      <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-ink/10 bg-white px-3 text-sm font-bold text-ink shadow-soft">
        <ImagePlus className="mr-2" size={18} />
        Galeri
        <input className="sr-only" type="file" accept="image/*,text/plain" onChange={handleChange} />
      </label>
      <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-leaf px-3 text-sm font-bold text-white shadow-soft">
        <Camera className="mr-2" size={18} />
        Kamera
        <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={handleChange} />
      </label>
    </div>
  );
}
