// Replace this URL with the one printed by `wrangler deploy`
const WORKER_URL = 'https://shooter-scroller-leaderboard.shooterscroller.workers.dev';

const LeaderboardService = {
  async getScores() {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res   = await fetch(WORKER_URL, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.scores) ? data.scores : [];
    } catch {
      return [];
    }
  },

  async submitScore(name, score) {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      const res   = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
