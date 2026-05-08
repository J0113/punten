/* global React, Icon, Topbar, IconBtn, StatusSpacer, formatDate */

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 999,
        background: value ? 'var(--accent)' : 'var(--surface-2)',
        border: '1px solid ' + (value ? 'transparent' : 'var(--line)'),
        cursor: 'pointer', padding: 0,
        position: 'relative', flexShrink: 0,
        transition: 'background .15s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: value ? 22 : 3,
        width: 20, height: 20, borderRadius: 999,
        background: 'white',
        boxShadow: '0 1px 3px oklch(0 0 0 / 0.2)',
        transition: 'left .15s',
      }} />
    </button>
  );
}

function GameSettings({ game: gameProp, setGame, onClose, onHistory, onDelete, isNew, onBack, onCreate }) {
  const [game, setLocal] = React.useState(() => gameProp || {
    name: '',
    icon: '🃏',
    accent: 'oklch(0.62 0.16 145)',
    scoreType: 'running',
    targetScore: 0,
    lowerIsBetter: false,
    players: ['', ''],
  });
  const [newPlayerName, setNewPlayerName] = React.useState('');
  const [showConfirm, setShowConfirm] = React.useState(false);

  React.useEffect(() => {
    if (!isNew && gameProp) setLocal(gameProp);
  }, [gameProp]);

  function update(patch) {
    const next = { ...game, ...patch };
    setLocal(next);
    if (!isNew && setGame) setGame(next);
  }

  function updatePlayer(i, v) {
    const next = [...game.players]; next[i] = v;
    update({ players: next });
  }

  function removePlayer(i) {
    if (game.players.length <= 2) return;
    const next = game.players.filter((_, j) => j !== i);
    const newHist = game.scoreType === 'rounds'
      ? (game.history || []).map(r => ({ ...r, scores: r.scores.filter((_, j) => j !== i) }))
      : (game.history || []);
    const newRunning = (game.runningHistory || [])
      .filter(h => h.player !== i)
      .map(h => ({ ...h, player: h.player > i ? h.player - 1 : h.player }));
    update({ players: next, history: newHist, runningHistory: newRunning });
  }

  function addPlayer() {
    const name = newPlayerName.trim();
    if (!name) return;
    const next = [...game.players, name];
    const newHist = game.scoreType === 'rounds'
      ? (game.history || []).map(r => ({ ...r, scores: [...r.scores, 0] }))
      : (game.history || []);
    update({ players: next, history: newHist });
    setNewPlayerName('');
  }

  function handleCreate() {
    const validPlayers = game.players.filter(p => p.trim());
    if (!game.name.trim() || validPlayers.length < 2) return;
    onCreate({ ...game, players: validPlayers });
  }

  const canCreate = isNew && game.name.trim() && game.players.filter(p => p.trim()).length >= 2;

  return (
    <>
      <StatusSpacer />
      <Topbar
        left={
          isNew
            ? <IconBtn onClick={onBack} ariaLabel="Terug"><Icon.Back /></IconBtn>
            : <IconBtn onClick={onClose} ariaLabel="Sluiten"><Icon.Close /></IconBtn>
        }
        title={<span>{isNew ? 'Nieuw spel' : 'Spel instellingen'}</span>}
        right={null}
      />

      <div className="scroll-area">
        {/* Name */}
        <div className="section-label">Naam</div>
        <div className="list-card">
          <div className="row" style={{ cursor: 'text' }}>
            <input
              className="player-input"
              value={game.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="Naam van het spel"
              style={{ fontSize: 17, fontWeight: 600 }}
            />
            <span style={{ fontSize: 22 }}>{game.icon}</span>
          </div>
        </div>

        {/* Icon picker */}
        <div className="section-label">Icoon</div>
        <div className="list-card">
          <div className="icon-picker">
            {['🃏','♠️','♣️','♥️','♦️','🎲','🎯','🏆','🎮','🤝'].map(ico => (
              <button
                key={ico}
                className={game.icon === ico ? 'selected' : ''}
                onClick={() => update({ icon: ico })}
              >
                {ico}
              </button>
            ))}
          </div>
        </div>

        {/* Type — only settable during creation */}
        {isNew && (
          <>
            <div className="section-label">Modus</div>
            <div className="list-card" style={{ padding: 8 }}>
              <div className="segmented">
                <button className={game.scoreType === 'running' ? 'active' : ''} onClick={() => update({ scoreType: 'running' })}>
                  Doorlopend
                </button>
                <button className={game.scoreType === 'rounds' ? 'active' : ''} onClick={() => update({ scoreType: 'rounds' })}>
                  Rondes (tabel)
                </button>
              </div>
            </div>
          </>
        )}

        {/* Options: target score + lager is beter + history */}
        <div className="list-card" style={{ marginTop: 18 }}>
          {/* History link — only for running games in edit mode */}
          {!isNew && game.scoreType === 'running' && (
            <div className="row" onClick={onHistory}>
              <div className="grow">
                <div className="title">Geschiedenis</div>
              </div>
              <div className="mono tabular" style={{ color: 'var(--ink-3)', fontSize: 14 }}>
                {(game.runningHistory || []).length} beurten
              </div>
              <span className="chev"><Icon.Chev /></span>
            </div>
          )}
          <div className="row">
            <div className="grow">
              <div className="title">Doelscore</div>
              <div className="sub">Eerste die dit haalt wint (0 = geen)</div>
            </div>
            <input
              inputMode="numeric"
              value={game.targetScore}
              onChange={e => update({ targetScore: parseInt(e.target.value || 0, 10) || 0 })}
              style={{
                width: 80, height: 36, textAlign: 'right',
                background: 'var(--surface-2)', border: '1px solid var(--line)',
                borderRadius: 10, fontFamily: 'Geist Mono', fontSize: 15, fontWeight: 600,
                color: 'var(--ink)', outline: 'none', padding: '0 10px',
              }}
            />
          </div>
          <div className="row" style={{ cursor: 'default' }}>
            <div className="grow">
              <div className="title">Lager is beter</div>
              <div className="sub">De speler met de laagste score is aan de leiding</div>
            </div>
            <Toggle value={!!game.lowerIsBetter} onChange={v => update({ lowerIsBetter: v })} />
          </div>
        </div>

        {/* Players */}
        <div className="section-label">Spelers</div>
        <div className="list-card">
          {game.players.map((p, i) => (
            <div className="row" key={i} style={{ paddingLeft: 12 }}>
              <button
                className="delete-btn"
                onClick={() => removePlayer(i)}
                aria-label={`Verwijder ${p}`}
                disabled={game.players.length <= 2}
                style={{ opacity: game.players.length <= 2 ? 0.3 : 1 }}
              >−</button>
              <input
                className="player-input"
                value={p}
                onChange={e => updatePlayer(i, e.target.value)}
                placeholder={`Speler ${i + 1}`}
              />
              <span style={{ color: 'var(--ink-3)' }}><Icon.Drag /></span>
            </div>
          ))}
          <div className="new-player-inline">
            <input
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              placeholder="Nieuwe speler..."
              onKeyDown={e => { if (e.key === 'Enter') addPlayer(); }}
            />
            <button onClick={addPlayer}>+</button>
          </div>
        </div>

        {/* Create button */}
        {isNew && (
          <div style={{ padding: '20px 16px 8px' }}>
            <button
              className="btn-primary btn-block"
              onClick={handleCreate}
              disabled={!canCreate}
              style={{ opacity: canCreate ? 1 : 0.4 }}
            >
              Maak aan
            </button>
          </div>
        )}

        {/* Delete game */}
        {!isNew && onDelete && (
          <div style={{ padding: '16px 0 8px' }}>
            <button className="delete-game-btn" onClick={() => setShowConfirm(true)}>
              Verwijder spel
            </button>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
            <h2>Spel verwijderen?</h2>
            <p>"{game.name}" en alle scores worden permanent verwijderd. Dit kan niet ongedaan worden gemaakt.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowConfirm(false)}>Annuleren</button>
              <button className="confirm-delete" onClick={() => { setShowConfirm(false); onDelete(); }}>Verwijderen</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function HistoryView({ game, setGame, onBack }) {
  function toggleRemove(id) {
    setGame({
      ...game,
      runningHistory: (game.runningHistory || []).map(h => h.id === id ? { ...h, removed: !h.removed } : h),
    });
  }
  const items = (game.runningHistory || []).slice().reverse();
  return (
    <>
      <StatusSpacer />
      <Topbar
        left={<IconBtn onClick={onBack} ariaLabel="Terug"><Icon.Back /></IconBtn>}
        title={<span>Geschiedenis</span>}
        right={null}
      />

      <div className="list-card" style={{ padding: 0 }}>
        {items.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
            Nog geen beurten gespeeld.
          </div>
        )}
        {items.map((h, idx) => {
          const num = items.length - idx;
          const player = game.players[h.player] || '—';
          return (
            <div key={h.id} className={'history-row' + (h.removed ? ' removed' : '')}>
              <div className="idx">{String(num).padStart(2, '0')}</div>
              <div>
                <div className="player">{player}</div>
                <div className="when">{h.when}</div>
              </div>
              <div className="pts">{h.pts >= 0 ? '+' : ''}{h.pts}</div>
              <button className="trash" onClick={() => toggleRemove(h.id)} aria-label="Verwijder beurt">
                <span style={{ width: 14, height: 14, display: 'flex' }}><Icon.Trash /></span>
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ height: 32 }} />
    </>
  );
}

window.GameSettings = GameSettings;
window.HistoryView = HistoryView;
