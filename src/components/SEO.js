import { useEffect } from 'react';
import { canonicalUrl } from '../lib/seoConfig';

const OG_IMAGE = 'https://lyfestyletattoos.com/resources/images/og-image.jpg';
const OG_IMAGE_ALT = 'Lyfestyle Tattoos logo';

function setAll(selector, apply) {
  document.querySelectorAll(selector).forEach(apply);
}

function removeAll(selector) {
  document.querySelectorAll(selector).forEach((el) => el.remove());
}

function upsert(selector, create) {
  const existing = document.querySelector(selector);
  if (existing) return existing;
  const el = create();
  document.head.appendChild(el);
  return el;
}

function SEO({ title, description, path, robots, canonical = true }) {
  const url = canonicalUrl(path);

  useEffect(() => {
    document.title = title;
    setAll('title', (el) => {
      el.textContent = title;
    });
    setAll('meta[name="description"]', (el) => {
      el.setAttribute('content', description);
    });
    if (canonical) {
      const link = upsert('link[rel="canonical"]', () => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        return el;
      });
      link.setAttribute('href', url);
    } else {
      removeAll('link[rel="canonical"]');
    }
    setAll('meta[property="og:title"]', (el) => {
      el.setAttribute('content', title);
    });
    setAll('meta[property="og:description"]', (el) => {
      el.setAttribute('content', description);
    });
    if (canonical) {
      setAll('meta[property="og:url"]', (el) => {
        el.setAttribute('content', url);
      });
    }
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
    if (robots) {
      const meta = upsert('meta[name="robots"]', () => {
        const el = document.createElement('meta');
        el.setAttribute('name', 'robots');
        return el;
      });
      meta.setAttribute('content', robots);
    }
    return () => {
      if (robots) removeAll('meta[name="robots"]');
    };
  }, [title, description, url, robots, canonical]);

  return null;
}

function jsonLdScripts() {
  return [...document.querySelectorAll('script[type="application/ld+json"]')];
}

function sameJsonLd(el, data) {
  const text = el.textContent || '';
  const serialized = JSON.stringify(data);
  if (text === serialized) return true;
  try {
    return JSON.stringify(JSON.parse(text)) === serialized;
  } catch {
    return false;
  }
}

export function JsonLd({ data }) {
  useEffect(() => {
    const id = 'site-jsonld';
    const existing =
      document.getElementById(id) ||
      (data ? jsonLdScripts().find((el) => sameJsonLd(el, data)) : null);

    if (!data) {
      jsonLdScripts().forEach((el) => {
        if (el.id === id || el.dataset.created === 'true') el.remove();
      });
      return undefined;
    }

    const serialized = JSON.stringify(data);
    let created = false;
    let script = existing;
    if (script) {
      script.id = id;
      script.textContent = serialized;
    } else {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = serialized;
      script.dataset.created = 'true';
      document.head.appendChild(script);
      created = true;
    }

    return () => {
      if (created) script.remove();
    };
  }, [data]);

  return null;
}

export default SEO;
