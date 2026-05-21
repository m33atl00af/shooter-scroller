const WORKER_URL = 'https://shooter-scroller-leaderboard.shooterscroller.workers.dev';

const LeaderboardService = {
  _session: null,

  // Called at game start — fetches a server-signed session token.
  async startSession() {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res   = await fetch(`${WORKER_URL}/session`, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) { this._session = null; return; }
      this._session = await res.json();
    } catch {
      this._session = null;
    }
  },

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
      // If startSession() didn't complete in time, try once more before submitting.
      if (!this._session) await this.startSession();

      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      const res   = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score, session: this._session }),
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
