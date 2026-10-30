import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import featuredSnapshot from '../generated/featured.json';
import contentSnapshot from '../generated/content.json';
import SEO, { JsonLd } from './SEO';
import { TATTOO_PARLOR_JSONLD } from '../lib/seoConfig';
import Footer from './Footer';
import { HowItWorks, Pricing, Policies } from './InfoBlocks';
import './work.css';

const PublishedGallery = lazy(() => import('./PublishedGallery'));
const IntakeForm = lazy(() => import('./IntakeForm'));
const SNAPSHOT = Array.isArray(featuredSnapshot?.pieces) ? featuredSnapshot.pieces : [];
const CONTENT_SNAPSHOT = contentSnapshot && typeof contentSnapshot === 'object' ? contentSnapshot : {};
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
  const [content, setContent] = useState(CONTENT_SNAPSHOT);
  const [formReady, setFormReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return window.location.hash === '#start' || params.has('ref');
  });
  const galleryRef = useRef(null);
  const startRef = useRef(null);
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
    let active = true;
    import('../lib/refreshContent')
      .then((mod) => mod.loadSiteContent())
      .then((result) => {
        if (!active || result.failed) return;
        setContent((current) => ({ ...current, ...result.content }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const node = startRef.current;
    if (!node || formReady) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setFormReady(true);
      },
      { rootMargin: '800px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [formReady]);

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
      <JsonLd data={TATTOO_PARLOR_JSONLD} />
      <main id="wrapper">
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

        <HowItWorks />
        <Pricing pricing={content.pricing} />
        <Policies policies={content.policies} />

        <section className="intake" id="start" ref={startRef} aria-labelledby="start-heading">
          <h2 id="start-heading">Start your tattoo</h2>
          {formReady ? (
            <Suspense fallback={<p className="work-note">Loading the request form.</p>}>
              <IntakeForm />
            </Suspense>
          ) : (
            <p className="work-note">
              Or message Clyde on <a href="https://ig.me/m/lyfetattooos">Instagram @lyfetattooos</a>.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;

