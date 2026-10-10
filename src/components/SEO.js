import { useEffect } from 'react';

const OG_IMAGE = 'https://lyfestyletattoos.com/resources/images/og-image.jpg';
const OG_IMAGE_ALT = 'Lyfestyle Tattoos logo';

function setAll(selector, apply) {
  document.querySelectorAll(selector).forEach(apply);
}

function SEO({ title, description, path }) {
  const url = `https://lyfestyletattoos.com${path}`;

  useEffect(() => {
    document.title = title;
    setAll('title', (el) => {
      el.textContent = title;
    });
    setAll('meta[name="description"]', (el) => {
      el.setAttribute('content', description);
    });
    setAll('link[rel="canonical"]', (el) => {
      el.setAttribute('href', url);
    });
    setAll('meta[property="og:title"]', (el) => {
      el.setAttribute('content', title);
    });
    setAll('meta[property="og:description"]', (el) => {
      el.setAttribute('content', description);
    });
    setAll('meta[property="og:url"]', (el) => {
      el.setAttribute('content', url);
    });
    setAll('meta[property="og:image"]', (el) => {
      el.setAttribute('content', OG_IMAGE);
    });
    setAll('meta[property="og:image:width"]', (el) => {
      el.setAttribute('content', '1200');
    });
    setAll('meta[property="og:image:height"]', (el) => {
      el.setAttribute('content', '630');
    });
    setAll('meta[property="og:image:alt"]', (el) => {
      el.setAttribute('content', OG_IMAGE_ALT);
    });
    setAll('meta[name="twitter:card"]', (el) => {
      el.setAttribute('content', 'summary_large_image');
    });
    setAll('meta[name="twitter:image"]', (el) => {
      el.setAttribute('content', OG_IMAGE);
    });
  }, [title, description, url]);

  return null;
}

export default SEO;
