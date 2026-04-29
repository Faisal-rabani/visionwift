import React, { useState, forwardRef, useCallback } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import './ContactForm.css';

// ── Mic icon ─────────────────────────────────────────────────────────────────
const MicIcon = ( { active } ) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" className={active ? 'mic-pulse' : ''}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

// ── Single field with inline voice button ─────────────────────────────────────
const VoiceField = ( { id, label, type = 'text', value, onChange, placeholder, multiline, required } ) => {
    const [activeField, setActiveField] = useState( false );

    const { listening, startListening, stopListening, supported } = useSpeechRecognition( {
        onResult: ( text ) => {
            onChange( multiline ? ( value ? value + ' ' + text : text ) : text );
            setActiveField( false );
        },
        onError: () => setActiveField( false ),
    } );

    const handleMic = () => {
        if ( listening ) { stopListening(); setActiveField( false ); }
        else { setActiveField( true ); startListening(); }
    };

    const inputProps = {
        id,
        name: id,
        value,
        // Accept both React synthetic events AND native input events (from sidebar voice)
        onChange: ( e ) => onChange( e.target.value ),
        onInput: ( e ) => onChange( e.target.value ),
        placeholder,
        required,
        'aria-required': required,
        className: `cf-input ${listening && activeField ? 'cf-input--listening' : ''}`,
    };

    return (
        <div className="cf-field">
            <label htmlFor={id} className="cf-label">
                {label}
                {required && <span className="cf-required" aria-hidden="true"> *</span>}
            </label>
            <div className="cf-input-wrap">
                {multiline
                    ? <textarea {...inputProps} rows={5} />
                    : <input   {...inputProps} type={type} />
                }
                {supported && (
                    <button
                        type="button"
                        className={`cf-mic-btn ${listening && activeField ? 'cf-mic-btn--active' : ''}`}
                        onClick={handleMic}
                        aria-label={listening && activeField ? `Stop voice input for ${label}` : `Speak to fill ${label}`}
                        aria-pressed={listening && activeField}
                        title={listening && activeField ? 'Stop recording' : 'Speak to fill this field'}
                    >
                        <MicIcon active={listening && activeField} />
                        <span className="cf-mic-label">
                            {listening && activeField ? 'Stop' : 'Speak'}
                        </span>
                    </button>
                )}
            </div>
            {listening && activeField && (
                <p className="cf-listening-hint" role="status" aria-live="polite">
                    🎙 Listening… speak now
                </p>
            )}
        </div>
    );
};

// ── Main form ─────────────────────────────────────────────────────────────────
const ContactForm = forwardRef( function ContactForm( _, ref ) {
    const [fields, setFields] = useState( { name: '', email: '', description: '' } );
    const [submitted, setSubmitted] = useState( false );
    const [errors, setErrors] = useState( {} );

    const set = useCallback( ( key ) => ( val ) => setFields( f => ( { ...f, [key]: val } ) ), [] );

    const validate = () => {
        const e = {};
        if ( !fields.name.trim() ) e.name = 'Name is required.';
        if ( !fields.email.trim() ) {
            e.email = 'Email is required.';
        } else if ( !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( fields.email ) ) {
            e.email = 'Please enter a valid email address.';
        }
        if ( !fields.description.trim() ) e.description = 'Description is required.';
        return e;
    };

    const handleSubmit = ( e ) => {
        e.preventDefault();
        const errs = validate();
        if ( Object.keys( errs ).length ) { setErrors( errs ); return; }
        setErrors( {} );
        setSubmitted( true );
    };

    if ( submitted ) {
        return (
            <div className="cf-success" role="alert" ref={ref}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                    viewBox="0 0 24 24" fill="none" stroke="#16a34a"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3>Message Sent!</h3>
                <p>Thank you, <strong>{fields.name}</strong>. We'll be in touch at <strong>{fields.email}</strong>.</p>
                <button className="cf-btn cf-btn--outline"
                    onClick={() => { setSubmitted( false ); setFields( { name: '', email: '', description: '' } ); }}>
                    Send Another
                </button>
            </div>
        );
    }

    return (
        <section className="cf-wrapper" ref={ref} aria-labelledby="form-heading">
            <div className="cf-card">
                <div className="cf-card__header">
                    <h2 id="form-heading" className="cf-card__title">Get in Touch</h2>
                    <p className="cf-card__subtitle">
                        Fill in the form below, use the <strong>microphone button</strong> next to each field,
                        or use <strong>Voice Input</strong> in the accessibility panel on the right.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="cf-form">
                    <VoiceField id="name" label="Full Name"
                        value={fields.name} onChange={set( 'name' )}
                        placeholder="e.g. Jane Smith" required />
                    {errors.name && <p className="cf-error" role="alert">{errors.name}</p>}

                    <VoiceField id="email" label="Email Address" type="email"
                        value={fields.email} onChange={set( 'email' )}
                        placeholder="e.g. jane@example.com" required />
                    {errors.email && <p className="cf-error" role="alert">{errors.email}</p>}

                    <VoiceField id="description" label="Description"
                        value={fields.description} onChange={set( 'description' )}
                        placeholder="Tell us how we can help…" multiline required />
                    {errors.description && <p className="cf-error" role="alert">{errors.description}</p>}

                    <button type="submit" className="cf-btn cf-btn--primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Send Message
                    </button>
                </form>
            </div>
        </section>
    );
} );

export default ContactForm;
