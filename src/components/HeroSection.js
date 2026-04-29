import React, { forwardRef, useState, useEffect, useRef } from 'react';
import './HeroSection.css';

// ─────────────────────────────────────────────────────────────────────────────
// All paragraph text lives here so both the renderer AND the TTS engine
// work from the exact same source of truth.
// ─────────────────────────────────────────────────────────────────────────────
export const PARAGRAPHS = [
    `The internet is one of the most powerful tools humanity has ever created — a place where knowledge, connection, and opportunity converge. Yet for millions of people living with visual, auditory, motor, or cognitive disabilities, the web remains a landscape full of barriers. At our core, we believe that digital accessibility is not a feature or an afterthought — it is a fundamental right.`,

    `Every person deserves to navigate the web with confidence and independence. Whether you rely on a screen reader to interpret text, need larger fonts to read comfortably, prefer high-contrast visuals to reduce eye strain, or use voice commands to interact with content, this platform is designed with you in mind. We have built every element of this experience to meet and exceed the Web Content Accessibility Guidelines (WCAG 2.1 AA), ensuring that no one is left behind.`,

    `Our accessibility toolkit — accessible via the button on the right — gives you direct control over how you experience this page. Increase or decrease text size, switch to a high-contrast or dark colour scheme, enable a dyslexia-friendly font, activate text-to-speech to have the page read aloud to you, or use voice input to fill in forms without typing a single character. These are not gimmicks; they are thoughtfully engineered tools that reflect our commitment to inclusive design.`,

    `Accessibility benefits everyone. Captions help people watching videos in noisy environments. Clear navigation helps users who are distracted or in a hurry. Readable fonts and generous spacing reduce cognitive load for all readers. When we design for the edges, we improve the experience at the centre. This is the philosophy that drives every decision we make — from colour choices and typography to keyboard navigation and ARIA semantics.`,

    `We invite you to explore, interact, and reach out. Use the contact form below to share your thoughts, ask questions, or tell us how we can make this experience even better. Your feedback is not just welcome — it is essential. Together, we can build a web that truly belongs to everyone.`,
];

// ─────────────────────────────────────────────────────────────────────────────
// Build a flat list of { word, charStart } objects from all paragraphs joined
// by a single space. This mirrors exactly what the TTS engine receives.
// ─────────────────────────────────────────────────────────────────────────────
export function buildWordMap( paragraphs ) {
    const fullText = paragraphs.join( ' ' );
    const wordMap = [];   // [{ word, charStart, globalIndex }]
    const regex = /\S+/g;
    let match;
    while ( ( match = regex.exec( fullText ) ) !== null ) {
        wordMap.push( { word: match[0], charStart: match.index } );
    }
    return { fullText, wordMap };
}

export const { fullText: HERO_FULL_TEXT, wordMap: HERO_WORD_MAP } = buildWordMap( PARAGRAPHS );

// ─────────────────────────────────────────────────────────────────────────────
// WordSpan — renders one word as a <span> that can be highlighted
// ─────────────────────────────────────────────────────────────────────────────
const WordSpan = React.memo( function WordSpan( { word, globalIndex, activeIndex } ) {
    const isActive = activeIndex === globalIndex;
    return (
        <span
            className={`tts-word${isActive ? ' tts-word--active' : ''}`}
            data-word-index={globalIndex}
            aria-hidden="true"
        >
            {word}
        </span>
    );
} );

// ─────────────────────────────────────────────────────────────────────────────
// ParagraphWords — renders one paragraph as a sequence of WordSpans + spaces
// ─────────────────────────────────────────────────────────────────────────────
function ParagraphWords( { paragraphText, wordStartGlobalIndex, activeWordIndex } ) {
    // Split on whitespace, keep the tokens
    const tokens = paragraphText.split( /(\s+)/ );
    let wordCounter = 0;
    return (
        <>
            {tokens.map( ( token, i ) => {
                if ( /^\s+$/.test( token ) ) {
                    // It's whitespace — render as-is
                    return <React.Fragment key={i}>{token}</React.Fragment>;
                }
                const globalIndex = wordStartGlobalIndex + wordCounter;
                wordCounter++;
                return (
                    <WordSpan
                        key={i}
                        word={token}
                        globalIndex={globalIndex}
                        activeIndex={activeWordIndex}
                    />
                );
            } )}
        </>
    );
}

// Pre-compute the global word start index for each paragraph
function getParagraphWordStartIndices( paragraphs ) {
    const indices = [];
    let count = 0;
    paragraphs.forEach( p => {
        indices.push( count );
        // Count words (non-whitespace tokens)
        count += p.split( /\s+/ ).filter( Boolean ).length;
    } );
    return indices;
}

const PARA_WORD_START_INDICES = getParagraphWordStartIndices( PARAGRAPHS );

// ─────────────────────────────────────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────────────────────────────────────
const HeroSection = forwardRef( function HeroSection( _, ref ) {
    const [activeWordIndex, setActiveWordIndex] = useState( -1 );

    useEffect( () => {
        // Listen for word-boundary events dispatched by AccessibilitySidebar
        const handler = ( e ) => {
            setActiveWordIndex( e.detail?.wordIndex ?? -1 );
        };
        window.addEventListener( 'a11y-word', handler );
        return () => window.removeEventListener( 'a11y-word', handler );
    }, [] );

    return (
        <section className="hero" ref={ref} aria-labelledby="hero-heading">
            <div className="hero__bg-shape hero__bg-shape--1" aria-hidden="true" />
            <div className="hero__bg-shape hero__bg-shape--2" aria-hidden="true" />

            <div className="hero__content">
                <div className="hero__badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                        viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="4" r="2" />
                        <path d="M19 9H5a1 1 0 0 0 0 2h5.5l-1.8 8.1a1 1 0 0 0 1.96.4L12 14l1.34 5.5a1 1 0 0 0 1.96-.4L13.5 11H19a1 1 0 0 0 0-2z" />
                    </svg>
                    Accessibility First
                </div>

                <h1 id="hero-heading" className="hero__title">
                    Building a Web That Works{' '}
                    <span className="hero__title-accent">for Everyone</span>
                </h1>

                <div className="hero__body">
                    {PARAGRAPHS.map( ( text, pIdx ) => (
                        <p key={pIdx}>
                            <ParagraphWords
                                paragraphText={text}
                                wordStartGlobalIndex={PARA_WORD_START_INDICES[pIdx]}
                                activeWordIndex={activeWordIndex}
                            />
                        </p>
                    ) )}
                </div>

                <div className="hero__stats" aria-label="Accessibility statistics">
                    <div className="hero__stat">
                        <span className="hero__stat-number">1 in 4</span>
                        <span className="hero__stat-label">Adults have a disability</span>
                    </div>
                    <div className="hero__stat">
                        <span className="hero__stat-number">WCAG 2.1</span>
                        <span className="hero__stat-label">AA Compliant</span>
                    </div>
                    <div className="hero__stat">
                        <span className="hero__stat-number">100%</span>
                        <span className="hero__stat-label">Keyboard navigable</span>
                    </div>
                </div>
            </div>

            {/* Illustration */}
            <div className="hero__illustration" aria-hidden="true">
                <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="hero__svg">
                    <circle cx="200" cy="200" r="180" fill="#eff6ff" />
                    <circle cx="200" cy="110" r="36" fill="#1a56db" />
                    <path d="M200 150 L200 240" stroke="#1a56db" strokeWidth="14" strokeLinecap="round" />
                    <path d="M200 175 L155 210" stroke="#1a56db" strokeWidth="12" strokeLinecap="round" />
                    <path d="M200 175 L245 210" stroke="#1a56db" strokeWidth="12" strokeLinecap="round" />
                    <path d="M200 240 L165 295" stroke="#1a56db" strokeWidth="12" strokeLinecap="round" />
                    <path d="M200 240 L235 295" stroke="#1a56db" strokeWidth="12" strokeLinecap="round" />
                    <circle cx="320" cy="140" r="28" fill="#dbeafe" />
                    <text x="320" y="148" textAnchor="middle" fontSize="20">👁</text>
                    <circle cx="80" cy="200" r="28" fill="#dbeafe" />
                    <text x="80" y="208" textAnchor="middle" fontSize="20">🎙</text>
                    <circle cx="310" cy="280" r="28" fill="#dbeafe" />
                    <text x="310" y="288" textAnchor="middle" fontSize="20">⌨️</text>
                    <circle cx="100" cy="300" r="28" fill="#dbeafe" />
                    <text x="100" y="308" textAnchor="middle" fontSize="20">🔊</text>
                </svg>
            </div>
        </section>
    );
} );

export default HeroSection;
