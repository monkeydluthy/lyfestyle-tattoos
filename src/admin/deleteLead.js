export async function deleteLead(supabase, lead) {
  const paths = (lead.reference_paths || []).map(referenceObjectPath).filter(Boolean);
  if (paths.length > 0) {
    const { data, error } = await supabase.storage.from('lead-references').remove(paths);
    if (error) {
      return {
        ok: false,
        error: error.message || "Couldn't remove the reference photos.",
      };
    }
    const removed = new Set((data || []).map((item) => item?.name || item?.path).filter(Boolean));
    const left = paths.filter((path) => !removed.has(path) && ![...removed].some((name) => path.endsWith(name)));
    if (left.length > 0) {
      return {
        ok: false,
        error: "Couldn't remove the reference photos.",
      };
    }
  }

  const { error } = await supabase.from('leads').delete().eq('id', lead.id);
  if (error) {
    return {
      ok: false,
      error: error.message || "Couldn't delete the lead.",
    };
  }
  return { ok: true };
}

export function referenceObjectPath(path) {
  return String(path || '')
    .replace(/^\/+/, '')
    .replace(/^lead-references\//, '');
}
