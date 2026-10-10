import React, { useEffect } from 'react';
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
        {/* TODO: wire this up to the booking request flow. */}
        <button type="button" className="contact-link">
          Start a request
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Analytics />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
