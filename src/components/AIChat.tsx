import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, Loader2, ChevronDown } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { supabase } from '../lib/supabase';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const AIChat: React.FC = () => {
    const { knowledgeBase } = useConfig();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '¡Hola! Soy el asistente de 440 Clinic. ¿En qué puedo ayudarte hoy con información de cirugías o protocolos?',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('ai-chat', {
                body: { query: input }
            });

            if (error) throw error;

            const assistantMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.answer || "No pude procesar tu solicitud en este momento.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            console.error('AI Error:', err);
            // Fallback for demo if function not deployed
            const response = simulateAIResponse(input, knowledgeBase);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Simple keyword-based search to simulate RAG until the real API is connected
    const simulateAIResponse = (query: string, data: any[]): string => {
        const lowerQuery = query.toLowerCase();

        // Find relevant items
        const relevantItems = data.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.content.toLowerCase().split(' ').some((word: string) => word.length > 4 && lowerQuery.includes(word.toLowerCase()))
        );

        if (relevantItems.length > 0) {
            const bestMatch = relevantItems[0];
            return `Basado en el protocolo de "${bestMatch.title}":\n\n${bestMatch.content}\n\n¿Necesitas más detalles sobre esto?`;
        }

        return "Lo siento, no encontré información específica sobre eso en mi base de datos actual. ¿Podrías ser más específico o verificar si el protocolo está cargado en Configuración?";
    };

    return (
        <div className="ai-chat-container no-print" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
            {/* Chat Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px', height: '60px', borderRadius: '30px',
                        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                        color: 'white', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <div style={{ position: 'relative' }}>
                        <MessageSquare size={28} />
                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></span>
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '380px', height: '550px',
                    background: 'var(--surface)', borderRadius: '20px',
                    boxShadow: 'var(--glass-shadow)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem', background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem' }}>Asistente 440</h4>
                                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Conectado a la Base del Conocimiento</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <ChevronDown size={24} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-color)' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', display: 'flex', flexDirection: 'column',
                                gap: '0.25rem'
                            }}>
                                <div style={{
                                    padding: '0.75rem 1rem', borderRadius: '15px',
                                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    fontSize: '0.9rem', lineHeight: '1.4',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {msg.content.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '15px', border: '1px solid var(--border-color)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick suggestions */}
                    {messages.length === 1 && (
                        <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', background: 'var(--bg-color)' }}>
                            {['Lipo', 'Renuvion', 'Post-operatorio'].map(tip => (
                                <button
                                    key={tip}
                                    onClick={() => setInput(tip)}
                                    style={{ padding: '0.3rem 0.8rem', borderRadius: '15px', background: 'var(--surface)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--primary)', whiteSpace: 'nowrap', cursor: 'pointer' }}
                                >
                                    {tip}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            style={{
                                flex: 1, border: '1px solid var(--border-color)', borderRadius: '10px',
                                padding: '0.75rem', outline: 'none', fontSize: '0.9rem',
                                background: 'var(--bg-color)', color: 'var(--text-main)'
                            }}
                            placeholder="Pregúntale a la IA..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            style={{
                                padding: '0.75rem', background: 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: '10px', cursor: 'pointer',
                                opacity: !input.trim() || isLoading ? 0.5 : 1
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;
