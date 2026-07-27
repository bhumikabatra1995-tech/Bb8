export function daysBetween(a: Date, b: Date): number {
  const startOfA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const startOfB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((startOfB - startOfA) / (1000 * 60 * 60 * 24));
}
