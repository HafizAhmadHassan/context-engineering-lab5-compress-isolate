export interface ContextEntry {
  kind: "base" | "instructions" | "data" | "summary" | "plan";
  title: string;
  tokens: number;
  content: string;
}

export interface StepAgentContext {
  agentId: string;
  tokens: number;
  maxTokens: number;
  entries: ContextEntry[];
}

export interface WindowStep {
  id: number;
  title: string;
  description: string;
  annotation: string;
  agents: StepAgentContext[];
}

const BASE: ContextEntry[] = [
  { kind: "base", title: "CLAUDE.md + Incident Briefing", tokens: 360, content: "Project conventions, terminology, severity levels shared across all agents." },
  { kind: "plan", title: "Delegation Plan", tokens: 100, content: "Orchestrator's plan for which agents run and in what order." },
];

const ROOT_AGENT: StepAgentContext = {
  agentId: "root-cause-analyst",
  tokens: 770,
  maxTokens: 1500,
  entries: [
    { kind: "base", title: "CLAUDE.md + Briefing", tokens: 360, content: "Project base context shared with all agents." },
    { kind: "instructions", title: "agents.md", tokens: 100, content: "Root Cause Analyst instructions." },
    { kind: "data", title: "config-audit.json", tokens: 120, content: "Delivery radius config changed 5→50 km." },
    { kind: "data", title: "driver-analytics.json", tokens: 190, content: "Driver pool depleted, cross-city routes." },
  ],
};

const IMPACT_AGENT: StepAgentContext = {
  agentId: "impact-assessor",
  tokens: 870,
  maxTokens: 1500,
  entries: [
    { kind: "base", title: "CLAUDE.md + Briefing", tokens: 360, content: "Project base context shared with all agents." },
    { kind: "instructions", title: "agents.md", tokens: 110, content: "Impact Assessor instructions." },
    { kind: "summary", title: "← Root Cause Summary", tokens: 180, content: "Root cause summary passed down from parent step." },
    { kind: "data", title: "order-metrics.json", tokens: 130, content: "Order queue, cancellation rates, delivery times." },
    { kind: "data", title: "perf-baseline.json", tokens: 90, content: "Baseline operating metrics for comparison." },
  ],
};

const RECOVERY_AGENT: StepAgentContext = {
  agentId: "recovery-planner",
  tokens: 1060,
  maxTokens: 1500,
  entries: [
    { kind: "base", title: "CLAUDE.md + Briefing", tokens: 360, content: "Project base context shared with all agents." },
    { kind: "instructions", title: "agents.md", tokens: 105, content: "Recovery Planner instructions." },
    { kind: "summary", title: "← Root Cause + Impact", tokens: 345, content: "Summaries from both prior analysts." },
    { kind: "data", title: "recovery-data.json", tokens: 130, content: "Recovery trajectory metrics." },
    { kind: "data", title: "customer-playbook.md", tokens: 120, content: "Customer communication and compensation playbook." },
  ],
};

export const WINDOW_STEPS: WindowStep[] = [
  {
    id: 0,
    title: "Task Arrives",
    description: "The orchestrator receives the incident task and reads the project base context (CLAUDE.md + incident briefing).",
    annotation: "Orchestrator starts with shared base context that every agent will inherit.",
    agents: [
      {
        agentId: "orchestrator",
        tokens: 565,
        maxTokens: 2000,
        entries: [
          { kind: "base", title: "CLAUDE.md + Briefing", tokens: 360, content: "Project conventions, terminology, incident briefing (shared base → all agents)." },
          { kind: "instructions", title: "agents/agents.md", tokens: 205, content: "Orchestrator-specific instructions: how to delegate and merge." },
        ],
      },
    ],
  },
  {
    id: 1,
    title: "Delegate",
    description: "The orchestrator dispatches the root-cause analysis to the Root Cause Analyst sub-agent.",
    annotation: "Orchestrator selects only config + driver data for the Root Cause Analyst.",
    agents: [
      ROOT_AGENT,
      {
        agentId: "orchestrator",
        tokens: 565,
        maxTokens: 2000,
        entries: BASE,
      },
    ],
  },
  {
    id: 2,
    title: "Root Cause Returns Summary",
    description: "The Root Cause Analyst returns a compressed summary, which enters the orchestrator's window.",
    annotation: "Only the summary — raw driver + config data stays in the sub-agent's window.",
    agents: [
      ROOT_AGENT,
      {
        agentId: "orchestrator",
        tokens: 745,
        maxTokens: 2000,
        entries: [
          ...BASE,
          { kind: "summary", title: "← Root Cause Summary", tokens: 180, content: "Config change (PR #892) expanded delivery radius 5km→50km, causing cross-city driver dispatch." },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Delegate",
    description: "The orchestrator dispatches the impact analysis to the Impact Assessor sub-agent.",
    annotation: "Impact Assessor receives root cause summary + order/baseline data.",
    agents: [
      IMPACT_AGENT,
      {
        agentId: "orchestrator",
        tokens: 745,
        maxTokens: 2000,
        entries: [
          ...BASE,
          { kind: "summary", title: "← Root Cause Summary", tokens: 180, content: "Config change (PR #892) expanded delivery radius 5km→50km." },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Impact Assessor Returns Summary",
    description: "The Impact Assessor returns a summary of operational impact, entering the orchestrator's window.",
    annotation: "Orchestrator now holds two summaries, still not the raw data.",
    agents: [
      IMPACT_AGENT,
      {
        agentId: "orchestrator",
        tokens: 925,
        maxTokens: 2000,
        entries: [
          ...BASE,
          { kind: "summary", title: "← Root Cause Summary", tokens: 180, content: "Config change expanded delivery radius causing dispatch failures." },
          { kind: "summary", title: "← Impact Summary", tokens: 180, content: "Delivery times 3.4x, cancellations surged, driver pool depleted." },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Delegate",
    description: "The orchestrator dispatches recovery planning to the Recovery Planner sub-agent.",
    annotation: "Recovery Planner receives both summaries + ops playbook data.",
    agents: [
      RECOVERY_AGENT,
      {
        agentId: "orchestrator",
        tokens: 925,
        maxTokens: 2000,
        entries: [
          ...BASE,
          { kind: "summary", title: "← Root Cause Summary", tokens: 180, content: "Config change expanded delivery radius causing dispatch failures." },
          { kind: "summary", title: "← Impact Summary", tokens: 180, content: "Delivery times 3.4x, cancellations surged, driver pool depleted." },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Final Synthesis",
    description: "The Recovery Planner returns its summary and the orchestrator synthesizes the final incident report.",
    annotation: "Orchestrator holds 515 tokens of summaries — not the 1,400+ tokens of raw data.",
    agents: [
      RECOVERY_AGENT,
      {
        agentId: "orchestrator",
        tokens: 1075,
        maxTokens: 2000,
        entries: [
          ...BASE,
          { kind: "summary", title: "← Root Cause Summary", tokens: 180, content: "Config change expanded delivery radius causing dispatch failures." },
          { kind: "summary", title: "← Impact Summary", tokens: 180, content: "Delivery times 3.4x, cancellations surged, driver pool depleted." },
          { kind: "summary", title: "← Recovery Summary", tokens: 150, content: "Revert config, rebalance drivers, add geo-scoping guardrails." },
        ],
      },
    ],
  },
];

export const KIND_COLORS: Record<string, string> = {
  base: "#3b82f6",
  instructions: "#f59e0b",
  data: "#8b5cf6",
  summary: "#22c55e",
  plan: "#eab308",
};
