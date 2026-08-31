"use client";

import { motion } from "motion/react";
import { Trophy, ArrowRight, BookOpen, Lightbulb } from "lucide-react";
import Button from "@/components/Button";
import { GRADE_PHASE_NAMES, TAKEAWAYS } from "@/lib/data";
import type { PhaseResult } from "@/types";

function gradeFromPct(pct: number) {
  if (pct >= 95) return { letter: "A+", color: "#22c55e" };
  if (pct >= 85) return { letter: "A", color: "#22c55e" };
  if (pct >= 75) return { letter: "B+", color: "#84cc16" };
  if (pct >= 65) return { letter: "B", color: "#f59e0b" };
  if (pct >= 55) return { letter: "C", color: "#f97316" };
  return { letter: "D", color: "#ef4444" };
}

export default function Phase7Synthesis({ scores }: { scores: PhaseResult[] }) {
  const maxTotal = GRADE_PHASE_NAMES.reduce((a, p) => a + p.maxScore, 0);
  const total = scores.reduce((a, s) => a + s.score, 0);
  const pct = Math.round((total / maxTotal) * 100);
  const { letter, color } = gradeFromPct(pct);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <div className="flex flex-col items-center mb-4">
          <Trophy className="h-8 w-8 text-amber-400 mb-3" />
          <h2 className="text-2xl font-bold mb-6">Session 5 Results</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
          <div className="relative" style={{ width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="62" fill="none" stroke="var(--border)" strokeWidth="10" />
              <motion.circle
                cx="70"
                cy="70"
                r="62"
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 62}
                initial={{ strokeDashoffset: 2 * Math.PI * 62 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 62 * (1 - pct / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
                transform={`rotate(-90 70 70)`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color }}>{letter}</span>
              <span className="text-sm text-muted-foreground">{pct}%</span>
            </div>
          </div>
          <div className="text-left">
            <div className="text-4xl font-bold">{total}</div>
            <div className="text-sm text-muted-foreground">
              Total Points <span className="text-muted-foreground">/ {maxTotal}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {GRADE_PHASE_NAMES.map((phase, idx) => {
            const result = scores.find((s) => s.phase === idx + 1);
            const score = result?.score ?? 0;
            const p = (score / phase.maxScore) * 100;
            return (
              <div key={phase.name} className="rounded-lg border border-border bg-muted/30 p-4 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">Phase {idx + 1}: {phase.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {score}/{phase.maxScore}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: result ? PHASE_COLORS[idx] : "transparent" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {result?.summary ?? "Not completed"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
        <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" /> Key Takeaways
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TAKEAWAYS.map((t, idx) => (
            <div key={t.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: t.color }}
              >
                {idx + 1}
              </span>
              <p className="text-xs text-foreground/80 leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Token Budgeting Models</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-4">
            <div className="text-sm font-semibold mb-3">40-40-20 Rule</div>
            <div className="flex h-3 w-full rounded-full overflow-hidden mb-3">
              <div className="w-[40%] bg-red-500" />
              <div className="w-[40%] bg-blue-500" />
              <div className="w-[20%] bg-green-500" />
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" /> 40% System prompt / tools / instructions</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> 40% Conversation history + tool results</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" /> 20% Reserved for model response</div>
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="text-sm font-semibold mb-3">Context Pyramid</div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" /> Top: System instructions (never remove)</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> Mid: Active conversation (compress oldest)</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" /> Base: Retrieved knowledge (refresh as needed)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-300">What&apos;s Next</div>
            <p className="text-sm text-foreground/80 leading-snug">
              Session 6: Memory Architectures — conversation memory, semantic
              memory, and persistent knowledge stores
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex justify-center">
        <Button href="/quiz">
          Take the Session 5 Quiz
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const PHASE_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6", "#06b6d4", "#ec4899"];
