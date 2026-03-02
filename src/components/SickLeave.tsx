import React, { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const SickLeave: React.FC<Props> = ({ patient }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [days, setDays] = useState('3');
    const [startDate, setStartDate] = useState(patient.date || new Date().toISOString().split('T')[0]);
    const [dx, setDx] = useState('');
    const [type, setType] = useState('Ambulatoria');
    const [notes, setNotes] = useState('');

    const getEndDate = () => {
        if (!startDate || !days) return '';
        const start = new Date(startDate);
        start.setDate(start.getDate() + parseInt(days) - 1);
        return start.toISOString().split('T')[0];
    };

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Incapacidad_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Certificado de Incapacidad Médica</h2>
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

            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title="Certificado de Incapacidad Médica">
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', textAlign: 'justify', color: '#1f2937', fontSize: '10pt' }}>
                        <p>
                            Certifico que el/la paciente <strong>{patient.name || '_______________________'}</strong>,
                            identificado/a con documento número <strong>{patient.id || '_________________'}</strong>,
                            requiere incapacidad médica de tipo <strong>{type.toLowerCase()}</strong> por un período de <strong>{days || '___'}</strong> días calendario.
                        </p>

                        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '1.2rem 0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '8pt', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Fecha de Inicio</span>
                                    <div style={{ fontWeight: 700, fontSize: '11pt', color: '#1e293b' }}>{startDate ? new Date(startDate).toLocaleDateString() : '___/___/___'}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '8pt', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Fecha de Finalización</span>
                                    <div style={{ fontWeight: 700, fontSize: '11pt', color: '#1e293b' }}>{getEndDate() ? new Date(getEndDate()).toLocaleDateString() : '___/___/___'}</div>
                                </div>
                            </div>
                        </div>

                        <p style={{ marginTop: '1rem' }}><strong>Diagnóstico / Motivo:</strong> {dx || '__________________________________________'}</p>

                        {notes && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                                <strong>Observaciones:</strong>
                                <p style={{ marginTop: '0.4rem', whiteSpace: 'pre-wrap', color: '#475569' }}>{notes}</p>
                            </div>
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

export default SickLeave;
