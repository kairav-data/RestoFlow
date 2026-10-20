import { BarChart3, ChefHat, Gamepad2, HeartHandshake, QrCode, ReceiptText, ScanLine, Sparkles, Users, UtensilsCrossed, type LucideIcon } from 'lucide-react';

export const CONTACT = {
  email: 'admin@cleanflow.one',
  phone: '9819662173',
  phoneHref: 'tel:+919819662173',
  city: 'Mumbai',
  country: 'India',
} as const;

export const NAV_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#app', label: 'Mobile app' },
  { href: '#restaurants', label: 'Restaurants' },
  { href: '#offers', label: 'Offers' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
] as const;

export interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const STEPS: Step[] = [
  { icon: ScanLine, title: 'Scan', body: 'Point your phone camera at the QR code on the table. The menu opens in your browser. No app to install.' },
  { icon: UtensilsCrossed, title: 'Order', body: 'Browse photos, filters and nutrition facts, choose half or full plates, and send the order to the kitchen.' },
  { icon: ChefHat, title: 'Track', body: 'Watch your order move from received to cooking to ready, live, and play a quick game while you wait.' },
  { icon: ReceiptText, title: 'Pay & review', body: 'Ask for the bill, pay at the table, then rate the meal and every dish in one tap.' },
];

export interface OwnerFeature {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Spans two columns in the bento grid. */
  wide?: boolean;
}

export const OWNER_FEATURES: OwnerFeature[] = [
  { icon: Sparkles, title: 'Menu from a photo in a minute', body: 'Photograph your printed menu. AI reads every dish, price and category, writes descriptions, and builds your digital menu. You review, then publish.', wide: true },
  { icon: ChefHat, title: 'Live kitchen screen', body: 'New orders appear within seconds. Accept, mark ready, mark served, confirm payment.' },
  { icon: Users, title: 'Know every guest', body: 'Each guest gets an ID and a full history of what they ate and when they came.' },
  { icon: BarChart3, title: 'Numbers that matter', body: 'Revenue, best-selling dishes and feedback, without spreadsheets.', wide: true },
  { icon: QrCode, title: 'Table QR codes', body: 'Print a QR for every table in one click.' },
  { icon: HeartHandshake, title: 'Half & full plates, nutrition', body: 'Sell half portions and show calories and macros so guests choose with confidence.' },
];

export interface Offer {
  tag: string;
  title: string;
  body: string;
  points: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}

export interface Value {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const VALUES: Value[] = [
  { icon: Gamepad2, title: 'Delightful for guests', body: 'Waiting should feel good. Fast menus, live tracking and a little play.' },
  { icon: ChefHat, title: 'Calm for kitchens', body: 'Fewer shouted orders and missed tickets. One clear screen for the whole team.' },
  { icon: HeartHandshake, title: 'Fair for restaurants', body: 'Your guests, your data, your prices. We just make the flow smoother.' },
];

/** Sample dishes shown only until real restaurants start taking orders. */
export const SAMPLE_DISHES = [
  { name: 'Paneer Tikka', price: 280, veg: true, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Butter Chicken', price: 390, veg: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80' },
  { name: 'Masala Dosa', price: 180, veg: true, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hyderabadi Biryani', price: 340, veg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
] as const;

export const APP_SCREENS = [
  { id: 'menu', label: 'Browse the menu', body: 'Photos, veg and non-veg filters, spice levels and nutrition facts on every dish.' },
  { id: 'cart', label: 'Order in two taps', body: 'Half or full plate, one cart, one button. Prices come straight from the restaurant.' },
  { id: 'track', label: 'Track it live', body: 'See exactly when the kitchen starts cooking and when your food is on its way.' },
  { id: 'play', label: 'Play while you wait', body: 'Mini games unlock while your food is being prepared, and disappear once it is served.' },
] as const;

export type AppScreenId = (typeof APP_SCREENS)[number]['id'];
