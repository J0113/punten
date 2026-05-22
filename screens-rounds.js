/* global React, Icon, Topbar, IconBtn, StatusSpacer, totalsFromRounds, leaderIndex */

function RoundsEntry({ game, setGame, onBack, onSettings }) {
  const totals = totalsFromRounds(game);
  const lead = leaderIndex(totals, game.lowerIsBetter);
  const [editing, setEditing] = React.useState(null);
  const [newRow, setNewRow] = React.useState((game.players || []).map(() => ''));
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const tableScrollRef = React.useRef(null);

  function updateCell(roundIdx, playerIdx, val) {
    const v = val === '' ? 0 : parseInt(val, 10);
    if (isNaN(v)) return;
    const newHist = (game.history || []).map((r, i) => {
      if (i !== roundIdx) return r;
      const next = [...r.scores]; next[playerIdx] = v;
      return { ...r, scores: next };
    });
    setGame({ ...game, history: newHist });
  }

  function confirmDeleteRound(roundIdx) {
    const newHist = (game.history || [])
      .filter((_, i) => i !== roundIdx)
      .map((r, i) => ({ ...r, round: i + 1 }));
    setGame({ ...game, history: newHist });
    setEditing(null);
    setDeleteConfirm(null);
  }

  function addRound() {
    const scores = newRow.map(v => parseInt(v || 0, 10) || 0);
    setGame({
      ...game,
      history: [...(game.history || []), { round: (game.history || []).length + 1, scores }],
    });
    setNewRow((game.players || []).map(() => ''));
    setTimeout(() => {
      if (tableScrollRef.current) tableScrollRef.current.scrollTop = 0;
    }, 50);
  }

  return (
    <>
      <StatusSpacer />
      <Topbar
        left={<IconBtn onClick={onBack} ariaLabel="Terug"><Icon.Back /></IconBtn>}
        title={<span>{game.icon} {game.name}</span>}
        right={<IconBtn onClick={onSettings} ariaLabel="Instellingen"><Icon.Sliders /></IconBtn>}
      />

      {/* Totals strip */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${game.players.length}, 1fr)`, gap: 8, padding: '0 12px 6px' }}>
        {game.players.map((p, i) => {
          const total = totals[i];
          const isDead = game.lowerIsBetter && game.targetScore > 0 && total >= game.targetScore;
          const isTargetWinner = !game.lowerIsBetter && game.targetScore > 0 && total >= game.targetScore;
          return (
            <div key={i} style={{
              background: i === lead ? 'oklch(0.97 0.04 145 / 0.6)' : 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 14, padding: '10px 8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {p} {i === lead && <span className="crown-badge"><Icon.Crown /></span>}
              </div>
              <div className="mono tabular" style={{
                fontSize: 24, fontWeight: 600, marginTop: 2,
                color: i === lead ? 'var(--accent-ink)' : 'var(--ink)',
                letterSpacing: '-0.04em',
              }}>{total}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {game.targetScore > 0 ? `/ ${game.targetScore}` : `${(game.history || []).length} rd`}
              </div>
              {isDead && <div className="win-badge" style={{ marginTop: 4, justifyContent: 'center' }}>💀</div>}
              {isTargetWinner && <div className="win-badge" style={{ marginTop: 4, justifyContent: 'center' }}>🏆</div>}
            </div>
          );
        })}
      </div>

      {/* Add new round bar */}
      <div className="round-add-bar">
        <div style={{ width: 28, alignSelf: 'center', textAlign: 'center', color: 'var(--ink-3)', fontWeight: 600, fontFamily: 'Geist Mono', fontSize: 13 }}>
          {(game.history || []).length + 1}
        </div>
        {game.players.map((p, i) => {
          const isNeg = newRow[i].startsWith('-');
          return (
            <div key={i} style={{ flex: 1, minWidth: 0, display: 'flex', position: 'relative' }}>
              <button
                tabIndex={-1}
                onClick={() => setNewRow(r => r.map((x, j) => {
                  if (j !== i) return x;
                  return x.startsWith('-') ? x.slice(1) : '-' + (x || '');
                }))}
                style={{
                  position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                  width: 22, height: 22, borderRadius: 6,
                  border: 'none', cursor: 'pointer', zIndex: 1,
                  background: isNeg ? 'var(--accent, #e74c3c)' : 'var(--surface-3, rgba(0,0,0,0.08))',
                  color: isNeg ? '#fff' : 'var(--ink-3)',
                  fontWeight: 700, fontSize: 14, lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="Wissel teken"
              >−</button>
              <input
                inputMode="numeric"
                placeholder={p}
                value={newRow[i].replace('-', '')}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setNewRow(r => r.map((x, j) => j === i ? (x.startsWith('-') ? '-' + digits : digits) : x));
                }}
                style={{
                  flex: 1, height: 42, minWidth: 0, width: '100%',
                  border: '1px solid var(--line)',
                  background: 'var(--surface-2)',
                  borderRadius: 12,
                  textAlign: 'center', font: 'inherit',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: 16, fontWeight: 600,
                  color: isNeg ? 'var(--accent, #e74c3c)' : 'var(--ink)',
                  outline: 'none',
                  paddingLeft: 28,
                }}
              />
            </div>
          );
        })}
        <button className="go" onClick={addRound} aria-label="Ronde toevoegen" style={{ width: 56, flex: 'none' }}>
          <Icon.Plus />
        </button>
      </div>

      {/* Rounds table */}
      <div className="rounds-wrap" style={{ flex: '1 1 auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div ref={tableScrollRef} style={{ overflow: 'auto', flex: 1 }}>
          <table className="rounds-table">
            <thead>
              <tr>
                <th className="col-rd">RD</th>
                {game.players.map((p, i) => (
                  <th key={i}><div className="player-name">{p}</div></th>
                ))}
                <th className="col-del"></th>
              </tr>
            </thead>
            <tbody>
{[...(game.history || [])].reverse().map((r, revIdx) => {
                const ri = (game.history || []).length - 1 - revIdx;
                const allZero = r.scores.every(s => s === 0);
                const roundBest = game.lowerIsBetter ? Math.min(...r.scores) : Math.max(...r.scores);
                return (
                  <tr key={ri}>
                    <td className="col-rd">{r.round}</td>
                    {r.scores.map((s, pi) => {
                      const isEditing = editing && editing.round === ri && editing.player === pi;
                      const isWinner = !allZero && s === roundBest;
                      return (
                        <td
                          key={pi}
                          className={(isEditing ? 'editing ' : '') + (s === 0 ? 'zero ' : '') + (isWinner ? 'winner' : '')}
                          onClick={() => setEditing({ round: ri, player: pi })}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              type="number"
                              defaultValue={s || ''}
                              onBlur={e => { updateCell(ri, pi, e.target.value); setEditing(null); }}
                              onKeyDown={e => { if (e.key === 'Enter') { updateCell(ri, pi, e.target.value); setEditing(null); } }}
                            />
                          ) : (s || 0)}
                        </td>
                      );
                    })}
                    <td className="col-del">
                      <button
                        className="round-del-btn"
                        onClick={() => setDeleteConfirm(ri)}
                        aria-label={`Verwijder ronde ${r.round}`}
                      >
                        <Icon.Trash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 8 }} />

      {/* Delete confirmation dialog */}
      {deleteConfirm !== null && (
        <div className="confirm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
            <h2>Ronde verwijderen?</h2>
            <p>Ronde {(game.history || [])[deleteConfirm]?.round} zal worden verwijderd.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setDeleteConfirm(null)}>Annuleren</button>
              <button className="confirm-delete" onClick={() => confirmDeleteRound(deleteConfirm)}>Verwijderen</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

window.RoundsEntry = RoundsEntry;
