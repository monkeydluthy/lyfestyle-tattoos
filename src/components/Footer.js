import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';

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
            marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
            color: 'var(--secondary-text)',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
          }}
        >
          Connect With Us
        </h3>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(1rem, 2.5vw, 2rem)',
            marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
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
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
