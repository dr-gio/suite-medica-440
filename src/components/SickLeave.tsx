import React, { useState } from 'react';
import PrintLayout from './PrintLayout';

interface Props {
    patient: any;
}

const SickLeave: React.FC<Props> = ({ patient }) => {
    const [days, setDays] = useState('3');
    const [startDate, setStartDate] = useState(patient.date || new Date().toISOString().split('T')[0]);
    const [dx, setDx] = useState('');
    const [type, setType] = useState('Ambulatoria');
    const [notes, setNotes] = useState('');

    // Calculate end date
    const getEndDate = () => {
        if (!startDate || !days) return '';
        const start = new Date(startDate);
        start.setDate(start.getDate() + parseInt(days) - 1);
        return start.toISOString().split('T')[0];
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Certificado de Incapacidad Médica</h2>

                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Días de Incapacidad</label>
                        <input type="number" min="1" className="form-input" value={days} onChange={(e) => setDays(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Fecha de Inicio</label>
                        <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Tipo de Incapacidad</label>
                        <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
                            <option>Ambulatoria</option>
                            <option>Hospitalaria</option>
                            <option>Prórroga</option>
                            <option>Maternidad</option>
                        </select>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Diagnóstico Principal (CIE-10 / Descripción)</label>
                    <input className="form-input" placeholder="Ej: Rinoplastia Post-operatorio" value={dx} onChange={(e) => setDx(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Observaciones Adicionales</label>
                    <textarea className="form-input" style={{ minHeight: '80px' }} placeholder="Reposo relativo, evitar esfuerzos físicos..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
            </div>

            <PrintLayout patient={patient} title="Certificado de Incapacidad Médica">
                <div style={{ fontSize: '1.1rem', lineHeight: '2', marginTop: '1rem', textAlign: 'justify' }}>
                    <p>
                        Certifico que el/la paciente <strong>{patient.name || '_______________________'}</strong>,
                        identificado/a con documento número <strong>{patient.id || '_________________'}</strong>,
                        requiere incapacidad médica de tipo <strong>{type.toLowerCase()}</strong> por un período de <strong>{days || '___'}</strong> días calendario.
                    </p>

                    <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', margin: '2rem 0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Fecha de Inicio</span>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{startDate ? new Date(startDate).toLocaleDateString() : '___/___/___'}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Fecha de Finalización</span>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{getEndDate() ? new Date(getEndDate()).toLocaleDateString() : '___/___/___'}</div>
                            </div>
                        </div>
                    </div>

                    <p><strong>Diagnóstico / Motivo:</strong> {dx || '__________________________________________'}</p>

                    {notes && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <strong>Observaciones:</strong>
                            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{notes}</p>
                        </div>
                    )}
                </div>
            </PrintLayout>
        </div>
    );
};

export default SickLeave;
