// providers/liquipediaProvider.mjs
// Node 18+ (fetch natif). Zéro dépendance.
export class LiquipediaProvider {
  constructor({ userAgent = 'EsportVision/1.0 (contact: you@example.com)' } = {}) {
    if (!userAgent) throw new Error('User-Agent requis pour Leaguepedia.');
    this.ua = userAgent;
    this.apiBaseByGame = {
      'League of Legends': 'https://lol.fandom.com/api.php',
      'Valorant': 'https://valorant.fandom.com/api.php'
    };
  }

  _apiBase(jeu) {
    const base = this.apiBaseByGame[jeu];
    if (!base) throw new Error(`Jeu non supporté: ${jeu}`);
    return base;
  }

  _escapeSingleQuotes(s) {
    return String(s).replace(/'/g, "\\'");
  }

  async _cargoQuery(jeu, params) {
    const url = new URL(this._apiBase(jeu));
    url.searchParams.set('action', 'cargoquery');
    url.searchParams.set('format', 'json');
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': this.ua, 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
    }
    const json = await res.json();
    return (json.cargoquery || []).map(x => x.title || x);
  }

  _statusFromDateUTC(dateUtc) {
    if (!dateUtc) return 'Inconnu';
    const ts = new Date(dateUtc.replace(' ', 'T') + 'Z').getTime();
    if (Number.isNaN(ts)) return 'Inconnu';
    return ts > Date.now() ? 'À venir' : 'Terminé';
  }

  _estimateProb(wrA, wrB) {
    const p = 0.5 + (wrA - wrB) / 2;
    return Math.min(0.9, Math.max(0.1, Number(p.toFixed(3))));
  }

  async _recentWinrate(jeu, team, n = 10) {
    const teamEsc = this._escapeSingleQuotes(team);
    const fields = [
      'MatchSchedule.Team1=team1',
      'MatchSchedule.Team2=team2',
      'MatchSchedule.Winner=winner',
      'MatchSchedule.DateTime_UTC=dateUtc'
    ].join(', ');
    const where = `(MatchSchedule.Team1='${teamEsc}' OR MatchSchedule.Team2='${teamEsc}') AND MatchSchedule.Winner IS NOT NULL AND MatchSchedule.Winner != ''`;

    const rows = await this._cargoQuery(jeu, {
      tables: 'MatchSchedule',
      fields, where,
      order_by: 'MatchSchedule.DateTime_UTC DESC',
      limit: String(n)
    });

    let wins = 0;
    for (const r of rows) if (String(r.winner || '').trim() === team) wins++;
    return rows.length ? wins / rows.length : 0.5;
  }

  async _matchRowsBetween(jeu, teamA, teamB, competitionLike) {
    const A = this._escapeSingleQuotes(teamA);
    const B = this._escapeSingleQuotes(teamB);
    const fields = [
      'MatchSchedule.MatchId=matchId',
      'MatchSchedule.Team1=team1',
      'MatchSchedule.Team2=team2',
      'MatchSchedule.DateTime_UTC=dateUtc',
      'MatchSchedule.Tournament=tournament',
      'MatchSchedule.Winner=winner',
      'MatchSchedule.OverviewPage=page'
    ].join(', ');

    let where = `(MatchSchedule.Team1='${A}' AND MatchSchedule.Team2='${B}') OR (MatchSchedule.Team1='${B}' AND MatchSchedule.Team2='${A}')`;
    if (competitionLike?.trim()) {
      const compEsc = this._escapeSingleQuotes(competitionLike.trim());
      where = `(${where}) AND MatchSchedule.Tournament LIKE '%${compEsc}%'`;
    }

    const rows = await this._cargoQuery(jeu, {
      tables: 'MatchSchedule',
      fields, where,
      order_by: 'MatchSchedule.DateTime_UTC ASC',
      limit: '200'
    });

    return rows.map(r => ({
      ...r,
      _ts: new Date((r.dateUtc || '').replace(' ', 'T') + 'Z').getTime()
    }));
  }

  async fetchOne({ jeu = 'League of Legends', competition = 'LFL', equipeA, equipeB }) {
    if (!equipeA || !equipeB) throw new Error('equipeA et equipeB sont requis.');
    const rows = await this._matchRowsBetween(jeu, equipeA, equipeB, competition);

    if (!rows.length) {
      return {
        id: `${competition}_${equipeA}_${equipeB}`.toUpperCase().replace(/\s+/g, '_'),
        jeu, competition, equipeA, equipeB,
        probabiliteA: 0.5,
        statut: 'Inconnu'
      };
    }

    const future = rows.find(r => !Number.isNaN(r._ts) && r._ts > Date.now());
    const chosen = future || rows.filter(r => !Number.isNaN(r._ts)).sort((a, b) => b._ts - a._ts)[0] || rows[0];

    const [wrA, wrB] = await Promise.all([
      this._recentWinrate(jeu, equipeA, 10),
      this._recentWinrate(jeu, equipeB, 10)
    ]);
    const probaA = this._estimateProb(wrA, wrB);

    return {
      id: String(chosen.matchId || `${competition}_${equipeA}_${equipeB}`).toUpperCase().replace(/\s+/g, '_'),
      jeu,
      competition: chosen.tournament || competition,
      equipeA,
      equipeB,
      probabiliteA: probaA,
      statut: this._statusFromDateUTC(chosen.dateUtc)
    };
  }

  async fetchMany({ jeu = 'League of Legends', competition = 'LFL', paires = [] }) {
    const out = [];
    for (const { equipeA, equipeB } of paires) {
      try {
        const m = await this.fetchOne({ jeu, competition, equipeA, equipeB });
        out.push(m);
        await new Promise(r => setTimeout(r, 120)); // throttle light
      } catch (e) {
        console.warn(`fetchOne échoué pour ${equipeA} vs ${equipeB}: ${e.message}`);
      }
    }
    return out;
  }
}
