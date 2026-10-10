export async function deleteWork(supabase, work) {
  const paths = [work.image_path, work.thumb_path].filter(Boolean);
  if (paths.length > 0) {
    const { error } = await supabase.storage.from('portfolio-media').remove(paths);
    if (error) {
      return {
        ok: false,
        error: error.message || "Couldn't remove the image files.",
      };
    }
  }

  const { error } = await supabase.from('works').delete().eq('id', work.id);
  if (error) {
    return {
      ok: false,
      error: error.message || "Couldn't delete the piece.",
    };
  }
  return { ok: true };
}
