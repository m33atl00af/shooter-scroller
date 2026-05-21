// Cloudflare Worker — Leaderboard proxy for Shooter Scroller
// Deploy with: wrangler deploy
// Secrets required:
//   wrangler secret put JSONBIN_KEY
//   wrangler secret put JSONBIN_BIN_ID
//   wrangler secret put SIGNING_SECRET   ← new: any long random string

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Max achievable score: 78 enemies × 100 pts = 7,800. Cap at 50k for future headroom.
const MAX_SCORE = 50000;

// Minimum milliseconds the game must have been running per 100 points scored.
// 500ms per kill is very lenient for real players but still blocks instant replays.
const MS_PER_100_PTS = 500;

// Session tokens expire after 4 hours (generous for a long play session).
const SESSION_MAX_AGE_MS = 4 * 60 * 60 * 1000;

function hasBadWord(name) {
  const lower = name.toLowerCase();
  const norm  = lower.replace(/ph/g, 'f').replace(/kn/g, 'n');

  const check = (s) => {
    const roots     = ['nigg', 'fuc'];
    const exactOnly = ['ass', 'fag', 'cum', 'poo', 'tit', 'nut', 'gay'];
    const substrings = [
      'shit', 'shyt', 'bitch', 'biatch', 'cunt', 'kunt',
      'dick', 'cock', 'kock', 'pussy', 'faggot', 'whore',
      'slut', 'bastard', 'piss', 'prick', 'twat', 'wank',
      'arse', 'asshole', 'arsehole', 'bollock', 'tosser',
      'wanker', 'retard', 'rape', 'nazi', 'fuk', 'azz',
    ];
    return roots.some(r => s.includes(r)) ||
           exactOnly.includes(s) ||
           substrings.some(w => s.includes(w));
  };

  return check(lower) || check(norm);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// HMAC-SHA256 using the Web Crypto API available in Cloudflare Workers.
async function sign(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verifySession(session, signingSecret) {
  if (!session?.sessionId || !session?.issuedAt || !session?.sig) return false;
  const expected = await sign(signingSecret, `${session.sessionId}:${session.issuedAt}`);
  if (session.sig !== expected) return false;
  const elapsed = Date.now() - Number(session.issuedAt);
  if (elapsed < 0 || elapsed > SESSION_MAX_AGE_MS) return false;
  return elapsed;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url  = new URL(request.url);
    const BIN  = `https://api.jsonbin.io/v3/b/${env.JSONBIN_BIN_ID}`;
    const AUTH = { 'X-Master-Key': env.JSONBIN_KEY, 'Content-Type': 'application/json' };

    try {
      // ── GET /session — issue a signed session token ───────────────────
      if (request.method === 'GET' && url.pathname === '/session') {
        if (!env.SIGNING_SECRET) {
          console.error('SIGNING_SECRET is not set — run: wrangler secret put SIGNING_SECRET');
          return json({ error: 'Server misconfiguration' }, 500);
        }
        const sessionId = crypto.randomUUID();
        const issuedAt  = Date.now();
        const sig       = await sign(env.SIGNING_SECRET, `${sessionId}:${issuedAt}`);
        return json({ sessionId, issuedAt, sig });
      }

      // ── GET / — return leaderboard ────────────────────────────────────
      if (request.method === 'GET') {
        const res  = await fetch(`${BIN}/latest`, { headers: AUTH });
        if (!res.ok) return json({ scores: [] });
        const data = await res.json();
        return json(data.record ?? { scores: [] });
      }

      // ── POST / — submit a score ───────────────────────────────────────
      if (request.method === 'POST') {
        const body  = await request.json();
        const name  = String(body.name  ?? '').replace(/[^a-zA-Z]/g, '').slice(0, 12).toUpperCase();
        const score = parseInt(body.score, 10);

        if (!name || isNaN(score) || score < 0 || score > MAX_SCORE) {
          return json({ error: 'invalid payload' }, 400);
        }

        if (hasBadWord(name)) {
          return json({ error: 'invalid payload' }, 400);
        }

        const elapsed = await verifySession(body.session, env.SIGNING_SECRET);
        if (elapsed === false) {
          return json({ error: 'invalid session' }, 403);
        }

        const minRequired = (score / 100) * MS_PER_100_PTS;
        if (elapsed < minRequired) {
          return json({ error: 'invalid payload' }, 400);
        }

        // Fetch current scores and append.
        const getRes  = await fetch(`${BIN}/latest`, { headers: AUTH });
        const current = getRes.ok ? await getRes.json() : { record: { scores: [] } };
        const scores  = Array.isArray(current.record?.scores) ? current.record.scores : [];

        scores.push({ name, score, date: new Date().toISOString() });
        scores.sort((a, b) => b.score - a.score);
        const top100 = scores.slice(0, 100);

        const putRes = await fetch(BIN, {
          method: 'PUT',
          headers: AUTH,
          body: JSON.stringify({ scores: top100 }),
        });

        if (!putRes.ok) {
          console.error(`JSONBin PUT failed ${putRes.status}: ${await putRes.text()}`);
          return json({ error: 'Score could not be saved' }, 502);
        }

        const rank = top100.findIndex(s => s.name === name && s.score === score) + 1;
        return json({ ok: true, rank: rank || null });
      }

      return new Response('Method not allowed', { status: 405, headers: CORS });
    } catch (err) {
      console.error('Worker error:', err.message);
      return json({ error: 'Internal error' }, 502);
    }
  },
};
