import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/server/security/adminSession';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ signedIn: isAdminRequest() });
}
