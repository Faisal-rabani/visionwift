import React, { useRef } from 'react';
import HeroSection from './HeroSection';
import ContactForm from './ContactForm';
import AccessibilitySidebar from './AccessibilitySidebar';
import './HomePage.css';

const HomePage = () => {
    const heroRef = useRef( null );
    const formRef = useRef( null );

    return (
        <div className="page">
            {/* Skip-to-content link for keyboard users */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            {/* Accessibility sidebar — receives refs so TTS can read them */}
            <AccessibilitySidebar heroRef={heroRef} formRef={formRef} />

            {/* ── Navigation ── */}
            <header className="nav" role="banner">
                <div className="nav__inner">
                    <a href="/" className="nav__logo" aria-label="Home">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#1a56db" aria-hidden="true">
                            <circle cx="12" cy="4" r="2" />
                            <path d="M19 9H5a1 1 0 0 0 0 2h5.5l-1.8 8.1a1 1 0 0 0 1.96.4L12 14l1.34 5.5a1 1 0 0 0 1.96-.4L13.5 11H19a1 1 0 0 0 0-2z" />
                        </svg>
                        <span>AccessiWeb</span>
                    </a>
                    <nav aria-label="Main navigation">
                        <ul className="nav__links">
                            <li><a href="#main-content" className="nav__link">Home</a></li>
                            <li><a href="#contact-form" className="nav__link">Contact</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* ── Main content ── */}
            <main id="main-content" tabIndex="-1">
                {/* Hero */}
                <HeroSection ref={heroRef} />

                {/* Divider */}
                <div className="section-divider" aria-hidden="true">
                    <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f0f4f8" />
                    </svg>
                </div>

                {/* Contact form */}
                <div id="contact-form" className="form-section">
                    <div className="form-section__label" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Contact Us
                    </div>
                    <ContactForm ref={formRef} />
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="footer" role="contentinfo">
                <p>
                    Built with accessibility in mind ·{' '}
                    <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">
                        WCAG 2.1 AA
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default HomePage;
