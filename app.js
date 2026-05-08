/* global React, ReactDOM, GamesList, QuickEntry, RoundsEntry, GameSettings, HistoryView, formatDate */
const { useState, useEffect } = React;

const STORAGE_KEY = 'punten:state:v2';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { games: [], screen: 'list', activeGameId: null };
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

function useIsWide() {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = e => setWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return wide;
}

function DesktopEmpty({ onNew }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, color: 'var(--ink-3)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>♣️</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>
        Selecteer een spel
      </div>
      <div style={{ fontSize: 14, marginBottom: 28 }}>
        Of maak een nieuw spel aan om te beginnen.
      </div>
      <button className="btn-primary" style={{ padding: '0 28px' }} onClick={onNew}>
        Nieuw spel
      </button>
    </div>
  );
}

function App() {
  const [state, setState] = useState(loadState);
  const isWide = useIsWide();

  useEffect(() => { saveState(state); }, [state]);

  function setGame(updater) {
    setState(s => ({
      ...s,
      games: s.games.map(g =>
        g.id === s.activeGameId
          ? (typeof updater === 'function' ? updater(g) : updater)
          : g
      ),
    }));
  }

  function openGame(id) {
    setState(s => ({ ...s, screen: 'game', activeGameId: id }));
  }

  function gotoList() {
    setState(s => ({ ...s, screen: 'list' }));
  }

  function gotoNew() {
    setState(s => ({ ...s, screen: 'new' }));
  }

  function gotoSettings(id) {
    setState(s => ({ ...s, screen: 'settings', activeGameId: id || s.activeGameId }));
  }

  function gotoHistory() {
    setState(s => ({ ...s, screen: 'history' }));
  }

  function createGame(draft) {
    const id = 'g' + Date.now();
    const game = {
      ...draft,
      id,
      history: [],
      runningHistory: [],
      updated: formatDate(new Date()),
    };
    setState(s => ({
      ...s,
      games: [game, ...s.games],
      screen: 'game',
      activeGameId: id,
    }));
  }

  function deleteGame(id) {
    setState(s => ({
      ...s,
      games: s.games.filter(g => g.id !== id),
      screen: 'list',
      activeGameId: null,
    }));
  }

  const activeGame = state.games.find(g => g.id === state.activeGameId);

  function buildMainPanel() {
    if (state.screen === 'new') {
      return (
        <GameSettings
          isNew
          onBack={gotoList}
          onCreate={createGame}
        />
      );
    }
    if (state.screen === 'game' && activeGame) {
      if (activeGame.scoreType === 'rounds') {
        return (
          <RoundsEntry
            game={activeGame}
            setGame={setGame}
            onBack={gotoList}
            onSettings={() => gotoSettings(activeGame.id)}
          />
        );
      } else {
        return (
          <QuickEntry
            game={activeGame}
            setGame={setGame}
            onBack={gotoList}
            onSettings={() => gotoSettings(activeGame.id)}
          />
        );
      }
    }
    if (state.screen === 'settings' && activeGame) {
      return (
        <GameSettings
          game={activeGame}
          setGame={setGame}
          onClose={() => setState(s => ({ ...s, screen: 'game' }))}
          onHistory={activeGame.scoreType === 'running' ? gotoHistory : undefined}
          onDelete={() => deleteGame(activeGame.id)}
        />
      );
    }
    if (state.screen === 'history' && activeGame && activeGame.scoreType === 'running') {
      return (
        <HistoryView
          game={activeGame}
          setGame={setGame}
          onBack={() => setState(s => ({ ...s, screen: 'settings' }))}
        />
      );
    }
    return null;
  }

  const sidebar = (
    <GamesList
      games={state.games}
      onOpen={openGame}
      onNew={gotoNew}
      onSettings={() => state.games[0] ? gotoSettings(state.games[0].id) : gotoNew()}
      activeGameId={state.activeGameId}
    />
  );

  if (isWide) {
    const mainPanel = buildMainPanel();
    return (
      <div className="shell desktop">
        <div className="desktop-sidebar">{sidebar}</div>
        <div className="desktop-main">
          <div className="screen-fill">
            {mainPanel || <DesktopEmpty onNew={gotoNew} />}
          </div>
        </div>
      </div>
    );
  }

  // Mobile: single-column
  const mainPanel = buildMainPanel();
  return <div className="shell">{mainPanel || sidebar}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
