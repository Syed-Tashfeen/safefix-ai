import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type Tone = "orange" | "blue" | "check" | "warn";

interface Props {
  title: string;
  icon?: ReactNode;
  items: string[];
  tone: Tone;
  danger?: boolean;
  className?: string;
}

export function ListBlock({ title, icon, items, tone, danger, className = "" }: Props) {
  return (
    <section
      className={`rounded-2xl border p-5 ${
        danger ? "border-red-400/40 bg-red-500/10" : "border-white/10 bg-navy-800/80"
      } ${className}`}
    >
      <h3
        className={`mb-3 flex items-center gap-2 font-display text-lg font-semibold ${
          danger ? "text-red-200" : "text-white"
        }`}
      >
        {icon}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Nothing noted.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-200">
              <span className="mt-1 shrink-0">
                {tone === "check" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {tone === "warn" && <AlertTriangle className="h-4 w-4 text-red-400" />}
                {tone === "orange" && <span className="mt-1.5 block h-2 w-2 rounded-full bg-orange-400" />}
                {tone === "blue" && <span className="mt-1.5 block h-2 w-2 rounded-full bg-brand-400" />}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
