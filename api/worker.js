// Cloudflare Worker — Leaderboard proxy for Shooter Scroller
// Deploy with: wrangler deploy
// Set secrets:  wrangler secret put JSONBIN_KEY
//               wrangler secret put JSONBIN_BIN_ID

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Max achievable score: 36 enemies × 100 pts = 3,600. Cap at 50k for future headroom.
const MAX_SCORE = 50000;

// Mirrors the client-side filter in NameScene.js — enforced server-side so direct API
// calls cannot bypass it.
const BAD_WORDS_EXACT      = ['ass', 'fag', 'cum', 'poo', 'tit', 'nut', 'gay'];
const BAD_WORDS_SUBSTRING  = [
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy',
  'nigger', 'nigga', 'faggot', 'whore', 'slut', 'bastard',
  'piss', 'prick', 'twat', 'wank', 'arse', 'asshole', 'arsehole',
  'bollock', 'tosser', 'wanker', 'retard', 'rape', 'nazi',
];

function hasBadWord(name) {
  const lower = name.toLowerCase();
  return BAD_WORDS_EXACT.includes(lower) ||
    BAD_WORDS_SUBSTRING.some(w => lower.includes(w));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const BIN  = `https://api.jsonbin.io/v3/b/${env.JSONBIN_BIN_ID}`;
    const AUTH = { 'X-Master-Key': env.JSONBIN_KEY, 'Content-Type': 'application/json' };

    try {
      // ── GET: return leaderboard ───────────────────────────────────────
      if (request.method === 'GET') {
        const res  = await fetch(`${BIN}/latest`, { headers: AUTH });
        if (!res.ok) return json({ scores: [] });
        const data = await res.json();
        return json(data.record ?? { scores: [] });
      }

      // ── POST: submit a score ──────────────────────────────────────────
      if (request.method === 'POST') {
        const body  = await request.json();
        const name  = String(body.name  ?? '').replace(/[^a-zA-Z]/g, '').slice(0, 12).toUpperCase();
        const score = parseInt(body.score, 10);

        // Issue 1 fix: enforce score cap
        if (!name || isNaN(score) || score < 0 || score > MAX_SCORE) {
          return json({ error: 'invalid payload' }, 400);
        }

        // Issue 2 fix: server-side profanity filter
        if (hasBadWord(name)) {
          return json({ error: 'invalid payload' }, 400);
        }

        // Fetch current scores
        const getRes  = await fetch(`${BIN}/latest`, { headers: AUTH });
        const current = getRes.ok ? await getRes.json() : { record: { scores: [] } };
        const scores  = Array.isArray(current.record?.scores) ? current.record.scores : [];

        scores.push({ name, score, date: new Date().toISOString() });
        scores.sort((a, b) => b.score - a.score);
        const top50 = scores.slice(0, 50);

        const putRes = await fetch(BIN, {
          method: 'PUT',
          headers: AUTH,
          body: JSON.stringify({ scores: top50 }),
        });

        // Issue 5 fix: log details server-side, return generic message to client
        if (!putRes.ok) {
          console.error(`JSONBin PUT failed ${putRes.status}: ${await putRes.text()}`);
          return json({ error: 'Score could not be saved' }, 502);
        }

        const rank = top50.findIndex(s => s.name === name && s.score === score) + 1;
        return json({ ok: true, rank: rank || null });
      }

      return new Response('Method not allowed', { status: 405, headers: CORS });
    } catch (err) {
      // Issue 5 fix: log full error server-side only
      console.error('Worker error:', err.message);
      return json({ error: 'Internal error' }, 502);
    }
  },
};
