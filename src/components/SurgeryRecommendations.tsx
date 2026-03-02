import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const SurgeryRecommendations: React.FC<Props> = ({ patient }) => {
    const { surgeries } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [surgery, setSurgery] = useState('');
    const [preText, setPreText] = useState('');
    const [postText, setPostText] = useState('');
    const [type, setType] = useState('Ambas'); // Ambas, Preoperatorias, Postoperatorias

    // Load template when surgery selected
    useEffect(() => {
        const match = surgeries.find(s => s.name === surgery);
        if (match) {
            setPreText(match.preText);
            setPostText(match.postText);
        } else if (surgery === '') {
            setPreText('');
            setPostText('');
        }
    }, [surgery, surgeries]);

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Recomendaciones_${surgery || 'Cirugia'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Recomendaciones Pre y Post Quirúrgicas</h2>
                    <button
                        className="action-btn primary"
                        onClick={handleDownload}
                        disabled={downloading}
                        style={{ borderRadius: '8px', padding: '0.6rem 1rem' }}
                    >
                        {downloading ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                        <span>{downloading ? 'Generando...' : 'Descargar PDF'}</span>
                    </button>
                </div>

                <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                        <label className="form-label">Procedimiento Quirúrgico (Plantilla Rápida)</label>
                        <select className="form-input" value={surgery} onChange={(e) => setSurgery(e.target.value)}>
                            <option value="">-- Seleccionar Procedimiento --</option>
                            {surgeries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            <option value="custom">-- Otro (Personalizado) --</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tipo de Recomendación</label>
                        <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="Ambas">Pre y Postoperatorias</option>
                            <option value="Preoperatorias">Solo Preoperatorias</option>
                            <option value="Postoperatorias">Solo Postoperatorias</option>
                        </select>
                    </div>
                </div>

                {(type === 'Ambas' || type === 'Preoperatorias') && (
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Instrucciones Preoperatorias</label>
                        <textarea
                            className="form-input"
                            value={preText}
                            onChange={(e) => setPreText(e.target.value)}
                            placeholder="Indíquele al paciente qué debe hacer antes de la operación..."
                        />
                    </div>
                )}

                {(type === 'Ambas' || type === 'Postoperatorias') && (
                    <div className="form-group">
                        <label className="form-label">Instrucciones Postoperatorias</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '150px' }}
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="Escriba los cuidados posteriores a la cirugía..."
                        />
                    </div>
                )}
            </div>

            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title={`RECOMENDACIONES: ${surgery.toUpperCase() || 'PROCEDIMIENTOS'}`}>
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', color: '#1f2937', fontSize: '10pt' }}>
                        {preText && (type === 'Ambas' || type === 'Preoperatorias') && (
                            <div className="recommendations-section" style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#f8fafc' }}>
                                <h3 style={{ fontSize: '11pt', marginBottom: '0.75rem', color: '#2563eb', fontWeight: 700, borderBottom: '1px solid #bfdbfe', paddingBottom: '0.25rem' }}>INSTRUCCIONES PREOPERATORIAS</h3>
                                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#1f2937' }}>
                                    {preText.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{line.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {postText && (type === 'Ambas' || type === 'Postoperatorias') && (
                            <div className="recommendations-section" style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                                <h3 style={{ fontSize: '11pt', marginBottom: '0.75rem', color: '#10b981', fontWeight: 700, borderBottom: '1px solid #a7f3d0', paddingBottom: '0.25rem' }}>INSTRUCCIONES POSTOPERATORIAS</h3>
                                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#1f2937' }}>
                                    {postText.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{line.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!preText && !postText && (
                            <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>No hay recomendaciones redactadas todavía.</p>
                        )}
                    </div>
                </PrintLayout>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SurgeryRecommendations;
