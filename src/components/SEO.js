import { useEffect } from 'react';

const OG_IMAGE = 'https://lyfestyletattoos.com/logo512.png';

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
  }, [title, description, url]);

  return null;
}

export default SEO;
