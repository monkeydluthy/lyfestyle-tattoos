import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const MENU_ID = 'site-menu';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { key } = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const closeMenu = () => setIsMenuOpen(false);

  // Close after any navigation, including a repeat click on the same link.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [key]);

  // Lock page scroll while the menu is open, and always release it.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector('a')?.focus();
    });
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onMouseDown = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [isMenuOpen]);

  return (
    <header>
      <div id="nav">
        {/* Desktop Logo */}
        <div id="logo" className="desktop-only">
          <Link to="/" onClick={closeMenu}>
            <img
              src="/resources/images/lyfestyle-logo.jpeg"
              alt="Lyfestyle Tattoos home"
            />
          </Link>
        </div>

        {/* Mobile Text Logo */}
        <div className="mobile-only text-logo">
          <Link
            to="/"
            onClick={closeMenu}
            style={{
              color: 'var(--primary-text)',
              textDecoration: 'none',
              fontSize: 'clamp(24px, 5vw, 28px)',
              fontWeight: '700',
              letterSpacing: '1.5px',
              padding: '12px 0',
              textShadow: '0 0 10px rgba(127, 255, 127, 0.3)',
            }}
          >
            LYFESTYLE TATTOOS
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="desktop-menu-wrap">
          <ul className="desktop-menu">
            <li>
              <Link to="/#work">Work</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/#start" className="nav-cta">
                Start a request
              </Link>
            </li>
          </ul>
        </nav>

        {/* Hamburger Menu Button */}
        <button
          ref={buttonRef}
          className="hamburger-button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls={MENU_ID}
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>

        {/* Mobile Menu Overlay */}
        <div
          id={MENU_ID}
          className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}
        >
          <nav aria-label="Mobile" className="mobile-menu" ref={menuRef}>
            <Link to="/#work" onClick={closeMenu}>
              Work
            </Link>
            <Link to="/about" onClick={closeMenu}>
              About
            </Link>
            <Link to="/#start" className="mobile-menu-cta" onClick={closeMenu}>
              Start a request
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
