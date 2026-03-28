import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { ExternalLink, Copy, Search, Check, Image as ImageIcon } from 'lucide-react';

const SurgeryResults: React.FC = () => {
    const { surgeryResults } = useConfig();
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredResults = surgeryResults.filter(result =>
        result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopy = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="tool-view no-print">
            <div className="form-section" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="form-label" style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                            Resultados de Cirugías
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Comparte resultados de Antes & Después mediante nuestras landing pages especializadas.
                        </p>
                    </div>

                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Buscar cirugía..."
                            style={{ paddingLeft: '40px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredResults.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-color)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                        <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem', color: 'var(--primary)' }} />
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 500 }}>
                            {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay resultados configurados aún.'}
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Puedes gestionar los enlaces desde Configuración &gt; Resultados.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {filteredResults.map((item) => (
                            <div key={item.id} className="item-card" style={{
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                gap: '1rem',
                                padding: '1.5rem',
                                background: 'var(--surface)',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'default'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <ImageIcon size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a2e' }}>{item.name}</h3>
                                        {item.description && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</p>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button
                                        className="action-btn primary"
                                        style={{ flex: 2, justifyContent: 'center' }}
                                        onClick={() => window.open(item.url, '_blank')}
                                    >
                                        <ExternalLink size={16} /> Ver Landing
                                    </button>
                                    <button
                                        className="action-btn"
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            backgroundColor: copiedId === item.id ? '#f0fdf4' : '',
                                            borderColor: copiedId === item.id ? '#22c55e' : '',
                                            color: copiedId === item.id ? '#15803d' : ''
                                        }}
                                        onClick={() => handleCopy(item.url, item.id)}
                                    >
                                        {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                                        <span>{copiedId === item.id ? 'Copiado' : 'Copiar'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .item-card:hover {
                    border-color: var(--primary);
                }
                .primary-light {
                    background-color: rgba(var(--primary-rgb), 0.1);
                }
            `}</style>
        </div>
    );
};

export default SurgeryResults;
