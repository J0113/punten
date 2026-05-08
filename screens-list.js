/* global React, Icon */

const SEED_GAMES = [
  {
    id: 'g1',
    name: 'Klaverjassen',
    icon: '♣️',
    accent: 'oklch(0.62 0.16 145)',
    players: ['Jolle', 'Corina', 'Perry', 'Mees'],
    targetScore: 1500,
    scoreType: 'rounds',
    history: [
      { round: 1, scores: [54, 78, 0, 30] },
      { round: 2, scores: [120, 22, 88, 14] },
      { round: 3, scores: [33, 105, 12, 60] },
      { round: 4, scores: [70, 0, 90, 130] },
      { round: 5, scores: [0, 142, 65, 88] },
      { round: 6, scores: [88, 24, 110, 30] },
    ],
    runningHistory: [],
    updated: '8 mei 2026',
  },
  {
    id: 'g2',
    name: 'Toep',
    icon: '🃏',
    accent: 'oklch(0.55 0.15 250)',
    players: ['Jolle', 'Corina', 'Perry'],
    targetScore: 0,
    scoreType: 'running',
    history: [],
    runningHistory: [
      { id: 'h1', player: 0, pts: 15, when: '03-05-2026 23:51' },
      { id: 'h2', player: 1, pts: 15, when: '03-05-2026 23:54' },
      { id: 'h3', player: 2, pts: 15, when: '03-05-2026 23:55', removed: true },
      { id: 'h4', player: 1, pts: 0,  when: '03-05-2026 23:56' },
      { id: 'h5', player: 2, pts: 15, when: '03-05-2026 23:56' },
      { id: 'h6', player: 0, pts: 15, when: '04-05-2026 00:01' },
      { id: 'h7', player: 2, pts: 95, when: '04-05-2026 00:01' },
      { id: 'h8', player: 0, pts: 0,  when: '04-05-2026 00:01' },
      { id: 'h9', player: 0, pts: 15, when: '04-05-2026 00:06' },
      { id: 'h10', player: 1, pts: 55, when: '04-05-2026 00:06' },
      { id: 'h11', player: 2, pts: 0, when: '04-05-2026 00:06' },
    ],
    updated: '4 mei 2026',
  },
];

function totalsFromRounds(game) {
  const t = (game.players || []).map(() => 0);
  (game.history || []).forEach(r => (r.scores || []).forEach((s, i) => { t[i] = (t[i] || 0) + (Number(s) || 0); }));
  return t;
}

function totalsFromRunning(game) {
  const t = (game.players || []).map(() => 0);
  (game.runningHistory || []).forEach(h => { if (!h.removed) t[h.player] = (t[h.player] || 0) + Number(h.pts || 0); });
  return t;
}

function leaderIndex(totals, lowerIsBetter = false) {
  if (totals.every(v => v === totals[0])) return -1;
  let best = lowerIsBetter ? Infinity : -Infinity, idx = 0;
  totals.forEach((v, i) => {
    if (lowerIsBetter ? v < best : v > best) { best = v; idx = i; }
  });
  return idx;
}

function formatDate(d) {
  const months = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function StatusSpacer() { return <div className="status-spacer" />; }

function Topbar({ left, title, right }) {
  const gridStyle = !left && !right
    ? { gridTemplateColumns: '1fr', justifyItems: 'center' }
    : {};
  return (
    <div className="topbar" style={gridStyle}>
      {left && <div>{left}</div>}
      <h1>{title}</h1>
      {right && <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{right}</div>}
    </div>
  );
}

function IconBtn({ children, onClick, ariaLabel }) {
  return (
    <button className="icon-btn" onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

function GamesList({ games, onOpen, onNew, onSettings, activeGameId }) {
  return (
    <>
      <StatusSpacer />
      <Topbar
        title={<span>Spellen</span>}
        right={null}
      />

      <div className="new-tile" onClick={onNew}>
        <div className="plus"><Icon.Plus /></div>
        <div>
          <div style={{ fontSize: 16 }}>Nieuw spel</div>
          <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}>Spelers, type, doelscore</div>
        </div>
      </div>

      <div className="section-label" style={{ paddingTop: 22 }}>Lopende spellen</div>

      {games.length === 0 && (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
          Nog geen spellen. Maak een nieuw spel aan!
        </div>
      )}

      {games.map(g => {
        const totals = g.scoreType === 'rounds' ? totalsFromRounds(g) : totalsFromRunning(g);
        const lead = leaderIndex(totals, g.lowerIsBetter);
        const leadTotal = lead >= 0 ? totals[lead] : 0;
        const hasWinner = g.targetScore > 0 && leadTotal >= g.targetScore;
        return (
          <div className="game-card" key={g.id} onClick={() => onOpen(g.id)} style={{ borderLeft: `4px solid ${g.accent}`, outline: g.id === activeGameId ? '2px solid var(--accent)' : 'none', outlineOffset: -1 }}>
            <div>
              <div className="name">{g.icon} {g.name}</div>
              <div className="players">{g.players.join(', ')}</div>
              <div className="meta">
                <span className="badge">{g.scoreType === 'rounds' ? 'Rondes' : 'Doorlopend'}</span>
                {g.lowerIsBetter && <span className="badge" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}>Lager is beter</span>}
                <span>·</span>
                <span>{g.updated}</span>
                {hasWinner && <span className="win-badge">🏆 Gewonnen</span>}
              </div>
            </div>
            <div className="right-stack">
              <div className="leader-tag">Leider</div>
              <div className="leader-name" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="crown-badge"><Icon.Crown /></span>
                {lead >= 0 ? g.players[lead] : '—'}
              </div>
              <div className="mono tabular" style={{ fontSize: 22, fontWeight: 600, color: g.accent }}>
                {leadTotal}
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ height: 40 }} />
    </>
  );
}

window.GamesList = GamesList;
window.Topbar = Topbar;
window.IconBtn = IconBtn;
window.StatusSpacer = StatusSpacer;
window.totalsFromRounds = totalsFromRounds;
window.totalsFromRunning = totalsFromRunning;
window.leaderIndex = leaderIndex;
window.formatDate = formatDate;
window.SEED_GAMES = SEED_GAMES;
