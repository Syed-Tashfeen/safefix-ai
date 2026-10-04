export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Assessment {
  problem: string;
  riskLevel: RiskLevel;
  detectedHazards: string[];
  visualEvidence: string[];
  possibleCause: string;
  immediateSafetyAdvice: string[];
  safeChecks: string[];
  doNotAttempt: string[];
  professionalHelp: boolean;
  professionalReason: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

