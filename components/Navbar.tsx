"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Key,
  Moon,
  Shrink,
  Sun,
  Check,
} from "lucide-react";
import { useApiKeys } from "@/lib/api-keys";
import Button from "@/components/Button";

function ApiKeysModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { keys, setKey, hasKey } = useApiKeys();
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [gemini, setGemini] = useState(keys.gemini);
  const [openai, setOpenAI] = useState(keys.openai);
  const [groq, setGroq] = useState(keys.groq);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">API Keys</h2>
            <p className="text-sm text-muted-foreground">
              Optional — Phase 1 summarization is enhanced with an API key. All
              phases work without one.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              Gemini API Key{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (free tier available)
              </span>
              {hasKey("gemini") && <Check className="h-4 w-4 text-green-500" />}
            </label>
            <div className="relative">
              <input
                type={showGemini ? "text" : "password"}
                value={gemini}
                onChange={(e) => setGemini(e.target.value)}
                placeholder="AIza..."
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              OpenAI API Key
              {hasKey("openai") && <Check className="h-4 w-4 text-green-500" />}
            </label>
            <div className="relative">
              <input
                type={showOpenAI ? "text" : "password"}
                value={openai}
                onChange={(e) => setOpenAI(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowOpenAI(!showOpenAI)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showOpenAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              Groq API Key{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (fast &amp; free tier available)
              </span>
              {hasKey("groq") && <Check className="h-4 w-4 text-green-500" />}
            </label>
            <div className="relative">
              <input
                type={showGroq ? "text" : "password"}
                value={groq}
                onChange={(e) => setGroq(e.target.value)}
                placeholder="gsk_..."
                className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showGroq ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {(hasKey("gemini") || hasKey("openai") || hasKey("groq")) && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Using{" "}
              {[
                hasKey("gemini") ? "Gemini" : null,
                hasKey("openai") ? "OpenAI" : null,
                hasKey("groq") ? "Groq" : null,
              ]
                .filter(Boolean)
                .join(" + ")}{" "}
              (primary listed first)
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setKey("gemini", gemini.trim());
              setKey("openai", openai.trim());
              setKey("groq", groq.trim());
              onClose();
            }}
          >
            Save Keys
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { availableProviders } = useApiKeys();
  const [keysOpen, setKeysOpen] = useState(false);
  const [dark, setDark] = useState(true);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Shrink className="h-5 w-5 text-session-5" />
            <span>Day 5: COMPRESS &amp; ISOLATE</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              {availableProviders.length === 0 ? (
                <span className="text-yellow-500">No API keys</span>
              ) : (
                availableProviders.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-green-500/10 px-2 py-0.5 text-green-500 capitalize"
                  >
                    {p}
                  </span>
                ))
              )}
            </div>
            <button
              onClick={() => setKeysOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-card transition-colors cursor-pointer"
              title="API Keys"
            >
              <Key className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setDark(!dark);
                document.documentElement.classList.toggle("dark");
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-card transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>
      <ApiKeysModal open={keysOpen} onClose={() => setKeysOpen(false)} />
    </>
  );
}
