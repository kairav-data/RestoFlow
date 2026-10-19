import React from 'react';
import type { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

/** Price of a dish: a single figure, or "Half / Full" when the restaurant sells a half plate. */
export const DishPrice: React.FC<{ dish: Pick<MenuItem, 'price' | 'halfPrice'>; className?: string }> = ({
  dish,
  className,
}) =>
  dish.halfPrice === undefined ? (
    <span className={className}>{formatCurrency(dish.price)}</span>
  ) : (
    <span className={className}>
      <span className="text-[0.65em] font-medium uppercase tracking-wide text-slate-500">Half </span>
      {formatCurrency(dish.halfPrice)}
      <span className="mx-1 text-slate-300">/</span>
      <span className="text-[0.65em] font-medium uppercase tracking-wide text-slate-500">Full </span>
      {formatCurrency(dish.price)}
    </span>
  );
