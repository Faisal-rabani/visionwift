import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AccessibilitySidebar.css';
import { HERO_FULL_TEXT, HERO_WORD_MAP } from './HeroSection';

// ── Icons ───────────────────────────────────────────────────────────────────
const Icon = ( { d, size = 20 } ) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
    </svg>
);

const ICONS = {
    close: 'M18 6L6 18M6 6l12 12',
    textSize: 'M4 7V4h16v3M9 20h6M12 4v16',
    contrast: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2v16a8 8 0 0 1 0-16z',
    highlight: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    spacing: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    cursor: 'M4 4l7.07 17 2.51-7.39L21 11.07z',
    pause: 'M10 9v6m4-6v6',
    play: 'M5 3l14 9-14 9V3z',
    stop: 'M6 6h12v12H6z',
    volume: 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07',
    reset: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8',
    dyslexia: 'M4 6h16M4 12h16M4 18h7',
    link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
    image: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    keyboard: 'M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
    mic: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8',
};

// ── Dispatch word-highlight event to HeroSection ─────────────────────────────
function dispatchWordEvent( wordIndex ) {
    window.dispatchEvent( new CustomEvent( 'a11y-word', { detail: { wordIndex } } ) );
}

// ── Stop TTS ─────────────────────────────────────────────────────────────────
export function stopSpeech() {
    if ( window.speechSynthesis ) window.speechSynthesis.cancel();
    dispatchWordEvent( -1 );
}

// ── Main Component ───────────────────────────────────────────────────────────
const AccessibilitySidebar = ( { heroRef, formRef } ) => {
    const [open, setOpen] = useState( false );
    const [speaking, setSpeaking] = useState( false );

    // Visual settings
    const [fontSize, setFontSize] = useState( 100 );
    const [contrast, setContrast] = useState( 'normal' );
    const [highlight, setHighlight] = useState( false );
    const [lineSpacing, setLineSpacing] = useState( 'normal' );
    const [bigCursor, setBigCursor] = useState( false );
    const [dyslexiaFont, setDyslexiaFont] = useState( false );
    const [highlightLinks, setHighlightLinks] = useState( false );
    const [focusOutline, setFocusOutline] = useState( false );

    // Voice input (sidebar global mic)
    const [voiceListening, setVoiceListening] = useState( false );
    const [voiceTarget, setVoiceTarget] = useState( 'name' );
    const [voiceTranscript, setVoiceTranscript] = useState( '' );
    const recognitionRef = useRef( null );

    // ── Apply font size to body ───────────────────────────────────────────────
    useEffect( () => {
        document.body.style.fontSize = `${fontSize}%`;
    }, [fontSize] );

    // ── Apply other visual settings ──────────────────────────────────────────
    useEffect( () => {
        const html = document.documentElement;
        const spacingMap = { normal: '1.6', wide: '2', extra: '2.6' };
        document.body.style.lineHeight = spacingMap[lineSpacing] || '1.6';
        html.classList.toggle( 'a11y-high-contrast', contrast === 'high' );
        html.classList.toggle( 'a11y-dark-mode', contrast === 'dark' );
        html.classList.toggle( 'a11y-inverted', contrast === 'inverted' );
        html.classList.toggle( 'a11y-highlight-hover', highlight );
        html.classList.toggle( 'a11y-big-cursor', bigCursor );
        html.classList.toggle( 'a11y-dyslexia', dyslexiaFont );
        html.classList.toggle( 'a11y-highlight-links', highlightLinks );
        html.classList.toggle( 'a11y-focus-outline', focusOutline );
    }, [contrast, highlight, lineSpacing, bigCursor, dyslexiaFont, highlightLinks, focusOutline] );

    // ── TTS: word-by-word highlighting via onboundary ────────────────────────
    const handleRead = useCallback( () => {
        if ( speaking ) {
            stopSpeech();
            setSpeaking( false );
            return;
        }

        // Build the text to speak: hero paragraphs + form fields
        // We use HERO_FULL_TEXT (same text the spans were built from) so
        // charIndex values from onboundary map 1-to-1 to HERO_WORD_MAP.
        let speakText = HERO_FULL_TEXT;
        let formSuffix = '';

        if ( formRef?.current ) {
            const inputs = formRef.current.querySelectorAll( 'input, textarea' );
            inputs.forEach( el => {
                const label = el.labels?.[0]?.innerText || el.getAttribute( 'placeholder' ) || el.name || '';
                const value = el.value ? el.value : 'is empty';
                if ( label ) formSuffix += ` ${label}: ${value}.`;
            } );
        }

        const fullSpeak = speakText + formSuffix;

        const utterance = new SpeechSynthesisUtterance( fullSpeak );
        utterance.rate = 0.9;   // slightly slower so highlights are visible
        utterance.pitch = 1;

        // onboundary fires for every word boundary with charIndex = position in fullSpeak
        utterance.onboundary = ( event ) => {
            if ( event.name !== 'word' ) return;

            const charIndex = event.charIndex;

            // Binary-search HERO_WORD_MAP for the word whose charStart <= charIndex
            // and charStart + word.length >= charIndex
            let lo = 0, hi = HERO_WORD_MAP.length - 1, found = -1;
            while ( lo <= hi ) {
                const mid = ( lo + hi ) >> 1;
                const entry = HERO_WORD_MAP[mid];
                if ( entry.charStart <= charIndex && charIndex < entry.charStart + entry.word.length + 1 ) {
                    found = mid;
                    break;
                } else if ( entry.charStart < charIndex ) {
                    found = mid; // best candidate so far
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }

            dispatchWordEvent( found );
        };

        utterance.onend = () => {
            setSpeaking( false );
            dispatchWordEvent( -1 );
        };

        utterance.onerror = () => {
            setSpeaking( false );
            dispatchWordEvent( -1 );
        };

        setSpeaking( true );
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak( utterance );
    }, [speaking, formRef] );

    // ── Global voice input ───────────────────────────────────────────────────
    const handleVoiceInput = useCallback( () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if ( !SpeechRecognition ) {
            alert( 'Speech recognition is not supported in this browser. Please use Chrome.' );
            return;
        }
        if ( voiceListening ) {
            recognitionRef.current?.stop();
            setVoiceListening( false );
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onstart = () => setVoiceListening( true );
        recognition.onresult = ( event ) => {
            let finalText = '', interimText = '';
            for ( let i = event.resultIndex; i < event.results.length; i++ ) {
                if ( event.results[i].isFinal ) finalText += event.results[i][0].transcript;
                else interimText += event.results[i][0].transcript;
            }
            setVoiceTranscript( finalText || interimText );
            if ( finalText && formRef?.current ) {
                const el = formRef.current.querySelector( `[name="${voiceTarget}"]` );
                if ( el ) {
                    const proto = el.tagName === 'TEXTAREA'
                        ? window.HTMLTextAreaElement.prototype
                        : window.HTMLInputElement.prototype;
                    const setter = Object.getOwnPropertyDescriptor( proto, 'value' )?.set;
                    setter?.call( el, finalText.trim() );
                    el.dispatchEvent( new Event( 'input', { bubbles: true } ) );
                    el.dispatchEvent( new Event( 'change', { bubbles: true } ) );
                }
                setVoiceListening( false );
                setTimeout( () => setVoiceTranscript( '' ), 2500 );
            }
        };
        recognition.onerror = () => setVoiceListening( false );
        recognition.onend = () => setVoiceListening( false );
        recognitionRef.current = recognition;
        recognition.start();
    }, [voiceListening, voiceTarget, formRef] );

    // ── Reset ────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setFontSize( 100 );
        setContrast( 'normal' );
        setHighlight( false );
        setLineSpacing( 'normal' );
        setBigCursor( false );
        setDyslexiaFont( false );
        setHighlightLinks( false );
        setFocusOutline( false );
        stopSpeech();
        setSpeaking( false );
        document.body.style.fontSize = '';
        document.body.style.lineHeight = '';
    };

    // ── Escape key ───────────────────────────────────────────────────────────
    useEffect( () => {
        const onKey = ( e ) => { if ( e.key === 'Escape' ) setOpen( false ); };
        window.addEventListener( 'keydown', onKey );
        return () => window.removeEventListener( 'keydown', onKey );
    }, [] );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/* Floating trigger button — RIGHT side */}
            <button
                className="a11y-trigger"
                onClick={() => setOpen( v => !v )}
                aria-label="Open accessibility menu"
                aria-expanded={open}
                aria-controls="a11y-sidebar"
                title="Accessibility Options"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                    viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="12" cy="4" r="2" />
                    <path d="M19 9H5a1 1 0 0 0 0 2h5.5l-1.8 8.1a1 1 0 0 0 1.96.4L12 14l1.34 5.5a1 1 0 0 0 1.96-.4L13.5 11H19a1 1 0 0 0 0-2z" />
                </svg>
                <span className="a11y-trigger-label">Accessibility</span>
            </button>

            {/* Sidebar — slides from right, NO overlay */}
            <aside
                id="a11y-sidebar"
                className={`a11y-sidebar ${open ? 'a11y-sidebar--open' : ''}`}
                role="dialog"
                aria-modal="false"
                aria-label="Accessibility Options"
            >
                {/* Header */}
                <div className="a11y-sidebar__header">
                    <div className="a11y-sidebar__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
                            viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <circle cx="12" cy="4" r="2" />
                            <path d="M19 9H5a1 1 0 0 0 0 2h5.5l-1.8 8.1a1 1 0 0 0 1.96.4L12 14l1.34 5.5a1 1 0 0 0 1.96-.4L13.5 11H19a1 1 0 0 0 0-2z" />
                        </svg>
                        <span>Accessibility</span>
                    </div>
                    <button className="a11y-sidebar__close" onClick={() => setOpen( false )}
                        aria-label="Close accessibility menu">
                        <Icon d={ICONS.close} size={18} />
                    </button>
                </div>

                <div className="a11y-sidebar__body">

                    {/* ── 1. Text-to-Speech ── */}
                    <section className="a11y-section">
                        <h3 className="a11y-section__title">
                            <Icon d={ICONS.volume} size={16} /> Text to Speech
                        </h3>
                        <p className="a11y-section__desc">
                            Each word is highlighted with a yellow background and blue underline as it is spoken.
                        </p>
                        <button
                            className={`a11y-btn a11y-btn--primary ${speaking ? 'a11y-btn--speaking' : ''}`}
                            onClick={handleRead}
                            aria-pressed={speaking}
                            aria-label={speaking ? 'Stop reading' : 'Read page aloud'}
                        >
                            <Icon d={speaking ? ICONS.stop : ICONS.play} size={16} />
                            {speaking ? 'Stop Reading' : 'Read Page'}
                        </button>
                        {speaking && (
                            <div className="a11y-speaking-indicator" aria-live="polite">
                                <span className="a11y-speaking-dot" />
                                Reading word by word…
                            </div>
                        )}
                    </section>

                    {/* ── 2. Voice Input ── */}
                    <section className="a11y-section">
                        <h3 className="a11y-section__title">
                            <Icon d={ICONS.mic} size={16} /> Voice Input
                        </h3>
                        <p className="a11y-section__desc">
                            Choose a field, click <strong>Start Listening</strong>, speak — your words fill the field automatically.
                        </p>
                        <div className="a11y-voice-target">
                            <label htmlFor="a11y-voice-field" className="a11y-voice-target__label">Fill field:</label>
                            <select id="a11y-voice-field" className="a11y-select"
                                value={voiceTarget} onChange={e => setVoiceTarget( e.target.value )}
                                aria-label="Select form field to fill with voice">
                                <option value="name">Full Name</option>
                                <option value="email">Email Address</option>
                                <option value="description">Description</option>
                            </select>
                        </div>
                        <button
                            className={`a11y-btn a11y-btn--mic ${voiceListening ? 'a11y-btn--mic-active' : ''}`}
                            onClick={handleVoiceInput}
                            aria-pressed={voiceListening}
                            aria-label={voiceListening ? 'Stop listening' : 'Start voice input'}
                        >
                            <Icon d={ICONS.mic} size={16} />
                            {voiceListening ? 'Listening… click to stop' : 'Start Listening'}
                        </button>
                        {voiceTranscript && (
                            <div className="a11y-transcript" aria-live="polite">
                                <span className="a11y-transcript__label">Heard:</span> "{voiceTranscript}"
                            </div>
                        )}
                    </section>

                    {/* ── 3. Text Size ── */}
                    <section className="a11y-section">
                        <h3 className="a11y-section__title">
                            <Icon d={ICONS.textSize} size={16} /> Text Size
                        </h3>
                        <div className="a11y-font-btns">
                            {[
                                { label: 'A', size: 80, title: 'Small' },
                                { label: 'A', size: 100, title: 'Default' },
                                { label: 'A', size: 120, title: 'Large' },
                                { label: 'A', size: 150, title: 'X-Large' },
                                { label: 'A', size: 180, title: 'XX-Large' },
                            ].map( ( { label, size, title } ) => (
                                <button key={size}
                                    className={`a11y-font-btn ${fontSize === size ? 'a11y-font-btn--active' : ''}`}
                                    onClick={() => setFontSize( size )}
                                    aria-pressed={fontSize === size}
                                    title={title}
                                    style={{ fontSize: `${size * 0.1 + 8}px` }}>
                                    {label}
                                </button>
                            ) )}
                        </div>
                        <div className="a11y-row a11y-row--spread">
                            <button className="a11y-btn a11y-btn--icon"
                                onClick={() => setFontSize( v => Math.max( 70, v - 10 ) )}
                                aria-label="Decrease font size">A−</button>
                            <span className="a11y-value">{fontSize}%</span>
                            <button className="a11y-btn a11y-btn--icon"
                                onClick={() => setFontSize( v => Math.min( 200, v + 10 ) )}
                                aria-label="Increase font size">A+</button>
                        </div>
                        <input type="range" min="70" max="200" step="10" value={fontSize}
                            onChange={e => setFontSize( Number( e.target.value ) )}
                            className="a11y-slider" aria-label="Font size slider" />
                    </section>

                    {/* ── 4. Color Contrast ── */}
                    <section className="a11y-section">
                        <h3 className="a11y-section__title">
                            <Icon d={ICONS.contrast} size={16} /> Color Contrast
                        </h3>
                        <div className="a11y-contrast-grid">
                            {[
                                { id: 'normal', label: 'Default', bg: '#ffffff', fg: '#1a202c' },
                                { id: 'high', label: 'High Contrast', bg: '#000000', fg: '#ffff00' },
                                { id: 'dark', label: 'Dark Mode', bg: '#1e293b', fg: '#f1f5f9' },
                                { id: 'inverted', label: 'Inverted', bg: '#1a202c', fg: '#ffffff' },
                            ].map( ( { id, label, bg, fg } ) => (
                                <button key={id}
                                    className={`a11y-contrast-btn ${contrast === id ? 'a11y-contrast-btn--active' : ''}`}
                                    onClick={() => setContrast( id )}
                                    aria-pressed={contrast === id}
                                    style={{ '--cb-bg': bg, '--cb-fg': fg }}>
                                    <span className="a11y-contrast-btn__swatch" aria-hidden="true">Aa</span>
                                    <span className="a11y-contrast-btn__name">{label}</span>
                                </button>
                            ) )}
                        </div>
                    </section>

                    {/* ── 5. Line Spacing ── */}
                    <section className="a11y-section">
                        <h3 className="a11y-section__title">
                            <Icon d={ICONS.spacing} size={16} /> Line Spacing
                        </h3>
                        <div className="a11y-row">
                            {[
                                { id: 'normal', label: 'Normal' },
                                { id: 'wide', label: 'Wide' },
                                { id: 'extra', label: 'Extra' },
                            ].map( ( { id, label } ) => (
                                <button key={id}
                                    className={`a11y-btn ${lineSpacing === id ? 'a11y-btn--active' : ''}`}
                                    onClick={() => setLineSpacing( id )}
                                    aria-pressed={lineSpacing === id}>
                                    {label}
                                </button>
                            ) )}
                        </div>
                    </section>

                    {/* ── 6. Visual Aids ── */}
                    <section className="a11y-section">
                        <h3 className="a11y-section__title">Visual Aids</h3>
                        <div className="a11y-toggles">
                            {[
                                { label: 'Highlight on Hover', icon: ICONS.highlight, state: highlight, set: setHighlight },
                                { label: 'Big Cursor', icon: ICONS.cursor, state: bigCursor, set: setBigCursor },
                                { label: 'Dyslexia Font', icon: ICONS.dyslexia, state: dyslexiaFont, set: setDyslexiaFont },
                                { label: 'Highlight Links', icon: ICONS.link, state: highlightLinks, set: setHighlightLinks },
                                { label: 'Focus Outline', icon: ICONS.keyboard, state: focusOutline, set: setFocusOutline },
                            ].map( ( { label, icon, state, set } ) => (
                                <button key={label}
                                    className={`a11y-toggle ${state ? 'a11y-toggle--on' : ''}`}
                                    onClick={() => set( v => !v )}
                                    aria-pressed={state} role="switch">
                                    <span className="a11y-toggle__icon"><Icon d={icon} size={16} /></span>
                                    <span className="a11y-toggle__label">{label}</span>
                                    <span className="a11y-toggle__switch" aria-hidden="true">
                                        <span className="a11y-toggle__knob" />
                                    </span>
                                </button>
                            ) )}
                        </div>
                    </section>

                    {/* ── 7. Reset ── */}
                    <section className="a11y-section">
                        <button className="a11y-btn a11y-btn--reset" onClick={handleReset}
                            aria-label="Reset all accessibility settings">
                            <Icon d={ICONS.reset} size={16} /> Reset All Settings
                        </button>
                    </section>

                </div>
            </aside>
        </>
    );
};

export default AccessibilitySidebar;
