import { api } from '@/lib/api';

export interface HistoryOrder {
  id: string;
  orderNumber: number;
  tableName: string | null;
  orderedAt: string;
  status: string;
  paid: boolean;
  total: number;
  items: { name: string; quantity: number; portion: string | null; total: number }[];
}

export interface CustomerHistory {
  customer: {
    id: string;
    customerCode: string;
    name: string;
    phone: string | null;
    email: string | null;
    memberSince: string;
  };
  stats: {
    visits: number;
    orders: number;
    totalSpent: number;
    averageOrder: number;
    firstVisitAt: string;
    lastVisitAt: string;
  };
  favourites: { menuItemId: string; name: string; times: number; lastOrderedAt: string }[];
  visits: { id: string; startedAt: string; tableName: string | null; spent: number; orders: HistoryOrder[] }[];
}

export const fetchCustomerHistory = (customerId: string) =>
  api<CustomerHistory>(`/api/portal/customers/${encodeURIComponent(customerId)}`);
