import React, { useState, useEffect } from 'react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';

interface Props {
    patient: any;
}

const SurgeryRecommendations: React.FC<Props> = ({ patient }) => {
    const { surgeries } = useConfig();
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

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Recomendaciones Pre y Post Quirúrgicas</h2>

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

            <PrintLayout patient={patient} title={`Recomendaciones: ${surgery || 'Procedimientos'}`}>
                <div style={{ fontSize: '0.8rem', lineHeight: '1.4', marginTop: '0.5rem', color: '#1f2937' }}>
                    {preText && (type === 'Ambas' || type === 'Preoperatorias') && (
                        <div className="recommendations-section" style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Instrucciones Preoperatorias</h3>
                            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.2rem', color: '#374151' }}>
                                {preText.split('\n').filter(line => line.trim()).map((line, i) => (
                                    <li key={i} style={{ marginBottom: '0.2rem' }}>{line.replace(/^\d+\.\s*/, '')}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {postText && (type === 'Ambas' || type === 'Postoperatorias') && (
                        <div className="recommendations-section" style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Instrucciones Postoperatorias</h3>
                            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.2rem', color: '#374151' }}>
                                {postText.split('\n').filter(line => line.trim()).map((line, i) => (
                                    <li key={i} style={{ marginBottom: '0.2rem' }}>{line.replace(/^\d+\.\s*/, '')}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!preText && !postText && (
                        <p>Seleccione o escriba las recomendaciones a imprimir.</p>
                    )}
                </div>
            </PrintLayout>
        </div>
    );
};

export default SurgeryRecommendations;
