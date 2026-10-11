import { lazy, Suspense } from 'react';
import Footer from './Footer';
import SEO from './SEO';

const PublishedGallery = lazy(() => import('./PublishedGallery'));

function Portfolio() {

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <SEO
        title="Portfolio | Lyfestyle Tattoos"
        description="Recent anime, black and grey, and color realism tattoos by Clyde Wint at Lyfestyle Tattoos in Brandon and Tampa, FL."
        path="/portfolio"
      />
      <div
        className="content"
        style={{
          backgroundColor: 'var(--primary-bg)',
          flex: '1',
          padding: 'clamp(40px, 5vw, 80px) 0',
        }}
      >
        <div id="wrapper">
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              marginBottom: '1rem',
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            Portfolio
          </h1>
          <h3
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              color: 'var(--secondary-text)',
              marginBottom: '1.5rem',
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            Check out some of our recent work
          </h3>
          <Suspense
            fallback={
              <p className="work-note" style={{ textAlign: 'center' }}>
                The work is loading, see our{' '}
                <a href="https://ig.me/m/lyfetattooos">Instagram</a>.
              </p>
            }
          >
            <PublishedGallery />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Portfolio;
