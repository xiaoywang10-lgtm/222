import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the page exposes every game controller target', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['game-canvas', 'next-canvas', 'score', 'level', 'lines', 'start-button', 'pause-button']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /data-action=["']rotate["']/);
  assert.match(html, /data-action=["']drop["']/);
});
