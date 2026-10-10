export const CONTENT_KEYS = ['pricing', 'policies'];

export async function saveContent(supabase, key, value) {
  if (!CONTENT_KEYS.includes(key)) {
    return { ok: false, error: 'That content key is not part of the site.' };
  }
  const { error } = await supabase.from('site_content').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return { ok: false, error: error.message || "Couldn't save this section." };
  }
  return { ok: true };
}
