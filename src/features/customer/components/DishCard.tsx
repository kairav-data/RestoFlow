'use client';

import React, { memo } from 'react';
import { Flame, Heart, Plus, Star } from 'lucide-react';
import { FoodImage } from '@/components/ui/FoodImage';
import { DishPrice } from '@/features/menu/components/DishPrice';
import type { MenuItem } from '@/types';

interface DishCardProps {
  dish: MenuItem;
  /** How many of this dish are in the cart (0 hides the badge). */
  inCart: number;
  isFavorite: boolean;
  /** Load the photo straight away; used for the first few cards on screen. */
  priority?: boolean;
  onOpen: (dish: MenuItem) => void;
  onQuickAdd: (dish: MenuItem) => void;
  onToggleFavorite: (dishId: string) => void;
}

const THUMB_PX = 96;

/**
 * One row of the menu. Memoised: with a long menu, adding a dish or typing a search re-renders only the cards
 * whose props changed, not all of them. The callbacks passed in must be stable.
 */
export const DishCard = memo<DishCardProps>(function DishCard({
  dish,
  inCart,
  isFavorite,
  priority,
  onOpen,
  onQuickAdd,
  onToggleFavorite,
}) {
  return (
    <div
      onClick={() => onOpen(dish)}
      // content-visibility lets the browser skip layout and paint for cards that are off screen.
      className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-subtle transition-colors [contain-intrinsic-size:auto_124px] [content-visibility:auto] active:bg-slate-50"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <FoodImage
          src={dish.image}
          alt={dish.name}
          displayWidth={THUMB_PX}
          priority={priority}
          width={THUMB_PX}
          height={THUMB_PX}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-1.5 top-1.5 rounded-sm bg-white p-0.5">
          <div
            className={`flex h-3 w-3 items-center justify-center rounded-xs border ${
              dish.isVegetarian ? 'border-emerald-600' : 'border-rose-600'
            }`}
            aria-label={dish.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${dish.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`} />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(dish.id);
          }}
          aria-label={isFavorite ? `Remove ${dish.name} from favourites` : `Save ${dish.name} to favourites`}
          aria-pressed={isFavorite}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
        >
          <Heart className={`h-3 w-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h4 className="line-clamp-1 text-sm font-bold leading-snug text-slate-900">{dish.name}</h4>
            <DishPrice dish={dish} className="ml-1 text-right text-sm font-extrabold text-slate-900" />
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-0.5 font-bold text-amber-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{dish.rating}</span>
            </div>
            <span>•</span>
            <span>({(dish.reviewCount / 1000).toFixed(1)}K orders)</span>
          </div>

          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{dish.description}</p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md border border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
              <Flame className="h-2.5 w-2.5" />
              <span className="capitalize">{dish.spiceLevel}</span>
            </span>
            {dish.isChefSpecial && (
              <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Chef&apos;s Special
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(dish);
            }}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm transition-transform hover:bg-amber-600 active:scale-90"
            aria-label={`Add ${dish.name}`}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            {inCart > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                {inCart}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
