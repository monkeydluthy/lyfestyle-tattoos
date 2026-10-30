import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, TATTOO_PARLOR_JSONLD, canonicalUrl } from '../src/lib/seoConfig.js';

export { SITE_ORIGIN };

export const PAGES = [
  {
    id: 'home',
    path: '/',
    out: 'index.html',
    title: 'Anime & Custom Tattoos in Brandon & Tampa, FL | Lyfestyle Tattoos',
    description:
      'Custom anime and pop-culture tattoos by Clyde Wint in Brandon, FL, serving Tampa Bay. Appointment only. Send your idea and get a quote.',
    canonical: true,
    jsonLd: true,
    source: 'src/components/Home.jsx',
  },
  {
    id: 'about',
    path: '/about',
    out: 'about/index.html',
    title: 'About | Lyfestyle Tattoos',
    description:
      'Private studio in Brandon, FL, serving Tampa Bay. Custom tattoos, including anime and pop culture, by Clyde Wint. Appointment only.',
    canonical: true,
    jsonLd: true,
    source: 'src/components/About.jsx',
  },
  {
    id: 'portfolio',
    path: '/portfolio',
    out: 'portfolio/index.html',
    title: 'Portfolio | Lyfestyle Tattoos',
    description:
      'Recent anime, black and grey, and color realism tattoos by Clyde Wint at Lyfestyle Tattoos in Brandon and Tampa, FL.',
    canonical: true,
    source: 'src/components/Portfolio.jsx',
  },
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
    const url = canonicalUrl(page.path);
    if (/<link\s+rel="canonical"/.test(next)) {
      next = next.replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
    } else {
      next = next.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`);
    }
    if (/<meta\s+property="og:url"/.test(next)) {
      next = next.replace(
        /<meta\s+property="og:url"[^>]*>/,
        `<meta property="og:url" content="${url}" />`
      );
    } else {
      next = next.replace('</head>', `    <meta property="og:url" content="${url}" />\n  </head>`);
    }
  }

  next = next.replace(/\s*<meta\s+name="robots"[^>]*>/g, '');
  if (page.robots) {
    next = next.replace(
      '</head>',
      `    <meta name="robots" content="${escapeHtml(page.robots)}" />\n  </head>`
    );
  }

  next = next.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  if (page.jsonLd) {
    next = next.replace(
      '</head>',
      `    <script id="site-jsonld" type="application/ld+json">${JSON.stringify(TATTOO_PARLOR_JSONLD)}</script>\n  </head>`
    );
  }

  return next;
}

function lastmodFor(file) {
  if (!file) return new Date().toISOString().slice(0, 10);
  try {
    const date = execSync(`git log -1 --format=%cs -- ${file}`, {
      encoding: 'utf8',
    }).trim();
    if (date) return date;
  } catch {
    // Fall through to today when git is unavailable.
  }
  return new Date().toISOString().slice(0, 10);
}

export function sitemapPages() {
  return PAGES.filter((page) => page.path && page.canonical !== false && !page.robots);
}

export function writeSitemap(outDir) {
  const urls = sitemapPages()
    .map((page) => {
      const loc = canonicalUrl(page.path);
      const lastmod = lastmodFor(page.source);
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
}

export function writeSeoPages(outDir, renderPage) {
  const index = readFileSync(path.join(outDir, 'index.html'), 'utf8');
  for (const page of PAGES) {
    let html = applyPageHead(index, page);
    if (typeof renderPage === 'function' && page.path) {
      const markup = renderPage(page.path);
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root">${markup}</div>`
      );
    }
    const dest = path.join(outDir, page.out);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, html);
  }
  writeSitemap(outDir);
}
