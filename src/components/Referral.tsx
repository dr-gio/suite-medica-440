import React, { useState, useRef } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';
import { useConfig } from '../context/ConfigContext';

interface Props {
    patient: any;
}

const Referral: React.FC<Props> = ({ patient }) => {
    const { signatureUrl, sealUrl, doctorName, rethus } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [validationError, setValidationError] = useState<string | null>(null);
    const [specialty, setSpecialty] = useState('');
    const [doctor, setDoctor] = useState('');
    const [dx, setDx] = useState('');
    const [summary, setSummary] = useState('');

    const handleDownload = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar la remisión.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const filename = `Remision_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, filename);

            if (pdfBlob && window.confirm(`¿Deseas enviar esta remisión por correo a ${patient.email}?`)) {
                // Convert blob to base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                          <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                          <p>Adjunto encontrarás tu <strong>Remisión Médica</strong> para ${specialty || 'el especialista'} generada en 440 Clinic.</p>
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
                        subject: `Remisión Médica – 440 Clinic`,
                        body: bodyHtml,
                        pdfBase64: base64data,
                        pdfFilename: filename,
                        documentId: patient.id
                    });

                    if (error) {
                        alert('Error al enviar el correo: ' + error);
                    } else {
                        alert('¡Remisión enviada correctamente!');
                    }
                };
                reader.readAsDataURL(pdfBlob);
            }
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Remisión a Especialista</h2>
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

            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title="Interconsulta / Remisión Médica">
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', color: '#1f2937' }}>

                        <div style={{ padding: '0.75rem', borderLeft: '4px solid #2563eb', backgroundColor: '#f8fafc', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '10pt', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Derivación para Especialidad:</h3>
                            <p style={{ fontSize: '12pt', fontWeight: 700, margin: '0.3rem 0', color: '#1e3a8a' }}>{specialty || '_________________________'}</p>
                            {doctor && <p style={{ margin: 0, color: '#4b5563', fontSize: '10pt' }}>A la atención del <strong>{doctor}</strong></p>}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{ color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem', fontSize: '10pt' }}>Impresión Diagnóstica</h4>
                            <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f3f4f6', fontWeight: 600, fontSize: '10pt' }}>
                                {dx || '___________________________________________________________________'}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ color: '#111827', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.5rem', fontSize: '10pt' }}>Resumen Clínico y Motivo de Derivación</h4>
                            <div style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', lineHeight: '1.5', fontSize: '10pt' }}>
                                {summary ? (
                                    summary.split('\n').map((paragraph, idx) => (
                                        <p key={idx} style={{ marginBottom: '0.75rem' }}>{paragraph}</p>
                                    ))
                                ) : (
                                    <p>No se adjuntó redacción clínica.</p>
                                )}
                            </div>
                        </div>

                        <p style={{ marginTop: '1.5rem', fontStyle: 'italic', color: '#6b7280', textAlign: 'center', fontSize: '9pt' }}>
                            A agradezco de antemano la valoración, sugerencias y manejo conjuto de mi paciente.
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

export default Referral;
