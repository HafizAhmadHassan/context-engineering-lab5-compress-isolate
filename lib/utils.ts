export function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
}

export function tokenColor(pctOfCapacity: number): string {
  if (pctOfCapacity < 0.6) return "#22c55e";
  if (pctOfCapacity < 0.8) return "#f59e0b";
  if (pctOfCapacity < 0.95) return "#f97316";
  return "#ef4444";
}

export function idToColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#f97316",
    "#3b82f6",
    "#22c55e",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#ef4444",
  ];
  return colors[Math.abs(hash) % colors.length];
}
