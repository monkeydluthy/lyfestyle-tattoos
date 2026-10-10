import { UNREADABLE_MESSAGE } from './options';

const FULL_SIDE = 1800;
const THUMB_SIDE = 480;
const FULL_QUALITY = 0.82;
const THUMB_QUALITY = 0.75;

function renderWebp(bitmap, maxSide, quality) {
  const longSide = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, maxSide / longSide);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return Promise.resolve(null);
  context.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
  });
}

export async function processPhoto(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(UNREADABLE_MESSAGE);
  }

  try {
    if (!bitmap.width || !bitmap.height) {
      throw new Error(UNREADABLE_MESSAGE);
    }
    const fullBlob = await renderWebp(bitmap, FULL_SIDE, FULL_QUALITY);
    const thumbBlob = await renderWebp(bitmap, THUMB_SIDE, THUMB_QUALITY);
    if (!fullBlob || !thumbBlob) {
      throw new Error(UNREADABLE_MESSAGE);
    }
    return {
      fullBlob,
      thumbBlob,
      width: bitmap.width,
      height: bitmap.height,
    };
  } finally {
    bitmap.close();
  }
}
