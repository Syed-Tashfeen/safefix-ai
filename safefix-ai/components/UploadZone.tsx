"use client";

import { useRef, useState } from "react";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES, formatBytes } from "@/lib/image";

interface Props {
  file: File | null;
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}

export function UploadZone({ file, previewUrl, onSelect, onRemove, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  function handleFile(f: File | undefined) {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type.toLowerCase())) {
      onError("That file is not a supported image. Use a JPG, PNG, WebP or HEIC photo.");
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      onError("That image is larger than 20 MB. Choose a smaller photo.");
      return;
    }
    setPreviewFailed(false);
    onSelect(f);
  }

  if (file && previewUrl) {
    return (
      <div className="card overflow-hidden">
        <div className="relative grid max-h-[420px] place-items-center bg-navy-900">
          {previewFailed ? (
            <div className="grid h-56 place-items-center px-6 text-center text-sm text-slate-400">
              <div>
                <ImagePlus className="mx-auto mb-2 h-8 w-8" />
                Preview is not available for this format, but the image will still be analyzed.
              </div>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected photo of the household problem"
              className="max-h-[420px] w-full object-contain"
              onError={() => setPreviewFailed(true)}
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <p className="min-w-0 truncate text-sm text-slate-300">
            {file.name} <span className="text-slate-500">({formatBytes(file.size)})</span>
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            <X className="h-4 w-4" /> Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a photo. Drag and drop or press Enter to browse."
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
        dragging ? "border-brand-400 bg-brand-500/10" : "border-white/20 bg-navy-800/50 hover:border-brand-400/60"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div>
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-400">
          <UploadCloud className="h-7 w-7" />
        </span>
        <p className="font-display text-lg font-semibold text-white">Drop a photo here</p>
        <p className="mt-1 text-sm text-slate-400">or tap to browse. JPG, PNG, WebP or HEIC.</p>
        <p className="mt-5 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white">
          Browse photos
        </p>
      </div>
    </div>
  );
}
