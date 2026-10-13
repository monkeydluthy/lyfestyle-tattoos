import { heroPieces } from './heroPieces';
import { fetchPublishedWorks, workImageUrl } from './works';

export async function loadHeroPieces() {
  const result = await fetchPublishedWorks();
  if (result.failed) return { pieces: [], failed: true };
  const pieces = heroPieces(result.works).map((work) => ({
    id: work.id,
    title: work.title || '',
    alt_text: work.alt_text || '',
    thumb_url: workImageUrl(work.thumb_path),
    sort_order: work.sort_order ?? 0,
  }));
  return { pieces, failed: false };
}
