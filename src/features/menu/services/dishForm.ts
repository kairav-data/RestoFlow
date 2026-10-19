import type { MenuItem, NutritionInfo } from '@/types';
import { SPICE_LEVELS, type DishChanges, type NewDish } from '../types';

export const NUTRITION_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fiber', label: 'Fibre', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
] as const;

export type NutritionKey = (typeof NUTRITION_FIELDS)[number]['key'];

export interface DishFormValues {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  isVegetarian: boolean;
  spiceLevel: (typeof SPICE_LEVELS)[number];
  halfOn: boolean;
  halfPrice: string;
  /** A new photo picked in this form (data URL), or the dish's current one when editing. */
  image?: string;
  isAvailable: boolean;
  servingSize: string;
  nutrition: Record<NutritionKey, string>;
}

const emptyNutrition = (): Record<NutritionKey, string> => ({
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  sugar: '',
  sodium: '',
});

export function blankDish(categoryId: string): DishFormValues {
  return {
    name: '',
    description: '',
    price: '',
    categoryId,
    isVegetarian: true,
    spiceLevel: 'mild',
    halfOn: false,
    halfPrice: '',
    isAvailable: true,
    servingSize: '',
    nutrition: emptyNutrition(),
  };
}

export function dishToForm(dish: MenuItem): DishFormValues {
  const nutrition = emptyNutrition();
  for (const { key } of NUTRITION_FIELDS) {
    const v = dish.nutrition?.[key];
    if (v !== undefined) nutrition[key] = String(v);
  }
  return {
    name: dish.name,
    description: dish.description,
    price: String(dish.price),
    categoryId: dish.category,
    isVegetarian: dish.isVegetarian,
    spiceLevel: dish.spiceLevel,
    halfOn: dish.halfPrice !== undefined,
    halfPrice: dish.halfPrice !== undefined ? String(dish.halfPrice) : '',
    image: dish.image,
    isAvailable: dish.isAvailable,
    servingSize: dish.nutrition?.servingSize ?? '',
    nutrition,
  };
}

/** A sensible starting half price: about 60% of the full price, rounded to 5 and always below the full price. */
export function suggestHalfPrice(fullPrice: number): string {
  if (!(fullPrice > 1)) return '';
  return String(Math.min(fullPrice - 1, Math.max(1, Math.round((fullPrice * 0.6) / 5) * 5)));
}

export function toNutrition(values: DishFormValues): NutritionInfo | undefined {
  const out: NutritionInfo = {};
  if (values.servingSize.trim()) out.servingSize = values.servingSize.trim();
  for (const { key } of NUTRITION_FIELDS) {
    const raw = values.nutrition[key].trim();
    if (raw !== '' && Number.isFinite(Number(raw))) out[key] = Number(raw);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export type DishFormErrors = Partial<Record<'name' | 'price' | 'halfPrice' | NutritionKey, string>>;

export function validateDish(values: DishFormValues): DishFormErrors {
  const errors: DishFormErrors = {};
  const price = Number(values.price);
  if (!values.name.trim()) errors.name = 'Enter the dish name.';
  if (values.price.trim() === '' || !(price > 0)) errors.price = 'Enter a price above 0.';
  if (values.halfOn) {
    const half = Number(values.halfPrice);
    if (values.halfPrice.trim() === '' || !(half > 0)) errors.halfPrice = 'Enter the half plate price.';
    else if (price > 0 && half >= price) errors.halfPrice = 'Half plate must cost less than the full plate.';
  }
  for (const { key, label } of NUTRITION_FIELDS) {
    const raw = values.nutrition[key].trim();
    if (raw !== '' && !(Number.isFinite(Number(raw)) && Number(raw) >= 0)) {
      errors[key] = `${label} must be a number, 0 or more.`;
    }
  }
  return errors;
}

const PLACEHOLDER_VEG =
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80';
const PLACEHOLDER_NONVEG =
  'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80';

export function formToNewDish(values: DishFormValues): NewDish {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    price: Number(values.price),
    halfPrice: values.halfOn ? Number(values.halfPrice) : undefined,
    category: values.categoryId,
    isVegetarian: values.isVegetarian,
    spiceLevel: values.spiceLevel,
    dietaryTags: [values.isVegetarian ? 'vegetarian' : 'non-vegetarian'],
    image: values.image ?? (values.isVegetarian ? PLACEHOLDER_VEG : PLACEHOLDER_NONVEG),
    nutrition: toNutrition(values),
  };
}

/** Everything the form controls, so saving always matches what the owner sees. The photo is sent only when it changed. */
export function formToChanges(values: DishFormValues, original: MenuItem): DishChanges {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    halfPrice: values.halfOn ? Number(values.halfPrice) : null,
    category: values.categoryId,
    isVegetarian: values.isVegetarian,
    isAvailable: values.isAvailable,
    spiceLevel: values.spiceLevel,
    nutrition: toNutrition(values) ?? null,
    ...(values.image && values.image !== original.image ? { image: values.image } : {}),
  };
}
