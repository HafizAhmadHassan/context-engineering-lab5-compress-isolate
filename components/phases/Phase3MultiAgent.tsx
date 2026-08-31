"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch,
  Check,
  X,
  LoaderCircle,
  GitPullRequest,
  Users,
} from "lucide-react";
import Button from "@/components/Button";
import { useApiKeys } from "@/lib/api-keys";
import {
  PHASE3_AGENTS,
  PR_DIFF,
  MULTI_AGENT_FINDINGS,
  SINGLE_AGENT_FINDINGS,
  CONTRACT_VALIDATION,
} from "@/lib/phase3data";
import type { PhaseResult } from "@/types";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  info: "bg-blue-500/20 text-blue-400",
};

export default function Phase3MultiAgent({
  onComplete,
}: {
  onComplete: (r: PhaseResult) => void;
}) {
  const { preferredProvider, keys } = useApiKeys();
  const [showDiff, setShowDiff] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [completed, setCompleted] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const hasKey = preferredProvider ? keys[preferredProvider].length > 0 : false;

  const run = async () => {
    setRunning(true);
    setPhase("dispatch");
    await new Promise((r) => setTimeout(r, 600));
    setPhase("working");
    await new Promise((r) => setTimeout(r, 900));
    setPhase("merge");
    await new Promise((r) => setTimeout(r, 500));
    setPhase("complete");
    setRunning(false);
  };

  const specs = PHASE3_AGENTS.filter((a) => a.id !== "orchestrator");
  const totalFindings = MULTI_AGENT_FINDINGS.length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
        <h2 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Phase 3: Multi-Agent Isolation
        </h2>
        <p className="text-sm text-foreground/80">
          Simulate a contract-first multi-agent code review. An orchestrator
          dispatches a PR diff to three specialist agents (Style, Security,
          Performance), each with their own context window and contract.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-foreground/70" />
            <span className="text-sm font-semibold">Pull Request: app/api/users.py</span>
          </div>
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="text-sm font-medium text-primary cursor-pointer hover:underline"
          >
            {showDiff ? "Hide" : "Show"} diff
          </button>
        </div>
        {showDiff ? (
          <pre className="p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto bg-muted/30">
            {PR_DIFF}
          </pre>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            Python web app with intentional style, security, and performance
            issues. The diff replaces ORM queries with raw SQL.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold">Agent Contracts</span>
          <button
            onClick={() => setShowContracts(!showContracts)}
            className="text-sm font-medium text-primary cursor-pointer hover:underline"
          >
            {showContracts ? "Hide" : "View"} contract schemas
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {specs.map((agent) => {
            return (
              <div
                key={agent.id}
                className="rounded-lg border p-3"
                style={{ borderColor: `${agent.color}40` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.color }} />
                  <span className="text-sm font-semibold">{agent.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{agent.role}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Budget: {agent.maxTokenBudget}</span>
                  <span className="text-muted-foreground">Tools: {agent.tools.length}</span>
                </div>
              </div>
            );
          })}
        </div>
        {showContracts && (
          <div className="p-4 border-t border-border grid grid-cols-1 lg:grid-cols-2 gap-4">
            {PHASE3_AGENTS.map((agent) => (
              <div key={agent.id} className="rounded-lg border border-border p-3">
                <div className="text-sm font-semibold mb-2" style={{ color: agent.color }}>
                  {agent.name}
                </div>
                <div className="text-xs font-mono text-foreground/70 whitespace-pre-wrap bg-muted rounded p-2">
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">Input Schema</div>
                  {agent.inputSchema}
                </div>
                <div className="mt-2 text-xs font-mono text-foreground/70 whitespace-pre-wrap bg-muted rounded p-2">
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">Output Schema</div>
                  {agent.outputSchema}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {phase === "complete" ? (
          <Button variant="secondary" onClick={run}>
            Re-run Review
          </Button>
        ) : running ? (
          <Button disabled>
            <LoaderCircle className="h-4 w-4 animate-spin" /> Running...
          </Button>
        ) : (
          <Button onClick={run}>
            <GitPullRequest className="h-4 w-4" /> Run Multi-Agent Review
          </Button>
        )}
      </div>
      {!hasKey && !running && (
        <p className="text-center text-xs text-amber-400">
          No API key — using pre-computed agent findings
        </p>
      )}

      <FlowDiagram phase={phase} />

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Contract Validation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONTRACT_VALIDATION.map((c) => {
            const agent = PHASE3_AGENTS.find((a) => a.id === c.agentId)!;
            return (
              <div key={c.agentId} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: agent.color }}>
                    {agent.name}
                  </span>
                  {c.valid ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <Check className="h-3.5 w-3.5" /> Valid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <X className="h-3.5 w-3.5" /> {c.errors.length} errors
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {c.valid ? (
                    <>
                      <div className="flex items-center gap-1"><Check className="h-3 w-3 text-green-400" /> Input Schema</div>
                      <div className="flex items-center gap-1"><Check className="h-3 w-3 text-green-400" /> Output Schema</div>
                    </>
                  ) : (
                    c.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-1 text-red-400">
                        <X className="h-3 w-3 mt-0.5 shrink-0" /> {e.text}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {phase === "complete" && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">
                Multi-Agent Findings ({totalFindings} total)
              </h3>
              <div className="space-y-3">
                {specs.map((agent) => {
                  const findings = MULTI_AGENT_FINDINGS.filter((f) => f.agentId === agent.id);
                  return (
                    <div key={agent.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.color }} />
                        <span className="text-sm font-semibold">{agent.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({findings.length} findings, {agent.maxTokenBudget} tokens)
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {findings.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs rounded-lg bg-muted/30 border border-border px-3 py-2">
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${SEVERITY_STYLES[f.severity]}`}>
                              {f.severity}
                            </span>
                            <span className="shrink-0 font-mono text-muted-foreground">L{f.line}</span>
                            <span className="text-foreground/80">{f.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <ComparisonCard
              show={showComparison}
              setShow={setShowComparison}
            />

            <div className="flex justify-end">
              {completed ? (
                <span className="text-sm text-green-400 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Phase completed
                </span>
              ) : (
                <Button
                  onClick={() => {
                    onComplete({
                      phase: 3,
                      score: 20,
                      maxScore: 20,
                      summary: `${totalFindings} findings across ${specs.length} agents (${PHASE3_AGENTS.length}/${PHASE3_AGENTS.length} valid contracts)`,
                    });
                    setCompleted(true);
                  }}
                >
                  Complete Phase 3
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function FlowDiagram({ phase }: { phase: string }) {
  const specs = PHASE3_AGENTS.filter((a) => a.id !== "orchestrator");
  const orchestrator = PHASE3_AGENTS[0];
  const statusText =
    phase === "idle" ? "Waiting..." : phase === "dispatch" ? "Dispatching to agents..." : phase === "working" ? "Agents working..." : phase === "merge" ? "Merging results..." : "Review complete";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground text-center mb-4">{statusText}</p>
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="flex flex-col items-center rounded-xl border-2 px-6 py-3"
          style={{ borderColor: orchestrator.color, backgroundColor: `${orchestrator.color}0d` }}
          animate={{ scale: phase === "merge" || phase === "complete" ? 1.05 : 1 }}
        >
          <span className="text-sm font-semibold" style={{ color: orchestrator.color }}>
            {orchestrator.name}
          </span>
          <span className="text-[10px] text-muted-foreground">Splits &amp; merges</span>
        </motion.div>
        <div className="w-full h-px bg-border" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {specs.map((agent, i) => (
            <motion.div
              key={agent.id}
              className="flex flex-col items-center rounded-xl border-2 px-4 py-3"
              style={{
                borderColor: `${agent.color}55`,
                backgroundColor: phase === "working" ? `${agent.color}0d` : "transparent",
              }}
              animate={{ scale: phase === "working" ? 1.05 : 1, boxShadow: phase === "working" ? `0 0 12px ${agent.color}33` : "none" }}
              transition={{ delay: i * 0.15 }}
            >
              <span className="text-sm font-semibold" style={{ color: agent.color }}>
                {agent.name}
              </span>
              <span className="text-[10px] text-muted-foreground text-center">{agent.role}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  const total = MULTI_AGENT_FINDINGS.length;
  const single = SINGLE_AGENT_FINDINGS.slice(0, 6);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Single-Agent vs Multi-Agent Comparison</h3>
        <button
          onClick={() => setShow(!show)}
          className="text-sm font-medium text-primary cursor-pointer hover:underline"
        >
          {show ? "Hide" : "Show"} comparison
        </button>
      </div>
      {show ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-red-500/5 border-b border-red-500/20">
              <span className="text-sm font-semibold text-red-400">Single Agent ({SINGLE_AGENT_FINDINGS.length} findings)</span>
            </div>
            <div className="p-3 space-y-1.5">
              {single.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${SEVERITY_STYLES[f.severity]}`}>
                    {f.severity}
                  </span>
                  <span className="shrink-0 font-mono text-muted-foreground">L{f.line}</span>
                  <span className="text-foreground/80">{f.message}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 text-xs text-red-400/80 border-t border-red-500/20">
              Missed: 3 SQL injection sites, auth gaps, N+1 detail, style issues
            </div>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-green-500/5 border-b border-green-500/20">
              <span className="text-sm font-semibold text-green-400">Multi-Agent ({total} findings)</span>
            </div>
            <div className="p-3 space-y-1.5">
              {MULTI_AGENT_FINDINGS.slice(0, 6).map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${SEVERITY_STYLES[f.severity]}`}>
                    {f.severity}
                  </span>
                  <span className="shrink-0 font-mono text-muted-foreground">L{f.line}</span>
                  <span className="text-foreground/80 truncate">{f.message}</span>
                </div>
              ))}
              {total > 6 && <div className="text-xs text-muted-foreground pt-1">+{total - 6} more findings</div>}
            </div>
            <div className="px-4 py-2 text-xs text-green-400/80 border-t border-green-500/20">
              Comprehensive coverage: all SQL injections, auth gaps, N+1 queries, style issues
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-red-500/30 p-4 text-center text-red-400">
            <div className="text-2xl font-bold">{SINGLE_AGENT_FINDINGS.length}</div>
            <div className="text-xs text-muted-foreground">Single Agent Findings</div>
          </div>
          <div className="rounded-lg border border-green-500/30 p-4 text-center text-green-400">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Multi-Agent Findings</div>
          </div>
        </div>
      )}
    </div>
  );
}
