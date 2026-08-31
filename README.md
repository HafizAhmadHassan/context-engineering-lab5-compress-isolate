# Day 5: COMPRESS & ISOLATE — Context Engineering
*Created: 2026-08-31*

A workspace-style (non-LLM) interactive walkthrough of the day-5 workshop: how to
**compress** context that accumulates inside a window and **isolate** work across
multiple focused windows using multiple agents.

Built with **Next.js 16 + React 19 + TypeScript + Tailwind v4 + Motion**,
deployable as a **static site** to GitHub Pages.

## Piloto Line-up

- **Phase 1 — Compress**: apply 3 compression techniques (LLM summarization,
  tool-result clearing, priority trimming + hierarchical) to an operations
  transcript and compare token savings / fact retention.
- **Phase 2 — Auto-Compaction**: configure thresholds and watch an
  auto-compaction system keep a simulated conversation under budget.
- **Phase 3 — Multi-Agent**: one agent vs. three specialized review agents
  (style / security / performance) reviewing a PR; see why isolation finds more.
- **Phase 4 — Isolation**: assign context items to agents within token budgets
  and validate findings.
- **Phase 5 — Context Sharing**: three sharing patterns (fan-out, pipeline,
  shared base context) + a scenario match challenge.
- **Phase 6 — Context Windows**: step through hierarchical delegation and watch
  each agent's context window build up with token budgets.
- **Phase 7 — Synthesis**: overall results, takeaways, token budgeting models.
- **Quiz**: a short graded quiz.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build   # static export writes to ./out
```

The static export can be served by any static host (GitHub Pages, etc.).

## API keys (optional)

The API-modal (top-right key icon) accepts **Gemini**, **OpenAI**, and **Groq**
keys to enhance Phase 1 summarization. All keys are stored only in the
browser's `localStorage` and calls are made directly from the client. All
phases work fully without a key (mock fallback).
