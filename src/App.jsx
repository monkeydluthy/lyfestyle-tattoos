import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Portfolio from './components/Portfolio';
import SEO from './components/SEO';
import './index.css';

const AdminApp = lazy(() => import('./admin/AdminApp'));
const Thanks = lazy(() => import('./components/Thanks'));

const GA_MEASUREMENT_ID = 'G-R3RBQDCXX4';

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      send_to: GA_MEASUREMENT_ID,
      page_title: document.title,
      page_location: window.location.href,
      page_path: location.pathname + location.search,
    });
  }, [location]);

  return null;
}

function ScrollToHash() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1));
    if (id) {
      document.getElementById(id)?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key]);

  return null;
}

function NotFound() {
  const location = useLocation();

  return (
    <div
      className="content"
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <SEO
        title="Page not found | Lyfestyle Tattoos"
        description="That page isn't on the Lyfestyle Tattoos site."
        path={location.pathname}
        canonical={false}
        robots="noindex, nofollow"
      />
      <div
        id="wrapper"
        style={{ textAlign: 'center', padding: '4rem 0', width: '100%' }}
      >
        <h1 style={{ marginBottom: '1rem' }}>Page not found</h1>
        <p
          style={{
            color: 'var(--secondary-text)',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}
        >
          That address isn't a page on this site.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--green-accent)' }}>
            Back to the homepage
          </Link>
        </p>
        <Link to="/#start" className="contact-link">
          Start a request
        </Link>
      </div>
    </div>
  );
}

function AdminFallback() {
  return (
    <div
      role="status"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--primary-bg)',
        color: 'var(--secondary-text)',
        fontSize: '16px',
      }}
    >
      Loading
    </div>
  );
}

function MobileCta() {
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    const target = document.getElementById('start');
    if (!target) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setHidden(entry.isIntersecting);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className={`mobile-cta${hidden ? ' is-hidden' : ''}`} aria-hidden={hidden || undefined}>
      <Link to="/#start" tabIndex={hidden ? -1 : undefined}>
        Start a request
      </Link>
    </div>
  );
}

function PublicSite() {
  const { pathname } = useLocation();
  const showCta = pathname !== '/thanks';
  return (
    <div className={`App${showCta ? ' has-cta' : ''}`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route
          path="/thanks"
          element={
            <Suspense fallback={null}>
              <Thanks />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showCta ? <MobileCta /> : null}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Analytics />
      <ScrollToHash />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </Router>
  );
}

export default App;
