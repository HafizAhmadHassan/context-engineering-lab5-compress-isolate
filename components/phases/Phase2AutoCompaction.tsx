"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Settings2,
  Check,
  X,
  Gauge,
} from "lucide-react";
import Button from "@/components/Button";
import { COMPACTION_PASSES } from "@/lib/data";
import { PHASE2_MESSAGES, QUALITY_CHECKPOINTS } from "@/lib/phase2data";
import type { PhaseResult } from "@/types";

const CAPACITY = 1000;
const CORE_START = 320;

const ROLE_COLORS: Record<string, string> = {
  system: "#ef4444",
  user: "#3b82f6",
  assistant: "#22c55e",
  tool: "#a855f7",
};

interface CompactionEvent {
  id: number;
  passIndex: number;
  timestamp: string;
  before: number;
  after: number;
  msgs: number;
}

interface Arrival {
  id: number;
  role: string;
  speaker: string;
  content: string;
  tokenCount: number;
  weight: number;
  priority: string;
}

const ARRIVALS: Arrival[] = PHASE2_MESSAGES.map((m) => ({
  id: m.id,
  role: m.role,
  speaker: m.speaker,
  content: m.content,
  tokenCount: m.tokenCount,
  weight: m.isToolResult ? m.tokenCount : Math.max(18, Math.round(m.tokenCount * 1.3)),
  priority: m.priority,
}));

export default function Phase2AutoCompaction({
  onComplete,
}: {
  onComplete: (r: PhaseResult) => void;
}) {
  const [compactAt, setCompactAt] = useState(80);
  const [emergencyAt, setEmergencyAt] = useState(95);
  const [streamIndex, setStreamIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [doneOnce, setDoneOnce] = useState(false);

  const visible = ARRIVALS.slice(0, streamIndex);
  const rawTokens = CORE_START + visible.reduce((a, m) => a + m.weight, 0);

  const toolTokens = visible.filter((m) => m.role === "tool").reduce((a, m) => a + m.weight, 0);
  const trimmedTokens = visible
    .filter((m) => (m.priority === "P2" || m.priority === "P3"))
    .reduce((a, m) => a + m.weight, 0);

  // Derived compaction events — which passes have fired up to the current position
  const events = useMemo(() => {
    let sum = CORE_START;
    let pass12At = -1;
    let pass3At = -1;
    for (let i = 1; i <= streamIndex; i++) {
      sum += ARRIVALS[i - 1].weight;
      const cap = Math.round((sum / CAPACITY) * 100);
      if (pass12At === -1 && cap >= compactAt) pass12At = i;
      if (pass3At === -1 && cap >= emergencyAt) pass3At = i;
    }
    const out: CompactionEvent[] = [];
    if (pass12At !== -1) {
      const part = ARRIVALS.slice(0, pass12At);
      const before = CORE_START + part.reduce((a, m) => a + m.weight, 0);
      const tools = part.filter((m) => m.role === "tool");
      out.push({
        id: 1,
        passIndex: 0,
        timestamp: "Auto",
        before,
        after: Math.max(0, before - Math.floor(tools.reduce((a, m) => a + m.weight, 0) * 0.7)),
        msgs: tools.length,
      });
    }
    if (pass3At !== -1) {
      const part = ARRIVALS.slice(0, pass3At);
      const before = CORE_START + part.reduce((a, m) => a + m.weight, 0);
      const trimmed = part.filter((m) => m.priority === "P2" || m.priority === "P3");
      out.push({
        id: 2,
        passIndex: 2,
        timestamp: "Auto",
        before,
        after: Math.max(0, before - trimmed.reduce((a, m) => a + m.weight, 0)),
        msgs: trimmed.length,
      });
    }
    return out;
  }, [streamIndex, compactAt, emergencyAt]);

  const firedPass12 = events.some((e) => e.passIndex === 0);
  const firedPass3 = events.some((e) => e.passIndex === 2);

  let effectiveTokens = rawTokens;
  if (firedPass3) effectiveTokens -= trimmedTokens;
  if (firedPass12) effectiveTokens -= Math.floor(toolTokens * 0.7);

  const effectivePct = Math.round((effectiveTokens / CAPACITY) * 100);

  useEffect(() => {
    if (running && streamIndex < ARRIVALS.length) {
      const id = setInterval(() => {
        setStreamIndex((i) => {
          const next = Math.min(i + 1, ARRIVALS.length);
          if (next >= ARRIVALS.length) {
            setRunning(false);
            setDone(true);
            setDoneOnce(true);
          }
          return next;
        });
      }, 480);
      return () => clearInterval(id);
    }
  }, [running, streamIndex]);

  const step = () => {
    setStreamIndex((i) => {
      const next = Math.min(i + 1, ARRIVALS.length);
      if (next >= ARRIVALS.length) {
        setDone(true);
        setDoneOnce(true);
      }
      return next;
    });
  };

  const reset = () => {
    setStreamIndex(0);
    setRunning(false);
    setDone(false);
    setDoneOnce(false);
  };

  const tokensSaved = events.reduce((a, e) => a + (e.before - e.after), 0);

  const byRole = visible.reduce<Record<string, number>>(
    (acc, m) => {
      acc[m.role] = (acc[m.role] || 0) + m.weight;
      return acc;
    },
    { system: CORE_START, user: 0, assistant: 0, tool: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
        <h2 className="text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Phase 2: Auto-Compaction System
        </h2>
        <p className="text-sm text-foreground/80">
          Configure thresholds and watch an auto-compaction system keep a
          simulated conversation under budget. Messages arrive one at a time —
          when capacity thresholds are hit, compaction passes fire automatically.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Settings2 className="h-4 w-4" /> Compaction Thresholds
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <SliderBlock
            label="Compact At"
            value={compactAt}
            min={60}
            max={90}
            color="amber"
            disabled={done}
            onChange={setCompactAt}
            caption="Pass 1 & 2 trigger at this capacity"
          />
          <SliderBlock
            label="Emergency At"
            value={emergencyAt}
            min={85}
            max={99}
            color="red"
            disabled={done}
            onChange={setEmergencyAt}
            caption="Pass 3 (emergency trim) triggers here"
          />
        </div>
        <div className="flex flex-col gap-2">
          {COMPACTION_PASSES.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{ backgroundColor: `${p.color}1a`, color: p.color }}
              >
                P{p.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div>
              </div>
              <div className="hidden md:block text-xs text-muted-foreground text-right">
                {p.reduction}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TopTokens value={effectiveTokens} capacity={CAPACITY} byRole={byRole} />

      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {!done && !running && (
            <Button size="sm" onClick={() => setRunning(true)}>
              <Play className="h-4 w-4" /> {streamIndex === 0 ? "Start Simulation" : "Resume"}
            </Button>
          )}
          {running && (
            <Button size="sm" variant="secondary" onClick={() => setRunning(false)}>
              <Pause className="h-4 w-4" /> Pause
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={step} disabled={running || done}>
            <StepForward className="h-4 w-4" /> Step
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Message {Math.min(streamIndex, ARRIVALS.length)} / {ARRIVALS.length}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 max-h-48 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-3">Active Context</h3>
        {streamIndex === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click Start to begin the simulation
          </p>
        ) : (
          <div className="space-y-2">
            {visible.slice(-10).map((m) => (
              <div key={m.id} className="flex items-start gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0"
                  style={{
                    backgroundColor: `${ROLE_COLORS[m.role] || "#3b82f6"}22`,
                    color: ROLE_COLORS[m.role] || "#3b82f6",
                  }}
                >
                  {m.role}
                </span>
                <span className="text-xs font-semibold text-primary truncate shrink-0 max-w-[9rem]">
                  {m.speaker}
                </span>
                <span className="text-xs text-foreground/70 truncate flex-1 min-w-0">
                  {m.content.slice(0, 80)}
                  {m.content.length > 80 ? "..." : ""}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                  {m.weight}t
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <EventList events={events} empty={streamIndex === 0} />

      {done && <SimulationSummary events={events} finalPct={effectivePct} />}

      {done && <QualityPanel streamIndex={streamIndex} />}

      <div className="flex justify-end">
        {doneOnce ? (
          <Button
            onClick={() => {
              onComplete({
                phase: 2,
                score: 25,
                maxScore: 25,
                summary: `${events.length} compactions, ${tokensSaved} tokens saved, final capacity: ${effectivePct}%`,
              });
            }}
          >
            Complete Phase 2
          </Button>
        ) : (
          <Button disabled>Complete simulation to continue</Button>
        )}
      </div>
    </div>
  );
}

function SliderBlock({
  label,
  value,
  min,
  max,
  color,
  disabled,
  caption,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  color: "amber" | "red";
  disabled: boolean;
  caption: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-mono ${color === "amber" ? "text-amber-400" : "text-red-400"}`}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${color === "amber" ? "accent-amber-500" : "accent-red-500"}`}
      />
      <p className="text-xs text-muted-foreground mt-1">{caption}</p>
    </div>
  );
}

function TopTokens({
  value,
  capacity,
  byRole,
}: {
  value: number;
  capacity: number;
  byRole: Record<string, number>;
}) {
  const pct = Math.round((value / capacity) * 100);
  const compactMarker = (80 / capacity) * 100;
  const emergencyMarker = (95 / capacity) * 100;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">Active Context</span>
        <span className="text-xs font-mono text-muted-foreground">
          {value} / {capacity} ({pct}%)
        </span>
      </div>
      <div className="relative mt-2 h-8 w-full rounded-lg bg-muted overflow-hidden">
        {(["system", "user", "assistant", "tool"] as const).map((role) => {
          const w = byRole[role] || 0;
          const wPct = (w / capacity) * 100;
          if (wPct <= 0) return null;
          return (
            <motion.div
              key={role}
              className="absolute top-0 bottom-0"
              style={{ width: `${wPct}%`, backgroundColor: ROLE_COLORS[role], opacity: 0.75 }}
              initial={{ width: 0 }}
              animate={{ width: `${wPct}%` }}
            />
          );
        })}
        <div
          className="absolute bottom-0 top-0 w-0.5 bg-amber-400"
          style={{ left: `${compactMarker}%` }}
          title="Compact At"
        />
        <div
          className="absolute bottom-0 top-0 w-0.5 bg-red-500"
          style={{ left: `${emergencyMarker}%` }}
          title="Emergency At"
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
        <div className="flex gap-3">
          {(["system", "user", "assistant", "tool"] as const).map((role) => (
            <div key={role} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ROLE_COLORS[role] }} />
              {role}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-0.5 bg-amber-400" /> Compact 80%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-0.5 bg-red-500" /> Emergency 95%
          </span>
        </div>
      </div>
    </div>
  );
}

function EventList({ events, empty }: { events: CompactionEvent[]; empty: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3">Compaction Timeline</h3>
      {empty && events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No compaction events yet. Start the simulation to see events appear.
        </p>
      ) : (
        <div className="space-y-2">
          {events.map((e) => {
            const p = COMPACTION_PASSES[e.passIndex];
            const pct = Math.round(((e.before - e.after) / e.before) * 100);
            return (
              <div key={e.id} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
                    style={{ backgroundColor: `${p.color}1a`, color: p.color }}
                  >
                    P{p.id}
                  </span>
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{e.timestamp}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {e.before} → {e.after} (-{pct}%) · {e.msgs} msgs
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SimulationSummary({
  events,
  finalPct,
}: {
  events: CompactionEvent[];
  finalPct: number;
}) {
  const tokensSaved = events.reduce((a, e) => a + (e.before - e.after), 0);
  return (
    <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
      <h3 className="text-base font-semibold text-green-400 mb-4 flex items-center gap-2">
        <Check className="h-5 w-5" /> Simulation Complete
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Compactions" value={String(events.length)} />
        <Stat label="Tokens Saved" value={String(tokensSaved)} green />
        <Stat label="Final Capacity" value={`${finalPct}%`} />
        <Stat
          label="Active Messages"
          value={String(Math.max(0, PHASE2_MESSAGES.length - events.reduce((a, e) => a + e.msgs, 0)))}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <div className={`text-2xl font-bold ${green ? "text-green-400" : ""}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function QualityPanel({ streamIndex }: { streamIndex: number }) {
  return (
    <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
      <h3 className="text-base font-semibold text-green-400 mb-4">Quality Checkpoints</h3>
      <div className="space-y-3">
        {QUALITY_CHECKPOINTS.map((q) => {
          const ok = q.reliesOn.every((id) => id <= streamIndex);
          return (
            <div key={q.question} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                  ok ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              </span>
              <div>
                <div className="text-sm font-medium">{q.question}</div>
                <div className="text-xs text-muted-foreground">
                  {ok ? "Context preserved" : "Message lost — quality degraded"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
