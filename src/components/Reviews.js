import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faQuoteLeft,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';

function Reviews() {
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 3;

  const reviews = [
    {
      name: 'Sarah M.',
      rating: 5,
      text: 'Amazing experience! Clyde is incredibly talented and made me feel comfortable throughout the entire process. The studio is clean and professional. The attention to detail in my custom design was beyond my expectations. Highly recommend!',
      date: 'January 2024',
    },
    {
      name: 'Mike R.',
      rating: 5,
      text: "Got my first tattoo here and couldn't be happier. The attention to detail is incredible, and the atmosphere is so welcoming. Clyde took the time to explain everything and ensure I was comfortable. Will definitely be coming back for more!",
      date: 'February 2024',
    },
    {
      name: 'Jessica L.',
      rating: 5,
      text: 'Clyde did an amazing job on my anime-inspired tattoo. He really understood what I was looking for and exceeded my expectations. The studio is super clean and comfortable. His artistic interpretation of my concept was perfect!',
      date: 'December 2023',
    },
    {
      name: 'David K.',
      rating: 5,
      text: "Professional, talented, and great attention to detail. The black and grey work is phenomenal. Clyde's expertise in shading and line work is evident in every piece. Already planning my next piece!",
      date: 'February 2024',
    },
    {
      name: 'Amanda P.',
      rating: 5,
      text: "Best tattoo experience I've had. The studio is immaculate, and Clyde's work is exceptional. He took my concept and made it even better than I imagined. The healing process was smooth, and the results are stunning.",
      date: 'January 2024',
    },
    {
      name: 'Chris T.',
      rating: 5,
      text: 'Incredible attention to detail on my custom sleeve. Clyde worked with me over multiple sessions to create something truly unique. The studio atmosphere is professional yet comfortable, and the results speak for themselves.',
      date: 'December 2023',
    },
    {
      name: 'Emily R.',
      rating: 5,
      text: 'Got a beautiful floral piece done by Clyde. His artistic vision and technical skill are outstanding. The studio is modern, clean, and welcoming. The whole experience exceeded my expectations!',
      date: 'February 2024',
    },
    {
      name: 'Marcus J.',
      rating: 5,
      text: "As someone who appreciates both anime and traditional art, I was blown away by Clyde's ability to blend styles. The final piece is exactly what I wanted but better than I could have imagined.",
      date: 'January 2024',
    },
  ];

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const displayedReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

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
          {/* Header Section */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: 'clamp(30px, 5vw, 60px)',
              padding: '0 20px',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                marginBottom: '20px',
                fontWeight: '600',
              }}
            >
              Client Reviews
            </h1>
            <div
              style={{
                width: '60px',
                height: '4px',
                backgroundColor: 'var(--secondary-text)',
                margin: '0 auto 30px',
              }}
            ></div>
            <p
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                color: 'var(--secondary-text)',
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: '1.6',
              }}
            >
              See what our clients have to say about their experience at
              Lyfestyle Tattoos
            </p>
          </div>

          {/* Reviews Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(20px, 4vw, 30px)',
              marginBottom: 'clamp(30px, 5vw, 40px)',
              padding: '0 clamp(16px, 4vw, 24px)',
            }}
          >
            {displayedReviews.map((review, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'var(--secondary-bg)',
                  padding: 'clamp(20px, 4vw, 40px)',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--green-accent)',
                  boxShadow: '0 0 10px rgba(127, 255, 127, 0.1)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow =
                    '0 0 20px rgba(127, 255, 127, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow =
                    '0 0 10px rgba(127, 255, 127, 0.1)';
                }}
              >
                <FontAwesomeIcon
                  icon={faQuoteLeft}
                  style={{
                    color: 'var(--accent-color)',
                    fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                    marginBottom: '20px',
                  }}
                />
                <div style={{ marginBottom: '20px' }}>
                  {[...Array(review.rating)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      style={{
                        color: '#ffd700',
                        marginRight: '0.5rem',
                        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                    lineHeight: '1.8',
                    marginBottom: '30px',
                    flex: '1',
                    color: 'var(--secondary-text)',
                  }}
                >
                  "{review.text}"
                </p>
                <div>
                  <p
                    style={{
                      fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                      fontWeight: '600',
                      marginBottom: '5px',
                    }}
                  >
                    {review.name}
                  </p>
                  <p
                    style={{
                      fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
                      color: 'var(--secondary-text)',
                    }}
                  >
                    {review.date}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(10px, 2vw, 20px)',
              marginBottom: 'clamp(30px, 5vw, 60px)',
              padding: '0 20px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handlePrevPage}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid var(--secondary-text)',
                color: 'var(--secondary-text)',
                padding: 'clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary-text)';
                e.currentTarget.style.color = 'var(--primary-bg)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Previous
            </button>
            <span
              style={{
                color: 'var(--secondary-text)',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              }}
            >
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid var(--secondary-text)',
                color: 'var(--secondary-text)',
                padding: 'clamp(8px, 2vw, 10px) clamp(15px, 3vw, 20px)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary-text)';
                e.currentTarget.style.color = 'var(--primary-bg)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
            >
              Next <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          {/* Leave Review Section */}
          <div
            style={{
              backgroundColor: 'var(--secondary-bg)',
              padding: 'clamp(30px, 5vw, 50px)',
              borderRadius: '12px',
              textAlign: 'center',
              margin: 'clamp(40px, 6vw, 60px) auto',
              maxWidth: '1200px',
              width: 'calc(100% - clamp(32px, 8vw, 48px))',
              border: '2px solid var(--green-accent)',
              boxShadow: '0 0 20px rgba(127, 255, 127, 0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 30px rgba(127, 255, 127, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow =
                '0 0 20px rgba(127, 255, 127, 0.1)';
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                marginBottom: '30px',
                fontWeight: '500',
              }}
            >
              Share Your Experience
            </h2>
            <p
              style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                marginBottom: '40px',
                color: 'var(--secondary-text)',
                maxWidth: '600px',
                margin: '0 auto 40px',
              }}
            >
              Your feedback helps us maintain our high standards and lets others
              know about their experience at Lyfestyle Tattoos
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(15px, 3vw, 30px)',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: 'clamp(12px, 2.5vw, 15px) clamp(20px, 4vw, 30px)',
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--primary-text)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Google Reviews
              </a>
              <a
                href="https://www.yelp.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: 'clamp(12px, 2.5vw, 15px) clamp(20px, 4vw, 30px)',
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--primary-text)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Yelp Reviews
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Reviews;
