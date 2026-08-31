"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ApiKeyState {
  gemini: string;
  openai: string;
  groq: string;
}

type Provider = "gemini" | "openai" | "groq";

interface ApiKeyContextValue {
  keys: ApiKeyState;
  setKey: (provider: Provider, value: string) => void;
  hasKey: (provider: Provider) => boolean;
  availableProviders: Provider[];
  preferredProvider: Provider | null;
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

const STORAGE_KEY = "day5-unified-keys";

export function useApiKeys(): ApiKeyContextValue {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKeys must be used within ApiKeyProvider");
  return ctx;
}

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<ApiKeyState>(() => {
    if (typeof window === "undefined") return { gemini: "", openai: "", groq: "" };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { gemini: "", openai: "", groq: "", ...JSON.parse(raw) };
    } catch {
      /* ignore malformed */
    }
    return { gemini: "", openai: "", groq: "" };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  }, [keys]);

  const hasKey = (provider: Provider) => keys[provider].length > 0;
  const availableProviders = (["gemini", "openai", "groq"] as const).filter(hasKey);
  const preferredProvider = availableProviders[0] ?? null;

  const setKey = (provider: Provider, value: string) => {
    setKeys((prev) => ({ ...prev, [provider]: value }));
  };

  return (
    <ApiKeyContext.Provider
      value={{ keys, setKey, hasKey, availableProviders, preferredProvider }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}
