import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

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

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG_IMAGE} />
    </Helmet>
  );
}

export default SEO;
