import type { RiskLevel } from "./types";

export const RISK_STYLES: Record<
  RiskLevel,
  { label: string; text: string; bg: string; border: string; bar: string; level: number }
> = {
  LOW: {
    label: "Low",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/30",
    bar: "bg-emerald-400",
    level: 1,
  },
  MEDIUM: {
    label: "Medium",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-400/30",
    bar: "bg-amber-400",
    level: 2,
  },
  HIGH: {
    label: "High",
    text: "text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-400/40",
    bar: "bg-orange-500",
    level: 3,
  },
  CRITICAL: {
    label: "Critical",
    text: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-400/40",
    bar: "bg-red-500",
    level: 4,
  },
};
