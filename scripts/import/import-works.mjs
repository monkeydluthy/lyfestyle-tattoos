import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { readdir } from 'node:fs';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const readDir = promisify(readdir);

const FULL_SIDE = 1800;
const THUMB_SIDE = 480;
const FULL_QUALITY = 82;
const THUMB_QUALITY = 75;
const FEATURED_ORDER = [106, 108, 113, 114, 73, 68, 84, 87];

const STYLE_MAP = new Map([
  ['Black & grey', 'black-grey'],
  ['Black & grey with red', 'black-grey'],
  ['Black & grey realism', 'realism'],
  ['Color', 'color'],
  ['Color (teal)', 'color'],
  ['Color (green)', 'color'],
  ['Fine line', 'fine-line'],
  ['Fine line + script', 'fine-line'],
  ['Fine line script', 'fine-line'],
  ['Linework', 'linework'],
  ['Linework (in progress)', 'linework'],
  ['Red linework', 'linework'],
  ['Black & grey linework', 'linework'],
  ['Black & grey (linework)', 'linework'],
  ['Linework / blackwork', 'blackwork'],
  ['Blackwork + red', 'blackwork'],
  ['Black brushwork', 'blackwork'],
  ['Lettering', 'lettering'],
  ['Lettering + color', 'lettering'],
  ['Traditional', 'traditional'],
  ['Neo-traditional', 'traditional'],
]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(scriptDir, 'Lyfestyle_Inventory_live.csv');
const manifestPath = path.join(scriptDir, 'import-manifest.json');

function blank(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? text : null;
}

function parseArgs(argv) {
  const options = { images: '', also: [], commit: false, only: null, limit: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--images') options.images = argv[++i] || '';
    else if (arg === '--also') options.also.push(argv[++i] || '');
    else if (arg === '--commit') options.commit = true;
    else if (arg === '--dry-run') options.commit = false;
    else if (arg === '--only') options.only = new Set((argv[++i] || '').split(',').map((part) => part.trim()).filter(Boolean));
    else if (arg === '--limit') options.limit = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.images) throw new Error('Pass --images <path to Lyfestyle_Images>.');
  if (options.also.some((folder) => !folder)) throw new Error('Each --also flag needs a folder path.');
  if (options.limit != null && (!Number.isInteger(options.limit) || options.limit < 0)) {
    throw new Error('--limit needs a whole number.');
  }
  return options;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') field += char;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((record) => record.some((cell) => cell.trim()));
}

function loadRows() {
  const records = parseCsv(readFileSync(csvPath, 'utf8'));
  const headers = records[0];
  const index = new Map(headers.map((header, position) => [header, position]));
  const required = ['#', 'Original file', 'Series', 'Character', 'Subject slug', 'Style', 'Placement (rough)', 'Alt text (draft)', 'Pixels', 'Recommendation', 'Your correction'];
  const missing = required.filter((header) => !index.has(header));
  if (missing.length) throw new Error(`CSV is missing columns: ${missing.join(', ')}`);
  return records.slice(1).map((record) => {
    const cell = (header) => record[index.get(header)] ?? '';
    return {
      number: cell('#').trim(),
      fileName: cell('Original file').trim(),
      series: cell('Series'),
      character: cell('Character'),
      subjectSlug: cell('Subject slug'),
      styleLabel: cell('Style').trim(),
      placement: cell('Placement (rough)'),
      altText: cell('Alt text (draft)'),
      sheetPixels: cell('Pixels').trim(),
      recommendation: cell('Recommendation').trim(),
      correction: cell('Your correction').trim(),
    };
  });
}

async function indexImages(root) {
  const byName = new Map();
  async function walk(directory) {
    const entries = await readDir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile()) {
        const matches = byName.get(entry.name) || [];
        matches.push(fullPath);
        byName.set(entry.name, matches);
      }
    }
  }
  await walk(root);
  return byName;
}

function classify(row, manifest) {
  if (row.recommendation.startsWith('Hold')) return { action: 'skip', reason: 'Hold' };
  if (row.correction) return { action: 'skip', reason: 'your correction is set' };
  if (manifest[row.number]) return { action: 'skip', reason: 'already imported' };
  return { action: 'import', reason: '' };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filesNamed(index, fileName) {
  return index.get(fileName) || [];
}

function filesWithDigitPrefix(index, fileName) {
  const pattern = new RegExp(`^\\d+_${escapeRegExp(fileName)}$`);
  const hits = [];
  for (const [name, paths] of index) {
    if (!pattern.test(name)) continue;
    paths.forEach((filePath) => hits.push({ path: filePath, name }));
  }
  return hits;
}

function resolveFile(fileName, imageIndex, alsoIndexes) {
  const exact = filesNamed(imageIndex, fileName);
  if (exact.length > 1) return { ambiguous: exact };
  if (exact.length === 1) return { path: exact[0], matchedBy: 'exact', name: fileName };

  const prefixed = filesWithDigitPrefix(imageIndex, fileName);
  if (prefixed.length > 1) return { ambiguous: prefixed.map((hit) => hit.path) };
  if (prefixed.length === 1) return { path: prefixed[0].path, matchedBy: 'prefix', name: prefixed[0].name };

  const alsoExact = alsoIndexes.flatMap((index) => filesNamed(index, fileName));
  if (alsoExact.length > 1) return { ambiguous: alsoExact };
  if (alsoExact.length === 1) return { path: alsoExact[0], matchedBy: 'also', name: fileName };

  const alsoPrefixed = alsoIndexes.flatMap((index) => filesWithDigitPrefix(index, fileName));
  if (alsoPrefixed.length > 1) return { ambiguous: alsoPrefixed.map((hit) => hit.path) };
  if (alsoPrefixed.length === 1) {
    return { path: alsoPrefixed[0].path, matchedBy: 'also', name: alsoPrefixed[0].name };
  }
  return { path: '', matchedBy: '', name: '' };
}

function sheetSize(text) {
  const match = String(text || '').trim().match(/^(\d+)\s*[xX×]\s*(\d+)$/);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

function sizesEqual(actual, sheet) {
  if (!sheet) return false;
  return (
    (actual.width === sheet.width && actual.height === sheet.height) ||
    (actual.width === sheet.height && actual.height === sheet.width)
  );
}

function workTitle(row) {
  const character = blank(row.character);
  if (character) return character;
  const slug = blank(row.subjectSlug);
  if (!slug) return null;
  const text = slug.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function orientedSize(filePath) {
  const { info } = await sharp(filePath).rotate().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height };
}

async function renderWebp(filePath, maxSide, quality) {
  const { data, info } = await sharp(filePath).rotate().raw().toBuffer({ resolveWithObject: true });
  const longSide = Math.max(info.width, info.height);
  const scale = Math.min(1, maxSide / longSide);
  const width = Math.max(1, Math.round(info.width * scale));
  const height = Math.max(1, Math.round(info.height * scale));
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .resize(width, height, { fit: 'fill' })
    .webp({ quality })
    .toBuffer();
}

function loadEnv(root) {
  const text = readFileSync(path.join(root, '.env'), 'utf8');
  return Object.fromEntries(
    text
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const splitAt = line.indexOf('=');
        return [line.slice(0, splitAt), line.slice(splitAt + 1)];
      })
  );
}

function readManifest() {
  if (!existsSync(manifestPath)) return {};
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function writeManifest(manifest) {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function removeUploaded(supabase, uploaded) {
  if (uploaded.length === 0) return;
  await supabase.storage.from('portfolio-media').remove(uploaded);
}

async function uploadRow(supabase, row, style, featuredRank) {
  const id = randomUUID();
  const imagePath = `works/${id}.webp`;
  const thumbPath = `works/thumbs/${id}.webp`;
  const uploaded = [];
  const fullBuffer = await renderWebp(row.sourcePath, FULL_SIDE, FULL_QUALITY);
  const full = await supabase.storage.from('portfolio-media').upload(imagePath, fullBuffer, {
    contentType: 'image/webp',
    upsert: false,
  });
  if (full.error) return { ok: false, error: full.error.message || 'Upload failed.' };
  uploaded.push(imagePath);

  const thumbBuffer = await renderWebp(row.sourcePath, THUMB_SIDE, THUMB_QUALITY);
  const thumb = await supabase.storage.from('portfolio-media').upload(thumbPath, thumbBuffer, {
    contentType: 'image/webp',
    upsert: false,
  });
  if (thumb.error) {
    await removeUploaded(supabase, uploaded);
    return { ok: false, error: thumb.error.message || 'Thumbnail upload failed.' };
  }
  uploaded.push(thumbPath);

  const inserted = await supabase
    .from('works')
    .insert({
      image_path: imagePath,
      thumb_path: thumbPath,
      alt_text: row.altText.trim(),
      style,
      title: workTitle(row),
      series: blank(row.series),
      character_name: blank(row.character),
      placement: blank(row.placement),
      size: null,
      caption: null,
      is_featured: featuredRank > 0,
      is_published: false,
      ...(featuredRank > 0 ? { sort_order: featuredRank } : {}),
    })
    .select('id')
    .single();
  if (inserted.error) {
    await removeUploaded(supabase, uploaded);
    return { ok: false, error: inserted.error.message || 'Insert failed.' };
  }
  return { ok: true, workId: inserted.data.id };
}

function actionLabel(item) {
  if (item.action === 'import') return 'import';
  if (item.reason === 'file not found') return 'skipped: file not found';
  return `skip: ${item.reason}`;
}

function printTable(planned) {
  const header = ['#', 'action', 'style', 'featured rank', 'pixels', 'matched by', 'pixel check'];
  const lines = planned.map((item) => [
    item.number,
    actionLabel(item),
    item.style || '',
    item.featuredRank || '',
    item.pixels || '',
    item.matchedBy || '',
    item.pixelCheck || 'n/a',
  ]);
  const widths = header.map((label, column) =>
    Math.max(label.length, ...lines.map((line) => String(line[column]).length))
  );
  const format = (cells) => cells.map((cell, column) => String(cell).padEnd(widths[column])).join('  ');
  console.log(format(header));
  console.log(widths.map((width) => '-'.repeat(width)).join('  '));
  lines.forEach((line) => console.log(format(line)));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const rows = loadRows();
  const manifest = readManifest();
  const images = await indexImages(options.images);
  const alsoIndexes = [];
  for (const folder of options.also) alsoIndexes.push(await indexImages(folder));
  const only = options.only;
  let importBudget = options.limit;
  const planned = [];
  const unmapped = [];
  const ambiguous = [];

  for (const row of rows) {
    if (only && !only.has(row.number)) continue;
    const decision = classify(row, manifest);
    const style = STYLE_MAP.get(row.styleLabel) || '';
    if (!style && row.styleLabel) unmapped.push(`#${row.number} ${row.styleLabel}`);
    else if (!style && decision.action === 'import') unmapped.push(`#${row.number} (blank style)`);
    const featuredRank = FEATURED_ORDER.indexOf(Number(row.number)) + 1;
    const found = resolveFile(row.fileName, images, alsoIndexes);
    if (found.ambiguous) {
      ambiguous.push({ number: row.number, fileName: row.fileName, paths: found.ambiguous });
      continue;
    }

    let pixels = '';
    let pixelCheck = 'n/a';
    let matchedBy = found.matchedBy;
    let matchedName = found.name;
    if (!found.path) {
      matchedBy = '';
      matchedName = '';
    } else {
      try {
        const size = await orientedSize(found.path);
        const sheet = sheetSize(row.sheetPixels);
        const equal = sizesEqual(size, sheet);
        pixels = equal
          ? `${size.width}x${size.height}`
          : `${size.width}x${size.height} / sheet ${row.sheetPixels || 'blank'}`;
        pixelCheck = equal ? 'ok' : 'mismatch';
        row.sourcePath = found.path;
      } catch {
        found.path = '';
        matchedBy = '';
        matchedName = '';
        pixelCheck = 'n/a';
      }
    }

    let action = decision.action;
    let reason = decision.reason;
    if (action === 'import' && !found.path) {
      action = 'skip';
      reason = 'file not found';
    } else if (action === 'import' && pixelCheck === 'mismatch') {
      action = 'skip';
      reason = 'pixel mismatch';
    } else if (action === 'import' && importBudget != null) {
      if (importBudget === 0) {
        action = 'skip';
        reason = 'over --limit';
      } else importBudget -= 1;
    }
    planned.push({
      ...row,
      action,
      reason,
      style,
      featuredRank,
      pixels,
      matchedBy,
      matchedName,
      pixelCheck,
    });
  }

  if (ambiguous.length) {
    console.error('Two files match one name:');
    ambiguous.forEach((item) => {
      console.error(`#${item.number} ${item.fileName}`);
      item.paths.forEach((filePath) => console.error(`  ${filePath}`));
    });
    process.exitCode = 1;
    return;
  }

  printTable(planned);
  const imported = planned.filter((item) => item.action === 'import');
  const skipped = planned.filter((item) => item.action === 'skip');
  const matched = planned.filter((item) => item.matchedBy);
  const missing = planned.filter((item) => !item.matchedBy);
  const mismatched = planned.filter((item) => item.pixelCheck === 'mismatch');
  console.log(`\nImported: ${imported.length}`);
  console.log(`Skipped: ${skipped.length}`);
  console.log(`Matched: ${matched.length}`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Mismatched: ${mismatched.length}`);

  const otherMatches = planned.filter((item) => item.matchedBy && item.matchedBy !== 'exact');
  console.log('\nMatched by a rule other than exact name');
  if (otherMatches.length === 0) console.log('(none)');
  otherMatches.forEach((item) => console.log(`#${item.number} ${item.matchedBy} ${item.matchedName}`));

  console.log('\nStill missing');
  if (missing.length === 0) console.log('(none)');
  missing.forEach((item) => console.log(`#${item.number} ${item.fileName} featured rank ${item.featuredRank || '—'}`));

  console.log('\nPixel mismatch');
  if (mismatched.length === 0) console.log('(none)');
  mismatched.forEach((item) => console.log(`#${item.number} ${item.pixels} featured rank ${item.featuredRank || '—'}`));

  if (unmapped.length) {
    console.error(`Unmapped style labels: ${unmapped.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  if (!options.commit) {
    console.log('\nDry run only. Nothing was written.');
    return;
  }

  const repoRoot = path.resolve(scriptDir, '../..');
  const env = loadEnv(repoRoot);
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signedIn = await supabase.auth.signInWithPassword({
    email: env.IMPORT_EMAIL,
    password: env.IMPORT_PASSWORD,
  });
  if (signedIn.error) {
    console.error('Sign-in failed.');
    process.exitCode = 1;
    return;
  }

  let failures = 0;
  let inserted = 0;
  for (const row of imported) {
    const result = await uploadRow(supabase, row, row.style, row.featuredRank);
    if (!result.ok) {
      failures += 1;
      console.error(`#${row.number} failed: ${result.error}`);
      if (failures >= 3) {
        console.error('Stopped after 3 consecutive failures.');
        process.exitCode = 1;
        return;
      }
      continue;
    }
    failures = 0;
    inserted += 1;
    manifest[row.number] = result.workId;
    writeManifest(manifest);
    console.log(`#${row.number} inserted ${result.workId}`);
  }
  console.log(`Inserted ${inserted}.`);
}

main().catch((error) => {
  console.error(error.message || 'Import failed.');
  process.exitCode = 1;
});
