import { PRE_COMPUTED_SUMMARY, PRE_COMPUTED_FACT_IDS } from "@/lib/data";

export type Provider = "gemini" | "openai" | "groq";

interface LLMRequest {
  provider: Provider | null;
  apiKey: string;
  system?: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export async function callLLM({
  provider,
  apiKey,
  system,
  messages,
  temperature,
  maxTokens,
}: LLMRequest) {
  // If a real API key was provided, call the provider directly from the browser.
  if (provider && apiKey) {
    try {
      if (provider === "gemini") {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: system
                ? { parts: [{ text: system }] }
                : undefined,
              contents: [
                { parts: messages.map((m) => ({ text: m.content })) },
              ],
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          return {
            choices: [
              {
                message: {
                  content:
                    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
                },
              },
            ],
          };
        }
      } else if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: system }, ...messages],
            temperature: temperature ?? 0.3,
            max_tokens: maxTokens ?? 1024,
          }),
        });
        if (res.ok) return await res.json();
      } else if (provider === "groq") {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: system }, ...messages],
            temperature: temperature ?? 0.3,
            max_tokens: maxTokens ?? 1024,
          }),
        });
        if (res.ok) return await res.json();
      }
    } catch {
      // fall through to mock
    }
  }

  // Mock: return realistic fallback data.
  return {
    choices: [
      {
        message: {
          content: PRE_COMPUTED_SUMMARY,
          keyFactIds: PRE_COMPUTED_FACT_IDS,
        },
      },
    ],
  };
}
