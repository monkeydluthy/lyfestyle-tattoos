import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from './SEO';

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
    <div className="content" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <SEO
        title="Thanks | Lyfestyle Tattoos"
        description="Your tattoo request was sent to Lyfestyle Tattoos."
        path="/thanks"
      />
      <div id="wrapper" style={{ textAlign: 'center', padding: '4rem 0', width: '100%' }}>
        <h1 style={{ marginBottom: '1rem' }}>{firstName ? `Thanks, ${firstName}.` : 'Thanks.'}</h1>
        <p style={{ color: 'var(--secondary-text)', marginBottom: '2rem', lineHeight: '1.6' }}>
          {firstName ? 'Clyde will reply' : 'Your request was sent. Clyde will reply'} within 2
          business days.
        </p>
        <p>
          <Link className="hero-primary" to="/#work">
            Back to the gallery
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Thanks;
