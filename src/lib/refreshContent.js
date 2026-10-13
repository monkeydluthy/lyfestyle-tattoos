import { supabase, supabaseReady } from './supabase';

export async function loadSiteContent() {
  if (!supabaseReady || !supabase) return { content: {}, failed: true };
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', ['pricing', 'policies']);
    if (error || !Array.isArray(data)) return { content: {}, failed: true };
    const content = {};
    for (const row of data) content[row.key] = row.value;
    return { content, failed: false };
  } catch {
    return { content: {}, failed: true };
  }
}
