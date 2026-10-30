import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { writeSeoPages } from './seo-html.mjs';

await build({
  build: {
    ssr: path.resolve('src/entry-server.jsx'),
    outDir: path.resolve('build-ssr'),
    emptyOutDir: true,
  },
});

const { render } = await import(
  pathToFileURL(path.resolve('build-ssr/entry-server.js')).href
);
writeSeoPages(path.resolve('build'), render);
