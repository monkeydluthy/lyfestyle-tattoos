import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from './SEO';
import { REPLY_TIME } from '../lib/siteConfig';

function Thanks() {
  const { state } = useLocation();
  const firstName = typeof state?.firstName === 'string' ? state.firstName.trim() : '';

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    window.scrollTo(0, 0);
    return () => meta.remove();
  }, []);

  return (
    <main className="content" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <SEO
        title="Thanks | Lyfestyle Tattoos"
        description="Your tattoo request was sent to Lyfestyle Tattoos."
        path="/thanks"
      />
      <div id="wrapper" style={{ textAlign: 'center', padding: '4rem 0', width: '100%' }}>
        <h1 style={{ marginBottom: '1rem' }}>{firstName ? `Thanks, ${firstName}.` : 'Thanks.'}</h1>
        <p style={{ color: 'var(--secondary-text)', marginBottom: '2rem', lineHeight: '1.6' }}>
          {firstName ? 'Clyde will reply' : 'Your request was sent. Clyde will reply'} {REPLY_TIME}.
        </p>
        <p>
          <a className="hero-primary" href="/#work">
            Back to the gallery
          </a>
        </p>
      </div>
    </main>
  );
}

export default Thanks;
