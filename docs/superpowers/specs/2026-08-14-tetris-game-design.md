# Classic Tetris Game Design

## Goal

Deliver a polished, single-player Tetris game that opens locally in a browser with no build step or external dependencies.

## Scope

The game uses the standard seven tetrominoes on a 10 by 20 board. Players move, rotate, soft-drop, and hard-drop pieces; completed rows clear and award points. Clearing rows increases the level and automatic fall speed. A piece that locks above the board ends the game.

The interface exposes the next piece, score, level, cleared-line count, start/restart, and pause. It supports keyboard controls (Arrow keys, Space, and P) plus on-screen directional controls for touch devices. The first load remains in a clear ready state until the user starts the game.

## Structure

- `index.html` defines the game surface, status panel, and touch controls.
- `style.css` renders a dark game area, high-contrast colored pieces, and a responsive layout that stacks information beneath the board on narrow screens.
- `game.js` owns game state, piece generation, movement validation, rotation, locking, row clearing, scoring, speed progression, rendering, and keyboard/touch events.

No third-party packages, remote assets, persistence, multiplayer, audio, or ranking system are included in this first version.

## State And Flow

`game.js` maintains a board matrix, the active and next pieces, score, lines, level, current status, and one fall timer. Each input proposes a movement or rotation; collision checking accepts valid changes and rejects invalid ones. A blocked downward movement locks the active piece, clears rows, updates score and level, promotes the next piece, then checks for game-over. Pausing and ending always stop the timer; starting and restarting initialize fresh state before scheduling automatic descent.

## Edge Cases

- Rotation and lateral movement are rejected when they would leave the board or overlap locked cells.
- Repeated start or pause actions never create multiple active timers.
- Inputs do nothing before starting, while paused, or after game-over except actions that change state.
- Four-line clears are supported, and scoring is deterministic for one through four cleared rows.

## Verification

Manually verify desktop keyboard play and narrow-screen touch controls. Exercise wall-adjacent rotations, hard drops, locking after a blocked descent, one-to-four-row clears, level speed changes, pause/resume, restart, and the game-over transition. Confirm the layout remains readable at desktop and mobile viewport widths.
