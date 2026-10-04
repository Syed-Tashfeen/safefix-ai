import { OutletIllustration } from "./OutletIllustration";

export function HeroScan() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-navy-800 p-10 shadow-2xl shadow-black/40">
        <OutletIllustration className="h-full w-full" />

        <span className="absolute left-5 top-5 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-brand-400" />
        <span className="absolute right-5 top-5 h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-brand-400" />
        <span className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-brand-400" />
        <span className="absolute bottom-5 right-5 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-brand-400" />

        <div className="scan-once" />

        <span className="absolute right-6 top-[38%] rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Cracked faceplate
        </span>
        <span className="absolute bottom-[22%] right-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Burn marks
        </span>
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
          High risk
        </span>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">Illustration of a sample analysis</p>
    </div>
  );
}
