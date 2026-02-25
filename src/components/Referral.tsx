import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

interface Props {
    patient: any;
}

const Referral: React.FC<Props> = ({ patient }) => {
    const [specialty, setSpecialty] = useState('');
    const [doctor, setDoctor] = useState('');
    const [dx, setDx] = useState('');
    const [summary, setSummary] = useState('');

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Remisión a Especialista</h2>

                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Especialidad Requerida</label>
                        <input type="text" placeholder="Ej: Cardiología" className="form-input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Médico Tratante / Derivado (Opcional)</label>
                        <input type="text" placeholder="Ej: Dr. Pérez" className="form-input" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Impresión Diagnóstica / CIE-10</label>
                    <input className="form-input" placeholder="Ej: Hipertensión en estudio" value={dx} onChange={(e) => setDx(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Resumen de Historia Clínica y Motivo</label>
                    <textarea
                        className="form-input"
                        style={{ minHeight: '180px' }}
                        placeholder="Paciente acude a consulta por cuadro clínico de X tiempo de evolución..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                    />
                </div>
            </div>

            <PrintLayout patient={patient} title="Interconsulta / Remisión Médica">
                <div style={{ fontSize: '0.8rem', lineHeight: '1.4', marginTop: '0.5rem', color: '#1f2937' }}>

                    <div style={{ padding: '0.6rem', borderLeft: '3px solid #2563eb', backgroundColor: '#eff6ff', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#1d4ed8' }}>Derivación para Especialidad:</h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0', color: '#1e3a8a' }}>{specialty || '_________________________'}</p>
                        {doctor && <p style={{ margin: 0, color: '#4b5563' }}>A la atención del <strong>{doctor}</strong></p>}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>Impresión Diagnóstica</h4>
                        <div style={{ backgroundColor: '#f9fafb', padding: '0.6rem', borderRadius: '6px', border: '1px solid #f3f4f6', fontWeight: 600 }}>
                            {dx || '___________________________________________________________________'}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>Resumen Clínico y Motivo de Derivación</h4>
                        <div style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', lineHeight: '1.4' }}>
                            {summary ? (
                                summary.split('\n').map((paragraph, idx) => (
                                    <p key={idx} style={{ marginBottom: '0.5rem' }}>{paragraph}</p>
                                ))
                            ) : (
                                <p>No se adjuntó redacción clínica.</p>
                            )}
                        </div>
                    </div>

                    <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#6b7280', textAlign: 'center', fontSize: '0.75rem' }}>
                        Agradezco de antemano la valoración, sugerencias y manejo conjuto de mi paciente.
                    </p>
                </div>
            </PrintLayout>
        </div>
    );
};

export default Referral;
