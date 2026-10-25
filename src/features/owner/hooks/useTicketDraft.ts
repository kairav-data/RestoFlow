import { useMemo, useState } from 'react';
import type { MenuItem } from '@/types';

export type Portion = 'half' | 'full';

export interface TicketLine {
  dish: MenuItem;
  portion: Portion;
  quantity: number;
}

const MAX_QTY = 20;
const keyOf = (dishId: string, portion: Portion) => `${dishId}:${portion}`;

/** Lines on a ticket staff are building. The subtotal is an estimate: the server re-prices every order. */
export function useTicketDraft() {
  const [lines, setLines] = useState<Map<string, TicketLine>>(new Map());

  const change = (dish: MenuItem, portion: Portion, delta: number) =>
    setLines((prev) => {
      const next = new Map(prev);
      const key = keyOf(dish.id, portion);
      const quantity = Math.min(MAX_QTY, (prev.get(key)?.quantity ?? 0) + delta);
      if (quantity <= 0) next.delete(key);
      else next.set(key, { dish, portion, quantity });
      return next;
    });

  const list = useMemo(() => [...lines.values()], [lines]);
  const subtotal = list.reduce(
    (sum, l) => sum + (l.portion === 'half' && l.dish.halfPrice ? l.dish.halfPrice : l.dish.price) * l.quantity,
    0,
  );
  const count = list.reduce((sum, l) => sum + l.quantity, 0);

  return {
    lines: list,
    subtotal,
    count,
    quantityOf: (dishId: string, portion: Portion) => lines.get(keyOf(dishId, portion))?.quantity ?? 0,
    add: (dish: MenuItem, portion: Portion) => change(dish, portion, 1),
    remove: (dish: MenuItem, portion: Portion) => change(dish, portion, -1),
    clear: () => setLines(new Map()),
  };
}
