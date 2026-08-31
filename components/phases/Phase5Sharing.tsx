"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, X, Share2, ArrowDown, Lightbulb } from "lucide-react";
import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import { SHARING_PATTERNS, SCENARIOS } from "@/lib/data";
import type { PhaseResult, SharingPatternId } from "@/types";

export default function Phase5Sharing({
  onComplete,
}: {
  onComplete: (r: PhaseResult) => void;
}) {
  const [patternTab, setPatternTab] = useState("full-isolation");
  const [answers, setAnswers] = useState<Record<number, SharingPatternId>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const correct = SCENARIOS.filter(
    (s) => answers[s.id] === s.correctPattern
  ).length;

  const select = (scenarioId: number, pattern: SharingPatternId) => {
    if (checked[scenarioId]) return; // locked
    setAnswers((prev) => ({ ...prev, [scenarioId]: pattern }));
  };

  const checkAnswer = (scenarioId: number) => {
    setChecked((prev) => ({ ...prev, [scenarioId]: true }));
  };

  const pattern = SHARING_PATTERNS.find((p) => p.id === patternTab)!;
  const allChecked = SCENARIOS.every((s) => checked[s.id]);
  const allCorrect = correct === SCENARIOS.length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
        <h2 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Phase 5: Context Sharing — How Agents Communicate
        </h2>
        <p className="text-sm text-foreground/80">
          Isolated agents need to share information. There are three main
          patterns for how context flows between agents. Learn them, then match
          each pattern to the right scenario.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Three Sharing Patterns</h3>
        </div>
        <div className="p-4">
          <Tabs
            tabs={SHARING_PATTERNS.map((p) => ({ id: p.id, label: p.name }))}
            activeTab={patternTab}
            onChange={setPatternTab}
            className="mb-4 flex-wrap"
          />

          <div className="flex items-start gap-3 mb-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: `${pattern.color}1a` }}
            >
              <Share2 className="h-5 w-5" style={{ color: pattern.color }} />
            </div>
            <div>
              <div className="text-base font-semibold" style={{ color: pattern.color }}>
                {pattern.fullName}
              </div>
              <p className="text-sm text-muted-foreground">{pattern.howItWorks}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 mb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Context Flow
            </div>
            <div className="space-y-3">
              {pattern.flow.map((stage, i) => (
                <div key={stage.name}>
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <span className="h-3 w-3 rounded-full mt-1" style={{ backgroundColor: stage.color }} />
                      {i < pattern.flow.length - 1 && <span className="w-0.5 flex-1 bg-border my-1" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{stage.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">{stage.totalIn}t</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {stage.inputs.map((input, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${
                              input.type === "summary"
                                ? "bg-purple-500/20 text-purple-400"
                                : input.type === "shared"
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {input.label}
                          </span>
                        ))}
                        {i < pattern.flow.length - 1 && <ArrowDown className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <FlowStat label="Total Tokens" value={`${pattern.totalTokens}t`} />
            <FlowStat label="Quality" value={`${pattern.quality}%`} />
            <FlowStat label="Latency" value={pattern.latency} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-green-400 mb-2">Advantages</div>
              <div className="space-y-1.5">
                {pattern.advantages.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <Check className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" /> {a}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-red-400 mb-2">Trade-offs</div>
              <div className="space-y-1.5">
                {pattern.tradeoffs.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">
              <strong className="text-foreground/80">Best for:</strong> {pattern.bestFor}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Scenario Challenge: Match the Pattern</h3>
          <span className="text-sm font-mono text-muted-foreground">{correct}/{SCENARIOS.length} correct</span>
        </div>
        <div className="space-y-5">
          {SCENARIOS.map((scenario) => {
            const answer = answers[scenario.id];
            const isChecked = checked[scenario.id];
            const isCorrect = answer === scenario.correctPattern;
            return (
              <div key={scenario.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded bg-cyan-500/20 text-cyan-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                    Scenario {scenario.id}
                  </span>
                  <span className="text-sm font-semibold">{scenario.title}</span>
                </div>
                <p className="text-xs text-foreground/70 mb-3">{scenario.context}</p>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Requirements
                </div>
                <div className="space-y-1 mb-3">
                  {scenario.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground shrink-0" /> {req}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {SHARING_PATTERNS.map((p) => {
                    const selected = answer === p.id;
                    const showAsCorrect = isChecked && p.id === scenario.correctPattern;
                    const showAsWrong = isChecked && selected && p.id !== scenario.correctPattern;
                    return (
                      <button
                        key={p.id}
                        onClick={() => select(scenario.id, p.id)}
                        disabled={isChecked}
                        className={`rounded-lg px-4 py-2 text-sm font-medium border cursor-pointer transition-colors ${
                          showAsCorrect
                            ? "border-green-500 bg-green-500/10 text-green-400"
                            : showAsWrong
                            ? "border-red-500 bg-red-500/10 text-red-400"
                            : selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-muted/30 text-foreground"
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
                {!isChecked ? (
                  <button
                    onClick={() => checkAnswer(scenario.id)}
                    disabled={!answer}
                    className={`text-sm font-medium px-4 py-2 rounded-lg cursor-pointer bg-primary text-primary-foreground ${!answer ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    Check answer
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-lg border p-3 text-xs ${
                      isCorrect
                        ? "border-green-500/30 bg-green-500/5 text-green-400"
                        : "border-orange-500/30 bg-orange-500/5 text-orange-300"
                    }`}
                  >
                    {isCorrect ? (
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <Check className="h-4 w-4" /> Correct!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <Lightbulb className="h-4 w-4" />
                        The best pattern is:{" "}
                        {SHARING_PATTERNS.find((p) => p.id === scenario.correctPattern)?.name}
                      </div>
                    )}
                    <p className="text-foreground/70">{scenario.explanation}</p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        {completed ? (
          <span className="text-sm text-green-400 flex items-center gap-2">
            <Check className="h-4 w-4" /> Phase completed
          </span>
        ) : allChecked ? (
          <Button
            onClick={() => {
              const score = Math.min(20, 5 * correct + (allCorrect ? 5 : 0));
              onComplete({
                phase: 5,
                score,
                maxScore: 20,
                summary: `Matched ${correct}/3 sharing patterns correctly`,
              });
              setCompleted(true);
            }}
          >
            Complete Phase 5
          </Button>
        ) : (
          <Button disabled>Answer all scenarios to continue</Button>
        )}
      </div>
    </div>
  );
}

function FlowStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
