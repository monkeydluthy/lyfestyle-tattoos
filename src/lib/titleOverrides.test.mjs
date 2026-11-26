import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizePath, titleOverride, withOverrides } from './titleOverrides.js';

const table = { '/portfolio': { title: 'T', description: 'D' } };
const pages = [
  { id: 'portfolio', path: '/portfolio', title: 'old', description: 'old', canonical: true },
  { id: 'about', path: '/about', title: 'About', description: 'A', canonical: true },
  { id: 'nf', out: '404.html', title: 'nf', description: 'nf', canonical: false, robots: 'noindex' },
];

test('paths normalise', () => {
  assert.equal(normalizePath('/portfolio/'), '/portfolio');
  assert.equal(normalizePath(''), '/');
});

test('an override replaces title and description only on its page', () => {
  const out = withOverrides(pages, table);
  assert.equal(out[0].title, 'T');
  assert.equal(out[0].description, 'D');
  assert.equal(out[1].title, 'About');
  assert.equal(out[2].title, 'nf');
});

test('a 404 or noindex page never takes an override, a half entry never applies', () => {
  assert.equal(withOverrides(pages, { '/': { title: 'x', description: 'y' } })[2].title, 'nf');
  assert.equal(titleOverride('/portfolio', { '/portfolio': { title: 'only' } }), null);
});

test('an empty table changes nothing', () => {
  assert.deepEqual(withOverrides(pages, {}), pages);
});
