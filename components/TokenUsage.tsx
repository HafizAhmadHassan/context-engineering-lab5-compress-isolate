"use client";

import { motion } from "motion/react";
import { formatTokens, tokenColor } from "@/lib/utils";

interface TokenUsageProps {
  used: number;
  capacity: number;
  target?: number;
  label?: string;
  showLabels?: boolean;
  animate?: boolean;
}

export default function TokenUsage({
  used,
  capacity,
  target,
  label = "Token Usage",
  showLabels = true,
  animate = true,
}: TokenUsageProps) {
  const pct = used / capacity;
  const widthPct = Math.min(100, pct * 100);
  const color = tokenColor(pct);
  const targetPct = target ? Math.min(100, (target / capacity) * 100) : undefined;

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span className="text-xs font-mono" style={{ color }}>
            {formatTokens(used)} / {formatTokens(capacity)}
            <span className="text-muted-foreground ml-1">
              ({Math.round(widthPct)}%)
            </span>
          </span>
        </div>
      )}
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          initial={animate ? { width: 0 } : { width: `${widthPct}%` }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        {targetPct !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
            style={{ left: `${targetPct}%` }}
            title={`Target: ${formatTokens(target!)} tokens`}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap">
              Target
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
