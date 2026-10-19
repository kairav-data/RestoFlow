import type { Metadata } from 'next';
import { AdminPortal } from '@/features/admin/AdminPortal';

export const metadata: Metadata = { title: 'RestoFlow Admin' };

export default function AdminPage() {
  return <AdminPortal />;
}
