"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import type { Assessment, ChatMessage } from "@/lib/types";

interface Props {
  assessment: Assessment;
  previewUrl: string | null;
  imageBase64?: string | null;
  isDemo?: boolean;
}

const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  CRITICAL: [
    "Where is the main shutoff valve or circuit breaker?",
    "Is it safe to stay in the room overnight?",
    "What specific details should I give the emergency service?",
    "Can I touch the area if I wear thick rubber gloves?",
  ],
  HIGH: [
    "Can I use electrical tape or sealant as a temporary fix?",
    "How do I safely isolate this circuit or pipe?",
    "What tools and questions should I ask an electrician/plumber?",
    "Is it safe to use other outlets on the same circuit?",
  ],
  MEDIUM: [
    "What is the risk if I wait a few days before fixing this?",
    "What safety gear do I need before taking a closer look?",
    "Could this cause water or fire damage behind the wall?",
    "How much does a typical repair like this cost?",
  ],
  LOW: [
    "What basic tools and supplies are required for this repair?",
    "Step-by-step instructions for inspecting this safely",
    "How can I prevent this issue from happening again?",
    "Should I still get a handyman to double-check this?",
  ],
};

function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-[14px] leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Caution / Warning block
        if (trimmed.startsWith("⚠️") || trimmed.startsWith("🚨") || trimmed.startsWith("🛡️") || trimmed.startsWith("⚡")) {
          return (
            <div
              key={idx}
              className="my-2 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 p-2.5 text-amber-200"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>{renderFormattedText(trimmed)}</div>
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              <span>{renderFormattedText(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-semibold text-brand-300">{numMatch[1]}.</span>
              <span>{renderFormattedText(numMatch[2])}</span>
            </div>
          );
        }

        // Standard line
        return <p key={idx}>{renderFormattedText(trimmed)}</p>;
      })}
    </div>
  );
}

function renderFormattedText(text: string) {
  // Parse **bold** and *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export function FollowUpChat({ assessment, previewUrl, imageBase64, isDemo = false }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions =
    DEFAULT_SUGGESTIONS[assessment.riskLevel] || DEFAULT_SUGGESTIONS["MEDIUM"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean emojis and markdown characters for cleaner audio reading
    const clean = text
      .replace(/[*#_`~]/g, "")
      .replace(/[⚠️🚨🛡️⚡📞]/g, "");

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (contentToSend?: string) => {
    const text = (contentToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          assessment,
          imageBase64: imageBase64 || null,
          isDemo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Unable to get response from Gemini");
      }

      const assistantMessage: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.reply || "No response received.",
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: `⚠️ ${err instanceof Error ? err.message : "Something went wrong while connecting to Gemini."}`,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="card overflow-hidden border border-brand-500/20 bg-navy-900/90 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-navy-800/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 border border-brand-400/30 shadow-inner">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-white">Interactive Safety Assistant</h3>
              <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Context
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ask clarifying questions regarding <strong className="text-slate-300">{assessment.problem}</strong>
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear conversation
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex min-h-[220px] max-h-[500px] flex-col overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center justify-center text-center px-4 py-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-brand-400 border border-white/10">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="font-display text-sm font-semibold text-white">
              Have questions about this safety diagnosis?
            </h4>
            <p className="mt-1 max-w-md text-xs text-slate-400">
              Ask anything about shutoff procedures, temporary hazard isolation, contractor questions, or tools.
            </p>

            {/* Suggestions Chips */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-xl">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-white/10 bg-navy-800/90 px-3 py-1.5 text-xs text-slate-300 hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-white transition-all text-left"
                >
                  💬 {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400 border border-brand-400/30">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`relative max-w-[85%] rounded-2xl p-4 ${
                    isUser
                      ? "bg-brand-600 text-white rounded-tr-sm shadow-md"
                      : "bg-navy-800/90 border border-white/10 text-slate-200 rounded-tl-sm"
                  }`}
                >
                  {isUser ? (
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <>
                      <SimpleMarkdown text={msg.content} />
                      <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/10 pt-2 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          title={speakingId === msg.id ? "Stop voice reading" : "Read response aloud"}
                          className="flex items-center gap-1 text-xs hover:text-white transition-colors"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                              <span className="text-amber-300">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                        <span className="text-white/20">|</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response text"
                          className="flex items-center gap-1 text-xs hover:text-white transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400 border border-brand-400/30">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-navy-800/90 border border-white/10 px-4 py-3 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
              <span>Gemini is evaluating safety steps...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-ups after conversation starts */}
      {messages.length > 0 && !loading && (
        <div className="flex items-center gap-2 overflow-x-auto px-5 py-2 border-t border-white/5 bg-navy-950/40 text-xs text-slate-400 scrollbar-none">
          <span className="shrink-0 flex items-center gap-1 font-medium text-slate-400">
            <HelpCircle className="h-3.5 w-3.5 text-brand-400" /> Quick Ask:
          </span>
          {suggestions.slice(0, 2).map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(s)}
              className="shrink-0 rounded-full border border-white/10 bg-navy-800 px-2.5 py-1 text-slate-300 hover:border-brand-400/40 hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="border-t border-white/10 bg-navy-800/60 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask a follow-up question (e.g., 'Can I use electrical tape?')"
              className="w-full resize-none rounded-xl border border-white/15 bg-navy-950/80 px-4 py-3 text-[14px] text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none max-h-32 min-h-[46px]"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            title="Send message"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Always prioritize immediate physical safety. Never touch live electrical or gas hazards.
        </p>
      </div>
    </section>
  );
}
