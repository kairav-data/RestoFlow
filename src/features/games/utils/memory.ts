export interface MemoryCard {
  id: number;
  pair: number;
  matched: boolean;
}

export const PAIRS = 6;

export function newDeck(): MemoryCard[] {
  const cards = Array.from({ length: PAIRS * 2 }, (_, i) => ({ id: i, pair: Math.floor(i / 2), matched: false }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
