import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, Loader2, ChevronDown, Copy, Check, Trash2 } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import Anthropic from '@anthropic-ai/sdk';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const client = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
});

const AIChat: React.FC = () => {
    const { knowledgeBase, surgeries, medications, labs, imaging, nutrition, consentTemplates, doctorName } = useConfig();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '¡Hola! Soy ARIA. Pregúntame lo que necesites sobre cirugías, precios, preoperatorio, postoperatorio o medicina estética.',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const QUICK = [
        { label: '🔪 Corporal', q: 'Resúmeme los procedimientos de cirugía corporal disponibles y cuándo se indica cada uno.' },
        { label: '🍑 Mamaria', q: 'Resúmeme los procedimientos de cirugía mamaria y cuándo se indica cada uno.' },
        { label: '😊 Facial', q: 'Resúmeme los procedimientos de cirugía facial disponibles.' },
        { label: '💉 Estética', q: 'Resúmeme los tratamientos de medicina estética disponibles.' },
        { label: '💰 Precios', q: 'Dame un resumen de los rangos de precios de las cirugías más solicitadas.' },
        { label: '🏥 Pre-op', q: '¿Qué debe saber un paciente antes de una cirugía? Cuidados preoperatorios generales.' },
        { label: '🌿 Post-op', q: '¿Qué debe saber un paciente después de una cirugía? Cuidados postoperatorios generales.' },
        { label: '❓ Objeciones', q: '¿Cómo responder cuando un paciente dice que el precio está muy caro?' },
    ];

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleClear = () => {
        setMessages([{
            id: '1',
            role: 'assistant',
            content: '¡Hola! Soy ARIA. Pregúntame lo que necesites sobre cirugías, precios, preoperatorio, postoperatorio o medicina estética.',
            timestamp: new Date()
        }]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const buildSystemPrompt = (): string => {
        const lines: string[] = [
            `Eres ARIA, asistente IA interna de 440 Clinic by ${doctorName || 'Dr. Giovanni Fuentes'}.`,
            `Tu usuario es una ASESORA COMERCIAL, no un paciente. Hablas con ella, no con el paciente.`,
            ``,
            `REGLAS DE RESPUESTA — CRÍTICAS:`,
            `- Sé ULTRA BREVE. Máximo 4-5 líneas por respuesta.`,
            `- Usa viñetas (•) para listar. NUNCA párrafos largos.`,
            `- Ve directo al dato útil. Sin saludos, sin introducción, sin relleno.`,
            `- Si la pregunta es simple, responde en 1-2 líneas máximo.`,
            `- Responde siempre en español.`,
            `- Nunca inventes precios. Si hay rango en la base, dalo directo.`,
            `- La indicación quirúrgica final siempre la define el Dr. Gio en valoración.`,
            `- Si no tienes el dato exacto: "Confirmar en valoración con el Dr. Gio."`,
            ``,
            `TU ROL: Darle a la asesora respuestas rápidas y concretas para que pueda`,
            `contestar al paciente al instante, sin perder tiempo buscando.`,
            ``,
        ];

        if (knowledgeBase.length > 0) {
            lines.push('=== BASE DE CONOCIMIENTO ===');
            knowledgeBase.forEach(item => {
                lines.push(`\n[${item.category?.toUpperCase() || 'INFO'}] ${item.title}:`);
                lines.push(item.content);
            });
            lines.push('');
        }

        if (surgeries.length > 0) {
            lines.push('=== PROCEDIMIENTOS QUIRÚRGICOS ===');
            surgeries.forEach(s => {
                lines.push(`\n${s.name}:`);
                if (s.preText) lines.push(`Pre-operatorio: ${s.preText}`);
                if (s.postText) lines.push(`Post-operatorio: ${s.postText}`);
            });
            lines.push('');
        }

        if (medications.length > 0) {
            lines.push('=== MEDICAMENTOS FRECUENTES ===');
            medications.forEach(m => {
                lines.push(`${m.name} ${m.dosage} - ${m.frequency} - ${m.duration}. ${m.indications}`);
            });
            lines.push('');
        }

        if (labs.length > 0) {
            lines.push('=== EXÁMENES DE LABORATORIO ===');
            labs.forEach(l => {
                lines.push(`${l.name}: ${l.indications}`);
            });
            lines.push('');
        }

        if (imaging.length > 0) {
            lines.push('=== IMÁGENES DIAGNÓSTICAS ===');
            imaging.forEach(i => {
                lines.push(`${i.name} - Razón: ${i.reason} - Formato: ${i.format}`);
            });
            lines.push('');
        }

        if (nutrition.length > 0) {
            lines.push('=== FASES DE NUTRICIÓN POST-OPERATORIA ===');
            nutrition.forEach(n => {
                lines.push(`${n.name}: ${n.desc}`);
            });
            lines.push('');
        }

        if (consentTemplates.length > 0) {
            lines.push('=== PROCEDIMIENTOS CON CONSENTIMIENTO ===');
            consentTemplates.forEach(c => {
                lines.push(`- ${c.name}`);
            });
            lines.push('');
        }

        return lines.join('\n');
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const conversationHistory = messages
                .filter(m => m.id !== '1')
                .map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                }));

            conversationHistory.push({ role: 'user', content: currentInput });

            const response = await client.messages.create({
                model: 'claude-haiku-4-5',
                max_tokens: 350,
                system: buildSystemPrompt(),
                messages: conversationHistory,
            });

            const text = response.content.find(b => b.type === 'text')?.text || 'No pude procesar tu solicitud.';

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date()
            }]);
        } catch (err: any) {
            console.error('AI Error:', err);
            const errorMsg = err?.message?.includes('API key')
                ? 'API key no configurada. Agrega VITE_ANTHROPIC_API_KEY en el archivo .env'
                : 'No pude conectarme al asistente en este momento. Intenta de nuevo.';
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: errorMsg,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-chat-container no-print" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
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

            {isOpen && (
                <div style={{
                    width: '420px', height: '600px',
                    background: 'var(--surface)', borderRadius: '20px',
                    boxShadow: 'var(--glass-shadow)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    border: '1px solid var(--border-color)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.25rem', background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
                        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                                <Bot size={18} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>ARIA — Asesora Comercial</h4>
                                <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>440 Clinic · Haiku · Base cargada</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button onClick={handleClear} title="Limpiar chat" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', padding: '0.35rem' }}>
                                <Trash2 size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <ChevronDown size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Quick category buttons — always visible */}
                    <div style={{ padding: '0.6rem 0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                        {QUICK.map(q => (
                            <button
                                key={q.label}
                                onClick={() => { setInput(q.q); }}
                                style={{
                                    padding: '0.25rem 0.65rem', borderRadius: '20px',
                                    background: 'var(--surface)', border: '1px solid var(--border-color)',
                                    fontSize: '0.72rem', color: 'var(--primary)', cursor: 'pointer',
                                    whiteSpace: 'nowrap', fontWeight: 600
                                }}
                            >
                                {q.label}
                            </button>
                        ))}
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--bg-color)' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: '0.2rem'
                            }}>
                                <div style={{
                                    padding: '0.7rem 0.95rem', borderRadius: '14px',
                                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    fontSize: '0.88rem', lineHeight: '1.5',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {msg.content.split('\n').map((line, i) => <div key={i}>{line || <br />}</div>)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <span style={{ fontSize: '0.63rem', color: '#94a3b8' }}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.role === 'assistant' && (
                                        <button
                                            onClick={() => handleCopy(msg.id, msg.content)}
                                            title="Copiar respuesta"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === msg.id ? '#22c55e' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', padding: '0.1rem 0.3rem', borderRadius: '6px' }}
                                        >
                                            {copiedId === msg.id ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--surface)', padding: '0.7rem 1rem', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Loader2 size={15} className="animate-spin" style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ARIA está pensando...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            style={{
                                flex: 1, border: '1px solid var(--border-color)', borderRadius: '10px',
                                padding: '0.7rem 0.9rem', outline: 'none', fontSize: '0.88rem',
                                background: 'var(--bg-color)', color: 'var(--text-main)'
                            }}
                            placeholder="Escribe tu pregunta..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            style={{
                                padding: '0.7rem 0.9rem', background: 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: '10px', cursor: 'pointer',
                                opacity: !input.trim() || isLoading ? 0.5 : 1, transition: 'opacity 0.2s'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;
