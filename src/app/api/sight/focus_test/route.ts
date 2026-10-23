import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifySessionCookie } from '@/lib/auth';
import { kvConfigured, kvRPush, kvLRange } from '@/lib/kv';

/**
 * 专注力测评成绩存取接口
 *
 * 身份：从 httpOnly Cookie `vg_access`（<code>.<HMAC>）解出邀请码，无需前端暴露。
 * 存储：Upstash Redis 列表，key = `focus_test:<code>:<nick>`
 *   - 一人一码用户：code 唯一 → 天然隔离、跨设备同步
 *   - 共享码用户：靠 nick（训练者昵称）区分家庭/多娃
 * 降级：KV 未配置时返回 { ok:false, unconfigured:true }，前端自动转 localStorage。
 */

async function getCode(req: NextRequest): Promise<string | null> {
  const cookie = req.cookies.get(COOKIE_NAME)?.value || '';
  if (!cookie || !cookie.includes('.')) return null;
  const [code] = cookie.split('.');
  const valid = await verifySessionCookie(cookie);
  return valid ? code : null;
}

function safeNick(n: unknown): string {
  const s = String(n || '').trim().replace(/[^一-龥A-Za-z0-9_]/g, '').slice(0, 20);
  return s || 'default';
}

function keyFor(code: string, nick: string): string {
  return `focus_test:${code}:${safeNick(nick)}`;
}

export async function POST(req: NextRequest) {
  const code = await getCode(req);
  if (!code) return NextResponse.json({ ok: false, error: '未授权，请先登录' }, { status: 401 });
  if (!kvConfigured()) return NextResponse.json({ ok: false, unconfigured: true }, { status: 200 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    /* 空 body 用默认 */
  }

  const now = Date.now();
  const scores = body.scores && typeof body.scores === 'object' ? body.scores : {};
  const rec = {
    ts: now,
    ageTier: String(body.ageTier || '6-12'),
    nick: safeNick(body.nick),
    index: Number.isFinite(body.index) ? Number(body.index) : 0,
    scores,
    durationSec: Number.isFinite(body.durationSec) ? Number(body.durationSec) : 0,
  };

  const key = keyFor(code, body.nick);
  const ok = await kvRPush(key, JSON.stringify(rec));
  if (ok !== true) return NextResponse.json({ ok: false, error: String(ok) }, { status: 500 });
  return NextResponse.json({ ok: true, ts: now });
}

export async function GET(req: NextRequest) {
  const code = await getCode(req);
  if (!code) return NextResponse.json({ ok: false, error: '未授权，请先登录' }, { status: 401 });
  if (!kvConfigured()) return NextResponse.json({ ok: false, unconfigured: true }, { status: 200 });

  const nick = safeNick(req.nextUrl.searchParams.get('nick'));
  const raws = await kvLRange(keyFor(code, nick), 0, -1);
  const records = raws
    .map((r) => {
      try {
        return JSON.parse(r);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.ts - b.ts);

  return NextResponse.json({ ok: true, records });
}
