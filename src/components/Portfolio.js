import React, { useState } from 'react';
import Footer from './Footer';

function Portfolio() {
  const [selectedImage, setSelectedImage] = useState(null);

  const portfolioImages = [
    { src: 'mihawk.jpeg', alt: 'Mihawk Tattoo' },
    { src: 'mahoraga.jpeg', alt: 'Mahoraga Tattoo' },
    { src: 'berserk.jpeg', alt: 'Berserk Logo Tattoo' },
    { src: 'asta.jpeg', alt: 'Asta Tattoo' },
    { src: 'vines.jpeg', alt: 'Vine Tattoo' },
    { src: 'jack-betterqual.jpeg', alt: 'Jack Skellington Tattoo' },
    { src: 'sasuke.jpeg', alt: 'Sasuke Tattoo' },
    { src: 'tiger.jpeg', alt: 'Tiger Tattoo' },
    { src: 'des.jpeg', alt: 'DES Tattoo' },
    { src: 'gaara-1.jpeg', alt: 'Gaara Tattoo' },
    { src: 'ch-drunk.jpeg', alt: 'Cuphead Tattoo' },
    { src: 'boruto.jpeg', alt: 'Boruto Tattoo' },
    { src: 'gogeta.jpeg', alt: 'Gogeta Tattoo' },
    { src: 'ghost.jpeg', alt: 'Ghostbusters Tattoo' },
    { src: 'toji.jpeg', alt: 'Toji Tattoo' },
    { src: 'law.jpeg', alt: 'Law Tattoo' },
    { src: 'n.jpeg', alt: 'Letter N Tattoo' },
    { src: 'ian-6.jpeg', alt: 'Lil Otis Tattoo' },
    { src: 'shenron.jpeg', alt: 'Shenron Tattoo' },
    { src: 'tiger-2.jpeg', alt: 'Second Tiger Tattoo' },
  ];

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) =>
      prev > 0 ? prev - 1 : portfolioImages.length - 1
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) =>
      prev < portfolioImages.length - 1 ? prev + 1 : 0
    );
  };

  const handleKeyDown = (e) => {
    if (selectedImage !== null) {
      if (e.key === 'ArrowLeft') handlePrevious(e);
      if (e.key === 'ArrowRight') handleNext(e);
      if (e.key === 'Escape') handleClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
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
              marginBottom: '3rem',
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            Check out some of our recent work
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 'clamp(1rem, 2vw, 2rem)',
              padding: 'clamp(1rem, 2vw, 2rem) 20px',
            }}
          >
            {portfolioImages.map((image, index) => (
              <div
                key={index}
                onClick={() => handleImageClick(index)}
                className="portfolio-item"
                style={{
                  position: 'relative',
                  paddingBottom: '100%',
                  backgroundColor: 'var(--secondary-bg)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid var(--green-accent)',
                  transition: 'all 0.3s ease',
                }}
              >
                <img
                  src={`/resources/images/${image.src}`}
                  alt={image.alt}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </div>
            ))}
          </div>

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
                  src={`/resources/images/${portfolioImages[selectedImage].src}`}
                  alt={portfolioImages[selectedImage].alt}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'clamp(-2rem, -4vw, -3rem)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    textAlign: 'center',
                    width: '100%',
                    padding: '0 20px',
                  }}
                >
                  {portfolioImages[selectedImage].alt}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Portfolio;
