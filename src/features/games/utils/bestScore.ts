const key = (game: string) => `rf-best-${game}`;

/** Best scores live only in this browser; storage can be blocked, so every access is guarded. */
export function readBest(game: string): number | null {
  try {
    const v = window.localStorage.getItem(key(game));
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

/** Saves the score if it beats the stored one. `lowerIsBetter` is for games scored by time or moves. */
export function saveBest(game: string, score: number, lowerIsBetter = false): number {
  const current = readBest(game);
  const better = current === null || (lowerIsBetter ? score < current : score > current);
  if (!better) return current as number;
  try {
    window.localStorage.setItem(key(game), String(score));
  } catch {
    /* best score is a nicety; ignore blocked storage */
  }
  return score;
}
