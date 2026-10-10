import { stat } from 'node:fs/promises';
import sharp from 'sharp';

const logoPath =
  'public/resources/images/lyfestyle-tattoos-high-resolution-logo-white.png';
const output = 'public/resources/images/og-image.jpg';
const width = 1200;
const height = 630;

const trimmed = await sharp(logoPath).trim({ threshold: 12 }).toBuffer();
const logo = await sharp(trimmed)
  .resize({
    height: 540,
    fit: 'inside',
    withoutEnlargement: false,
  })
  .png()
  .toBuffer();
const logoMeta = await sharp(logo).metadata();

await sharp({
  create: {
    width,
    height,
    channels: 3,
    background: '#000000',
  },
})
  .composite([
    {
      input: logo,
      left: Math.round((width - logoMeta.width) / 2),
      top: Math.round((height - logoMeta.height) / 2),
    },
  ])
  .jpeg({ quality: 82 })
  .toFile(output);

const { size } = await stat(output);
const meta = await sharp(output).metadata();
console.log(`${output}  ${meta.width}x${meta.height}  ${size} bytes`);
