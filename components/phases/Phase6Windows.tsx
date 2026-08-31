"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  RotateCcw,
  Check,
  Folder,
  FolderOpen,
  File,
} from "lucide-react";
import Button from "@/components/Button";
import { WINDOW_STEPS, KIND_COLORS, type ContextEntry } from "@/lib/phase6data";
import type { PhaseResult } from "@/types";

const AGENT_NAMES: Record<string, { name: string; color: string; role: string }> = {
  orchestrator: { name: "Orchestrator", color: "#f59e0b", role: "Coordinates delegation" },
  "root-cause-analyst": { name: "Root Cause Analyst", color: "#ef4444", role: "Finds root cause" },
  "impact-assessor": { name: "Impact Assessor", color: "#3b82f6", role: "Quantifies impact" },
  "recovery-planner": { name: "Recovery Planner", color: "#22c55e", role: "Plans recovery" },
};

export default function Phase6Windows({
  onComplete,
}: {
  onComplete: (r: PhaseResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const totalSteps = WINDOW_STEPS.length;
  const isLast = step === totalSteps - 1;

  const current = WINDOW_STEPS[step];

  const reset = () => setStep(0);
  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const skipToEnd = () => setStep(totalSteps - 1);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-pink-500/30 bg-pink-500/5 p-5">
        <h2 className="text-lg font-semibold text-pink-400 mb-2 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Phase 6: Agent Context Windows — See What Each Agent Sees
        </h2>
        <p className="text-sm text-foreground/80">
          Step through a hierarchical delegation and{" "}
          <strong>watch each agent&apos;s context window build up</strong>. See
          how shared base context flows to all agents, how each gets specialized
          instructions and data, and how summaries compress raw data as they
          flow back to the orchestrator.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowHierarchy(!showHierarchy)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted/30"
        >
          <span>How Agents Construct Context from the File Hierarchy</span>
          <span className="text-muted-foreground">{showHierarchy ? "Hide" : "Show"}</span>
        </button>
        {showHierarchy && <HierarchyPanel />}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="text-sm font-semibold">
            Step {step + 1}/{totalSteps}
            <span className="text-muted-foreground font-normal"> — {current.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={reset} title="Reset to start" className="p-1.5 rounded hover:bg-muted cursor-pointer"><RotateCcw className="h-4 w-4" /></button>
            <button onClick={prev} disabled={step === 0} className="p-1.5 rounded hover:bg-muted disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={next} disabled={isLast} className="p-1.5 rounded hover:bg-muted disabled:opacity-30 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={skipToEnd} title="Skip to end" className="p-1.5 rounded hover:bg-muted cursor-pointer"><ChevronsRight className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {WINDOW_STEPS.map((s, i) => (
            <div
              key={s.id}
              onClick={() => setStep(i)}
              className="h-1.5 flex-1 rounded-full cursor-pointer"
              style={{
                backgroundColor:
                  i < step ? "#22c55e" : i === step ? "#ec4899" : "var(--border)",
              }}
            />
          ))}
        </div>

        <p className="text-sm text-foreground/80 mb-4">{current.description}</p>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mb-4">
          <p className="text-xs text-amber-300">{current.annotation}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {current.agents.map((agent) => (
            <AgentWindow
              key={agent.agentId}
              agentId={agent.agentId}
              tokens={agent.tokens}
              maxTokens={agent.maxTokens}
              entries={agent.entries}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          ))}
        </div>

        {isLast && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 mt-4"
            >
              <h3 className="text-base font-semibold text-green-400 mb-3">Key Takeaways</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Takeaway
                  title="Shared Base = Consistency"
                  text="All 4 agents received the same system prompt, CLAUDE.md, and incident briefing (360 tokens). This ensures consistent formatting, terminology, and severity ratings across all findings."
                />
                <Takeaway
                  title="Summaries = Compression"
                  text="The orchestrator ended with 515 tokens of summaries instead of 1,400+ tokens of raw data. Each sub-agent had full access to its raw data, but only a compressed summary left its window."
                />
                <Takeaway
                  title="Pipeline = Context Building"
                  text="Each agent built on prior agents' findings. The Recovery Planner received summaries from both Root Cause and Impact — without seeing their raw data. Context flows forward, not sideways."
                />
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        <div className="flex justify-end mt-4">
          {completed ? (
            <span className="text-sm text-green-400 flex items-center gap-2">
              <Check className="h-4 w-4" /> Phase completed
            </span>
          ) : isLast ? (
            <Button
              onClick={() => {
                onComplete({
                  phase: 6,
                  score: 15,
                  maxScore: 15,
                  summary: `Walked through ${totalSteps}/7 delegation steps. Saw full context flow.`,
                });
                setCompleted(true);
              }}
            >
              Complete Phase 6
            </Button>
          ) : (
            <Button onClick={next}>Next Step</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentWindow({
  agentId,
  tokens,
  maxTokens,
  entries,
  expanded,
  setExpanded,
}: {
  agentId: string;
  tokens: number;
  maxTokens: number;
  entries: ContextEntry[];
  expanded: Record<string, boolean>;
  setExpanded: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}) {
  const meta = AGENT_NAMES[agentId];
  const pct = Math.min(100, (tokens / maxTokens) * 100);
  if (!meta) return null;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: `${meta.color}14` }}
      >
        <div>
          <span className="text-sm font-semibold" style={{ color: meta.color }}>
            {meta.name}
          </span>
          <span className="text-xs text-muted-foreground ml-2 font-mono">
            {tokens}t / {maxTokens}t
          </span>
        </div>
      </div>
      <div className="px-4 py-2 text-xs text-muted-foreground">{meta.role}</div>
      <div className="px-4 pb-2">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: meta.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="px-4 pb-4 space-y-1.5">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No context yet</p>
        ) : (
          entries.map((entry, idx) => {
            const key = `${agentId}-${idx}`;
            const isOpen = expanded[key];
            return (
              <div key={key} className="rounded-lg border border-border bg-muted/30">
                <button
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer"
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded bg-black/20 text-white text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: KIND_COLORS[entry.kind] }}
                  >
                    {entry.kind.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-foreground/80">{entry.title}</span>
                  {entry.kind === "summary" && (
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  )}
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                    {entry.tokens}t
                  </span>
                </button>
                {isOpen && (
                  <p className="px-3 pb-2 text-xs text-foreground/70">{entry.content}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function HierarchyPanel() {
  return (
    <div className="p-4 border-t border-border">
      <p className="text-xs text-muted-foreground mb-4">
        Each agent inherits context from the root <code className="text-blue-400">CLAUDE.md</code>, then adds
        its own subfolder&apos;s <code className="text-amber-400">agents.md</code> instructions. The orchestrator also
        reads the delegation plan. Data files are selectively passed to each agent.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs space-y-1.5">
          <div className="flex items-center gap-1 text-foreground/70"><FolderOpen className="h-3.5 w-3.5" /> bitebridge-incident/</div>
          <div className="pl-4 flex items-center gap-1 text-blue-400"><File className="h-3.5 w-3.5" /> CLAUDE.md <span className="text-muted-foreground">— Shared base → all agents</span></div>
          <div className="pl-4 flex items-center gap-1 text-blue-400"><File className="h-3.5 w-3.5" /> incident-briefing.md <span className="text-muted-foreground">— Shared base → all agents</span></div>
          <div className="pl-4 flex items-center gap-1 text-foreground/70"><Folder className="h-3.5 w-3.5" /> data/</div>
          <div className="pl-8 flex items-center gap-1 text-indigo-400"><File className="h-3.5 w-3.5" /> config-audit.json <span className="text-muted-foreground">→ Root Cause, Customer Exp</span></div>
          <div className="pl-8 flex items-center gap-1 text-indigo-400"><File className="h-3.5 w-3.5" /> driver-analytics.json <span className="text-muted-foreground">→ Root Cause only</span></div>
          <div className="pl-8 flex items-center gap-1 text-indigo-400"><File className="h-3.5 w-3.5" /> order-metrics.json <span className="text-muted-foreground">→ Impact Assessor only</span></div>
          <div className="pl-8 flex items-center gap-1 text-indigo-400"><File className="h-3.5 w-3.5" /> perf-baseline.json <span className="text-muted-foreground">→ Impact Assessor only</span></div>
          <div className="pl-8 flex items-center gap-1 text-indigo-400"><File className="h-3.5 w-3.5" /> recovery-data.json <span className="text-muted-foreground">→ Recovery Planner only</span></div>
          <div className="pl-8 flex items-center gap-1 text-indigo-400"><File className="h-3.5 w-3.5" /> customer-playbook.md <span className="text-muted-foreground">→ Recovery Planner only</span></div>
          <div className="pl-4 flex items-center gap-1 text-foreground/70"><Folder className="h-3.5 w-3.5" /> agents/</div>
          <div className="pl-8 flex items-center gap-1 text-amber-400"><File className="h-3.5 w-3.5" /> agents.md <span className="text-muted-foreground">— Orchestrator instructions</span></div>
          <div className="pl-8 flex items-center gap-1 text-red-400"><File className="h-3.5 w-3.5" /> root-cause-analyst/agents.md <span className="text-muted-foreground">— Root Cause instructions</span></div>
          <div className="pl-8 flex items-center gap-1 text-blue-400"><File className="h-3.5 w-3.5" /> impact-assessor/agents.md <span className="text-muted-foreground">— Impact Assessor instructions</span></div>
          <div className="pl-8 flex items-center gap-1 text-green-400"><File className="h-3.5 w-3.5" /> recovery-planner/agents.md <span className="text-muted-foreground">— Recovery Planner instructions</span></div>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            How Each Agent&apos;s Context is Assembled
          </div>
          <div className="space-y-3">
            {[
              { name: "Orchestrator", color: "#f59e0b", total: "565t", segments: [[360, "base"], [205, "instructions"]] as [number, string][], desc: "CLAUDE.md+Briefing 360 + agents/agents.md 205 = 565t" },
              { name: "Root Cause Analyst", color: "#ef4444", total: "770t", segments: [[360, "base"], [100, "instructions"], [310, "data"]] as [number, string][], desc: "360 + 100 + config-audit+driver-analytics 310 = 770t" },
              { name: "Impact Assessor", color: "#3b82f6", total: "870t", segments: [[360, "base"], [110, "instructions"], [180, "summary"], [220, "data"]] as [number, string][], desc: "360 + 110 + Root Cause summary 180 + order-metrics+baseline 220 = 870t" },
              { name: "Recovery Planner", color: "#22c55e", total: "1060t", segments: [[360, "base"], [105, "instructions"], [345, "summary"], [250, "data"]] as [number, string][], desc: "360 + 105 + RC+Impact summaries 345 + recovery-data+playbook 250 = 1060t" },
            ].map((a) => (
              <div key={a.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: a.color }}>{a.name}</span>
                  <span className="font-mono text-muted-foreground">{a.total} total</span>
                </div>
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
                  {a.segments.map(([v, kind], i) => (
                    <div key={i} style={{ width: `${(v / 1100) * 100}%`, backgroundColor: KIND_COLORS[kind] }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} /> Shared Base</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} /> Agent Instructions</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#8b5cf6" }} /> Task Data</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#22c55e" }} /> Return Summary</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#eab308" }} /> Delegation Plan</span>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mt-4">
            <p className="text-xs text-amber-300 flex gap-2">
              <Folder className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span><strong>Key pattern:</strong> The root CLAUDE.md provides consistency across all agents (same formatting rules, terminology, severity levels). Each agent&apos;s subfolder agents.md adds role-specific instructions. Data files are selectively routed — not every agent sees every file.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Takeaway({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-sm font-semibold mb-1">{title}</div>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
