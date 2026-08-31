"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Shrink, ArrowRight } from "lucide-react";
import { ApiKeyProvider } from "@/lib/api-keys";
import Navbar from "@/components/Navbar";
import PhaseStepper from "@/components/PhaseStepper";
import { FEATURE_CARDS } from "@/lib/data";
import type { PhaseResult } from "@/types";
import Phase1Compression from "@/components/phases/Phase1Compression";
import Phase2AutoCompaction from "@/components/phases/Phase2AutoCompaction";
import Phase3MultiAgent from "@/components/phases/Phase3MultiAgent";
import Phase4Isolation from "@/components/phases/Phase4Isolation";
import Phase5Sharing from "@/components/phases/Phase5Sharing";
import Phase6Windows from "@/components/phases/Phase6Windows";
import Phase7Synthesis from "@/components/phases/Phase7Synthesis";

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
        <Shrink className="h-4 w-4" />
        Session 5 of 8
      </div>

      <h1 className="text-3xl font-bold mb-3">
        COMPRESS &amp; <span className="gradient-text">ISOLATE</span>
      </h1>
      <p className="text-foreground/70 max-w-2xl mx-auto text-base mb-8">
        Master context compression, auto-compaction, and multi-agent isolation
        with BiteBridge — a fictional food delivery platform.
      </p>

      <div className="rounded-xl border border-border bg-card p-6 text-left mb-8">
        <h2 className="text-lg font-semibold mb-3">Why COMPRESS &amp; ISOLATE?</h2>
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          You&apos;ve learned to <strong>WRITE</strong> context and{" "}
          <strong>SELECT</strong> what to include (Sessions 3-4). But as agents
          run longer and tackle bigger tasks, context windows fill up fast. Two
          problems emerge:
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          <strong>Context rot</strong> — old, stale, or irrelevant content
          dilutes the model&apos;s attention. <strong>Context overflow</strong>{" "}
          — a single window can&apos;t hold everything needed for complex
          multi-domain tasks.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          <strong>COMPRESS</strong> solves rot by shrinking what&apos;s inside the
          window. <strong>ISOLATE</strong> solves overflow by splitting work
          across multiple windows — each sub-agent gets its own focused context,
          like how Claude Code spins up sub-agents with separate API calls.
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {FEATURE_CARDS.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border bg-opacity-5 p-4 text-left"
            style={{
              borderColor: `${card.color}30`,
              backgroundColor: `${card.color}0d`,
            }}
          >
            <div
              className="h-1 w-8 rounded-full mb-2"
              style={{ backgroundColor: card.color }}
            />
            <div className="text-sm font-semibold mb-0.5">{card.title}</div>
            <div className="text-xs text-muted-foreground leading-snug">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground cursor-pointer hover:brightness-110 transition-all"
      >
        Start the lab
        <ArrowRight className="h-5 w-5" />
      </button>
    </motion.div>
  );
}

export default function Page() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const [scores, setScores] = useState<PhaseResult[]>([]);
  const [showIntro, setShowIntro] = useState(true);

  const onComplete = useCallback((phaseData: PhaseResult) => {
    setScores((prev) => [
      ...prev.filter((s) => s.phase !== phaseData.phase),
      phaseData,
    ]);
    setCompletedPhases((prev) => {
      const next = new Set(prev);
      next.add(phaseData.phase);
      return next;
    });
    setCurrentPhase((prev) => Math.min(prev + 1, 7));
  }, []);

  return (
    <ApiKeyWrap>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)]">
        <div className="mx-auto max-w-5xl px-4 py-8">
          {showIntro ? (
            <Intro onStart={() => setShowIntro(false)} />
          ) : (
            <>
              <PhaseStepper
                currentPhase={currentPhase}
                completedPhases={completedPhases}
                onPhaseClick={(id) => setCurrentPhase(id)}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhase}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPhase === 0 && (
                    <Intro onStart={() => setShowIntro(false)} />
                  )}
                  {currentPhase === 1 && (
                    <Phase1Compression onComplete={onComplete} />
                  )}
                  {currentPhase === 2 && (
                    <Phase2AutoCompaction onComplete={onComplete} />
                  )}
                  {currentPhase === 3 && (
                    <Phase3MultiAgent onComplete={onComplete} />
                  )}
                  {currentPhase === 4 && (
                    <Phase4Isolation onComplete={onComplete} />
                  )}
                  {currentPhase === 5 && (
                    <Phase5Sharing onComplete={onComplete} />
                  )}
                  {currentPhase === 6 && (
                    <Phase6Windows onComplete={onComplete} />
                  )}
                  {currentPhase === 7 && <Phase7Synthesis scores={scores} />}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Context Engineering Workshop · Session 5 — COMPRESS &amp; ISOLATE ·
        BiteBridge
      </footer>
    </ApiKeyWrap>
  );
}

function ApiKeyWrap({ children }: { children: React.ReactNode }) {
  return <ApiKeyProvider>{children}</ApiKeyProvider>;
}
