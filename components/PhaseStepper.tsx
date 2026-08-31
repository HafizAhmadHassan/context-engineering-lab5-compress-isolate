"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PHASES } from "@/lib/data";
import {
  Scissors,
  ChartColumn,
  Users,
  Split,
  Share2,
  Eye,
  Layers,
} from "lucide-react";

const ICONS = [Scissors, ChartColumn, Users, Split, Share2, Eye, Layers];

export default function PhaseStepper({
  currentPhase,
  completedPhases,
  onPhaseClick,
}: {
  currentPhase: number;
  completedPhases: Set<number>;
  onPhaseClick: (id: number) => void;
}) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {PHASES.map((phase, i) => {
          const active = phase.id === currentPhase;
          const done = completedPhases.has(phase.id);
          const Icon = ICONS[i];
          return (
            <div key={phase.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => onPhaseClick(phase.id)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all cursor-pointer"
                  style={{
                    borderColor: active
                      ? phase.color
                      : done
                      ? "#22c55e"
                      : "var(--border)",
                    backgroundColor: active
                      ? phase.bgColor
                      : done
                      ? "rgba(34, 197, 94, 0.1)"
                      : "transparent",
                  }}
                >
                  {done && !active ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Icon
                      className="h-4 w-4"
                      style={{
                        color: active ? phase.color : "var(--foreground)",
                      }}
                    />
                  )}
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ borderColor: phase.color }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </button>
                <div className="text-center">
                  <span
                    className="text-[10px] font-semibold block"
                    style={{
                      color: active
                        ? phase.color
                        : done
                        ? "#22c55e"
                        : "var(--foreground)",
                    }}
                  >
                    {phase.shortLabel}
                  </span>
                </div>
              </div>
              {i < PHASES.length - 1 && (
                <div className="flex-1 mx-1 mt-[-1.5rem]">
                  <div>
                    <div className="h-0.5 w-full rounded-full overflow-hidden bg-border">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: done ? "#22c55e" : "transparent" }}
                        initial={{ width: "0%" }}
                        animate={{ width: done ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
