import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const commands = [
        { id: 'dashboard', label: 'Dashboard', path: '/', keywords: ['home', 'overview'] },
        { id: 'stocks', label: 'US Stocks', path: '/stocks', keywords: ['trade', 'equity', 'market'] },
        { id: 'crypto', label: 'Crypto & Polymarket', path: '/crypto', keywords: ['bitcoin', 'eth', 'prediction'] },
        { id: 'agents', label: 'AI Agents', path: '/agents', keywords: ['bot', 'automation', 'ai'] },
        { id: 'settings', label: 'Settings', path: '/settings', keywords: ['config', 'preferences'] },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords.some(k => k.includes(query.toLowerCase()))
    );

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
                navigate(filteredCommands[selectedIndex].path);
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, navigate, onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '15vh'
            }}
            onClick={onClose}
        >
            <div
                className="glass-panel"
                style={{
                    width: '600px',
                    maxWidth: '90vw',
                    padding: 0,
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--glass-border)'
                }}>
                    <Command size={20} style={{ color: 'var(--accent-primary)' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Type a command or search..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                    <kbd style={{
                        padding: '2px 6px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)'
                    }}>ESC</kbd>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredCommands.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No commands found
                        </div>
                    ) : (
                        filteredCommands.map((cmd, index) => (
                            <div
                                key={cmd.id}
                                onClick={() => {
                                    navigate(cmd.path);
                                    onClose();
                                }}
                                style={{
                                    padding: '12px 20px',
                                    cursor: 'pointer',
                                    background: index === selectedIndex ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    borderLeft: index === selectedIndex ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontWeight: 500 }}>{cmd.label}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {cmd.keywords.join(', ')}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    gap: '20px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                }}>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '2px' }}>↑↓</kbd> Navigate</span>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '2px' }}>Enter</kbd> Select</span>
                    <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '2px' }}>ESC</kbd> Close</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
