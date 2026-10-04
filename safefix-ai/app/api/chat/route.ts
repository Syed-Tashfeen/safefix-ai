import { NextResponse } from "next/server";
import type { Assessment, ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  assessment: Assessment;
  imageBase64?: string | null;
  mimeType?: string | null;
  isDemo?: boolean;
}

function buildChatSystemInstruction(assessment: Assessment): string {
  return `You are SafeFix AI Assistant, an expert, calm, and safety-first home troubleshooting specialist.
The user is asking follow-up questions about a household safety assessment that was previously diagnosed from a photo.

Initial Diagnosis Context:
- Problem: ${assessment.problem}
- Risk Level: ${assessment.riskLevel}
- Detected Hazards: ${assessment.detectedHazards.join(", ")}
- Visual Evidence: ${assessment.visualEvidence.join(", ")}
- Possible Cause: ${assessment.possibleCause}
- Immediate Safety Advice: ${assessment.immediateSafetyAdvice.join("; ")}
- Safe Checks: ${assessment.safeChecks.join("; ")}
- Do NOT Attempt: ${assessment.doNotAttempt.join("; ")}
- Professional Help Needed: ${assessment.professionalHelp ? `Yes (${assessment.professionalReason})` : "No"}
- Summary: ${assessment.summary}

Critical Safety Rules:
1. NEVER instruct the user to touch, disassemble, or tamper with dangerous live components (especially exposed electrical wiring, high-voltage breaker panels, leaking gas pipes, active burning/smoking items, or water near active electrical outlets).
2. If the risk level is HIGH or CRITICAL, strongly reinforce that professional inspection or utility shutoff is necessary before any physical interaction.
3. If the user asks whether a temporary "hack" (e.g., using tape, glue, or paper) is safe, evaluate it strictly from an engineering & fire safety standard and warn them against fire/shock hazards.
4. Give clear, concise, actionable, and reassuring guidance.
5. Answer specific follow-up questions directly, such as how to locate main shutoffs safely, what to tell an emergency contractor or electrician, or temporary containment precautions.
6. Use clean Markdown with short bullet points, bold key terms, and cautionary highlights.`;
}

function getDemoResponse(userQuery: string, assessment: Assessment): string {
  const q = userQuery.toLowerCase();
  if (q.includes("tape") || q.includes("temporary") || q.includes("electrical tape")) {
    return `⚠️ **Do NOT use electrical tape on this scorched outlet.**\n\nElectrical tape cannot insulate against internal arc damage, carbon tracking, or overheating terminals. Since the outlet shows thermal scorch marks, wrapping it in tape will trap heat and may ignite, creating a severe fire hazard.\n\n**What you should do instead:**\n- Keep appliances unplugged from this outlet.\n- Turn off the breaker controlling this circuit at your main panel.\n- Leave it untouched until a licensed electrician replaces the outlet receptacle and inspects the wire terminations.`;
  }
  if (q.includes("shutoff") || q.includes("breaker") || q.includes("main switch") || q.includes("turn off")) {
    return `⚡ **How to safely isolate this circuit:**\n\n1. **Locate your main electrical panel** (usually in a basement, garage, hallway, or utility closet).\n2. **Identify the breaker** labeled for the room or area containing this outlet.\n3. **Switch the breaker firmly to OFF**.\n4. If the breakers are not labeled, or if you notice any buzzing or burning odor near the panel, turn off the **Main Breaker** or call an electrician immediately.\n\n*Safety tip: Make sure your hands and the floor in front of the breaker panel are completely dry.*`;
  }
  if (q.includes("contractor") || q.includes("electrician") || q.includes("technician") || q.includes("tell")) {
    return `📞 **What to tell your licensed electrician:**\n\n- *"I have a wall outlet that produced sparks and visible black scorch marks on the faceplate and terminal slots."*\n- *"I have disconnected the power to this circuit."*\n- *"I need an inspection of the internal receptacle wiring, box ground, and thermal damage assessment."*\n\nHaving your SafeFix report details ready will help them arrive with the correct replacement parts.`;
  }
  if (q.includes("safe") || q.includes("overnight") || q.includes("leave")) {
    return `🛡️ **Leaving this overnight:**\n\nAs long as the **circuit breaker is switched OFF** and no appliances are plugged in, it is safe to leave overnight until an electrician arrives.\n\n**Precautions:**\n- Ensure pets and children cannot touch or play near the socket.\n- If you smell burning plastic or hear buzzing even after turning off the breaker, isolate the main panel immediately.`;
  }
  return `Thank you for asking. Based on the diagnosis for **${assessment.problem}** (Risk Level: **${assessment.riskLevel}**):\n\n- **Safety Status:** Please do not attempt direct contact or physical repair on scorched or high-risk components.\n- **Recommended Next Step:** Ensure the circuit breaker remains switched off and schedule an inspection with a licensed professional.\n\nFeel free to ask more specific questions about safety shutoffs, temporary precautions, or finding a technician!`;
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { messages, assessment, imageBase64, mimeType, isDemo } = body;

  if (!assessment || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing assessment or chat messages" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const lastUserMsg = messages[messages.length - 1]?.content || "";

  // If demo mode or no API key, provide smart contextual mock responses
  if (isDemo || !apiKey) {
    const reply = getDemoResponse(lastUserMsg, assessment);
    return NextResponse.json({ reply });
  }

  const systemInstruction = buildChatSystemInstruction(assessment);

  // Format messages into Gemini contents structure
  const contents = [];

  // Turn 1: User's initial diagnosis context + optional image
  const initialParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    {
      text: `Context: Household safety diagnosis for "${assessment.problem}".\nSummary: ${assessment.summary}\nRisk: ${assessment.riskLevel}`,
    },
  ];

  if (imageBase64) {
    const rawB64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
    initialParts.push({
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: rawB64,
      },
    });
  }

  contents.push({
    role: "user",
    parts: initialParts,
  });

  contents.push({
    role: "model",
    parts: [
      {
        text: `Understood. I am SafeFix AI Assistant. I have analyzed the safety assessment for "${assessment.problem}" and the visual evidence. I will provide accurate, safe, and actionable follow-up guidance.`,
      },
    ],
  });

  // Append user/assistant turns
  for (const msg of messages) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  const geminiBody = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(geminiBody),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      const message = String(detail?.error?.message ?? "");
      if (res.status === 400 && /api key/i.test(message)) {
        return NextResponse.json({ error: "Invalid Gemini API key. Check GEMINI_API_KEY." }, { status: 500 });
      }
      if (res.status === 429) {
        return NextResponse.json({ error: "Gemini is currently rate-limited. Please try again in a moment." }, { status: 429 });
      }
      return NextResponse.json({ error: `Gemini API returned an error (${res.status}).` }, { status: 502 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const candidate = data?.candidates?.[0];
    const text: string = Array.isArray(candidate?.content?.parts)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candidate.content.parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("").trim()
      : "";

    if (!text) {
      return NextResponse.json({ error: "Gemini did not return a response. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ reply: text });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out waiting for Gemini." }, { status: 504 });
    }
    return NextResponse.json({ error: "Failed to connect to Gemini API." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
