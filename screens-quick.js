/* global React, Icon, Topbar, IconBtn, StatusSpacer, totalsFromRunning, leaderIndex */

function QuickEntry({ game, setGame, onBack, onSettings }) {
  const [activePlayer, setActivePlayer] = React.useState(0);
  const [buffer, setBuffer] = React.useState('');
  const [signMode, setSignMode] = React.useState(false);
  const [toast, setToast] = React.useState('');

  const totals = totalsFromRunning(game);
  const lead = leaderIndex(totals, game.lowerIsBetter);

  function press(d) {
    setBuffer(b => {
      if (b.length >= 4) return b;
      if (b === '0') return String(d);
      return b + d;
    });
  }
  function del() { setBuffer(b => b.slice(0, -1)); }

  function commit() {
    const n = parseInt(buffer || '0', 10);
    if (!n && !buffer) return;
    const val = signMode ? -n : n;
    const now = new Date();
    const stamp = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setGame({
      ...game,
      runningHistory: [
        ...(game.runningHistory || []),
        { id: 'h' + Date.now(), player: activePlayer, pts: val, when: stamp },
      ],
    });
    setBuffer('');
    const sign = val >= 0 ? '+' : '';
    setToast(`${sign}${val} → ${game.players[activePlayer]}`);
    setTimeout(() => setToast(''), 1600);
    setActivePlayer((activePlayer + 1) % game.players.length);
  }

  function quickAdd(n) {
    const amount = signMode ? -n : n;
    setBuffer(b => {
      const current = parseInt(b || '0', 10) || 0;
      const sum = current + amount;
      return String(sum);
    });
  }

  return (
    <>
      <StatusSpacer />
      <Topbar
        left={<IconBtn onClick={onBack} ariaLabel="Terug"><Icon.Back /></IconBtn>}
        title={<span>{game.icon} {game.name}</span>}
        right={<IconBtn onClick={onSettings} ariaLabel="Instellingen"><Icon.Sliders /></IconBtn>}
      />

      <div className="entry-panel">
        <div style={{ textAlign: 'center' }}>
          <button className="side-btn minus" onClick={() => setSignMode(s => !s)} aria-label="Plus of min">
            <span style={{ fontSize: 22, fontWeight: 700 }}>{signMode ? '−' : '+'}</span>
          </button>
          <div className="small-label">{signMode ? 'min' : 'plus'}</div>
        </div>
        <div>
          <div className="display">
            <span>{signMode ? '−' : ''}{buffer || '0'}</span>
            <span className="caret"></span>
          </div>
          <div className="small-label">Punten</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="side-btn add" onClick={commit} aria-label="Toevoegen">
            <Icon.Plus />
          </button>
          <div className="small-label">{game.players[activePlayer]}</div>
        </div>
      </div>

      <div style={{ padding: '4px 8px 0' }}>
        {game.players.map((p, i) => {
          const total = totals[i];
          const isDead = game.lowerIsBetter && game.targetScore > 0 && total >= game.targetScore;
          const isTargetWinner = !game.lowerIsBetter && game.targetScore > 0 && total >= game.targetScore;
          return (
            <div
              key={i}
              className={'score-row' + (i === activePlayer ? ' active' : '')}
              onClick={() => setActivePlayer(i)}
            >
              <div className="marker" />
              <div>
                <div className="name">
                  {p} {i === lead && <span className="crown-badge"><Icon.Crown /></span>}
                  {isDead && <span className="win-badge">💀</span>}
                  {isTargetWinner && <span className="crown-badge" style={{ color: 'oklch(0.72 0.18 85)' }}><Icon.Crown /></span>}
                </div>
                <div className="turns">{(game.runningHistory || []).filter(h => h.player === i && !h.removed).length} beurten</div>
              </div>
              <div className="total">{total}</div>
            </div>
          );
        })}
      </div>

      <div className="numpad-push" style={{ marginTop: 'auto' }}>
        <div className="numpad">
          <div className="quick-strip">
            {[5, 10, 15, 25, 50].map(n => (
              <button key={n} onClick={() => quickAdd(n)}>{signMode ? '−' : '+'}{n}</button>
            ))}
          </div>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => press(n)}>{n}</button>
          ))}
          <button onClick={del} className="del" aria-label="Wissen"><Icon.Backspace /></button>
          <button onClick={() => press(0)}>0</button>
          <button className="action" onClick={commit} aria-label="Toevoegen"><Icon.Plus /></button>
        </div>
      </div>

      <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>
    </>
  );
}

window.QuickEntry = QuickEntry;
