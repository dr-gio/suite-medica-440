import React, { useState, useRef } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';
import { useConfig } from '../context/ConfigContext';

interface Props {
    patient: any;
}

const SickLeave: React.FC<Props> = ({ patient }) => {
    const { signatureUrl, sealUrl, doctorName, rethus } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [validationError, setValidationError] = useState<string | null>(null);
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

    const handleDownload = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar la incapacidad.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const filename = `Incapacidad_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, filename);

            if (pdfBlob && window.confirm(`¿Deseas enviar esta incapacidad por correo a ${patient.email}?`)) {
                // Convert blob to base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                          <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                          <p>Adjunto encontrarás tu <strong>Certificado de Incapacidad Médica</strong> generado en 440 Clinic.</p>
                          <div style="margin-top:20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                            <p style="margin:0"><strong>Médico:</strong> Dr. Giovanni Fuentes</p>
                          </div>
                          <p>Si tienes alguna duda, puedes contactarnos.</p>
                          <div style="margin-top:30px;border-top:1px solid #eee;padding-top:20px">
                            <p style="margin:0;font-weight:600">440 Clinic by Dr. Gio</p>
                            <p style="margin:0;color:#666;font-size:14px">La perfecta armonía de tu cuerpo</p>
                          </div>
                        </div>
                    `;

                    const { error } = await emailService.sendMedicalDocument({
                        to: patient.email,
                        subject: `Certificado de Incapacidad – 440 Clinic`,
                        body: bodyHtml,
                        pdfBase64: base64data,
                        pdfFilename: filename,
                        documentId: patient.id
                    });

                    if (error) {
                        alert('Error al enviar el correo: ' + error);
                    } else {
                        alert('¡Certificado enviado correctamente!');
                    }
                };
                reader.readAsDataURL(pdfBlob);
            }
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Incapacidad Médica</h2>
                    {validationError && (
                        <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <X size={16} /> {validationError}
                        </div>
                    )}
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
