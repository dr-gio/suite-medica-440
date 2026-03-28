import React, { useState, useEffect, useRef } from 'react';
import { Delete } from 'lucide-react';

const PIN_STORAGE_KEY = 'suiteMedicaPin';
const DRGIO_PIN_STORAGE_KEY = 'suiteMedicaDrGioPin';
const DEFAULT_PIN = '440440';
const DEFAULT_DRGIO_PIN = '048231';
const PIN_LENGTH = 6;
// How many minutes before the app auto-locks again
const LOCK_TIMEOUT_MINUTES = 30;

export const getStoredPin = (): string => {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
};

export const setStoredPin = (pin: string) => {
    localStorage.setItem(PIN_STORAGE_KEY, pin);
};

export const getStoredDrGioPin = (): string => {
    return localStorage.getItem(DRGIO_PIN_STORAGE_KEY) || DEFAULT_DRGIO_PIN;
};

export const setStoredDrGioPin = (pin: string) => {
    localStorage.setItem(DRGIO_PIN_STORAGE_KEY, pin);
};

interface PinLockProps {
    onUnlock: () => void;
}

const PinLock: React.FC<PinLockProps> = ({ onUnlock }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleDigit = (digit: string) => {
        if (input.length >= PIN_LENGTH) return;
        const next = input + digit;
        setInput(next);
        setError(false);
        if (next.length === PIN_LENGTH) {
            setTimeout(() => validate(next), 120);
        }
    };

    const handleDelete = () => {
        setInput(prev => prev.slice(0, -1));
        setError(false);
    };

    const validate = (pin: string) => {
        const stored = getStoredPin();
        const storedDrGio = getStoredDrGioPin();
        
        if (pin === stored || pin === storedDrGio) {
            localStorage.setItem('suiteMedicaUnlockedAt', Date.now().toString());
            localStorage.setItem('isDrGio', (pin === storedDrGio).toString());
            onUnlock();
        } else {
            setError(true);
            setShake(true);
            setTimeout(() => { setShake(false); setInput(''); }, 600);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
        else if (e.key === 'Backspace') handleDelete();
    };

    const dots = Array.from({ length: PIN_LENGTH }, (_, i) => i < input.length);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif"
        }}>
            {/* Logo / Brand */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
                    440 <span style={{ color: '#60a5fa' }}>Clinic</span>
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '1rem' }}>Suite Médica · Dr. Giovanni Fuentes</p>
            </div>

            {/* PIN Card */}
            <div style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '2.5rem 2rem',
                width: '90%', maxWidth: '360px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                animation: shake ? 'shake 0.5s ease' : 'none',
            }}>
                <p style={{ color: '#cbd5e1', textAlign: 'center', marginBottom: '2rem', fontSize: '1.05rem', fontWeight: 500 }}>
                    Ingresa tu PIN de 6 dígitos
                </p>

                {/* Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    {dots.map((filled, i) => (
                        <div key={i} style={{
                            width: '18px', height: '18px', borderRadius: '50%',
                            background: error ? '#ef4444' : filled ? '#60a5fa' : 'rgba(255,255,255,0.15)',
                            border: `2px solid ${error ? '#ef4444' : filled ? '#3b82f6' : 'rgba(255,255,255,0.25)'}`,
                            transition: 'all 0.15s ease',
                            transform: filled ? 'scale(1.1)' : 'scale(1)',
                        }} />
                    ))}
                </div>

                {error && (
                    <p style={{ color: '#f87171', textAlign: 'center', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                        PIN incorrecto. Inténtalo de nuevo.
                    </p>
                )}

                {/* Hidden input for keyboard on mobile */}
                <input
                    ref={inputRef}
                    type="number"
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    onKeyDown={handleKeyDown}
                    onChange={() => { }}
                    value={input}
                    inputMode="numeric"
                />

                {/* Keypad */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.5rem' }}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, idx) => {
                        if (key === '') return <div key={idx} />;
                        return (
                            <button
                                key={idx}
                                onClick={() => key === '⌫' ? handleDelete() : handleDigit(key)}
                                style={{
                                    padding: '1.1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    background: key === '⌫' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    fontSize: '1.4rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = key === '⌫' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.18)')}
                                onMouseLeave={e => (e.currentTarget.style.background = key === '⌫' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)')}
                            >
                                {key === '⌫' ? <Delete size={20} /> : key}
                            </button>
                        );
                    })}
                </div>
            </div>

            <p style={{ color: '#475569', marginTop: '2rem', fontSize: '0.8rem' }}>
                PIN por defecto: 440440
            </p>

            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
        </div>
    );
};

// Hook to check if the session is still valid
export const useAutoLock = (): { locked: boolean; lock: () => void } => {
    const checkLocked = () => {
        const ts = localStorage.getItem('suiteMedicaUnlockedAt');
        if (!ts) return true;
        const elapsed = (Date.now() - parseInt(ts)) / 1000 / 60;
        return elapsed >= LOCK_TIMEOUT_MINUTES;
    };

    const [locked, setLocked] = useState(checkLocked);

    useEffect(() => {
        const interval = setInterval(() => {
            if (checkLocked()) setLocked(true);
        }, 60_000); // check every minute
        return () => clearInterval(interval);
    }, []);

    const lock = () => {
        localStorage.removeItem('suiteMedicaUnlockedAt');
        setLocked(true);
    };

    return { locked, lock };
};

export default PinLock;
