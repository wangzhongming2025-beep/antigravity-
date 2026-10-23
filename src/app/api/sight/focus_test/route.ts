import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifySessionCookie } from '@/lib/auth';
import { kvConfigured, kvRPush, kvLRange } from '@/lib/kv';

export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: true, m: 'post' });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, m: 'get' });
}
