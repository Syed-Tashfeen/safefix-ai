import { Eye, Lightbulb, OctagonX, RotateCcw, ShieldAlert, ShieldCheck, Stethoscope } from "lucide-react";
import type { Assessment } from "@/lib/types";
import { RISK_STYLES } from "@/lib/risk";
import { ListBlock } from "./ListBlock";
import { OutletIllustration } from "./OutletIllustration";
import { FollowUpChat } from "./FollowUpChat";

interface Props {
  assessment: Assessment;
  isDemo: boolean;
  previewUrl: string | null;
  imageBase64?: string | null;
  onReset: () => void;
}

export function ResultView({ assessment: a, isDemo, previewUrl, imageBase64, onReset }: Props) {
  const risk = RISK_STYLES[a.riskLevel];
  const severe = a.riskLevel === "HIGH" || a.riskLevel === "CRITICAL";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">AI analysis</h1>
        {isDemo && (
          <span className="rounded-full border border-brand-400/50 bg-brand-500/15 px-3 py-1 text-xs font-bold tracking-wide text-brand-400">
            DEMO RESULT
          </span>
        )}
      </div>
      {isDemo && (
        <p className="text-sm text-slate-400">
          This is a pre-written example. It was not generated live by Gemini.
        </p>
      )}

      {severe && (
        <div
          role="alert"
          className={`flex gap-3 rounded-2xl border p-4 ${risk.border} ${risk.bg}`}
        >
          <ShieldAlert className={`mt-0.5 h-6 w-6 shrink-0 ${risk.text}`} />
          <p className="text-[15px] leading-relaxed text-slate-100">
            {a.riskLevel === "CRITICAL" ? (
              <>
                <strong className="text-white">Stay away from the hazard and keep others away.</strong> If
                there is fire, smoke, a gas smell or any immediate danger, leave the area and call your
                local emergency number (112 in India, 911 in the US).
              </>
            ) : (
              <>
                <strong className="text-white">Treat this as unsafe until a qualified professional has inspected it.</strong>{" "}
                Do not touch or interact with the affected area.
              </>
            )}
          </p>
        </div>
      )}

      <section className="card grid gap-6 p-5 sm:p-6 md:grid-cols-[240px_1fr]">
        <div className="overflow-hidden rounded-xl bg-navy-900">
          {isDemo ? (
            <div className="p-4">
              <OutletIllustration className="h-full w-full" />
            </div>
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="The photo you uploaded" className="h-full max-h-64 w-full object-cover md:max-h-none" />
          ) : null}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-400">Problem detected</p>
          <p className="mt-1 font-display text-2xl font-bold leading-tight text-white">{a.problem}</p>

          <p className="mt-5 text-sm font-medium text-slate-400">Risk level</p>
          <div className="mt-2 flex items-center gap-4">
            <span
              className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${risk.border} ${risk.bg} ${risk.text}`}
            >
              {a.riskLevel}
            </span>
            <div className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={`h-2 w-9 rounded-full ${n <= risk.level ? risk.bar : "bg-white/10"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <ListBlock
          title="Detected hazards"
          icon={<ShieldAlert className="h-5 w-5 text-orange-400" />}
          items={a.detectedHazards}
          tone="orange"
        />
        <ListBlock
          title="What Gemini observed"
          icon={<Eye className="h-5 w-5 text-brand-400" />}
          items={a.visualEvidence}
          tone="blue"
        />
      </div>

      {a.possibleCause && (
        <section className="card p-5">
          <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Lightbulb className="h-5 w-5 text-brand-400" /> Possible cause
          </h3>
          <p className="text-[15px] leading-relaxed text-slate-200">{a.possibleCause}</p>
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <ListBlock
          title="Immediate safety advice"
          icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
          items={a.immediateSafetyAdvice}
          tone="check"
        />
        <ListBlock title="Safe checks" items={a.safeChecks} tone="check" />
      </div>

      <ListBlock
        title="Do not attempt"
        icon={<OctagonX className="h-5 w-5 text-red-400" />}
        items={a.doNotAttempt}
        tone="warn"
        danger
      />

      <section className="card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Stethoscope className="h-5 w-5 text-brand-400" /> Professional help
        </h3>
        <span
          className={`inline-block rounded-lg border px-3 py-1.5 text-sm font-bold ${
            a.professionalHelp
              ? "border-orange-400/40 bg-orange-500/10 text-orange-300"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {a.professionalHelp ? "Recommended" : "Not immediately required"}
        </span>
        {a.professionalReason && (
          <p className="mt-3 text-[15px] leading-relaxed text-slate-200">
            <span className="font-semibold text-white">Reason: </span>
            {a.professionalReason}
          </p>
        )}
      </section>

      <section className="card p-5">
        <h3 className="mb-2 font-display text-lg font-semibold text-white">Summary</h3>
        <p className="text-[15px] leading-relaxed text-slate-200">{a.summary}</p>
        <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-400">
          Based on the visible evidence only. This is AI-generated guidance, not a professional
          inspection.
        </p>
      </section>

      {/* Interactive AI Follow-up Chat */}
      <FollowUpChat
        assessment={a}
        previewUrl={previewUrl}
        imageBase64={imageBase64}
        isDemo={isDemo}
      />

      <div className="pt-2">
        <button type="button" onClick={onReset} className="btn-primary">
          <RotateCcw className="h-4 w-4" /> Analyze another problem
        </button>
      </div>
    </div>
  );
}
