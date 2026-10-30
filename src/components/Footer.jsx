import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--secondary-bg)',
        padding: 'clamp(1.5rem, 3vw, 2rem) 0',
        marginTop: 'clamp(2rem, 5vw, 4rem)',
        borderTop: '1px solid var(--accent-bg)',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '0 clamp(15px, 3vw, 20px)',
        }}
      >
        <h3
          style={{
            marginBottom: '0.25rem',
            color: 'var(--primary-text)',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
          }}
        >
          Lyfestyle Tattoos
        </h3>
        <p
          style={{
            color: 'var(--secondary-text)',
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
            marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
          }}
        >
          Brandon / Tampa, FL
        </p>
        <nav
          aria-label="Footer"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(0.5rem, 2vw, 1.5rem)',
            marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
            flexWrap: 'wrap',
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
          }}
        >
          <a
            href="https://www.instagram.com/lyfetattooos/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faInstagram} size="lg" />
            <span>Instagram @lyfetattooos</span>
          </a>
          <a
            href="https://x.com/LyfestyleTattoo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faXTwitter} size="lg" />
            <span>X</span>
          </a>
          <a
            href="https://www.facebook.com/lyfestyletattoos/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faFacebook} size="lg" />
            <span>Facebook</span>
          </a>
          <Link to="/portfolio/">Portfolio</Link>
          <Link to="/#policies">Policies</Link>
        </nav>
        <p
          style={{
            color: 'var(--secondary-text)',
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
            lineHeight: '1.6',
            marginBottom: '1rem',
          }}
        >
          Appointment only. The address comes with your booking confirmation.
        </p>
        <p
          style={{
            color: 'var(--secondary-text)',
            fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
          }}
        >
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
  );
}

export default Footer;
