import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faLink } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faInstagram,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const images = [
    'yamato.jpeg',
    'gojo.jpg',
    'mihawk.jpeg',
    'mahoraga.png',
    'berserk.jpeg',
    'asta.jpeg',
    'vine.jpeg',
    'jack-betterqual.jpeg',
    'sasuke.jpeg',
    'tiger.jpeg',
    'nico-robin.jpeg',
    'des.jpeg',
    'gaara-1.jpeg',
    'rose.jpeg',
    'ch-drunk.jpeg',
    'boruto.jpeg',
    'gogeta.jpeg',
    's-moon.jpeg',
    'ghost.jpeg',
    'toji.jpeg',
    'law.jpeg',
    'n.jpeg',
    'lugia.jpeg',
    'vegeta.jpeg',
    'ian-6.jpeg',
    'shenron.jpeg',
    'tiger-2.jpeg',
    'spike.jpeg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedImage === null) {
        // Only auto-advance if modal is closed
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length, selectedImage]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (selectedImage !== null) {
      if (e.key === 'ArrowLeft') handlePrevious(e);
      if (e.key === 'ArrowRight') handleNext(e);
      if (e.key === 'Escape') handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <div>
      <div id="wrapper">
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
              <a href="tel:813-613-5609" className="contact-link">
                <FontAwesomeIcon icon={faPhone} />
                <span>Call</span>
              </a>
              <a href="sms:+1813613-5609" className="contact-link">
                <FontAwesomeIcon icon={faComment} />
                <span>Text</span>
              </a>
              <a href="mailto:darkrai393@gmail.com" className="contact-link">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        <section>
          <div className="carousel">
            <button className="carousel-button prev" onClick={prevSlide}>
              &#8678;
            </button>
            <button className="carousel-button next" onClick={nextSlide}>
              &#8680;
            </button>
            <ul>
              {images.map((image, index) => (
                <li
                  key={index}
                  className="slide"
                  data-active={index === currentSlide ? true : undefined}
                  onClick={() => handleImageClick(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={`/resources/images/${image}`}
                    alt={`Slide ${index + 1}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Modal Gallery */}
        {selectedImage !== null && (
          <div
            onClick={handleClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            {/* Navigation Buttons */}
            <button
              onClick={handlePrevious}
              style={{
                position: 'absolute',
                left: 'clamp(0.5rem, 2vw, 2rem)',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                cursor: 'pointer',
                padding: 'clamp(0.5rem, 2vw, 1rem)',
                zIndex: 1001,
              }}
            >
              ←
            </button>
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: 'clamp(0.5rem, 2vw, 2rem)',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                cursor: 'pointer',
                padding: 'clamp(0.5rem, 2vw, 1rem)',
                zIndex: 1001,
              }}
            >
              →
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: 'clamp(0.5rem, 2vw, 2rem)',
                right: 'clamp(0.5rem, 2vw, 2rem)',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                cursor: 'pointer',
                padding: 'clamp(0.5rem, 2vw, 1rem)',
                zIndex: 1001,
              }}
            >
              ×
            </button>

            {/* Modal Image */}
            <div
              style={{
                position: 'relative',
                width: '95%',
                height: '90%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 'clamp(1rem, 3vw, 2rem)',
              }}
            >
              <img
                src={`/resources/images/${images[selectedImage]}`}
                alt={`Slide ${selectedImage + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            </div>
          </div>
        )}

        <div className="content">
          <div
            style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}
          >
            <h1
              style={{
                fontSize: '3.5rem',
                marginBottom: '1.5rem',
                color: 'var(--primary-text)',
              }}
            >
              Lyfestyle Tattoos
            </h1>
            <h2
              style={{
                fontSize: '2.2rem',
                marginBottom: '2rem',
                color: 'var(--secondary-text)',
              }}
            >
              Premier Tattoo Studio in Tampa, Florida
            </h2>
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
                <span className="desktop-only">
                  Welcome to Tampa's finest tattoo destination. At Lyfestyle
                  Tattoos, Clyde Wint specializes in creating unique, custom
                  tattoos that tell your story. As an experienced Tampa-based
                  artist, he is a master of various styles:
                </span>
                <span
                  className="mobile-only"
                  style={{ display: 'block', textAlign: 'left' }}
                >
                  Our Tattoo Styles:
                </span>
              </h3>
              <div
                className="styles-grid desktop-only"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
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

              {/* Mobile Styles Section */}
              <div
                className="styles-list mobile-only"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  className="style-card"
                  style={{
                    backgroundColor: 'var(--accent-bg)',
                    padding: '1rem',
                    borderRadius: '8px',
                  }}
                >
                  <h4
                    style={{
                      color: 'var(--primary-text)',
                      marginBottom: '0.25rem',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                    }}
                  >
                    Traditional
                  </h4>
                  <p
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                    }}
                  >
                    Classic bold lines and timeless designs
                  </p>
                </div>
                <div
                  className="style-card"
                  style={{
                    backgroundColor: 'var(--accent-bg)',
                    padding: '1rem',
                    borderRadius: '8px',
                  }}
                >
                  <h4
                    style={{
                      color: 'var(--primary-text)',
                      marginBottom: '0.25rem',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                    }}
                  >
                    Japanese & Anime
                  </h4>
                  <p
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                    }}
                  >
                    Authentic Japanese and anime-inspired artwork
                  </p>
                </div>
                <div
                  className="style-card"
                  style={{
                    backgroundColor: 'var(--accent-bg)',
                    padding: '1rem',
                    borderRadius: '8px',
                  }}
                >
                  <h4
                    style={{
                      color: 'var(--primary-text)',
                      marginBottom: '0.25rem',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                    }}
                  >
                    Black & Grey
                  </h4>
                  <p
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                    }}
                  >
                    Detailed shading and lifelike designs
                  </p>
                </div>
                <div
                  className="style-card"
                  style={{
                    backgroundColor: 'var(--accent-bg)',
                    padding: '1rem',
                    borderRadius: '8px',
                  }}
                >
                  <h4
                    style={{
                      color: 'var(--primary-text)',
                      marginBottom: '0.25rem',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                    }}
                  >
                    Color Realism
                  </h4>
                  <p
                    style={{
                      color: 'var(--secondary-text)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
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
                    Highest standards of hygiene and safety
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
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} Lyfestyle Tattoos. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
