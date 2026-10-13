import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadEnv } from 'vite';
import { heroPieces } from '../src/lib/heroPieces.js';

const fileEnv = loadEnv('', process.cwd(), '');
const url = (process.env.VITE_SUPABASE_URL ?? fileEnv.VITE_SUPABASE_URL ?? '').trim();
const key = (process.env.VITE_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY ?? '').trim();
const outFile = path.resolve('src/generated/featured.json');

const FIELDS =
  'id,title,image_path,thumb_path,alt_text,series,character_name,style,placement,size,sort_order,is_featured,created_at';

function write(pieces) {
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify({ pieces }, null, 2)}\n`);
}

const contentFile = path.resolve('src/generated/content.json');
const CONTENT_KEYS = ['pricing', 'policies'];

function writeContent(content) {
  mkdirSync(path.dirname(contentFile), { recursive: true });
  writeFileSync(contentFile, `${JSON.stringify(content, null, 2)}\n`);
}

async function snapshotContent() {
  if (!url || !key) {
    writeContent({});
    return;
  }
  try {
    const endpoint = new URL('/rest/v1/site_content', url);
    endpoint.searchParams.set('select', 'key,value');
    endpoint.searchParams.set('key', `in.(${CONTENT_KEYS.join(',')})`);
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`site_content request failed (${response.status})`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('site_content response was not a list');
    const content = {};
    for (const row of rows) {
      if (CONTENT_KEYS.includes(row.key)) content[row.key] = row.value;
    }
    writeContent(content);
    console.log(`Content snapshot wrote ${Object.keys(content).join(', ') || 'nothing'}.`);
  } catch (error) {
    console.warn(`Content snapshot unavailable (${error.message}). Writing an empty snapshot.`);
    writeContent({});
  }
}

function publicThumbUrl(base, objectPath) {
  const encoded = String(objectPath)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/portfolio-media/${encoded}`;
}

async function main() {
  if (!url || !key) {
    console.warn('Featured snapshot skipped: Supabase env is missing. Writing an empty snapshot.');
    write([]);
    return;
  }

  try {
    const endpoint = new URL('/rest/v1/works', url);
    endpoint.searchParams.set('select', FIELDS);
    endpoint.searchParams.set('is_published', 'eq.true');
    endpoint.searchParams.set('order', 'sort_order.asc');
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`works request failed (${response.status})`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('works response was not a list');
    const pieces = heroPieces(rows).map((work) => ({
      id: work.id,
      title: work.title || '',
      alt_text: work.alt_text || '',
      thumb_url: work.thumb_path ? publicThumbUrl(url, work.thumb_path) : '',
      sort_order: work.sort_order ?? 0,
    }));
    write(pieces);
    console.log(`Featured snapshot wrote ${pieces.length} pieces.`);
  } catch (error) {
    console.warn(`Featured snapshot unavailable (${error.message}). Writing an empty snapshot.`);
    write([]);
  }
}

await snapshotContent();
await main();
