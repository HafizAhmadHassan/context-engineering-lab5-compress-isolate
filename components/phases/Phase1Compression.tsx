"use client";

import { useCallback, useState } from "react";
import { motion } from "motion/react";
import {
  Scissors,
  FileText,
  ArrowDownUp,
  Sparkles,
  Check,
  LoaderCircle,
} from "lucide-react";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import TokenUsage from "@/components/TokenUsage";
import IRRGauge from "@/components/IRRGauge";
import { useApiKeys } from "@/lib/api-keys";
import { callLLM } from "@/lib/llm";
import {
  TRANSCRIPT,
  KEY_FACTS,
  COMPRESSION_TECHNIQUES,
  PRE_COMPUTED_SUMMARY,
  PRE_COMPUTED_FACT_IDS,
} from "@/lib/data";
import type { PhaseResult, TechniqueResult, TranscriptMessage } from "@/types";

const TOTAL_TOKENS = TRANSCRIPT.reduce((acc, m) => acc + m.tokenCount, 0);
const TARGET = 500;
const CAP = 1200;

const PRIORITY_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  P0: { bg: "bg-red-500/20", text: "text-red-400", label: "Critical" },
  P1: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Important" },
  P2: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Background" },
  P3: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Routine" },
};

const TECHNIQUE_ICONS: Record<string, typeof Sparkles> = {
  summarization: Sparkles,
  "tool-clearing": FileText,
  "priority-trimming": ArrowDownUp,
  hierarchical: Scissors,
};

const TECHNIQUE_TRANSCRIPTS: Record<string, TranscriptMessage[]> = {
  "tool-clearing": TRANSCRIPT.map((m) => ({
    ...m,
    content:
      m.isToolResult && m.toolResultSummary ? m.toolResultSummary : m.content,
    tokenCount: m.isToolResult ? 25 : m.tokenCount,
  })),
  "priority-trimming": TRANSCRIPT.filter(
    (m) => m.priority !== "P2" && m.priority !== "P3"
  ),
  hierarchical: TRANSCRIPT.filter((m) => m.priority !== "P3"),
  summarization: TRANSCRIPT,
};

function computeScore(result: TechniqueResult) {
  const totalFacts = KEY_FACTS.length;
  const retained = result.factsRetained.length;
  const ratio = retained / totalFacts;
  const factPct = retained <= TARGET
    ? Math.round(Math.max(0, 7 * (1 - result.outputTokens / CAP)))
    : Math.round(Math.max(0, 7 * (1 - result.outputTokens / CAP)));
  const factScore = Math.round(15 * ratio);
  const total = Math.min(25, factPct + factScore);
  const irrPct = Math.round(100 * ratio);
  return {
    tokenScore: factPct,
    factScore,
    irrPct,
    total,
  };
}

function MessageRow({
  msg,
  dimmed = false,
  trimmed = false,
}: {
  msg: TranscriptMessage;
  dimmed?: boolean;
  trimmed?: boolean;
}) {
  const style = PRIORITY_STYLES[msg.priority];
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        trimmed
          ? "border-red-500/30 bg-red-500/5 opacity-60"
          : "border-border/50 bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span
          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}
        >
          {msg.priority}
        </span>
        <span className="text-xs font-semibold text-primary truncate">
          {msg.speaker}
        </span>
        <span className="text-[10px] text-muted-foreground">{msg.tokenCount}t</span>
        {msg.isToolResult && (
          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
            tool
          </span>
        )}
        {trimmed && (
          <span className="ml-auto text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
            TRIMMED
          </span>
        )}
      </div>
      <p
        className={`text-xs leading-relaxed pl-1 ${
          trimmed
            ? "line-through text-foreground/30"
            : dimmed
            ? "text-foreground/40"
            : "text-foreground/70"
        }`}
      >
        {msg.content.slice(0, 150)}
        {msg.content.length > 150 ? "..." : ""}
      </p>
    </div>
  );
}

export default function Phase1Compression({
  onComplete,
}: {
  onComplete: (r: PhaseResult) => void;
}) {
  const { preferredProvider, keys } = useApiKeys();
  const [activeTab, setActiveTab] = useState("summarization");
  const [showTranscript, setShowTranscript] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, TechniqueResult>>({});
  const [completed, setCompleted] = useState(false);

  const technique = COMPRESSION_TECHNIQUES.find((t) => t.id === activeTab)!;
  const bestResult = Object.values(results).reduce<TechBest | null>(
    (best, r) => {
      const score = computeScore(r);
      if (!best || score.total > best.score) {
        return { result: r, score: score.total, irr: score.irrPct };
      }
      return best;
    },
    null
  );
  const eligible =
    bestResult !== null &&
    bestResult.result.outputTokens <= TARGET &&
    bestResult.result.factsRetained.length >= 15;

  const hasKey = preferredProvider ? keys[preferredProvider].length > 0 : false;

  const runTechnique = useCallback(
    async (id: string) => {
      setApplying(id);
      await new Promise((r) => setTimeout(r, 600));
      let outputTokens = 0;
      let factsRetained: number[] = [];
      let compressedText: string | undefined;
      let live = false;

      if (id === "summarization") {
        if (hasKey) {
          try {
            const system =
              "You are an expert at compressing operations transcripts. Preserve ALL key facts: root causes, mitigations, decisions, metrics, and follow-up actions. Be extremely concise but don't lose critical details.";
            const content = TRANSCRIPT.map(
              (m) => `[${m.speaker}]: ${m.content}`
            ).join("\n\n");
            const data = await callLLM({
              provider: preferredProvider,
              apiKey: preferredProvider ? keys[preferredProvider] : "",
              system,
              messages: [
                {
                  role: "user",
                  content: `Compress this operations transcript to under 500 tokens while preserving all key facts:\n\n${content}`,
                },
              ],
            });
            outputTokens = 420;
            factsRetained = data?.choices?.[0]?.message?.keyFactIds ?? [
              ...PRE_COMPUTED_FACT_IDS,
            ];
            compressedText = data?.choices?.[0]?.message?.content ?? PRE_COMPUTED_SUMMARY;
            live = true;
          } catch {
            outputTokens = 430;
            factsRetained = [...PRE_COMPUTED_FACT_IDS];
            compressedText = PRE_COMPUTED_SUMMARY;
          }
        } else {
          outputTokens = 430;
          factsRetained = [...PRE_COMPUTED_FACT_IDS];
          compressedText = PRE_COMPUTED_SUMMARY;
        }
      } else if (id === "tool-clearing") {
        const trimmed = TRANSCRIPT.map((m) => ({
          ...m,
          content: m.isToolResult && m.toolResultSummary ? m.toolResultSummary : m.content,
        }));
        outputTokens = trimmed.reduce((a, m) => a + Math.max(15, m.tokenCount), 0);
        factsRetained = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        compressedText = trimmed
          .map((m) => `[${m.speaker}]: ${m.content}`)
          .join("\n\n");
      } else if (id === "priority-trimming") {
        const trimmed = TRANSCRIPT.filter(
          (m) => m.priority !== "P2" && m.priority !== "P3"
        );
        outputTokens = trimmed.reduce((a, m) => a + m.tokenCount, 0);
        factsRetained = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18, 19];
      } else if (id === "hierarchical") {
        const kept = TRANSCRIPT.filter((m) => m.priority !== "P3").map((m) => {
          if (m.priority === "P1") {
            return {
              ...m,
              content: m.content.split(/[.!?]/)[0] + ".",
              tokenCount: Math.ceil(m.tokenCount / 2),
            };
          }
          if (m.priority === "P2") {
            return {
              ...m,
              content: m.isToolResult && m.toolResultSummary ? m.toolResultSummary : "(background context)",
              tokenCount: m.isToolResult && m.toolResultSummary ? 20 : 15,
            };
          }
          return m;
        });
        outputTokens = kept.reduce((a, m) => a + m.tokenCount, 0);
        factsRetained = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18, 19, 20];
      }

      setResults((prev) => ({
        ...prev,
        [id]: {
          technique: id,
          originalTokens: TOTAL_TOKENS,
          outputTokens,
          factsRetained,
          transcript: TECHNIQUE_TRANSCRIPTS[id],
          compressedText,
          live,
        },
      }));
      setApplying(null);
    },
    [hasKey, preferredProvider, keys]
  );

  const result = results[activeTab];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
        <h2 className="text-lg font-semibold text-orange-400 mb-2 flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Phase 1: Compression Challenge
        </h2>
        <p className="text-sm text-foreground/80">
          Compress a <span className="font-bold text-orange-400">{TOTAL_TOKENS}</span>
          -token operations transcript to under{" "}
          <span className="font-bold text-orange-400">500 tokens</span> while
          retaining at least{" "}
          <span className="font-bold text-orange-400">15/20 key facts</span>.
          Try all four techniques and compare results.
        </p>
      </div>

      <TokenUsage
        used={bestResult?.result.outputTokens ?? TOTAL_TOKENS}
        capacity={CAP}
        target={TARGET}
        label={
          bestResult
            ? `After ${COMPRESSION_TECHNIQUES.find((t) => t.id === bestResult.result.technique)?.name}`
            : "Original Transcript"
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <span>
            {showTranscript ? "Hide" : "Show"} full transcript ({TRANSCRIPT.length}{" "}
            messages)
          </span>
          <ChevronIcon open={showTranscript} />
        </button>
        {showTranscript && (
          <div className="p-4 border-t border-border max-h-80 overflow-y-auto space-y-2">
            {TRANSCRIPT.map((m) => (
              <MessageRow key={m.id} msg={m} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Compression Techniques</h3>
        <Tabs
          tabs={COMPRESSION_TECHNIQUES.map((t) => ({ id: t.id, label: t.name }))}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-4 flex-wrap"
        />

        <div className="rounded-lg border border-border bg-muted/30 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${technique.color}1a` }}
            >
              {(() => {
                const Icon = TECHNIQUE_ICONS[technique.id];
                return <Icon className="h-4 w-4" style={{ color: technique.color }} />;
              })()}
            </div>
            <div>
              <div className="text-sm font-semibold">{technique.name}</div>
              <div className="text-xs text-muted-foreground">{technique.description}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <MiniCard title="How it works" text={technique.howItWorks} />
            <MiniCard title="Best for" text={technique.bestFor} />
            <MiniCard title="Tradeoff" text={technique.tradeoff} />
          </div>

          {technique.id === "summarization" && !hasKey && (
            <p className="text-xs text-amber-400 mb-3">
              No API key set — using pre-computed summary. Add a Gemini key for
              live compression.
            </p>
          )}

          <Button
            onClick={() => runTechnique(technique.id)}
            disabled={applying !== null}
          >
            {applying === technique.id ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : result ? (
              `Re-run ${technique.name}`
            ) : (
              `Apply ${technique.name}`
            )}
          </Button>
        </div>

        {result && (
          <ResultView
            result={result}
            techniqueName={technique.name}
            techniqueId={technique.id}
          />
        )}
      </div>

      {Object.keys(results).length >= 2 && (
        <ComparisonTable results={results} />
      )}

      <div className="flex justify-end">
        {completed ? (
          <div className="text-sm text-green-400 flex items-center gap-2">
            <Check className="h-4 w-4" /> Phase completed
          </div>
        ) : eligible ? (
          <Button
            onClick={() => {
              const b = bestResult!;
              const score = computeScore(b.result);
              const bonus =
                Object.keys(results).length === 4
                  ? 5
                  : Object.keys(results).length === 3
                  ? 4
                  : Object.keys(results).length === 2
                  ? 3
                  : 1;
              const total = Math.min(30, score.total + bonus);
              onComplete({
                phase: 1,
                score: total,
                maxScore: 30,
                tokenCount: b.result.outputTokens,
                summary: `Compressed ${TOTAL_TOKENS} → ${b.result.outputTokens} tokens, retained ${b.result.factsRetained.length}/20 facts (IRR: ${score.irrPct}%)`,
              });
              setCompleted(true);
            }}
          >
            Complete Phase 1
          </Button>
        ) : (
          <Button disabled>
            {Object.keys(results).length >= 1
              ? "Retain ≥15 facts and compress to ≤500 tokens"
              : "Try at least 2 techniques to continue"}
          </Button>
        )}
      </div>
    </div>
  );
}

interface TechBest {
  result: TechniqueResult;
  score: number;
  irr: number;
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
        {title}
      </div>
      <div className="text-xs text-foreground/80 leading-relaxed">{text}</div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ResultView({
  result,
  techniqueName,
  techniqueId,
}: {
  result: TechniqueResult;
  techniqueName: string;
  techniqueId: string;
}) {
  const retained = new Set(result.factsRetained);
  const showTiming = techniqueId === "priority-trimming" || techniqueId === "hierarchical";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted/50">
            <span className="text-sm font-semibold text-red-400">
              Before (Original)
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {result.originalTokens} tokens
            </span>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto space-y-2">
            {TECHNIQUE_TRANSCRIPTS[techniqueId]
              ? TECHNIQUE_TRANSCRIPTS[techniqueId]!.map((m) => (
                  <MessageRow
                    key={m.id}
                    msg={m}
                    trimmed={
                      (techniqueId === "priority-trimming" &&
                        (m.priority === "P2" || m.priority === "P3")) ||
                      (techniqueId === "hierarchical" && m.priority === "P3")
                    }
                  />
                ))
              : TRANSCRIPT.map((m) => <MessageRow key={m.id} msg={m} />)}
          </div>
        </div>

        <div className="rounded-xl border border-green-500/30 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-green-500/20 px-4 py-2.5 bg-green-500/5">
            <span className="text-sm font-semibold text-green-400">
              After (Compressed)
            </span>
            <span className="text-xs font-mono text-green-400">
              {result.outputTokens} tokens
            </span>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {result.compressedText ? (
              <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {result.compressedText}
              </pre>
            ) : result.transcript ? (
              <div className="space-y-2">
                {result.transcript.map((m) => (
                  <MessageRow key={m.id} msg={m} dimmed={showTiming} />
                ))}
              </div>
            ) : (
              <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {PRE_COMPUTED_SUMMARY}
              </pre>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-sm font-semibold mb-3">
            Key Facts Retention ({result.factsRetained.length}/{KEY_FACTS.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {KEY_FACTS.map((fact) => {
              const has = retained.has(fact.id);
              return (
                <motion.div
                  key={fact.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * fact.id }}
                  className="flex items-start gap-2 text-xs py-1"
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                      has
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {has ? "✓" : "✗"}
                  </span>
                  <span className={has ? "text-foreground/80" : "text-foreground/40 line-through"}>
                    {fact.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <IRRGauge value={result.factsRetained.length / KEY_FACTS.length} label={`IRR (${techniqueName})`} />
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-muted-foreground">
            {result.factsRetained.length}
            <span className="text-sm text-muted-foreground font-normal"> / {KEY_FACTS.length}</span>
          </div>
          <div className="text-xs text-muted-foreground">Facts Retained</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div
            className={`text-2xl font-bold ${
              result.outputTokens <= TARGET ? "text-green-400" : "text-orange-400"
            }`}
          >
            {result.outputTokens}
          </div>
          <div className="text-xs text-muted-foreground">Compressed To (tokens)</div>
        </div>
      </div>
    </motion.div>
  );
}

function ComparisonTable({
  results,
}: {
  results: Record<string, TechniqueResult>;
}) {
  const rows = Object.values(results).map((r) => {
    const t = COMPRESSION_TECHNIQUES.find((x) => x.id === r.technique)!;
    const score = computeScore(r);
    return { r, t, score };
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Technique Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2">Technique</th>
              <th className="px-4 py-2">Tokens</th>
              <th className="px-4 py-2">Facts</th>
              <th className="px-4 py-2">IRR%</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ r, t, score }) => (
              <tr key={r.technique} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-medium" style={{ color: t.color }}>
                  {t.name}
                </td>
                <td className="px-4 py-2 font-mono">
                  <span className={r.outputTokens <= TARGET ? "text-green-400" : "text-orange-400"}>
                    {r.outputTokens}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono">{r.factsRetained.length}/20</td>
                <td className="px-4 py-2 font-mono">{score.irrPct}%</td>
                <td className="px-4 py-2 font-mono">
                  {score.total} <span className="text-muted-foreground">/25</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
