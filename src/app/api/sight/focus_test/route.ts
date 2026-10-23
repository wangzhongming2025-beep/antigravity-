import { NextRequest, NextResponse } from 'next/server';

/**
 * 专注力测评成绩存取接口（自包含，无外部 lib 依赖）
 *
 * 身份：从 httpOnly Cookie `vg_access`（<code>.<HMAC>）解出邀请码；
 *       若配置了 INVITE_SECRET 则校验签名，否则直接信任 code 前缀（v1 降级）。
 * 存储：Upstash Redis REST（env: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN）
 *       key = `focus_test:<code>:<nick>`，列表结构，支持一人多娃/跨设备同码同步。
 * 降级：Upstash 未配置时返回 { ok:false, unconfigured:true }，前端转 localStorage。
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
const INVITE_SECRET = process.env.INVITE_SECRET || '';

function upstashConfigured(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

async function upstash(path: string, method = 'GET'): Promise<{ result?: unknown; error?: string }> {
  try {
    const res = await fetch(`${UPSTASH_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      cache: 'no-store',
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return (await res.json()) as { result?: unknown; error?: string };
  } catch (e) {
    return { error: `连接失败: ${String(e).slice(0, 160)}` };
  }
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getCode(req: NextRequest): Promise<string | null> {
  const cookie = req.cookies.get('vg_access')?.value || '';
  if (!cookie || !cookie.includes('.')) return null;
  const [code, hmac] = cookie.split('.');
  if (INVITE_SECRET && INVITE_SECRET !== 'dev-secret-change-me') {
    const expect = await hmacHex(code, INVITE_SECRET);
    if (expect !== hmac) return null;
  }
  return code;
}

function safeNick(n: unknown): string {
  const s = String(n || '')
    .trim()
    .replace(/[^一-龥A-Za-z0-9_]/g, '')
    .slice(0, 20);
  return s || 'default';
}

function keyFor(code: string, nick: string): string {
  return `focus_test:${code}:${safeNick(nick)}`;
}

export async function POST(req: NextRequest) {
  const code = await getCode(req);
  if (!code) return NextResponse.json({ ok: false, error: '未授权，请先登录' }, { status: 401 });
  if (!upstashConfigured()) return NextResponse.json({ ok: false, unconfigured: true }, { status: 200 });

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* 空 body 用默认 */
  }

  const now = Date.now();
  const ageTier = typeof body.ageTier === 'string' ? body.ageTier : '6-12';
  const nick = typeof body.nick === 'string' ? body.nick : '';
  const index = typeof body.index === 'number' ? body.index : 0;
  const scores = body.scores && typeof body.scores === 'object' ? body.scores : {};
  const durationSec = typeof body.durationSec === 'number' ? body.durationSec : 0;

  const rec = {
    ts: now,
    ageTier,
    nick: safeNick(nick),
    index,
    scores,
    durationSec,
  };

  const path = `/rpush/${encodeURIComponent(keyFor(code, nick))}/${encodeURIComponent(JSON.stringify(rec))}`;
  const j = await upstash(path, 'POST');
  if (j.error) return NextResponse.json({ ok: false, error: j.error }, { status: 500 });
  return NextResponse.json({ ok: true, ts: now });
}

export async function GET(req: NextRequest) {
  const code = await getCode(req);
  if (!code) return NextResponse.json({ ok: false, error: '未授权，请先登录' }, { status: 401 });
  if (!upstashConfigured()) return NextResponse.json({ ok: false, unconfigured: true }, { status: 200 });

  const nick = safeNick(req.nextUrl.searchParams.get('nick'));
  const j = await upstash(`/lrange/${encodeURIComponent(keyFor(code, nick))}/0/-1`);
  if (j.error) return NextResponse.json({ ok: false, error: j.error }, { status: 500 });

  const raws = (j.result as string[]) || [];
  const records = raws
    .map((r) => {
      try {
        return JSON.parse(r) as { ts: number; [k: string]: unknown };
      } catch {
        return null;
      }
    })
    .filter((x): x is { ts: number; [k: string]: unknown } => x !== null)
    .sort((a, b) => a.ts - b.ts);

  return NextResponse.json({ ok: true, records });
}
