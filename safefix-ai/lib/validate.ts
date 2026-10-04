import type { Assessment, RiskLevel } from "./types";

const LEVELS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function list(v: unknown): string[] {
  if (typeof v === "string") return v.trim() ? [v.trim()] : [];
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function bool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return null;
}

/** Returns a clean Assessment, or null if the data does not match the schema. */
export function validateAssessment(raw: unknown): Assessment | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;

  const riskLevel = str(r.riskLevel).toUpperCase() as RiskLevel;
  if (!LEVELS.includes(riskLevel)) return null;

  const problem = str(r.problem);
  const summary = str(r.summary);
  if (!problem || !summary) return null;

  let professionalHelp = bool(r.professionalHelp);
  if (professionalHelp === null) return null;
  // Safety floor: HIGH and CRITICAL always recommend a professional.
  if (riskLevel === "HIGH" || riskLevel === "CRITICAL") professionalHelp = true;

  return {
    problem,
    riskLevel,
    detectedHazards: list(r.detectedHazards),
    visualEvidence: list(r.visualEvidence),
    possibleCause: str(r.possibleCause),
    immediateSafetyAdvice: list(r.immediateSafetyAdvice),
    safeChecks: list(r.safeChecks),
    doNotAttempt: list(r.doNotAttempt),
    professionalHelp,
    professionalReason: str(r.professionalReason),
    summary,
  };
}
