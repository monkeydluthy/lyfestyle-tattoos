function blank(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? text : null;
}

export async function uploadPiece(supabase, piece) {
  const id = crypto.randomUUID();
  const imagePath = `works/${id}.webp`;
  const thumbPath = `works/thumbs/${id}.webp`;
  const uploaded = [];

  async function removeUploaded() {
    if (uploaded.length === 0) return;
    await supabase.storage.from('portfolio-media').remove(uploaded);
  }

  const full = await supabase.storage.from('portfolio-media').upload(imagePath, piece.fullBlob, {
    contentType: 'image/webp',
    upsert: false,
  });
  if (full.error) {
    return { ok: false, error: full.error };
  }
  uploaded.push(imagePath);

  const thumb = await supabase.storage
    .from('portfolio-media')
    .upload(thumbPath, piece.thumbBlob, {
      contentType: 'image/webp',
      upsert: false,
    });
  if (thumb.error) {
    await removeUploaded();
    return { ok: false, error: thumb.error };
  }
  uploaded.push(thumbPath);

  const { error: insertError } = await supabase.from('works').insert({
    image_path: imagePath,
    thumb_path: thumbPath,
    alt_text: piece.altText.trim(),
    style: piece.style,
    title: blank(piece.title),
    series: blank(piece.series),
    character_name: blank(piece.character),
    placement: blank(piece.placement),
    size: piece.size || null,
    caption: blank(piece.caption),
    is_featured: Boolean(piece.featured),
    is_published: false,
  });

  if (insertError) {
    await removeUploaded();
    return { ok: false, error: insertError };
  }

  return { ok: true, imagePath, thumbPath };
}
