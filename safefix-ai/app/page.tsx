import Link from "next/link";
import { ChevronRight, FileText, Gauge, ListChecks, ScanSearch } from "lucide-react";
import { HeroScan } from "@/components/HeroScan";

const STEPS = [
  {
    icon: ScanSearch,
    title: "Detect",
    text: "Gemini reads your photo and your note, then names the problem it can see.",
  },
  {
    icon: Gauge,
    title: "Understand",
    text: "It rates the risk from low to critical and lists the hazards behind it.",
  },
  {
    icon: ListChecks,
    title: "Guide",
    text: "You get safe checks to do from a distance and a plain list of what not to attempt.",
  },
  {
    icon: FileText,
    title: "Report",
    text: "A short summary says whether you should call a professional, and why.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            See the problem.
            <br />
            Understand the risk.
            <br />
            <span className="text-brand-400">Fix it safely.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Upload a photo of a household problem and let Gemini AI analyze the visible issue, assess
            safety risk and provide responsible guidance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/analyze" className="btn-primary px-6 py-3.5 text-base">
              Analyze a Problem
            </Link>
            <Link href="/analyze?demo=1" className="btn-secondary px-6 py-3.5 text-base">
              Try Demo
            </Link>
          </div>
        </div>
        <HeroScan />
      </section>

      <section className="border-y border-white/10 bg-navy-900/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-bold text-white">From photo to safety report in four steps</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="contents">
                <div>
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
                    <s.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-300">{s.text}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    className="mt-3 hidden h-6 w-6 shrink-0 text-slate-600 md:block"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="max-w-2xl font-display text-3xl font-bold text-white">
          Built to say &ldquo;call a professional&rdquo; when it matters
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="border-l-2 border-orange-500 pl-5">
            <h3 className="font-display text-lg font-semibold text-white">No risky DIY</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
              For electrical, gas, fire and structural problems, SafeFix AI never gives repair or
              disassembly steps.
            </p>
          </div>
          <div className="border-l-2 border-brand-500 pl-5">
            <h3 className="font-display text-lg font-semibold text-white">Honest about uncertainty</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
              Answers are based on visible evidence only, and a blurry photo gets a request for a better
              one, not a guess.
            </p>
          </div>
          <div className="border-l-2 border-brand-500 pl-5">
            <h3 className="font-display text-lg font-semibold text-white">Checked before you see it</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-300">
              Every Gemini response is validated against a strict schema, and high-risk results always
              recommend professional help.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
