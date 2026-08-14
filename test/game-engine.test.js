import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearCompletedRows,
  collides,
  createBoard,
  createPiece,
  getLevel,
  scoreForClear
} from '../game-engine.js';

test('a new board is 20 rows by 10 columns and empty', () => {
  const board = createBoard();
  assert.equal(board.length, 20);
  assert.equal(board[0].length, 10);
  assert.ok(board.flat().every((cell) => cell === 0));
});

test('a piece collides with walls and full cells', () => {
  const board = createBoard();
  const piece = createPiece('O');
  assert.equal(collides(board, { ...piece, x: -1 }), true);
  board[0][3] = 'T';
  assert.equal(collides(board, { ...piece, x: 3, y: 0 }), true);
});

test('clearing four complete rows returns four and awards a tetris score', () => {
  const board = createBoard();
  for (let row = 16; row < 20; row += 1) board[row].fill('I');
  const result = clearCompletedRows(board);
  assert.equal(result.cleared, 4);
  assert.ok(result.board.flat().every((cell) => cell === 0));
  assert.equal(scoreForClear(4, 1), 1200);
});

test('level rises after each ten cleared lines', () => {
  assert.equal(getLevel(0), 1);
  assert.equal(getLevel(10), 2);
  assert.equal(getLevel(29), 3);
});
