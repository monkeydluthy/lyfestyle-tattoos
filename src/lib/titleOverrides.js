// Title / meta description overrides, one entry per page path, written by the DDS SEO pod
// (dds-agents `python -m seopod.titles pr`: one PR, seo/titles.json only, merged with
// `approve` in Slack). {} = nothing overridden. Pure functions: the build script
// (scripts/seo-html.mjs) reads the JSON with fs, the SEO component imports it.
export function normalizePath(path) {
  if (!path) return '/';
  const p = String(path).split(/[?#]/)[0];
  return p === '/' ? p : p.replace(/\/+$/, '') || '/';
}

/** {title, description} for this path from the table, or null. */
export function titleOverride(path, table) {
  const entry = table?.[normalizePath(path)];
  if (!entry || typeof entry.title !== 'string' || typeof entry.description !== 'string') return null;
  return entry;
}

/** PAGES with the table applied to every indexable page (a path, no robots, canonical on). */
export function withOverrides(pages, table) {
  return pages.map((page) => {
    if (!page.path || page.robots || page.canonical === false) return page;
    const o = titleOverride(page.path, table);
    return o ? { ...page, title: o.title, description: o.description } : page;
  });
}
