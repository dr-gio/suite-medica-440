import React, { useState, useRef } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';
import { useConfig } from '../context/ConfigContext';

interface Props {
    patient: any;
}

const TravelCertificate: React.FC<Props> = ({ patient }) => {
    const { signatureUrl, sealUrl, doctorName, rethus } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [validationError, setValidationError] = useState<string | null>(null);
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [restrictions, setRestrictions] = useState('Ninguna, paciente apto para viaje regular.');
    const [templateText, setTemplateText] = useState(
        'Por medio de la presente certifico que he examinado clínica y físicamente al paciente referenciado, encontrándose en buenas condiciones generales de salud al momento de la evaluación.\n\nEl/la paciente no padece actualmente de enfermedades infectocontagiosas agudas ni presenta condiciones médicas que contraindiquen su traslado por vía aérea o terrestre comercial, por lo cual se considera APTO/A para viajar.'
    );

    const handleDownload = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar el certificado.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const filename = `CertificadoViaje_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, filename);

            if (pdfBlob && window.confirm(`¿Deseas enviar este certificado por correo a ${patient.email}?`)) {
                // Convert blob to base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                          <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                          <p>Adjunto encontrarás tu <strong>Certificado Médico de Viaje</strong> generado en 440 Clinic.</p>
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
                        subject: `Certificado Médico de Viaje – 440 Clinic`,
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
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Certificado para Viaje</h2>
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
