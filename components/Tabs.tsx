"use client";

import { useState } from "react";
import { motion } from "motion/react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab: controlled,
  onChange,
  className = "",
}: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.id);
  const active = controlled ?? internal;

  return (
    <div className={`flex gap-1 rounded-lg bg-muted p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setInternal(tab.id);
            onChange?.(tab.id);
          }}
          className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
            active === tab.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-md bg-card border border-border"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
