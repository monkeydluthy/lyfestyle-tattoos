import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../utils/analytics';
import featuredSnapshot from '../generated/featured.json';
import SEO from './SEO';
import './work.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faLink } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faInstagram,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

const PublishedGallery = lazy(() => import('./PublishedGallery'));
const SNAPSHOT = Array.isArray(featuredSnapshot?.pieces) ? featuredSnapshot.pieces : [];
const HERO_SLOTS = [0, 1, 2, 3];
const TILE_WIDTH = 360;
const TILE_HEIGHT = 480;

function samePieces(left, right) {
  if (left.length !== right.length) return false;
  return left.every(
    (piece, index) =>
      piece.id === right[index]?.id &&
      piece.thumb_url === right[index]?.thumb_url &&
      piece.alt_text === right[index]?.alt_text
  );
}

function Home() {
  const [pieces, setPieces] = useState(SNAPSHOT);
  const [heroSettled, setHeroSettled] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const galleryRef = useRef(null);
  const showFallback = heroSettled && pieces.length === 0;

  useEffect(() => {
    let active = true;
    import('../lib/refreshHero')
      .then((mod) => mod.loadHeroPieces())
      .then((result) => {
        if (!active) return;
        setHeroSettled(true);
        if (result.failed) return;
        setPieces((current) => (samePieces(current, result.pieces) ? current : result.pieces));
      })
      .catch(() => {
        if (active) setHeroSettled(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const node = galleryRef.current;
    if (!node) return undefined;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      setGalleryReady(true);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start();
      },
      { rootMargin: '600px' }
    );
    observer.observe(node);
    let idleId = 0;
    let timer = 0;
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      timer = window.setTimeout(start, 200);
    }
    return () => {
      observer.disconnect();
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <SEO
        title="Anime & Custom Tattoos in Brandon & Tampa, FL | Lyfestyle Tattoos"
        description="Custom anime and pop-culture tattoos by Clyde Wint in Brandon, FL, serving Tampa Bay. Appointment only. Send your idea and get a quote."
        path="/"
      />
      <div id="wrapper">
        <section className="public-hero">
          <h1>Custom anime and pop-culture tattoos in Brandon and Tampa.</h1>
          <p className="hero-sub">
            Appointment only. Send your idea, get a quote, lock your date with a deposit.
          </p>
          <div className="hero-actions">
            <a className="hero-primary" href="#start">
              Start Your Tattoo
            </a>
            <a className="hero-secondary" href="#work">
              See the work
            </a>
          </div>
          {showFallback ? (
            <p className="work-note">
              The work is loading, see our{' '}
              <a href="https://ig.me/m/lyfetattooos">Instagram</a>.
            </p>
          ) : (
            <div className="hero-pieces">
              {HERO_SLOTS.map((index) => {
                const piece = pieces[index];
                return (
                  <div className="work-tile" key={index}>
                    {piece?.thumb_url ? (
                      <img
                        src={piece.thumb_url}
                        alt={piece.alt_text || piece.title || 'Tattoo'}
                        width={TILE_WIDTH}
                        height={TILE_HEIGHT}
                        fetchPriority={index === 0 ? 'high' : undefined}
                        loading="eager"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div id="work" className="home-gallery" ref={galleryRef}>
          {galleryReady ? (
            <Suspense fallback={null}>
              <PublishedGallery />
            </Suspense>
          ) : null}
        </div>

        <section className="start-soon" id="start">
          <h2>Start your tattoo</h2>
          <p>
            The request form is coming soon. In the meantime, send your idea on Instagram.
          </p>
          <p>
            <a href="https://ig.me/m/lyfetattooos">Message on Instagram</a>
          </p>
        </section>

        <div id="booking">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '0',
            }}
          >
            <p
              style={{
                margin: '0',
                fontSize: '1.2rem',
                textAlign: 'center',
                lineHeight: '1.4',
              }}
            >
              <span className="desktop-only">
                Contact us to Book a Consultation Today
              </span>
              <span className="mobile-only">Book a Consultation</span>
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
              }}
              className="contact-links-container"
            >
              <a
                href="tel:+16562401034"
                className="contact-link"
                onClick={() =>
                  trackEvent('click_to_call', {
                    link_location: 'home',
                  })
                }
              >
                <FontAwesomeIcon icon={faPhone} />
                <span>Call</span>
              </a>
              <a
                href="sms:+16562401034"
                className="contact-link"
                onClick={() =>
                  trackEvent('click_to_text', {
                    link_location: 'home',
                  })
                }
              >
                <FontAwesomeIcon icon={faComment} />
                <span>Text</span>
              </a>
              {/* TODO: confirm this email address before publishing contact details. */}
              <a href="mailto:darkrai393@gmail.com" className="contact-link">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        <div className="content">
          <div
            style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}
          >
            <div
              style={{
                backgroundColor: 'var(--secondary-bg)',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '3rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.2rem',
                  lineHeight: '1.4',
                  marginBottom: '1.5rem',
                  color: 'var(--secondary-text)',
                  fontWeight: 'normal',
                }}
              >
                We draw custom anime and pop-culture tattoos in Brandon, FL,
                and we book people from across Tampa Bay. These are the styles
                we work in:
              </h3>
              <div className="styles-grid">
                <div
                  className="style-box"
                  style={{ textAlign: 'center', padding: '0.5rem' }}
                >
                  <h4
                    style={{
                      marginBottom: '0.5rem',
                      color: 'var(--primary-text)',
                      fontSize: '1rem',
                    }}
                  >
                    Traditional
                  </h4>
                  <p
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Classic bold lines and timeless designs
                  </p>
                </div>
                <div
                  className="style-box"
                  style={{ textAlign: 'center', padding: '0.5rem' }}
                >
                  <h4
                    style={{
                      marginBottom: '0.5rem',
                      color: 'var(--primary-text)',
                      fontSize: '1rem',
                    }}
                  >
                    Japanese & Anime
                  </h4>
                  <p
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Authentic Japanese and anime-inspired artwork
                  </p>
                </div>
                <div
                  className="style-box"
                  style={{ textAlign: 'center', padding: '0.5rem' }}
                >
                  <h4
                    style={{
                      marginBottom: '0.5rem',
                      color: 'var(--primary-text)',
                      fontSize: '1rem',
                    }}
                  >
                    Black & Grey
                  </h4>
                  <p
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Detailed shading and lifelike designs
                  </p>
                </div>
                <div
                  className="style-box"
                  style={{ textAlign: 'center', padding: '0.5rem' }}
                >
                  <h4
                    style={{
                      marginBottom: '0.5rem',
                      color: 'var(--primary-text)',
                      fontSize: '1rem',
                    }}
                  >
                    Color Realism
                  </h4>
                  <p
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Vibrant, true-to-life color work
                  </p>
                </div>
              </div>
            </div>

            <div
              className="choose"
              style={{
                backgroundColor: 'var(--secondary-bg)',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '2rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                }}
              >
                Why Choose Us?
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                <div className="feature" style={{ textAlign: 'center' }}>
                  <h4
                    style={{
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Expert Artist
                  </h4>
                  <p
                    style={{
                      lineHeight: '1.4',
                      color: 'var(--secondary-text)',
                      fontSize: '0.95rem',
                    }}
                  >
                    Years of experience creating unique, custom tattoos in Tampa
                  </p>
                </div>

                <div className="feature" style={{ textAlign: 'center' }}>
                  <h4
                    style={{
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Custom Designs
                  </h4>
                  <p
                    style={{
                      lineHeight: '1.4',
                      color: 'var(--secondary-text)',
                      fontSize: '0.95rem',
                    }}
                  >
                    Personalized consultation to bring your vision to life
                  </p>
                </div>

                <div className="feature" style={{ textAlign: 'center' }}>
                  <h4
                    style={{
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Clean & Safe
                  </h4>
                  <p
                    style={{
                      lineHeight: '1.4',
                      color: 'var(--secondary-text)',
                      fontSize: '0.95rem',
                    }}
                  >
                    We keep the studio clean and use sterile equipment
                  </p>
                </div>

                <div className="feature" style={{ textAlign: 'center' }}>
                  <h4
                    style={{
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Professional Studio
                  </h4>
                  <p
                    style={{
                      lineHeight: '1.4',
                      color: 'var(--secondary-text)',
                      fontSize: '0.95rem',
                    }}
                  >
                    Comfortable, private tattooing experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer
        style={{
          backgroundColor: 'var(--secondary-bg)',
          padding: '2rem 0',
          marginTop: '4rem',
          borderTop: '1px solid var(--accent-bg)',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          <h3
            style={{ marginBottom: '1.5rem', color: 'var(--secondary-text)' }}
          >
            Connect With Us
          </h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="https://www.facebook.com/lyfestyletattoos/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--primary-text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--primary-text)';
              }}
            >
              <FontAwesomeIcon icon={faFacebook} size="lg" />
              <span>Facebook</span>
            </a>
            <a
              href="https://www.instagram.com/lyfetattooos/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--primary-text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--primary-text)';
              }}
            >
              <FontAwesomeIcon icon={faInstagram} size="lg" />
              <span>Instagram</span>
            </a>
            <a
              href="https://x.com/LyfestyleTattoo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--primary-text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--primary-text)';
              }}
            >
              <FontAwesomeIcon icon={faXTwitter} size="lg" />
              <span>X (Twitter)</span>
            </a>
            <a
              href="https://linktr.ee/lyfestyletattoos"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--primary-text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--primary-text)';
              }}
            >
              <FontAwesomeIcon icon={faLink} size="lg" />
              <span>Linktree</span>
            </a>
          </div>
          <p
            style={{
              color: 'var(--secondary-text)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '1rem',
            }}
          >
            Private studio in Brandon, FL, serving Tampa Bay. Appointment only.
            The address comes with your booking confirmation.
          </p>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} Lyfestyle Tattoos. All rights reserved.
          </p>
          <p className="site-credit">
            <a
              href="https://digitaldynamicsolution.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Site by DDS
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;

