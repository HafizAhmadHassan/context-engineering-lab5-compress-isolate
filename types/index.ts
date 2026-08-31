export type Priority = "P0" | "P1" | "P2" | "P3";

export interface TranscriptMessage {
  id: number;
  role: "user" | "assistant" | "tool";
  speaker: string;
  content: string;
  tokenCount: number;
  priority: Priority;
  isToolResult?: boolean;
  toolResultSummary?: string;
  keyFactIds: number[];
}

export interface KeyFact {
  id: number;
  text: string;
  category: string;
}

export interface CompressionTechnique {
  id: string;
  name: string;
  description: string;
  howItWorks: string;
  bestFor: string;
  tradeoff: string;
  color: string;
}

export interface TechniqueResult {
  technique: string;
  originalTokens: number;
  outputTokens: number;
  factsRetained: number[];
  transcript?: TranscriptMessage[];
  compressedText?: string;
  live?: boolean;
}

export interface PhaseResult {
  phase: number;
  score: number;
  maxScore: number;
  tokenCount?: number;
  summary: string;
}

export interface ContextItem {
  id: string;
  name: string;
  description: string;
  tokenCount: number;
  category: string;
}

export interface IsolationAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  tokenBudget: number;
  optimalContextIds: string[];
}

export interface IsolationFinding {
  id: string;
  agentId: string;
  severity: "critical" | "high" | "medium" | "low";
  text: string;
  requiredContextIds: string[];
}

export interface Rationale {
  agentId: string;
  contextId: string;
  reason: string;
}

export type SharingPatternId = "full-isolation" | "shared-base" | "sequential-pipeline";

export interface ContextFlowStage {
  name: string;
  color: string;
  inputs: { type: "shared" | "summary" | "base"; label: string; tokens: number }[];
  totalIn: number;
}

export interface SharingPattern {
  id: SharingPatternId;
  name: string;
  fullName: string;
  color: string;
  howItWorks: string;
  totalTokens: number;
  quality: number;
  latency: string;
  advantages: string[];
  tradeoffs: string[];
  bestFor: string;
  flow: ContextFlowStage[];
}

export interface Scenario {
  id: number;
  title: string;
  context: string;
  requirements: string[];
  correctPattern: SharingPatternId;
  explanation: string;
}

export interface CompactionPass {
  id: number;
  name: string;
  color: string;
  flashColor: string;
  description: string;
  action: string;
  reduction: string;
}
