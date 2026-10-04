import { NextResponse } from "next/server";
import { SYSTEM_INSTRUCTION, buildUserPrompt } from "@/lib/prompt";
import { validateAssessment } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function fail(status: number, code: string, error: string) {
  return NextResponse.json({ code, error }, { status });
}

function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fail(
      500,
      "MISSING_API_KEY",
      "The server is missing GEMINI_API_KEY. Add it to your environment variables and restart or redeploy."
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "BAD_REQUEST", "Could not read the upload. Please try again.");
  }

  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return fail(400, "NO_IMAGE", "Add a photo of the problem before analyzing.");
  }
  const mimeType = (image.type || "").toLowerCase();
  if (!ALLOWED_TYPES.has(mimeType)) {
    return fail(415, "INVALID_IMAGE", "Unsupported file type. Use a JPG, PNG, WebP or HEIC image.");
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return fail(413, "IMAGE_TOO_LARGE", "This image is too large. Use a photo under 4 MB.");
  }

  const rawDescription = form.get("description");
  const description =
    typeof rawDescription === "string" ? rawDescription.trim().slice(0, 1000) : "";

  const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: buildUserPrompt(description) },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      const detail = await res.json().catch(() => null);
      const message = String(detail?.error?.message ?? "");
      if (res.status === 400 && /api key/i.test(message)) {
        return fail(500, "INVALID_API_KEY", "The Gemini API key is invalid. Check GEMINI_API_KEY.");
      }
      if (res.status === 401 || res.status === 403) {
        return fail(502, "API_AUTH", "Gemini rejected the API key or the key cannot use this model.");
      }
      if (res.status === 404) {
        return fail(502, "API_MODEL", `Gemini model "${MODEL}" was not found. Check GEMINI_MODEL.`);
      }
      if (res.status === 429) {
        return fail(429, "RATE_LIMITED", "Gemini is rate-limiting requests. Wait a moment and try again.");
      }
      if (res.status === 400) {
        return fail(422, "INVALID_IMAGE", "Gemini could not process this image. Try a clearer JPG or PNG.");
      }
      return fail(502, "API_ERROR", `Gemini returned an error (${res.status}). Try again shortly.`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();

    if (data?.promptFeedback?.blockReason) {
      return fail(422, "BLOCKED", "Gemini declined to analyze this image. Try a different photo.");
    }
    const candidate = data?.candidates?.[0];
    const text: string = Array.isArray(candidate?.content?.parts)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        candidate.content.parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("").trim()
      : "";

    if (!text) {
      if (candidate?.finishReason === "SAFETY") {
        return fail(422, "BLOCKED", "Gemini declined to analyze this image. Try a different photo.");
      }
      return fail(502, "INVALID_RESPONSE", "Gemini returned an empty response. Please try again.");
    }

    const assessment = validateAssessment(extractJson(text));
    if (!assessment) {
      return fail(
        502,
        "INVALID_RESPONSE",
        "Gemini returned an answer in an unexpected format. Please try again."
      );
    }

    return NextResponse.json({ assessment, model: MODEL });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return fail(504, "TIMEOUT", "Gemini took too long to respond. Please try again.");
    }
    return fail(502, "NETWORK", "Could not reach Gemini from the server. Please try again.");
  } finally {
    clearTimeout(timeout);
  }
}
