import { useState, useRef, useCallback } from 'react';

/**
 * useSpeechRecognition
 * Returns { listening, transcript, startListening, stopListening, supported }
 *
 * @param {function} onResult  - called with the final transcript string
 * @param {function} onError   - called with an error message string
 */
const useSpeechRecognition = ( { onResult, onError } = {} ) => {
    const [listening, setListening] = useState( false );
    const [transcript, setTranscript] = useState( '' );
    const recognitionRef = useRef( null );

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    const supported = Boolean( SpeechRecognition );

    const startListening = useCallback( () => {
        if ( !supported ) {
            onError?.( 'Speech recognition is not supported in this browser.' );
            return;
        }

        if ( recognitionRef.current ) {
            recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setListening( true );

        recognition.onresult = ( event ) => {
            let interim = '';
            let final = '';
            for ( let i = event.resultIndex; i < event.results.length; i++ ) {
                const result = event.results[i];
                if ( result.isFinal ) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }
            setTranscript( final || interim );
            if ( final ) {
                onResult?.( final.trim() );
            }
        };

        recognition.onerror = ( event ) => {
            setListening( false );
            onError?.( event.error || 'Speech recognition error' );
        };

        recognition.onend = () => {
            setListening( false );
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [supported, onResult, onError, SpeechRecognition] );

    const stopListening = useCallback( () => {
        recognitionRef.current?.stop();
        setListening( false );
    }, [] );

    return { listening, transcript, startListening, stopListening, supported };
};

export default useSpeechRecognition;
