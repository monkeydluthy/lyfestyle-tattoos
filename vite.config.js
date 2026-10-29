import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { writeSeoPages } from './scripts/seo-html.mjs';

const snapshotPath = path.resolve('src/generated/featured.json');

const contentPath = path.resolve('src/generated/content.json');

function ensureSnapshot() {
  mkdirSync(path.dirname(snapshotPath), { recursive: true });
  if (!existsSync(snapshotPath)) {
    writeFileSync(snapshotPath, `${JSON.stringify({ pieces: [] }, null, 2)}\n`);
  }
  if (!existsSync(contentPath)) {
    writeFileSync(contentPath, `${JSON.stringify({}, null, 2)}\n`);
  }
}

function readSnapshot() {
  try {
    const parsed = JSON.parse(readFileSync(snapshotPath, 'utf8'));
    return Array.isArray(parsed.pieces) ? parsed.pieces : [];
  } catch {
    return [];
  }
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function featuredHints() {
  return {
    name: 'featured-hints',
    transformIndexHtml(html) {
      const pieces = readSnapshot();
      const first = pieces.find((piece) => piece.thumb_url);
      let origin = '';
      if (first?.thumb_url) {
        try {
          origin = new URL(first.thumb_url).origin;
        } catch {
          origin = '';
        }
      }
      if (!origin) {
        const fromProcess = (process.env.VITE_SUPABASE_URL || '').trim();
        const fromFile = (loadEnv('', process.cwd(), 'VITE_').VITE_SUPABASE_URL || '').trim();
        const raw = fromProcess || fromFile;
        if (raw) {
          try {
            origin = new URL(raw).origin;
          } catch {
            origin = '';
          }
        }
      }
      const tags = [];
      if (origin) {
        tags.push(`<link rel="preconnect" href="${escapeAttr(origin)}" crossorigin>`);
      }
      if (first?.thumb_url) {
        tags.push(
          `<link rel="preload" as="image" fetchpriority="high" href="${escapeAttr(first.thumb_url)}">`
        );
      }
      if (tags.length === 0) return html;
      return html.replace('<head>', `<head>\n    ${tags.join('\n    ')}`);
    },
  };
}

function seoHtml() {
  return {
    name: 'seo-html',
    apply: 'build',
    closeBundle() {
      writeSeoPages(path.resolve('build'));
    },
  };
}

ensureSnapshot();

export default defineConfig({
  plugins: [react(), featuredHints(), seoHtml()],
  build: {
    outDir: 'build',
    modulePreload: false,
  },
});
