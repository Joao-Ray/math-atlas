export function chooseUncompleted<T extends { id: string }>(items: readonly T[], completedIds: readonly string[], random = Math.random()): T | null {
  const completed = new Set(completedIds);
  const available = items.filter(item => !completed.has(item.id));
  if (!available.length) return null;
  const index = Math.min(available.length - 1, Math.max(0, Math.floor(random * available.length)));
  return available[index];
}
