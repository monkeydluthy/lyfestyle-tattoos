import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import SEO from './SEO';

function About() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <SEO
        title="About | Lyfestyle Tattoos"
        description="Private studio in Brandon, FL, serving Tampa Bay. Custom tattoos, including anime and pop culture, by Clyde Wint. Appointment only."
        path="/about"
      />
      <div
        className="content"
        style={{
          backgroundColor: 'var(--primary-bg)',
          flex: '1',
          padding: '40px 0',
        }}
      >
        <div id="wrapper">
          {/* Hero Section with Image and Intro */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
              marginBottom: '60px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: '1 1 300px',
                minWidth: '280px',
                padding: '0 20px',
              }}
            >
              <h1
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  marginBottom: '20px',
                  fontWeight: '600',
                  letterSpacing: '1px',
                }}
              >
                About Lyfestyle Tattoos
              </h1>
              <p
                style={{
                  fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                  lineHeight: '1.8',
                  color: 'var(--secondary-text)',
                  marginBottom: '20px',
                }}
              >
                We tattoo in a private studio in Brandon, FL, and we take
                appointments from across Tampa Bay. We draw custom pieces,
                including anime and pop culture.
              </p>
            </div>
            <div
              style={{
                flex: '1 1 300px',
                minWidth: '280px',
                position: 'relative',
                padding: '0 20px',
              }}
            >
              <img
                src="/resources/images/clyde-tattooing.jpeg"
                alt="Clyde Wint Tattooing"
                style={{
                  width: '100%',
                  height: 'clamp(300px, 50vh, 600px)',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  filter: 'grayscale(100%)',
                }}
              />
            </div>
          </div>

          {/* Artist Section */}
          <div
            className="featured-section"
            style={{
              backgroundColor: 'var(--secondary-bg)',
              padding: 'clamp(20px, 5vw, 60px)',
              borderRadius: '12px',
              marginBottom: '100px',
            }}
          >
            <h2
              style={{
                fontSize: '2.5rem',
                marginBottom: '40px',
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              Meet Your Artist
            </h2>
            <div
              style={{
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '2rem',
                  marginBottom: '20px',
                  color: 'var(--secondary-text)',
                }}
              >
                Clyde Wint
              </h3>
              <p
                style={{
                  fontSize: '1.2rem',
                  lineHeight: '1.8',
                  color: 'var(--secondary-text)',
                  marginBottom: '30px',
                }}
              >
                With years of experience and a passion for creating unique
                pieces, Clyde specializes in various styles from traditional to
                contemporary, anime-inspired to realism. Each tattoo is crafted
                with precision and dedication to bring your vision to life.
              </p>
            </div>
          </div>

          {/* Services Grid */}
          <div style={{ marginBottom: '100px' }}>
            <h2
              style={{
                fontSize: '2.5rem',
                marginBottom: '50px',
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              Our Services
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '30px',
              }}
            >
              {[
                {
                  title: 'Custom Designs',
                  description:
                    'Unique tattoos crafted to match your personal vision and style',
                },
                {
                  title: 'Free Consultation',
                  description:
                    'Detailed discussion to understand your ideas and requirements',
                },
                {
                  title: 'Cover-Up Work',
                  description:
                    'Expert transformation of existing tattoos into new artwork',
                },
                {
                  title: 'Multiple Styles',
                  description:
                    'From traditional to modern, black & grey to full color',
                },
              ].map((service, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'var(--secondary-bg)',
                    padding: '40px',
                    borderRadius: '12px',
                    cursor: 'default',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      marginBottom: '20px',
                      color: 'var(--primary-text)',
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '1.1rem',
                      lineHeight: '1.6',
                      color: 'var(--secondary-text)',
                    }}
                  >
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Studio Section */}
          <div
            className="featured-section"
            style={{
              backgroundColor: 'var(--secondary-bg)',
              padding: 'clamp(20px, 5vw, 60px)',
              borderRadius: '12px',
            }}
          >
            <h2
              style={{
                fontSize: '2.5rem',
                marginBottom: '40px',
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              Our Studio
            </h2>
            <div
              style={{
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '1.2rem',
                  lineHeight: '1.8',
                  color: 'var(--secondary-text)',
                  marginBottom: '30px',
                }}
              >
                Private studio in Brandon, FL, serving Tampa Bay. Appointment
                only. The address comes with your booking confirmation. We use
                sterile equipment and follow health department rules.
              </p>
              <p
                style={{
                  fontSize: '1.2rem',
                  lineHeight: '1.8',
                  color: 'var(--secondary-text)',
                }}
              >
                We've created an inclusive, welcoming environment where you can
                feel comfortable discussing your ideas and working with us to
                bring your vision to life.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '60px 0 20px' }}>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                marginBottom: '20px',
                fontWeight: '500',
              }}
            >
              Have an idea?
            </h2>
            <Link className="hero-primary" to="/#start">
              Start a request
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default About;
