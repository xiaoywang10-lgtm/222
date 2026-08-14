import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  PIECE_TYPES,
  clearCompletedRows,
  collides,
  createBoard,
  createPiece,
  getLevel,
  mergePiece,
  movePiece,
  rotatePiece,
  scoreForClear
} from './game-engine.js';

const COLORS = {
  I: '#70d6ff', J: '#5b8cff', L: '#ff9f4a', O: '#f5c951', S: '#67d17b', T: '#d982e4', Z: '#f06a6a'
};
const CELL_SIZE = 30;
const gameCanvas = document.querySelector('#game-canvas');
const nextCanvas = document.querySelector('#next-canvas');
const gameContext = gameCanvas.getContext('2d');
const nextContext = nextCanvas.getContext('2d');
const scoreOutput = document.querySelector('#score');
const levelOutput = document.querySelector('#level');
const linesOutput = document.querySelector('#lines');
const statusMessage = document.querySelector('#status-message');
const startButton = document.querySelector('#start-button');
const pauseButton = document.querySelector('#pause-button');

let state = createInitialState();
let timerId = null;

function createInitialState() {
  return { board: createBoard(), active: null, next: null, score: 0, lines: 0, level: 1, status: 'ready', bag: [] };
}

function fillBag() {
  state.bag = [...PIECE_TYPES].sort(() => Math.random() - 0.5);
}

function takePiece() {
  if (!state.bag.length) fillBag();
  return createPiece(state.bag.pop());
}

function fallDelay() {
  return Math.max(110, 900 - (state.level - 1) * 75);
}

function setStatus(message, visible = true) {
  statusMessage.textContent = message;
  statusMessage.hidden = !visible;
}

function updateHud() {
  scoreOutput.textContent = String(state.score);
  levelOutput.textContent = String(state.level);
  linesOutput.textContent = String(state.lines);
  pauseButton.disabled = state.status === 'ready' || state.status === 'over';
  pauseButton.textContent = state.status === 'paused' ? '继续' : '暂停';
  startButton.textContent = state.status === 'playing' ? '重新开始' : state.status === 'over' ? '再玩一次' : '开始游戏';
}

function drawCell(context, x, y, color, size = CELL_SIZE) {
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  context.fillStyle = 'rgba(255, 255, 255, 0.25)';
  context.fillRect(x * size + 3, y * size + 3, size - 6, 3);
}

function drawGame() {
  gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  gameContext.strokeStyle = '#1f292e';
  gameContext.lineWidth = 1;
  for (let x = 0; x <= BOARD_WIDTH; x += 1) {
    gameContext.beginPath(); gameContext.moveTo(x * CELL_SIZE, 0); gameContext.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE); gameContext.stroke();
  }
  for (let y = 0; y <= BOARD_HEIGHT; y += 1) {
    gameContext.beginPath(); gameContext.moveTo(0, y * CELL_SIZE); gameContext.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE); gameContext.stroke();
  }
  state.board.forEach((row, y) => row.forEach((cell, x) => { if (cell) drawCell(gameContext, x, y, COLORS[cell]); }));
  if (state.active) {
    state.active.matrix.forEach((row, y) => row.forEach((cell, x) => {
      if (cell) drawCell(gameContext, state.active.x + x, state.active.y + y, COLORS[state.active.type]);
    }));
  }
}

function drawNext() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (!state.next) return;
  const size = 20;
  const matrix = state.next.matrix;
  const offsetX = Math.floor((nextCanvas.width / size - matrix[0].length) / 2);
  const offsetY = Math.floor((nextCanvas.height / size - matrix.length) / 2);
  matrix.forEach((row, y) => row.forEach((cell, x) => {
    if (cell) drawCell(nextContext, offsetX + x, offsetY + y, COLORS[state.next.type], size);
  }));
}

function render() {
  drawGame();
  drawNext();
  updateHud();
}

function stopTimer() {
  if (timerId !== null) window.clearTimeout(timerId);
  timerId = null;
}

function scheduleDrop() {
  stopTimer();
  if (state.status !== 'playing') return;
  timerId = window.setTimeout(() => {
    stepDown();
    scheduleDrop();
  }, fallDelay());
}

function spawnPiece() {
  state.active = state.next ?? takePiece();
  state.next = takePiece();
  if (collides(state.board, state.active)) {
    state.status = 'over';
    stopTimer();
    setStatus('游戏结束', true);
  }
}

function lockPiece() {
  state.board = mergePiece(state.board, state.active);
  const result = clearCompletedRows(state.board);
  state.board = result.board;
  if (result.cleared) {
    state.score += scoreForClear(result.cleared, state.level);
    state.lines += result.cleared;
    state.level = getLevel(state.lines);
  }
  spawnPiece();
}

function stepDown() {
  if (state.status !== 'playing') return;
  const nextPosition = movePiece(state.active, 0, 1);
  if (collides(state.board, nextPosition)) lockPiece();
  else state.active = nextPosition;
  render();
}

function move(dx) {
  const nextPosition = movePiece(state.active, dx, 0);
  if (!collides(state.board, nextPosition)) state.active = nextPosition;
  render();
}

function rotate() {
  const rotated = rotatePiece(state.active);
  if (!collides(state.board, rotated)) state.active = rotated;
  render();
}

function hardDrop() {
  while (!collides(state.board, movePiece(state.active, 0, 1))) state.active = movePiece(state.active, 0, 1);
  lockPiece();
  render();
  scheduleDrop();
}

function startGame() {
  stopTimer();
  state = createInitialState();
  state.status = 'playing';
  state.next = takePiece();
  spawnPiece();
  setStatus('', false);
  render();
  scheduleDrop();
}

function togglePause() {
  if (state.status === 'playing') {
    state.status = 'paused';
    stopTimer();
    setStatus('已暂停', true);
  } else if (state.status === 'paused') {
    state.status = 'playing';
    setStatus('', false);
    scheduleDrop();
  }
  render();
}

function handleAction(action) {
  if (action === 'pause') return togglePause();
  if (state.status !== 'playing') return;
  if (action === 'left') move(-1);
  if (action === 'right') move(1);
  if (action === 'down') stepDown();
  if (action === 'rotate') rotate();
  if (action === 'drop') hardDrop();
}

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => handleAction(button.dataset.action));
});
document.addEventListener('keydown', (event) => {
  const actions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate', ' ': 'drop', p: 'pause', P: 'pause' };
  const action = actions[event.key];
  if (!action) return;
  event.preventDefault();
  handleAction(action);
});

setStatus('按开始进入游戏', true);
render();
