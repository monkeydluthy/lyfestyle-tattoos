import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header>
      <div id="nav">
        {/* Desktop Logo */}
        <div id="logo" className="desktop-only">
          <Link to="/" onClick={closeMenu}>
            <img
              src="/resources/images/test-mini-logo%20Small.jpeg"
              alt="logo"
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
        <ul className="desktop-menu">
          <li>
            <Link to="/about">About</Link>
          </li>
          <li id="hide">|</li>
          <li>
            <Link to="/portfolio">Portfolio</Link>
          </li>
          <li id="hide">|</li>
          <li>
            <a href="sms:+16562401034">Booking</a>
          </li>
          <li id="hide">|</li>
          <li>
            <Link to="/reviews">Reviews</Link>
          </li>
          <li id="hide">|</li>
          <li>
            <a
              href="https://www.instagram.com/lyfetattooos/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </li>
        </ul>

        {/* Hamburger Menu Button */}
        <button
          ref={buttonRef}
          className="hamburger-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu" ref={menuRef}>
            <Link
              to="/about"
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '3.5rem',
              }}
            >
              About
            </Link>
            <Link
              to="/portfolio"
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '3.5rem',
              }}
            >
              Portfolio
            </Link>
            <a
              href="sms:+16562401034"
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '3.5rem',
              }}
            >
              Booking
            </a>
            <Link
              to="/reviews"
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '3.5rem',
              }}
            >
              Reviews
            </Link>
            <a
              href="https://www.instagram.com/lyfetattooos/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '3.5rem',
              }}
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
