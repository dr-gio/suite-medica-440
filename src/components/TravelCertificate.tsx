import React, { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const TravelCertificate: React.FC<Props> = ({ patient }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [restrictions, setRestrictions] = useState('Ninguna, paciente apto para viaje regular.');
    const [templateText, setTemplateText] = useState(
        'Por medio de la presente certifico que he examinado clínica y físicamente al paciente referenciado, encontrándose en buenas condiciones generales de salud al momento de la evaluación.\n\nEl/la paciente no padece actualmente de enfermedades infectocontagiosas agudas ni presenta condiciones médicas que contraindiquen su traslado por vía aérea o terrestre comercial, por lo cual se considera APTO/A para viajar.'
    );

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `CertificadoViaje_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Certificado Médico de Viaje</h2>
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

            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title="Certificado Médico de Viaje">
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', textAlign: 'justify', color: '#111827', fontSize: '10pt' }}>
                        <p style={{ fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', fontSize: '11pt', color: '#1f2937' }}>A QUIEN INTERESE:</p>

                        {templateText.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                            <p key={idx} style={{ marginBottom: '0.75rem', textIndent: '2rem' }}>{paragraph}</p>
                        ))}

                        <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '1rem 0' }}>
                            <h4 style={{ color: '#2563eb', marginBottom: '0.5rem', borderBottom: '1px solid #bfdbfe', paddingBottom: '0.2rem', fontFamily: 'Outfit, sans-serif', fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detalles del Viaje y Permisos</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem', fontSize: '10pt' }}>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                                    <strong>Restricciones de Traslado:</strong> <span>{restrictions}</span>
                                </div>
                            </div>
                        </div>

                        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '9pt' }}>
                            Este certificado se expide a solicitud del paciente para los fines pertinentes.
                        </p>
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

export default TravelCertificate;
