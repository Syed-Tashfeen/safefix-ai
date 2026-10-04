import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold text-white">About SafeFix AI</h1>
      <div className="mt-6 space-y-5 text-[17px] leading-relaxed text-slate-300">
        <p>
          Most people who find a scorched socket, a leaking pipe or a cracked wall do not know how serious
          it is. They either ignore it or reach for a tutorial that assumes they can safely do the repair.
        </p>
        <p>
          SafeFix AI helps with the first question: how worried should I be? It uses Google Gemini to look
          at a photo, name the visible problem, rate the risk and explain what to do and what to avoid
          while you wait for help.
        </p>
      </div>

      <h2 className="mt-12 font-display text-2xl font-bold text-white">What it cannot do</h2>
      <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-300">
        <li className="border-l-2 border-orange-500 pl-4">
          It cannot see inside walls, pipes or appliances, so it can miss hidden problems.
        </li>
        <li className="border-l-2 border-orange-500 pl-4">
          It can be wrong. A clear photo and a good description help, but the result is guidance, not a
          diagnosis.
        </li>
        <li className="border-l-2 border-orange-500 pl-4">
          It is not a substitute for a licensed electrician, plumber, gas technician or engineer. In an
          emergency, leave the area and call your local emergency number.
        </li>
      </ul>

      <h2 className="mt-12 font-display text-2xl font-bold text-white">Privacy</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
        SafeFix AI has no accounts or database and does not store your photos or descriptions. They are
        sent through the app&apos;s server to the Gemini API to produce the analysis.
      </p>

      <div className="mt-10">
        <Link href="/analyze" className="btn-primary">
          Analyze a problem
        </Link>
      </div>
    </div>
  );
}
