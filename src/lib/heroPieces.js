export function heroPieces(works) {
  const featured = works
    .filter((work) => work.is_featured)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const chosen = featured.slice(0, 4);
  if (chosen.length >= 4) return chosen;
  const used = new Set(chosen.map((work) => work.id));
  const newest = works
    .filter((work) => !used.has(work.id))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return [...chosen, ...newest].slice(0, 4);
}
