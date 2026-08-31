"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, RotateCcw, Play, Lightbulb, Users } from "lucide-react";
import Button from "@/components/Button";
import {
  CONTEXT_ITEMS,
  CONTEXT_CATEGORY_COLORS,
  ISOLATION_AGENTS,
  ISOLATION_FINDINGS,
  NAIVE_BASELINE,
  SOLUTION_RATIONALES,
  EXCLUSION_RATIONALES,
} from "@/lib/data";
import type { PhaseResult } from "@/types";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
};

export default function Phase4Isolation({
  onComplete,
}: {
  onComplete: (r: PhaseResult) => void;
}) {
  const baseIds = ["system-prompt", "task-briefing"];
  const specialized = CONTEXT_ITEMS.filter((i) => !baseIds.includes(i.id));

  const [assigned, setAssigned] = useState<Record<string, string[]>>({
    "order-flow": [...baseIds],
    "delivery-ops": [...baseIds],
    "customer-exp": [...baseIds],
  });
  const [showSolution, setShowSolution] = useState(false);
  const [ranAll, setRanAll] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const [completed, setCompleted] = useState(false);

  const toggle = (contextId: string, agentId: string) => {
    setAssigned((prev) => {
      const arr = prev[agentId];
      const next = arr.includes(contextId)
        ? arr.filter((c) => c !== contextId)
        : [...arr, contextId];
      return { ...prev, [agentId]: next };
    });
  };

  const assignOptimal = (agentId: string) => {
    const agent = ISOLATION_AGENTS.find((a) => a.id === agentId)!;
    setAssigned((prev) => ({
      ...prev,
      [agentId]: [...agent.optimalContextIds],
    }));
  };

  const assignAllOptimal = () => {
    const next: Record<string, string[]> = {};
    for (const agent of ISOLATION_AGENTS) {
      next[agent.id] = [...agent.optimalContextIds];
    }
    setAssigned(next);
  };

  const reset = () => {
    const next: Record<string, string[]> = {};
    for (const agent of ISOLATION_AGENTS) {
      next[agent.id] = [...baseIds];
    }
    setAssigned(next);
    setRanAll(false);
    setShowSolution(false);
  };

  const poolTotal = CONTEXT_ITEMS.reduce((a, i) => a + i.tokenCount, 0);

  const tokenByAgent = (agentId: string) => {
    const ids = assigned[agentId];
    return CONTEXT_ITEMS.filter((i) => ids.includes(i.id)).reduce(
      (a, i) => a + i.tokenCount,
      0
    );
  };

  const overBudget = ISOLATION_AGENTS.filter(
    (a) => tokenByAgent(a.id) > a.tokenBudget
  );

  const isOptimal =
    ISOLATION_AGENTS.every((a) => {
      const set = new Set(assigned[a.id]);
      const opt = a.optimalContextIds;
      return opt.length === set.size && opt.every((id) => set.has(id));
    });

  const findingsForAgent = (agentId: string) => {
    const ids = new Set(assigned[agentId]);
    return ISOLATION_FINDINGS.filter(
      (f) =>
        f.agentId === agentId && f.requiredContextIds.every((id) => ids.has(id))
    );
  };

  const totalUnlocked = ISOLATION_AGENTS.reduce(
    (a, agent) => a + findingsForAgent(agent.id).length,
    0
  );

  const allWithinBudget = overBudget.length === 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
        <h2 className="text-lg font-semibold text-violet-400 mb-2 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Phase 4: Context Isolation — Who Sees What?
        </h2>
        <p className="text-sm text-foreground/80">
          Each agent gets its own context window with a limited token budget.
          Your job: distribute the {CONTEXT_ITEMS.length} context items (
          {poolTotal} tokens total) across 3 specialist agents to maximize
          findings while staying within each budget.
        </p>
      </div>

      <div>
        <div className="text-xs font-bold text-foreground/80 uppercase tracking-wider mb-3">
          Meet Your 3 Specialist Agents
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ISOLATION_AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: agent.color }} />
                <span className="text-sm font-semibold">{agent.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{agent.role}</p>
              <p className="text-xs text-foreground/70 mb-3">{agent.description}</p>
              <span className="text-xs font-mono text-muted-foreground">
                Budget: {agent.tokenBudget}t
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Think about what data each agent <strong className="text-foreground/70">actually needs</strong>{" "}
          to do its job. The Order Flow agent needs raw metrics and config data.
          The Delivery Ops agent needs before/after comparisons. The Customer
          agent needs summaries and customer-facing policies — not raw telemetry.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="text-sm text-amber-300 flex gap-2">
          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>Key Insight:</strong> Sending everything to every agent would
            require {NAIVE_BASELINE.totalTokensPerAgent}t per agent — but budgets
            are only 900–1100t. You must distribute wisely. The base items
            (System Prompt + Task Briefing) are pre-assigned to all agents.
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-wrap gap-2">
          <h3 className="text-sm font-semibold">Context Distribution Matrix</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-sm font-medium text-amber-400 hover:underline cursor-pointer"
            >
              Show Solution
            </button>
            <button
              onClick={reset}
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_100px_100px_100px] gap-2 px-4 py-2 border-b border-border bg-muted/30 items-center">
          <div className="text-xs font-semibold text-muted-foreground">Context Item</div>
          {ISOLATION_AGENTS.map((agent) => {
            const used = tokenByAgent(agent.id);
            const over = used > agent.tokenBudget;
            return (
              <div key={agent.id} className="text-center">
                <div className="text-xs font-semibold" style={{ color: agent.color }}>
                  {agent.name.split(" ")[0]}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  {used}/{agent.tokenBudget}t
                </div>
                <button
                  onClick={() => assignOptimal(agent.id)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  Assign Optimal
                </button>
                {over && <div className="text-[10px] text-red-400 font-bold">OVER</div>}
              </div>
            );
          })}
        </div>

        {/* Shared base */}
        <div className="px-4 py-2 border-b border-border bg-indigo-500/5">
          <div className="text-xs font-semibold text-indigo-400 mb-1">
            Shared Base (auto-assigned to all agents)
          </div>
          <div className="space-y-1">
            {CONTEXT_ITEMS.filter((i) => baseIds.includes(i.id)).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked disabled className="accent-indigo-400" />
                <span>{item.name}</span>
                <span className="ml-auto font-mono">{item.tokenCount}t</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specialized */}
        <div className="px-4 py-3">
          <div className="text-xs font-semibold text-foreground/80 mb-2">
            Specialized Context (assign to agents)
          </div>
          <div className="space-y-1">
            {specialized.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_100px_100px_100px] gap-2 items-center py-1.5 border-b border-border/50 last:border-0"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span
                    className="mt-1 h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: CONTEXT_CATEGORY_COLORS[item.category] }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{item.description}</div>
                  </div>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground self-center">
                    {item.tokenCount}t
                  </span>
                </div>
                {ISOLATION_AGENTS.map((agent) => (
                  <div key={agent.id} className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={assigned[agent.id].includes(item.id)}
                      onChange={() => toggle(item.id, agent.id)}
                      className="h-4 w-4 cursor-pointer"
                      style={{
                        accentColor: agent.color,
                      }}
                      aria-label={`Assign ${item.name} to ${agent.name}`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {overBudget.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="text-sm text-red-400">
            <strong>
              {overBudget.map((a) => a.name).join(", ")} exceeds token budget.
            </strong>{" "}
            Remove some context items to fit.
          </div>
        </div>
      )}

      {showSolution && (
        <SolutionPanel assigned={assigned} />
      )}

      <div className="flex justify-center">
        {ranAll ? (
          <Button variant="secondary" onClick={assignAllOptimal}>
            Re-run Agents
          </Button>
        ) : (
          <Button onClick={() => { assignAllOptimal(); setRanAll(true); }}>
            <Play className="h-4 w-4" /> Run All Agents
          </Button>
        )}
      </div>

      {ranAll && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ISOLATION_AGENTS.map((agent) => {
                const findings = findingsForAgent(agent.id);
                const used = tokenByAgent(agent.id);
                const over = used > agent.tokenBudget;
                const optimalForThis = assigned[agent.id].length === agent.optimalContextIds.length &&
                  agent.optimalContextIds.every((id) => assigned[agent.id].includes(id));
                return (
                  <div key={agent.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: agent.color }} />
                      <span className="text-sm font-semibold">{agent.name}</span>
                      <span className="ml-auto text-xs font-mono text-muted-foreground">{used}t</span>
                    </div>
                    <div className="text-xs mb-2">
                      {optimalForThis ? (
                        <span className="font-semibold text-green-400">
                          {findings.length}/4 findings unlocked
                        </span>
                      ) : (
                        <span className="font-semibold">
                          {findings.length}/4 findings unlocked
                        </span>
                      )}
                      {over && (
                        <span className="ml-2 text-orange-400">Budget exceeded — quality degraded</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {findings.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No findings — agent lacks required context
                        </p>
                      ) : (
                        findings.map((f) => (
                          <div key={f.id} className="flex items-start gap-2 text-xs rounded-lg bg-muted/30 border border-border px-2 py-1.5">
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${SEVERITY_STYLES[f.severity]}`}>
                              {f.severity}
                            </span>
                            <span className="text-foreground/80">{f.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${totalUnlocked >= 10 ? "text-green-400" : totalUnlocked >= 6 ? "text-orange-400" : "text-red-400"}`}>
                  {totalUnlocked}/{ISOLATION_FINDINGS.length}
                </div>
                <div className="text-xs text-muted-foreground">Findings Unlocked</div>
              </div>
              <div className="text-center">
                {allWithinBudget ? (
                  <div className="flex items-center justify-center gap-1 text-green-400 font-bold text-sm">
                    <Check className="h-4 w-4" /> All within budget
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-red-400 font-bold text-sm">
                    <X className="h-4 w-4" /> Over budget
                  </div>
                )}
                <div className="text-xs text-muted-foreground">Budget Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {ISOLATION_AGENTS.reduce((a, agent) => a + tokenByAgent(agent.id), 0)}
                  <span className="text-sm text-muted-foreground font-normal">t</span>
                </div>
                <div className="text-xs text-muted-foreground">across 3 windows</div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <button
                onClick={() => setShowBaseline(!showBaseline)}
                className="w-full px-4 py-3 text-sm font-medium flex items-center justify-between cursor-pointer hover:bg-muted/30"
              >
                <span>Compare with &quot;Send Everything&quot; approach</span>
                <span className="text-muted-foreground">{showBaseline ? "Hide" : "Show"}</span>
              </button>
              {showBaseline && <BaselinePanel />}
            </div>

            <div className="flex justify-end">
              {completed ? (
                <span className="text-sm text-green-400 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Phase completed
                </span>
              ) : totalUnlocked >= 4 ? (
                <Button
                  onClick={() => {
                    onComplete({
                      phase: 4,
                      score: isOptimal && allWithinBudget ? 25 : 20,
                      maxScore: 25,
                      summary: `Distributed ${poolTotal}t pool across 3 agents, unlocked ${totalUnlocked}/${ISOLATION_FINDINGS.length} findings (${allWithinBudget ? "all" : "some"} within budget)`,
                    });
                    setCompleted(true);
                  }}
                >
                  Complete Phase 4
                </Button>
              ) : (
                <Button disabled>Unlock at least 4 findings to continue</Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function SolutionPanel({
  assigned,
}: {
  assigned: Record<string, string[]>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"
    >
      <div className="text-sm font-semibold text-amber-300 mb-3">
        Why This Is the Optimal Assignment
      </div>
      <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4 mb-4">
        <div className="text-sm font-semibold text-indigo-400 mb-1">
          Core Principle: Relevance-Based Isolation
        </div>
        <p className="text-xs text-foreground/80">
          Each agent receives <strong>only the context it needs</strong> to
          produce its specific findings. Irrelevant context wastes tokens,
          dilutes focus, and increases hallucination risk. The key question for
          each assignment: <em>&quot;Does this agent need this data to do its
          job?&quot;</em>
        </p>
      </div>
      <div className="space-y-4">
        {ISOLATION_AGENTS.map((agent) => {
          const used = assigned[agent.id].reduce((acc, id) => {
            const item = CONTEXT_ITEMS.find((i) => i.id === id);
            return acc + (item?.tokenCount ?? 0);
          }, 0);
          const assignedIds = new Set(assigned[agent.id]);
          const rationale = SOLUTION_RATIONALES.filter((r) => r.agentId === agent.id);
          const exclusions = EXCLUSION_RATIONALES.filter((r) => r.agentId === agent.id);
          const notAssigned = exclusions.filter((e) => !assignedIds.has(e.contextId));
          return (
            <div key={agent.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: agent.color }} />
                  <span className="text-sm font-semibold">{agent.name}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{used}t / {agent.tokenBudget}t</span>
              </div>
              <div className="text-xs font-semibold text-green-400 mb-2">Assigned — and why</div>
              <div className="space-y-1.5 mb-3">
                {rationale.map((r) => {
                  const item = CONTEXT_ITEMS.find((i) => i.id === r.contextId);
                  return (
                    <div key={r.contextId} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span><strong>{item?.name}</strong> — {r.reason}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs font-semibold text-red-400 mb-2">Not assigned — and why</div>
              <div className="space-y-1.5">
                {notAssigned.length === 0 ? (
                  <p className="text-xs text-muted-foreground">All base + optimal items assigned.</p>
                ) : (
                  notAssigned.map((r) => {
                    const item = CONTEXT_ITEMS.find((i) => i.id === r.contextId);
                    return (
                      <div key={r.contextId} className="flex items-start gap-2 text-xs">
                        <X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span><strong>{item?.name}</strong> — {r.reason}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 mt-4">
        <div className="text-sm font-semibold text-green-400 mb-1">
          Result: All 12 Findings Unlocked
        </div>
        <p className="text-xs text-foreground/80">
          With this assignment, each agent has exactly the context it needs to
          produce all its findings. Click <strong>Run All Agents</strong> to
          verify — you should see 4/4 findings per agent. Notice how findings
          require specific <strong>combinations</strong> of context items (e.g.,
          the critical finding &quot;config change caused driver cascade&quot;
          requires <em>both</em> Driver Analytics and Config Audit in the same
          agent).
        </p>
      </div>
    </motion.div>
  );
}

function BaselinePanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 border-t border-border"
    >
      <div className="text-sm font-semibold text-red-400 mb-3">
        &quot;Send Everything&quot; Baseline: {NAIVE_BASELINE.totalTokensPerAgent}t per agent
      </div>
      <div className="text-xs font-semibold text-red-400 mb-2">Problems:</div>
      <div className="space-y-1.5 mb-4">
        {NAIVE_BASELINE.issues.map((issue, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
            <X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
            <span>{issue}</span>
          </div>
        ))}
      </div>
      <div className="text-xs font-semibold mb-2">Your approach vs Naive:</div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Tokens per agent (avg)</span>
          <span><span className="text-green-400 font-mono">808t</span> <span className="text-muted-foreground">vs</span> <span className="text-red-400 font-mono">{NAIVE_BASELINE.totalTokensPerAgent}t</span></span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Finding quality</span>
          <span><span className="text-green-400">Focused</span> <span className="text-muted-foreground">vs</span> <span className="text-red-400">{NAIVE_BASELINE.findingsQualityPct}% (noisy)</span></span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Budget compliance</span>
          <span><span className="text-green-400">Yes</span> <span className="text-muted-foreground">vs</span> <span className="text-red-400">0/3 within budget</span></span>
        </div>
      </div>
    </motion.div>
  );
}
