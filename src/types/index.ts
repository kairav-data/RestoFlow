export type DietaryPreference =
  | 'vegetarian'
  | 'non-vegetarian'
  | 'egg'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'jain'
  | 'halal';

export type SpiceLevel = 'mild' | 'medium' | 'spicy' | 'extra-spicy';

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';

export type OrderType = 'dine-in' | 'takeaway' | 'qr-online';

export interface MenuItemPairing {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

/** Optional nutrition facts the restaurant enters for a dish (per full plate). Sodium is in mg, the rest in g / kcal. */
export interface NutritionInfo {
  servingSize?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  /** Full-plate price (the only price when `halfPrice` is unset). */
  price: number;
  /** When set, the restaurant also sells a half plate at this price. */
  halfPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  isVegetarian: boolean;
  spiceLevel: SpiceLevel;
  dietaryTags: DietaryPreference[];
  calories: number;
  /** Set only when the restaurant filled in nutrition facts. */
  nutrition?: NutritionInfo;
  prepTimeMinutes: number;
  isChefSpecial?: boolean;
  isBestSeller?: boolean;
  isMostOrdered?: boolean;
  isAvailable: boolean;
  allergens: string[];
  whyCustomersLoveIt: string[];
  pairings: MenuItemPairing[];
  viewsCount?: number;
  ordersCount?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  itemCount: number;
  image: string;
  iconName?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isVegetarian: boolean;
  spiceLevel?: SpiceLevel;
  /** Which plate size was ordered; `price` is already the price for that size. */
  portion?: 'half' | 'full';
  specialInstructions?: string;
  selectedPairings?: MenuItemPairing[];
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #1028
  tableNumber: string; // e.g. T05
  customerName?: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  taxes: number; // 5% GST
  serviceCharge: number; // 5% optional/standard
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO string
  estimatedReadyMinutes: number;
  diningSessionId: string;
  serverName?: string;
  customerEmail?: string;
  paymentStatus?: 'none' | 'pending' | 'paid';
  paymentMethod?: 'upi' | 'card' | 'cash' | 'wallet';
}

export interface BillSplit {
  type: 'full' | 'equal' | 'by-item';
  splitsCount: number;
  amountPerPerson?: number;
  payerAmounts?: { [payerId: string]: number };
}

export interface CustomerReview {
  id: string;
  orderId: string;
  customerName: string;
  tableNumber: string;
  overallRating: number; // 1 to 5
  timeAgo: string;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  breakdown: {
    foodQuality: number;
    taste: number;
    portionSize: number;
    presentation: number;
    temperature: number;
    service: number;
    staffBehavior: number;
    cleanliness: number;
    ambience: number;
    waitingTime: number;
    valueForMoney: number;
  };
  complaints?: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface PopularCombination {
  id: string;
  name: string; // e.g. "Paneer Tikka + Garlic Naan"
  itemNames: string[];
  ordersCount: number;
  revenue: number;
  comboPrice: number;
  regularPrice: number;
  savingsPercentage: number;
  image: string;
}

export interface AIRecommendationRequest {
  moods: string[];
  hungerLevel: 'light' | 'normal' | 'very-hungry' | 'extremely-hungry';
  dietary: DietaryPreference[];
  budgetTier: 'under-300' | '300-500' | '500-800' | '800-1200' | '1200-plus';
  peopleCount: number;
  freeformPrompt?: string;
}

export interface AIRecommendedDish {
  dish: MenuItem;
  matchScore: number;
  reasonBullets: string[];
}

export interface RestaurantKPIs {
  totalRevenue: number;
  revenueChangePct: number;
  totalOrders: number;
  ordersChangePct: number;
  totalCustomers: number;
  customersChangePct: number;
  averageOrderValue: number;
  aovChangePct: number;
  averageRating: number;
  ratingChange: number;
}
