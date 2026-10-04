"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { ResultView } from "@/components/ResultView";
import { DEMO_RESULT } from "@/lib/demo";
import { prepareImage } from "@/lib/image";
import { validateAssessment } from "@/lib/validate";
import type { Assessment } from "@/lib/types";

const MAX_DESCRIPTION = 1000;

function AnalyzeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const demoRequested = params.get("demo") === "1";

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<Assessment | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoRequested) {
      setResult(DEMO_RESULT);
      setIsDemo(true);
      setStatus("done");
    }
  }, [demoRequested]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setImageBase64(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setDescription("");
    setResult(null);
    setImageBase64(null);
    setIsDemo(false);
    setError(null);
    setStatus("idle");
    if (demoRequested) router.replace("/analyze");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [demoRequested, router]);

  async function analyze() {
    if (!file) {
      setError("Add a photo of the problem before analyzing.");
      return;
    }
    setError(null);
    setStatus("loading");
    try {
      const prepared = await prepareImage(file);
      const form = new FormData();
      form.append("image", prepared);
      form.append("description", description.trim());

      // Convert prepared image to base64 for persistent context during follow-up chat
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageBase64(reader.result);
        }
      };
      reader.readAsDataURL(prepared);

      const res = await fetch("/api/analyze", { method: "POST", body: form });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        /* non-JSON response */
      }
      if (!res.ok) {
        if (res.status === 413) throw new Error("This image is too large. Try a smaller photo.");
        throw new Error(data?.error || "Something went wrong while analyzing. Please try again.");
      }
      const assessment = validateAssessment(data?.assessment);
      if (!assessment) throw new Error("The analysis came back in an unexpected format. Please try again.");

      setResult(assessment);
      setIsDemo(false);
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const message =
        e instanceof TypeError
          ? "Network error. Check your connection and try again."
          : e instanceof Error
            ? e.message
            : "Something went wrong. Please try again.";
      setError(message);
      setStatus("idle");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <ResultView
          assessment={result}
          isDemo={isDemo}
          previewUrl={previewUrl}
          imageBase64={imageBase64}
          onReset={reset}
        />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
        <div className="card overflow-hidden">
          <div className="relative grid max-h-[380px] place-items-center overflow-hidden bg-navy-900">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Your photo being analyzed" className="max-h-[380px] w-full object-contain opacity-80" />
            )}
            <div className="scan-line" />
          </div>
          <div className="flex items-center gap-3 px-5 py-4" role="status" aria-live="polite">
            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
            <p className="text-sm text-slate-200">Gemini is analyzing your photo. This usually takes a few seconds.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Analyze a problem</h1>
      <p className="mt-3 text-slate-300">
        Add a clear photo of the issue. Stay at a safe distance when you take it.
      </p>

      <div className="mt-8 space-y-6">
        <UploadZone
          file={file}
          previewUrl={previewUrl}
          onSelect={(f) => {
            setFile(f);
            setError(null);
          }}
          onRemove={() => setFile(null)}
          onError={setError}
        />

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-white">
            What happened? <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
            rows={4}
            placeholder="The electrical socket started sparking and now has black marks."
            className="w-full resize-y rounded-xl border border-white/15 bg-navy-800/80 px-4 py-3 text-[15px] text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-slate-500">
            {description.length}/{MAX_DESCRIPTION}
          </p>
        </div>

        {error && (
          <div role="alert" className="flex gap-3 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        <div>
          <button type="button" onClick={analyze} disabled={!file} className="btn-primary w-full px-6 py-4 text-base sm:w-auto">
            <Sparkles className="h-5 w-5" /> Analyze with Gemini
          </button>
          {!file && <p className="mt-2 text-sm text-slate-400">Add a photo to enable analysis.</p>}
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            SafeFix AI does not store your photos. They are sent to Google&apos;s Gemini API for analysis.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={null}>
      <AnalyzeInner />
    </Suspense>
  );
}
