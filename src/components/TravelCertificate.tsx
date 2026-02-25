import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

interface Props {
    patient: any;
}

const TravelCertificate: React.FC<Props> = ({ patient }) => {
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [restrictions, setRestrictions] = useState('Ninguna, paciente apto para viaje regular.');
    const [templateText, setTemplateText] = useState(
        'Por medio de la presente certifico que he examinado clínica y físicamente al paciente referenciado, encontrándose en buenas condiciones generales de salud al momento de la evaluación.\n\nEl/la paciente no padece actualmente de enfermedades infectocontagiosas agudas ni presenta condiciones médicas que contraindiquen su traslado por vía aérea o terrestre comercial, por lo cual se considera APTO/A para viajar.'
    );

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Certificado Médico de Viaje</h2>

                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Destino (Opcional)</label>
                        <input type="text" placeholder="Ej: Madrid, España" className="form-input" value={destination} onChange={(e) => setDestination(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Fecha del Viaje (Opcional)</label>
                        <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Restricciones / Cuidos Especiales</label>
                    <input className="form-input" placeholder="Ej: Requiere movilización asistida / Silla de Ruedas..." value={restrictions} onChange={(e) => setRestrictions(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Texto del Certificado (Editable)</label>
                    <textarea className="form-input" style={{ minHeight: '150px' }} value={templateText} onChange={(e) => setTemplateText(e.target.value)} />
                </div>
            </div>

            <PrintLayout patient={patient} title="Certificado Médico de Viaje">
                <div style={{ fontSize: '0.45rem', lineHeight: '1.05', marginTop: '0.05rem', textAlign: 'justify', color: '#111827' }}>
                    <p style={{ fontWeight: 600, textAlign: 'center', marginBottom: '0.3rem', fontSize: '0.5rem' }}>A QUIEN INTERESE:</p>

                    {templateText.split('\n').map((paragraph, idx) => (
                        <p key={idx} style={{ marginBottom: '0.15rem', textIndent: '1rem' }}>{paragraph}</p>
                    ))}

                    <div style={{ backgroundColor: '#f9fafb', padding: '0.3rem', borderRadius: '8px', border: '1px solid #e5e7eb', margin: '0.3rem 0' }}>
                        <h4 style={{ color: '#2563eb', marginBottom: '0.15rem', borderBottom: '1px solid #bfdbfe', paddingBottom: '0.1rem', fontFamily: 'Outfit, sans-serif', fontSize: '0.45rem' }}>Detalles del Viaje y Permisos</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.15rem' }}>
                            {destination && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Destino Registrado:</strong> <span>{destination}</span>
                                </div>
                            )}
                            {date && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Fecha de Vuelo / Viaje:</strong> <span>{new Date(date).toLocaleDateString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem' }}>
                                <strong>Restricciones de Traslado:</strong> <span>{restrictions}</span>
                            </div>
                        </div>
                    </div>

                    <p style={{ marginTop: '0.25rem', textAlign: 'center', color: '#4b5563', fontStyle: 'italic', fontSize: '0.4rem' }}>
                        Este certificado se expide a solicitud del paciente para los fines pertinentes.
                    </p>
                </div>
            </PrintLayout>
        </div>
    );
};

export default TravelCertificate;
