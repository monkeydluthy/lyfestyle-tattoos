export const SITE_ORIGIN = 'https://lyfestyletattoos.com';

export function canonicalPath(path = '/') {
  const raw = path.startsWith('/') ? path : `/${path}`;
  if (raw === '/') return '/';
  const base = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
  if (base === '/about' || base === '/portfolio') return `${base}/`;
  return base;
}

export function canonicalUrl(path) {
  return `${SITE_ORIGIN}${canonicalPath(path)}`;
}

export const SITE = {
  name: 'Lyfestyle Tattoos',
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/resources/images/lyfestyle-logo.jpeg`,
  image: `${SITE_ORIGIN}/resources/images/og-image.jpg`,
  // TODO: telephone — not settled (656.240.1034 vs 813-650-3603).
  // Do not add streetAddress or geo; the studio is appointment only.
  sameAs: [
    'https://www.instagram.com/lyfetattooos/',
    'https://www.facebook.com/lyfestyletattoos/',
    'https://x.com/LyfestyleTattoo',
  ],
};

function city(name) {
  return {
    '@type': 'City',
    name,
    containedInPlace: {
      '@type': 'State',
      name: 'FL',
    },
  };
}

export function tattooParlorJsonLd() {
  const person = {
    '@type': 'Person',
    name: 'Clyde Wint',
  };

  return {
    '@context': 'https://schema.org',
    '@type': ['TattooParlor', 'LocalBusiness'],
    name: SITE.name,
    url: SITE.url,
    logo: SITE.logo,
    image: SITE.image,
    areaServed: [city('Brandon'), city('Tampa')],
    sameAs: SITE.sameAs,
    founder: person,
    employee: person,
  };
}

export const TATTOO_PARLOR_JSONLD = tattooParlorJsonLd();
