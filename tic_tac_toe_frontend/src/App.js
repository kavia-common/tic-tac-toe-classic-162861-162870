import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Minimalistic dark-themed Tic Tac Toe with:
 * - Start new game
 * - Human vs Human or Human vs AI
 * - Centered board, score and controls
 * - Winner/Draw display
 * - Restart game
 * Theme uses provided palette:
 *  - primary: #1976d2
 *  - secondary: #ffffff
 *  - accent: #ff9800
 */

// Helpers for game logic
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diags
];

function calculateWinner(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: [] };
}

function emptyIndices(squares) {
  return squares
    .map((v, idx) => (v ? null : idx))
    .filter((v) => v !== null);
}

/**
 * Very simple AI:
 * 1) Win if possible
 * 2) Block opponent if needed
 * 3) Take center
 * 4) Take a corner
 * 5) Take any side
 */
function computeAIMove(squares, aiMark, humanMark) {
  const available = emptyIndices(squares);
  if (available.length === 0) return null;

  const tryMove = (idx, mark) => {
    const copy = squares.slice();
    copy[idx] = mark;
    return calculateWinner(copy).winner === mark;
  };

  // 1) Can AI win now?
  for (const idx of available) {
    if (tryMove(idx, aiMark)) return idx;
  }

  // 2) Can opponent win next? Block.
  for (const idx of available) {
    if (tryMove(idx, humanMark)) return idx;
  }

  // 3) Take center
  if (available.includes(4)) return 4;

  // 4) Corners
  const corners = [0, 2, 6, 8].filter((c) => available.includes(c));
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // 5) Sides
  const sides = [1, 3, 5, 7].filter((s) => available.includes(s));
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];

  return available[0];
}

/**
 * App component
 */
// PUBLIC_INTERFACE
function App() {
  /**
   * App state
   */
  const [theme] = useState('dark'); // Force dark theme per requirements
  const [mode, setMode] = useState('HUMAN_HUMAN'); // or 'HUMAN_AI'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [statusMessage, setStatusMessage] = useState('Choose a mode and start playing!');
  const [gameActive, setGameActive] = useState(true);

  // Apply theme attribute to root for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const { winner, line } = useMemo(() => calculateWinner(board), [board]);
  const movesLeft = useMemo(() => emptyIndices(board).length, [board]);

  const currentPlayer = xIsNext ? 'X' : 'O';
  const aiMark = 'O'; // Human is X, AI is O in HUMAN_AI mode

  useEffect(() => {
    // Determine status
    if (winner) {
      setStatusMessage(`Winner: ${winner}`);
      setGameActive(false);
      setScores((s) => ({ ...s, [winner]: s[winner] + 1 }));
      return;
    }
    if (movesLeft === 0) {
      setStatusMessage('Draw!');
      setGameActive(false);
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
      return;
    }
    setStatusMessage(`Turn: ${currentPlayer}`);
  }, [winner, movesLeft, currentPlayer]);

  // AI move when mode is HUMAN_AI and it's AI's turn
  useEffect(() => {
    if (!gameActive || winner) return;
    if (mode === 'HUMAN_AI' && !xIsNext) {
      const timer = setTimeout(() => {
        const idx = computeAIMove(board, aiMark, 'X');
        if (idx !== null && board[idx] === null) {
          const next = board.slice();
          next[idx] = aiMark;
          setBoard(next);
          setXIsNext(true);
        }
      }, 400); // small delay for UX
      return () => clearTimeout(timer);
    }
  }, [mode, xIsNext, board, aiMark, winner, gameActive]);

  const canPlay = useMemo(() => gameActive && !winner, [gameActive, winner]);

  function handleClick(i) {
    if (!canPlay) return;
    if (board[i]) return; // occupied

    if (mode === 'HUMAN_AI' && !xIsNext) return; // Prevent clicking during AI turn

    const next = board.slice();
    next[i] = currentPlayer;
    setBoard(next);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function restartGame(hard = false) {
    /**
     * Restart current round. If hard is true, also reset scores.
     */
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameActive(true);
    setStatusMessage('New round. Turn: X');
    if (hard) {
      setScores({ X: 0, O: 0, draws: 0 });
    }
  }

  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    /**
     * Change game mode and start a fresh round.
     */
    setMode(newMode);
    restartGame(false);
  }

  // PUBLIC_INTERFACE
  function startNewGame() {
    /**
     * Start a new game with the selected mode and reset everything.
     */
    restartGame(true);
  }

  const highlighted = (idx) => line.includes(idx);

  return (
    <div className="App">
      <div className="ttt-container">
        <header className="ttt-header">
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <p className="ttt-subtitle">Minimal • Dark • Clean</p>
        </header>

        <section className="ttt-controls">
          <div className="mode-select" role="group" aria-label="Game mode">
            <button
              className={`btn ${mode === 'HUMAN_HUMAN' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleModeChange('HUMAN_HUMAN')}
            >
              Human vs Human
            </button>
            <button
              className={`btn ${mode === 'HUMAN_AI' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleModeChange('HUMAN_AI')}
            >
              Human vs AI
            </button>
          </div>

          <div className="game-actions">
            <button className="btn btn-accent" onClick={startNewGame} title="Start a fresh game (reset score)">
              New Game
            </button>
            <button className="btn btn-secondary" onClick={() => restartGame(false)} title="Restart current round">
              Restart Round
            </button>
          </div>

          <div className="status-row">
            <span className="status-label">{statusMessage}</span>
          </div>
        </section>

        <main className="board-wrapper" aria-label="Game board">
          <div className="board">
            {board.map((val, i) => (
              <button
                key={i}
                className={`cell ${highlighted(i) ? 'cell-win' : ''}`}
                onClick={() => handleClick(i)}
                aria-label={`Cell ${i + 1}: ${val ? val : 'empty'}`}
              >
                {val}
              </button>
            ))}
          </div>
        </main>

        <footer className="ttt-footer">
          <div className="scoreboard">
            <div className="score">
              <span className="score-label">X</span>
              <span className="score-value">{scores.X}</span>
            </div>
            <div className="score">
              <span className="score-label">Draws</span>
              <span className="score-value">{scores.draws}</span>
            </div>
            <div className="score">
              <span className="score-label">O</span>
              <span className="score-value">{scores.O}</span>
            </div>
          </div>
          <small className="hint">Tip: X starts first. In Human vs AI, AI plays O.</small>
        </footer>
      </div>
    </div>
  );
}

export default App;
