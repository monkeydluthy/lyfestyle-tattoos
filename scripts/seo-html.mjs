import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const SITE_ORIGIN = 'https://lyfestyletattoos.com';

export const PAGES = [
  {
    id: 'not-found',
    out: '404.html',
    title: 'Page not found | Lyfestyle Tattoos',
    description: "That page isn't on the Lyfestyle Tattoos site.",
    canonical: false,
    robots: 'noindex, nofollow',
  },
];

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

export function applyPageHead(html, page) {
  let next = html.replace(/<title>[^]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);

  next = next.replace(
    /<meta\s+name="description"[^>]*>/,
    `<meta name="description" content="${escapeHtml(page.description)}" />`
  );
  next = next.replace(
    /<meta\s+property="og:title"[^>]*>/,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`
  );
  next = next.replace(
    /<meta\s+property="og:description"[^>]*>/,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`
  );

  if (page.canonical === false) {
    next = next.replace(/\s*<link\s+rel="canonical"[^>]*>/g, '');
  } else if (page.path != null) {
    const url = `${SITE_ORIGIN}${page.path}`;
    if (/<link\s+rel="canonical"/.test(next)) {
      next = next.replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
    } else {
      next = next.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`);
    }
  }

  next = next.replace(/\s*<meta\s+name="robots"[^>]*>/g, '');
  if (page.robots) {
    next = next.replace(
      '</head>',
      `    <meta name="robots" content="${escapeHtml(page.robots)}" />\n  </head>`
    );
  }

  return next;
}

export function writeSeoPages(outDir) {
  const index = readFileSync(path.join(outDir, 'index.html'), 'utf8');
  for (const page of PAGES) {
    const dest = path.join(outDir, page.out);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, applyPageHead(index, page));
  }
}
