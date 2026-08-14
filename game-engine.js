export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

const PIECES = {
  I: [[1, 1, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[0, 1, 0], [1, 1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]]
};

export const PIECE_TYPES = Object.keys(PIECES);

export function createBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

export function createPiece(type) {
  const matrix = PIECES[type].map((row) => [...row]);
  return {
    type,
    matrix,
    x: Math.floor((BOARD_WIDTH - matrix[0].length) / 2),
    y: 0
  };
}

export function movePiece(piece, dx, dy) {
  return { ...piece, x: piece.x + dx, y: piece.y + dy };
}

export function rotatePiece(piece) {
  const { matrix } = piece;
  const rotated = matrix[0].map((_, column) => matrix.map((row) => row[column]).reverse());
  return { ...piece, matrix: rotated };
}

export function collides(board, piece) {
  return piece.matrix.some((row, rowIndex) => row.some((cell, columnIndex) => {
    if (!cell) return false;
    const boardX = piece.x + columnIndex;
    const boardY = piece.y + rowIndex;
    return boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT || boardY < 0 || board[boardY][boardX] !== 0;
  }));
}

export function mergePiece(board, piece) {
  const merged = board.map((row) => [...row]);
  piece.matrix.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
    if (cell && piece.y + rowIndex >= 0) {
      merged[piece.y + rowIndex][piece.x + columnIndex] = piece.type;
    }
  }));
  return merged;
}

export function clearCompletedRows(board) {
  const completeRows = board.filter((row) => row.every(Boolean));
  const remainingRows = board.filter((row) => !row.every(Boolean));
  const emptyRows = Array.from({ length: completeRows.length }, () => Array(BOARD_WIDTH).fill(0));
  return { board: [...emptyRows, ...remainingRows], cleared: completeRows.length };
}

export function scoreForClear(lines, level) {
  return [0, 100, 300, 500, 1200][lines] * level;
}

export function getLevel(lines) {
  return Math.floor(lines / 10) + 1;
}
