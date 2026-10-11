import { useEffect, useState } from 'react';
import { STYLE_OPTIONS, SIZE_OPTIONS } from '../admin/options';
import { supabase, supabaseReady } from './supabase';

const WORK_FIELDS =
  'id, title, image_path, thumb_path, alt_text, series, character_name, style, placement, size, sort_order, is_featured, created_at';

export function styleLabel(value) {
  return STYLE_OPTIONS.find((option) => option.value === value)?.label || value || '';
}

export function sizeLabel(value) {
  return SIZE_OPTIONS.find((option) => option.value === value)?.label || value || '';
}

export function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function workImageUrl(path) {
  if (!path || !supabase) return '';
  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(path);
  return data?.publicUrl || '';
}

export async function fetchPublishedWorks() {
  if (!supabaseReady || !supabase) return { works: [], failed: true };
  try {
    const { data, error } = await supabase
      .from('works')
      .select(WORK_FIELDS)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });
    if (error) return { works: [], failed: true };
    return { works: data || [], failed: false };
  } catch {
    return { works: [], failed: true };
  }
}

export function usePublishedWorks() {
  const [state, setState] = useState({ works: [], status: 'loading' });

  useEffect(() => {
    let active = true;
    fetchPublishedWorks().then((result) => {
      if (!active) return;
      setState({
        works: result.works,
        status: result.failed ? 'error' : 'ready',
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

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
