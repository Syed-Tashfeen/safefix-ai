import Link from "next/link";
import { ArrowDown } from "lucide-react";

const FLOW = [
  { title: "User", text: "Photo + description" },
  { title: "Web application", text: "Resizes the photo in your browser and sends it with your note." },
  { title: "Secure API", text: "A server route (/api/analyze) makes the Gemini request. The API key never reaches the browser." },
  { title: "Google Gemini", text: "Receives the image and the text together in a single multimodal request." },
  { title: "Multimodal analysis", text: "Reads what is visible in the photo alongside what you wrote." },
  { title: "Safety assessment", text: "Returns structured JSON with risk level, hazards and advice. It is validated before display." },
  { title: "Actionable result", text: "Clear next steps, a do-not-attempt list and a call on professional help." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold text-white">How SafeFix AI works</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-300">
        Gemini is the core intelligence of the app. It looks at your photo and reads your description in
        one request, so the answer is based on what is actually in the picture.
      </p>

      <ol className="mt-12">
        {FLOW.map((step, i) => (
          <li key={step.title}>
            <div className="card px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-white">{step.title}</h2>
              <p className="mt-1 text-[15px] text-slate-300">{step.text}</p>
            </div>
            {i < FLOW.length - 1 && (
              <div className="grid h-10 place-items-center text-brand-400" aria-hidden="true">
                <ArrowDown className="h-5 w-5" />
              </div>
            )}
          </li>
        ))}
      </ol>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-white">Why Gemini</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-300">
          <p>
            Troubleshooting a home problem depends on seeing it: scorch marks, a crack, water staining, a
            frayed cable. Gemini&apos;s multimodal vision lets one model read the image and the user&apos;s
            words together, instead of relying on a text description alone.
          </p>
          <p>
            SafeFix AI asks Gemini for a strict JSON structure, then checks that structure on the server
            before anything is shown. If the response is malformed, you see an error instead of a guess.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-white">Safety guardrails</h2>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-300">
          <li className="border-l-2 border-orange-500 pl-4">
            No DIY instructions for electrical, gas, fire or structural problems.
          </li>
          <li className="border-l-2 border-orange-500 pl-4">
            High and critical results always recommend a qualified professional and tell you not to touch
            the hazard.
          </li>
          <li className="border-l-2 border-brand-500 pl-4">
            Hedged wording based on visible evidence, with a request for a clearer photo when the image is
            unclear.
          </li>
        </ul>
      </section>

      <div className="mt-12">
        <Link href="/analyze" className="btn-primary">
          Analyze a problem
        </Link>
      </div>
    </div>
  );
}
