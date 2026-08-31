import type {
  ContextItem,
  IsolationAgent,
  IsolationFinding,
  KeyFact,
  Rationale,
  Scenario,
  SharingPattern,
  TranscriptMessage,
  CompressionTechnique,
  CompactionPass,
} from "@/types";

export const PHASES = [
  {
    id: 1,
    label: "Compression",
    shortLabel: "Compress",
    color: "#f97316",
    bgColor: "rgba(249, 115, 22, 0.1)",
  },
  {
    id: 2,
    label: "Auto-Compaction",
    shortLabel: "Compact",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
  },
  {
    id: 3,
    label: "Multi-Agent",
    shortLabel: "Agents",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.1)",
  },
  {
    id: 4,
    label: "Context Isolation",
    shortLabel: "Isolate",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  {
    id: 5,
    label: "Context Sharing",
    shortLabel: "Share",
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.1)",
  },
  {
    id: 6,
    label: "Context Windows",
    shortLabel: "Windows",
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.1)",
  },
  {
    id: 7,
    label: "Synthesis",
    shortLabel: "Synthesis",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
] as const;

export const FEATURE_CARDS = [
  {
    title: "Compression",
    description: "4 techniques, IRR scoring",
    color: "#f97316",
    api: true,
  },
  {
    title: "Auto-Compaction",
    description: "3-pass threshold system",
    color: "#3b82f6",
    api: false,
  },
  {
    title: "Multi-Agent",
    description: "Contract-first code review",
    color: "#22c55e",
    api: true,
  },
  {
    title: "Context Isolation",
    description: "Distribute context to agents",
    color: "#8b5cf6",
    api: false,
  },
  {
    title: "Context Sharing",
    description: "3 sharing patterns",
    color: "#06b6d4",
    api: false,
  },
  {
    title: "Context Windows",
    description: "Visualize agent context flow",
    color: "#ec4899",
    api: false,
  },
];

export const TRANSCRIPT: TranscriptMessage[] = [
  {
    id: 1,
    role: "user",
    speaker: "Operations Manager (Priya)",
    content:
      "BiteBridge is in crisis — average delivery times just jumped from 28 minutes to 97 minutes across the metro area. Started about 10 minutes ago right at Friday dinner rush peak (7 PM). We're seeing a flood of customer cancellations and driver complaints about being routed across the entire city. Need to triage now.",
    tokenCount: 58,
    priority: "P0",
    isToolResult: false,
    keyFactIds: [1, 2],
  },
  {
    id: 2,
    role: "assistant",
    speaker: "BiteBridge AI",
    content:
      "Acknowledged — a 3.5x spike in delivery times during Friday peak is a P0 event. Drivers being routed across the city suggests a matching or routing misconfiguration. Let me pull the current order dashboard and driver analytics to understand the scope. Querying systems now.",
    tokenCount: 52,
    priority: "P0",
    isToolResult: false,
    keyFactIds: [1],
  },
  {
    id: 3,
    role: "tool",
    speaker: "order_dashboard",
    content: `{
  "query": "order_metrics last 30m",
  "results": {
    "timestamps": ["18:45", "18:50", "18:55", "19:00", "19:05", "19:10", "19:15"],
    "avg_delivery_min": [27, 29, 28, 64, 82, 91, 97],
    "order_queue_depth": [42, 48, 45, 138, 224, 310, 387],
    "cancellation_rate_pct": [2.1, 2.3, 1.9, 8.4, 14.2, 19.8, 23.6],
    "orders_per_min": [86, 91, 88, 84, 72, 58, 41],
    "avg_driver_distance_km": [2.8, 3.1, 2.9, 18.4, 26.7, 31.2, 34.8],
    "driver_acceptance_rate_pct": [89, 87, 90, 52, 34, 22, 18],
    "active_orders": [520, 545, 532, 680, 790, 860, 912]
  }
}`,
    tokenCount: 275,
    priority: "P1",
    isToolResult: true,
    toolResultSummary:
      "Metrics show: avg delivery time spiked from 28min to 97min at 19:00. Order queue backed up from 45 to 387. Cancellation rate jumped to 23.6%. Avg driver distance ballooned from 2.9km to 34.8km. Driver acceptance rate crashed to 18%.",
    keyFactIds: [1, 3, 4, 5],
  },
  {
    id: 4,
    role: "assistant",
    speaker: "BiteBridge AI",
    content:
      "Critical finding: average driver-to-restaurant distance exploded from 2.9km to 34.8km at exactly 19:00. That's the smoking gun — drivers are being matched to restaurants absurdly far away, which means they can't accept or complete deliveries in time. The cascading effect: order queue backup (45 → 387), acceptance rate collapse (90% → 18%), cancellation spike (1.9% → 23.6%). Let me check the driver analytics and matching algorithm configuration.",
    tokenCount: 88,
    priority: "P0",
    isToolResult: false,
    keyFactIds: [3, 4, 5],
  },
  {
    id: 5,
    role: "tool",
    speaker: "driver_analytics",
    content: `{
  "query": "driver_pool status last 1h",
  "results": [
    {"ts": "18:50", "available_drivers": 342, "en_route_drivers": 198, "avg_trip_km": 3.2, "idle_drivers": 144, "out_of_zone_drivers": 0},
    {"ts": "19:00", "available_drivers": 342, "en_route_drivers": 284, "avg_trip_km": 22.6, "idle_drivers": 12, "out_of_zone_drivers": 46},
    {"ts": "19:05", "available_drivers": 338, "en_route_drivers": 318, "avg_trip_km": 28.4, "idle_drivers": 4, "out_of_zone_drivers": 112},
    {"ts": "19:10", "available_drivers": 330, "en_route_drivers": 322, "avg_trip_km": 31.8, "idle_drivers": 2, "out_of_zone_drivers": 168},
    {"ts": "19:15", "available_drivers": 318, "en_route_drivers": 316, "avg_trip_km": 33.1, "idle_drivers": 0, "out_of_zone_drivers": 204}
  ]
}`,
    tokenCount: 310,
    priority: "P0",
    isToolResult: true,
    toolResultSummary:
      "Driver analytics: idle drivers dropped from 144 to 0 within 15 minutes. 204 drivers now classified as out-of-zone. Average trip distance jumped from 3.2km to 33.1km. Entire driver pool is effectively depleted for local orders.",
    keyFactIds: [3, 5],
  },
  {
    id: 6,
    role: "assistant",
    speaker: "BiteBridge AI",
    content:
      "The driver pool is completely drained — zero idle drivers, 204 out of 318 total drivers are flagged as out-of-zone. They're being sent on 30+ km trips instead of the normal 3km. The matching algorithm's delivery radius has to be misconfigured. Let me pull the config audit log to find what changed.",
    tokenCount: 62,
    priority: "P0",
    isToolResult: false,
    keyFactIds: [5, 6],
  },
  {
    id: 7,
    role: "tool",
    speaker: "config_audit_log",
    content: `{
  "query": "config changes last 2h matching|routing|radius",
  "results": [
    {"ts": "18:56:12", "user": "deploy-bot", "action": "update", "key": "matching.algorithm.delivery_radius_km", "old": 5, "new": 50, "source": "PR #892 — 'Expand radius for Westfield test market'", "environment": "production", "approved_by": "auto-deploy"},
    {"ts": "18:56:12", "user": "deploy-bot", "action": "update", "key": "matching.algorithm.max_driver_distance_km", "old": 8, "new": 80, "source": "PR #892 — 'Expand radius for Westfield test market'", "environment": "production", "approved_by": "auto-deploy"},
    {"ts": "18:22:44", "user": "deploy-bot", "action": "update", "key": "promotions.friday_rush_banner", "old": false, "new": true, "source": "PR #890", "environment": "production", "approved_by": "product-lead-review"}
  ]
}`,
    tokenCount: 280,
    priority: "P0",
    isToolResult: true,
    toolResultSummary:
      "Config audit: PR #892 ('Expand radius for Westfield test market') auto-deployed at 18:56, changing delivery_radius_km from 5→50 and max_driver_distance_km from 8→80 in production. Was meant for a single test market but applied globally.",
    keyFactIds: [6, 7, 8, 9, 10],
  },
  {
    id: 8,
    role: "assistant",
    speaker: "BiteBridge AI",
    content:
      "ROOT CAUSE IDENTIFIED: At 18:56, PR #892 titled 'Expand radius for Westfield test market' was auto-deployed to production. It changed delivery_radius_km from 5 to 50 and max_driver_distance_km from 8 to 80. This was intended only for the Westfield test market but was applied globally via auto-deploy, causing the matching algorithm to send drivers up to 50km away for any order. IMMEDIATE ACTION: Revert both radius parameters now.",
    tokenCount: 92,
    priority: "P0",
    isToolResult: false,
    keyFactIds: [6, 7, 8, 9, 10, 11],
  },
  {
    id: 9,
    role: "user",
    speaker: "Operations Manager (Priya)",
    content:
      "Pushing the config revert now — setting delivery_radius_km back to 5 and max_driver_distance_km back to 8. Also notifying the ops lead about the auto-deploy policy. A radius change like this should never go live without geo-scoping. What's our expected recovery time once we revert?",
    tokenCount: 56,
    priority: "P0",
    isToolResult: false,
    keyFactIds: [11, 12],
  },
  {
    id: 10,
    role: "assistant",
    speaker: "BiteBridge AI",
    content:
      "Once the radius is reverted: new order matches will immediately use the correct 5km radius, so incoming orders will get local drivers. However, the 204 drivers currently on long-haul trips will take 15-25 minutes to complete those deliveries and become available locally again. Expected recovery: 5-10 minutes for new orders to match correctly, 20-30 minutes for the full driver pool to rebalance and queue depth to normalize. Watch the avg_driver_distance_km metric — we want it back under 4km.",
    tokenCount: 98,
    priority: "P1",
    isToolResult: false,
    keyFactIds: [13, 14],
  },
  {
    id: 11,
    role: "user",
    speaker: "Operations Manager (Priya)",
    content:
      "Config revert deployed. Radius values restored: delivery_radius_km=5, max_driver_distance_km=8. Monitoring the dashboard now.",
    tokenCount: 30,
    priority: "P0",
    isToolResult: false,
    keyFactIds: [11],
  },
  {
    id: 12,
    role: "tool",
    speaker: "delivery_metrics",
    content: `{
  "query": "delivery_metrics last 20m (post-fix)",
  "results": {
    "timestamps": ["19:20", "19:25", "19:30", "19:35", "19:40"],
    "avg_delivery_min": [89, 62, 44, 34, 30],
    "cancellation_rate_pct": [18.2, 11.4, 5.8, 3.2, 2.4],
    "order_queue_depth": [340, 218, 124, 72, 51],
    "avg_driver_distance_km": [28.4, 14.2, 5.8, 3.6, 3.1],
    "driver_acceptance_rate_pct": [24, 48, 72, 84, 88]
  }
}`,
    tokenCount: 220,
    priority: "P1",
    isToolResult: true,
    toolResultSummary:
      "Post-fix metrics: Avg delivery time recovering 89min→30min over 20 min. Driver distance normalizing to 3.1km. Cancellation rate down to 2.4%. Order queue draining from 340 to 51. Acceptance rate climbing back to 88%.",
    keyFactIds: [15, 16],
  },
  {
    id: 13,
    role: "assistant",
    speaker: "BiteBridge AI",
    content:
      "Strong recovery underway. Delivery times back to 30 minutes (near baseline of 28), driver distance normalized to 3.1km, cancellation rate at 2.4% (baseline ~2%), queue depth at 51 (baseline ~45), acceptance rate at 88%. The incident is effectively resolved. Let me compile the post-incident summary.",
    tokenCount: 60,
    priority: "P1",
    isToolResult: false,
    keyFactIds: [15, 16],
  },
  {
    id: 14,
    role: "assistant",
    speaker: "BiteBridge AI",
    content:
      "POST-INCIDENT SUMMARY:\n\n• Duration: 18:56 – 19:40 (44 minutes)\n• Impact: Delivery times 3.5x normal, cancellation rate peaked at 23.6%, driver pool fully depleted for local orders\n• Root Cause: PR #892 changed delivery radius from 5km to 50km in production (meant for Westfield test market only)\n• Contributing Factor: Auto-deploy policy allowed global radius changes without geo-scoping or human review\n• Mitigation: Reverted to delivery_radius_km=5, max_driver_distance_km=8\n• Recovery: Full recovery within 20 minutes of fix\n\nRECOMMENDED FOLLOW-UPS:\n1. Require geo-scoping for any delivery radius or matching algorithm changes\n2. Add guardrails: reject delivery_radius_km > 15 in production without ops approval\n3. Add per-market configuration isolation so test market changes cannot affect global settings\n4. Build a driver rebalancing procedure to accelerate recovery from pool displacement events",
    tokenCount: 178,
    priority: "P1",
    isToolResult: false,
    keyFactIds: [17, 18, 19, 20],
  },
  {
    id: 15,
    role: "user",
    speaker: "Operations Manager (Priya)",
    content:
      "Great summary. I'll create tickets for all four follow-up items. Marking this incident as resolved. The driver distance spike was the key signal — once we saw 34km average trips, it was clear the matching radius was blown wide open. Thanks for the fast triage.",
    tokenCount: 48,
    priority: "P2",
    isToolResult: false,
    keyFactIds: [],
  },
];

export const KEY_FACTS: KeyFact[] = [
  { id: 1, text: "Average delivery time spiked from 28 minutes to 97 minutes during Friday dinner rush", category: "metric" },
  { id: 2, text: "Customer cancellation rate peaked at 23.6%, up from baseline 2%", category: "metric" },
  { id: 3, text: "Average driver-to-restaurant distance exploded from 2.9km to 34.8km", category: "metric" },
  { id: 4, text: "Order queue backed up from 45 to 387 pending orders", category: "metric" },
  { id: 5, text: "Driver acceptance rate collapsed from 90% to 18%, with zero idle drivers remaining", category: "metric" },
  { id: 6, text: "Root cause: delivery_radius_km changed from 5 to 50 in production config", category: "root-cause" },
  { id: 7, text: "max_driver_distance_km was also changed from 8 to 80", category: "root-cause" },
  { id: 8, text: "Change came from PR #892 titled 'Expand radius for Westfield test market'", category: "root-cause" },
  { id: 9, text: "PR was auto-deployed without human review or geo-scoping", category: "root-cause" },
  { id: 10, text: "Change was intended for Westfield test market only but applied globally to production", category: "root-cause" },
  { id: 11, text: "Mitigation: Reverted to delivery_radius_km=5, max_driver_distance_km=8", category: "mitigation" },
  { id: 12, text: "Ops lead was notified about the auto-deploy policy gap", category: "action" },
  { id: 13, text: "Expected recovery: 5-10 min for new matches, 20-30 min for full driver pool rebalance", category: "decision" },
  { id: 14, text: "avg_driver_distance_km identified as key recovery indicator (target <4km)", category: "decision" },
  { id: 15, text: "System recovered within 20 minutes of the fix", category: "metric" },
  { id: 16, text: "Post-fix: delivery time back to 30min, driver distance 3.1km, cancellation rate 2.4%", category: "metric" },
  { id: 17, text: "Follow-up: Require geo-scoping for delivery radius and matching algorithm changes", category: "action" },
  { id: 18, text: "Follow-up: Add guardrails to reject delivery_radius_km > 15 in production without approval", category: "action" },
  { id: 19, text: "Follow-up: Add per-market configuration isolation for test market changes", category: "action" },
  { id: 20, text: "Follow-up: Build driver rebalancing procedure for pool displacement recovery", category: "action" },
];

export const COMPRESSION_TECHNIQUES: CompressionTechnique[] = [
  {
    id: "summarization",
    name: "LLM Summarization",
    description: "Use an LLM to compress the entire transcript into a dense summary",
    howItWorks: "Send the full conversation to an LLM with instructions to summarize while preserving key decisions, root causes, and action items.",
    bestFor: "Maximum compression when you have an LLM available",
    tradeoff: "Requires API call, may hallucinate or omit subtle details",
    color: "#f97316",
  },
  {
    id: "tool-clearing",
    name: "Tool Result Clearing",
    description: "Replace verbose tool outputs with one-line summaries",
    howItWorks: "Identify tool result messages and replace their full JSON output with a pre-computed summary line. The reasoning around tool results is preserved.",
    bestFor: "Conversations with large tool outputs (JSON, logs, metrics)",
    tradeoff: "Simple to implement but only helps if tool results are large",
    color: "#3b82f6",
  },
  {
    id: "priority-trimming",
    name: "Priority Trimming",
    description: "Assign priority levels to messages and drop low-priority ones",
    howItWorks: "Each message gets a priority tag (P0=critical, P1=important, P2=background, P3=routine). Remove all P3 messages and optionally compress P2 messages.",
    bestFor: "Long conversations where some turns are administrative/routine",
    tradeoff: "Requires priority assignment (can be automated); may lose context",
    color: "#22c55e",
  },
  {
    id: "hierarchical",
    name: "Hierarchical Compression",
    description: "Preserve different levels at different compression rates",
    howItWorks: "Categorize content into tiers: Critical (100% preserved), Important (50% — summarized), Background (10% — one-line), Routine (0% — removed).",
    bestFor: "Fine-grained control over what to keep vs discard",
    tradeoff: "Most complex to configure but gives best precision",
    color: "#a855f7",
  },
];

export const PRE_COMPUTED_SUMMARY = `INCIDENT SUMMARY — BiteBridge Friday Dinner Rush Crisis

Root Cause: PR #892 ("Expand radius for Westfield test market") was auto-deployed to production at 18:56, changing delivery_radius_km from 5 to 50 and max_driver_distance_km from 8 to 80. This was intended for a single test market but applied globally.

Impact: Average delivery times spiked 3.5x (28min → 97min), cancellation rate peaked at 23.6%, driver distance exploded from 2.9km to 34.8km, order queue backed up to 387, driver acceptance rate collapsed to 18% with zero idle drivers.

Timeline: Crisis began at 19:00, root cause identified at 19:10 via driver distance correlation, config reverted at 19:20, full recovery by 19:40 (44 min total).

Mitigation: Reverted radius values to delivery_radius_km=5, max_driver_distance_km=8.

Follow-ups: (1) Require geo-scoping for radius changes, (2) Reject delivery_radius_km > 15 in production without approval, (3) Per-market configuration isolation, (4) Driver rebalancing procedure for pool displacement recovery.`;

export const PRE_COMPUTED_FACT_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 18, 19, 20,
];

export const CONTEXT_ITEMS: ContextItem[] = [
  { id: "system-prompt", name: "System Prompt", description: "Base instructions defining the agent's role and output format", tokenCount: 120, category: "base" },
  { id: "task-briefing", name: "Task Briefing", description: '"Analyze the BiteBridge Friday rush crisis for order delays, delivery failures, and customer impact"', tokenCount: 80, category: "base" },
  { id: "initial-alert", name: "Initial P1 Alert", description: "Priya's alert: delivery times jumped from 28 min to 95 min, 38% orders cancelled", tokenCount: 55, category: "analysis" },
  { id: "order-dashboard", name: "Order Dashboard", description: "JSON metrics: pending orders, avg prep time, avg delivery time, cancellation rate, order volume per hour", tokenCount: 280, category: "metrics" },
  { id: "driver-analytics", name: "Driver Analytics", description: "Driver fleet status: available count dropped 340→45, avg assignment distance 4km→42km, GPS data showing cross-city routes", tokenCount: 320, category: "logs" },
  { id: "config-audit", name: "Config Audit Trail", description: "PR #892 'Expand delivery coverage for suburbs' auto-deployed, radius changed 5km→50km globally", tokenCount: 240, category: "config" },
  { id: "root-cause-summary", name: "Root Cause Summary", description: "AI's analysis: 50km radius causing cross-city driver assignments, driver shortage cascade across all zones", tokenCount: 75, category: "analysis" },
  { id: "recovery-metrics", name: "Recovery Metrics", description: "Post-fix: delivery times 95min→32min over 18 min, driver availability recovering across zones", tokenCount: 190, category: "metrics" },
  { id: "incident-summary", name: "Post-Incident Summary", description: "Full summary: 45-min disruption, customer impact stats, root cause, mitigation steps, follow-up items", tokenCount: 160, category: "analysis" },
  { id: "ops-playbook", name: "Ops Playbook", description: "Delivery operations procedures: driver rebalancing, surge management, order queue prioritization", tokenCount: 220, category: "reference" },
  { id: "customer-impact-guide", name: "Customer Impact Guide", description: "Customer experience protocols: refund policies, compensation tiers, communication templates", tokenCount: 180, category: "reference" },
  { id: "perf-baseline", name: "Performance Baseline", description: "Normal operating metrics: delivery=28min, drivers available=340, order queue=150, cancellation=3%", tokenCount: 150, category: "metrics" },
];

export const CONTEXT_CATEGORY_COLORS: Record<string, string> = {
  base: "#6366f1",
  metrics: "#f97316",
  logs: "#eab308",
  config: "#ef4444",
  analysis: "#22c55e",
  reference: "#8b5cf6",
};

export const ISOLATION_AGENTS: IsolationAgent[] = [
  {
    id: "order-flow",
    name: "Order Flow Analyst",
    role: "Analyze order pipeline bottleneck",
    description: "Investigates the order pipeline to identify where and why orders backed up during the Friday rush crisis",
    color: "#ef4444",
    tokenBudget: 1100,
    optimalContextIds: ["system-prompt", "task-briefing", "order-dashboard", "driver-analytics", "config-audit"],
  },
  {
    id: "delivery-ops",
    name: "Delivery Operations Analyst",
    role: "Analyze driver dispatch and routing",
    description: "Examines driver fleet behavior, dispatch patterns, and routing anomalies to assess operational impact",
    color: "#3b82f6",
    tokenBudget: 950,
    optimalContextIds: ["system-prompt", "task-briefing", "initial-alert", "order-dashboard", "recovery-metrics", "perf-baseline"],
  },
  {
    id: "customer-exp",
    name: "Customer Experience Analyst",
    role: "Analyze customer impact and recommend recovery",
    description: "Assesses customer-facing damage from the crisis and recommends compensation and communication strategies",
    color: "#22c55e",
    tokenBudget: 900,
    optimalContextIds: ["system-prompt", "task-briefing", "root-cause-summary", "config-audit", "customer-impact-guide", "incident-summary"],
  },
];

export const ISOLATION_FINDINGS: IsolationFinding[] = [
  { id: "of-1", agentId: "order-flow", severity: "critical", text: "Delivery radius config change from 5km to 50km caused a cascade of cross-city driver assignments, draining local availability", requiredContextIds: ["driver-analytics", "config-audit"] },
  { id: "of-2", agentId: "order-flow", severity: "high", text: "PR #892 ('Expand delivery coverage for suburbs') auto-deployed without human review during peak Friday hours", requiredContextIds: ["config-audit"] },
  { id: "of-3", agentId: "order-flow", severity: "high", text: "Order queue backed up 8x normal levels — pending orders surged from 150 to 1,200+ within 20 minutes", requiredContextIds: ["order-dashboard"] },
  { id: "of-4", agentId: "order-flow", severity: "medium", text: "Restaurant prep times remained stable at 12–15 min — bottleneck was entirely in driver dispatch, not kitchen output", requiredContextIds: ["order-dashboard", "driver-analytics"] },
  { id: "do-1", agentId: "delivery-ops", severity: "critical", text: "Drivers dispatched 40+ km away from their zones — GPS data shows cross-city routes consuming 3–4x normal trip time", requiredContextIds: ["initial-alert", "order-dashboard"] },
  { id: "do-2", agentId: "delivery-ops", severity: "high", text: "Available driver count dropped 87% (340→45) as fleet was scattered across the expanded 50km radius", requiredContextIds: ["order-dashboard", "perf-baseline"] },
  { id: "do-3", agentId: "delivery-ops", severity: "high", text: "Average delivery time spiked 3.4x from baseline (28min→95min) — confirmed against normal operating metrics", requiredContextIds: ["recovery-metrics", "perf-baseline"] },
  { id: "do-4", agentId: "delivery-ops", severity: "medium", text: "Cross-city routing patterns visible in GPS telemetry — drivers looping between distant zones instead of staying local", requiredContextIds: ["order-dashboard", "recovery-metrics"] },
  { id: "ce-1", agentId: "customer-exp", severity: "critical", text: "Cancellation rate hit 38% (13x the normal 3%) — customers abandoned orders after seeing 2+ hour estimated delivery times", requiredContextIds: ["root-cause-summary", "customer-impact-guide"] },
  { id: "ce-2", agentId: "customer-exp", severity: "high", text: "Estimated delivery times displayed 2+ hours to customers, triggering mass cancellations and negative reviews", requiredContextIds: ["root-cause-summary", "incident-summary"] },
  { id: "ce-3", agentId: "customer-exp", severity: "high", text: "Compensation required for all affected orders — recommend tier-2 refunds plus credits per customer impact guide protocols", requiredContextIds: ["customer-impact-guide", "incident-summary"] },
  { id: "ce-4", agentId: "customer-exp", severity: "medium", text: "Refund processing queue backed up — automated refund system overwhelmed by volume, manual intervention needed for 400+ orders", requiredContextIds: ["config-audit", "customer-impact-guide"] },
];

export const NAIVE_BASELINE = {
  totalTokensPerAgent: 1970,
  findingsQualityPct: 55,
  issues: [
    "Every agent exceeds its token budget by 2x+",
    "Agents get confused by irrelevant context (customer experience agent sees driver GPS data)",
    "Order flow analysis diluted by customer refund policies",
    "Delivery operations assessment muddled by compensation tier details",
    "Higher hallucination rate when context is noisy",
  ],
};

export const SOLUTION_RATIONALES: Rationale[] = [
  { agentId: "order-flow", contextId: "order-dashboard", reason: "Order metrics (pending count, prep time, delivery time, cancellation rate) are the primary data source for diagnosing pipeline bottlenecks." },
  { agentId: "order-flow", contextId: "driver-analytics", reason: "Driver fleet data (340→45 available, 4km→42km distances) reveals the dispatch cascade that caused the order backup." },
  { agentId: "order-flow", contextId: "config-audit", reason: "The config change (PR #892, radius 5km→50km) is the root cause — this agent needs it to connect the config change to the order pipeline failure." },
  { agentId: "delivery-ops", contextId: "initial-alert", reason: "Priya's P1 alert (28→95 min delivery, 38% cancellations) provides the starting context for investigating operational anomalies." },
  { agentId: "delivery-ops", contextId: "order-dashboard", reason: "Order metrics help quantify the operational impact — how many orders were affected, what queues looked like during the crisis." },
  { agentId: "delivery-ops", contextId: "recovery-metrics", reason: "Post-fix metrics (95→32 min over 18 min) show recovery trajectory — essential for assessing whether operations are stabilizing." },
  { agentId: "delivery-ops", contextId: "perf-baseline", reason: "Normal operating baselines (delivery=28min, drivers=340) are needed to compare against crisis metrics and quantify impact severity." },
  { agentId: "customer-exp", contextId: "root-cause-summary", reason: "The root cause summary gives this agent the 'what happened' context needed to craft accurate customer-facing communications." },
  { agentId: "customer-exp", contextId: "config-audit", reason: "Knowing the specific config change helps assess accountability and determine the scope of customer impact for compensation tiers." },
  { agentId: "customer-exp", contextId: "customer-impact-guide", reason: "Refund policies, compensation tiers, and communication templates — this is the customer experience agent's core reference material." },
  { agentId: "customer-exp", contextId: "incident-summary", reason: "The full incident summary (45-min disruption, impact stats, follow-ups) is needed to draft post-incident customer communications." },
];

export const EXCLUSION_RATIONALES: Rationale[] = [
  { agentId: "order-flow", contextId: "customer-impact-guide", reason: "Refund policies are irrelevant to diagnosing the order pipeline — this would just add noise and waste 180 tokens." },
  { agentId: "order-flow", contextId: "recovery-metrics", reason: "Recovery data is about what happened AFTER the fix — the Order Flow agent focuses on diagnosing the CAUSE, not the recovery." },
  { agentId: "delivery-ops", contextId: "driver-analytics", reason: "Surprising exclusion! The Delivery Ops agent focuses on comparing before/after metrics against baselines, not raw GPS telemetry. The Order Flow agent handles the driver dispatch root cause." },
  { agentId: "delivery-ops", contextId: "config-audit", reason: "Config change details are the Order Flow agent's responsibility — the Delivery Ops agent only needs to see the operational impact, not the root cause config." },
  { agentId: "customer-exp", contextId: "driver-analytics", reason: "Raw driver GPS data and fleet status are irrelevant to customer communications — customers don't need to know about driver assignment distances." },
  { agentId: "customer-exp", contextId: "order-dashboard", reason: "Detailed order metrics are for the operations analysts — the Customer Experience agent works from summaries and customer-facing policies." },
];

export const COMPACTION_PASSES: CompactionPass[] = [
  {
    id: 1,
    name: "Tool Clearing",
    color: "#f97316",
    flashColor: "rgba(249, 115, 22, 0.3)",
    description: "Replace raw tool JSON outputs with one-line summaries",
    action: "Scans for tool-role messages...",
    reduction: "30-50% reduction",
  },
  {
    id: 2,
    name: "Summarization",
    color: "#3b82f6",
    flashColor: "rgba(59, 130, 246, 0.3)",
    description: "Summarize the oldest third of messages into a single recap",
    action: "Summarizes the oldest third...",
    reduction: "20-30% additional reduction",
  },
  {
    id: 3,
    name: "Priority Trim",
    color: "#ef4444",
    flashColor: "rgba(239, 68, 68, 0.3)",
    description: "Remove P2 and P3 messages entirely",
    action: "Removes P2 and P3 messages...",
    reduction: "10-20% additional reduction, with information loss",
  },
];

export const SHARING_PATTERNS: SharingPattern[] = [
  {
    id: "full-isolation",
    name: "Full Isolation",
    fullName: "Full Isolation (Fan-Out)",
    color: "#3b82f6",
    howItWorks: "The orchestrator sends a copy of the base task to each agent simultaneously. Each agent works completely independently with zero knowledge of the others. Results are collected at the end.",
    totalTokens: 2700,
    quality: 70,
    latency: "1x (parallel)",
    advantages: [
      "Maximum parallelism — all agents start immediately",
      "No contamination between agents",
      "Simplest to reason about",
    ],
    tradeoffs: [
      "No way to incorporate early findings into later work",
      "Duplicated context across agents",
      "Lower overall quality on interdependent tasks",
    ],
    bestFor: "Independent tasks with no ordering dependencies",
    flow: [
      {
        name: "Orchestrator",
        color: "#f97316",
        inputs: [{ type: "base", label: "Base context", tokens: 360 }],
        totalIn: 360,
      },
      {
        name: "Demand Analyst",
        color: "#3b82f6",
        inputs: [
          { type: "base", label: "Shared task", tokens: 300 },
          { type: "shared", label: "Demand data (600t)", tokens: 600 },
        ],
        totalIn: 900,
      },
      {
        name: "Competition Analyst",
        color: "#22c55e",
        inputs: [
          { type: "base", label: "Shared task", tokens: 300 },
          { type: "shared", label: "Competition data (600t)", tokens: 600 },
        ],
        totalIn: 900,
      },
      {
        name: "Logistics Analyst",
        color: "#a855f7",
        inputs: [
          { type: "base", label: "Shared task", tokens: 300 },
          { type: "shared", label: "Logistics data (600t)", tokens: 600 },
        ],
        totalIn: 900,
      },
    ],
  },
  {
    id: "shared-base",
    name: "Shared Base Context",
    fullName: "Shared Base Context",
    color: "#22c55e",
    howItWorks: "All agents share a common base context (system prompt, project docs, shared rules) but each gets its own specialized slice of data. The shared base is read once and reused.",
    totalTokens: 3200,
    quality: 85,
    latency: "1x (mostly-parallel)",
    advantages: [
      "Consistent standards across all agents",
      "Specialized data keeps each agent focused",
      "Good balance of parallelism and consistency",
    ],
    tradeoffs: [
      "Shared base can still carry some irrelevant content",
      "Agents still can't react to each other's findings",
    ],
    bestFor: "Multi-domain analyses of the same project with a shared standard",
    flow: [
      {
        name: "Orchestrator",
        color: "#f97316",
        inputs: [{ type: "base", label: "Shared base (360t)", tokens: 360 }],
        totalIn: 360,
      },
      {
        name: "Menu Quality",
        color: "#3b82f6",
        inputs: [
          { type: "base", label: "Shared base", tokens: 360 },
          { type: "shared", label: "Menu data (500t)", tokens: 500 },
        ],
        totalIn: 860,
      },
      {
        name: "Kitchen Compliance",
        color: "#22c55e",
        inputs: [
          { type: "base", label: "Shared base", tokens: 360 },
          { type: "shared", label: "Kitchen data (500t)", tokens: 500 },
        ],
        totalIn: 860,
      },
      {
        name: "Delivery Logistics",
        color: "#a855f7",
        inputs: [
          { type: "base", label: "Shared base", tokens: 360 },
          { type: "shared", label: "Logistics data (500t)", tokens: 500 },
        ],
        totalIn: 860,
      },
    ],
  },
  {
    id: "sequential-pipeline",
    name: "Sequential Pipeline",
    fullName: "Sequential Pipeline",
    color: "#a855f7",
    howItWorks: "Agents run in sequence. Each agent's output becomes the input summary for the next. Later agents build on earlier findings without seeing the full raw data.",
    totalTokens: 3800,
    quality: 95,
    latency: "3x (sequential)",
    advantages: [
      "Highest quality on interdependent tasks",
      "Each stage builds on validated findings",
      "De-duplicated — summaries carry forward, not raw data",
    ],
    tradeoffs: [
      "Slowest — each stage waits for the previous",
      "Risk of error propagation down the chain",
    ],
    bestFor: "Sequential or deeply interdependent analyses where quality matters most",
    flow: [
      {
        name: "Triage",
        color: "#3b82f6",
        inputs: [{ type: "base", label: "Incident alert", tokens: 320 }],
        totalIn: 320,
      },
      {
        name: "Root Cause",
        color: "#22c55e",
        inputs: [
          { type: "base", label: "Base context", tokens: 320 },
          { type: "summary", label: "← Triage findings (100t)", tokens: 100 },
          { type: "shared", label: "Config data (400t)", tokens: 400 },
        ],
        totalIn: 820,
      },
      {
        name: "Recovery",
        color: "#a855f7",
        inputs: [
          { type: "base", label: "Base context", tokens: 320 },
          { type: "summary", label: "← Triage (100t)", tokens: 100 },
          { type: "summary", label: "← Root Cause (120t)", tokens: 120 },
          { type: "shared", label: "Ops playbook (500t)", tokens: 500 },
        ],
        totalIn: 1040,
      },
    ],
  },
];

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Multi-Domain Restaurant Onboarding",
    context: "A restaurant chain is onboarding new locations. You spawn Menu Quality, Kitchen Compliance, and Delivery Logistics agents to review a single new restaurant.",
    requirements: [
      "All three agents must review the same restaurant data",
      "They must use the same compliance standards and scoring rubric",
      "Reports can be generated independently; no findings depend on each other",
    ],
    correctPattern: "shared-base",
    explanation: "All agents analyze the same entity with the same standards but independently — Shared Base Context gives consistent rubrics while keeping parallel speed.",
  },
  {
    id: 2,
    title: "Rush Hour Incident Response",
    context: "A delivery platform is hit by a system incident during rush hour. You must triage the alert, then diagnose the root cause, then plan recovery actions.",
    requirements: [
      "Root cause analysis depends on the triage outcome",
      "Recovery planning depends on both prior analyses",
      "Quality matters more than speed — you need a correct fix",
    ],
    correctPattern: "sequential-pipeline",
    explanation: "Each stage's findings feed the next. Sequential Pipeline delivers the highest quality for this deeply interdependent chain.",
  },
  {
    id: 3,
    title: "Parallel City Expansion Analysis",
    context: "A food delivery startup wants to expand to three new cities. You spawn Demand, Competition, and Logistics agents to analyze each city independently.",
    requirements: [
      "Each city's analysis is completely independent",
      "No shared rubrics or dependencies between analyses",
      "Speed is critical — leadership wants results fast",
    ],
    correctPattern: "full-isolation",
    explanation: "Independent analyses with no shared dependencies — Full Isolation (Fan-Out) maximizes parallelism for the fastest results.",
  },
];

export const GRADE_PHASE_NAMES = [
  { name: "Compression", maxScore: 30 },
  { name: "Auto-Compaction", maxScore: 25 },
  { name: "Multi-Agent", maxScore: 20 },
  { name: "Context Isolation", maxScore: 25 },
  { name: "Context Sharing", maxScore: 20 },
  { name: "Context Windows", maxScore: 15 },
];

export const TAKEAWAYS = [
  { id: 1, color: "#f97316", text: "Compression preserves the signal. Keep key facts and drop noise — measured by IRR (Information Retention Rate)." },
  { id: 2, color: "#3b82f6", text: "Auto-compaction prevents context rot. Thresholds trigger passes that clear stale tool output and summarize old turns." },
  { id: 3, color: "#8b5cf6", text: "Isolation = focus. Each sub-agent gets its own context window and token budget — irrelevant context dilutes attention and increases hallucinations." },
  { id: 4, color: "#06b6d4", text: "Choose the right sharing pattern. Fan-out, shared base, and sequential pipelines trade off speed, quality, and context duplication." },
];
