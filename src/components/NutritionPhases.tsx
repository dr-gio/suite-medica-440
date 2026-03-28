import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';

interface Props {
    patient: any;
}

const NutritionPhases: React.FC<Props> = ({ patient }) => {
    const { nutrition: catalogNutrition, doctorName, rethus, contactPhone } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [phases, setPhases] = useState(
        catalogNutrition.map(p => ({ ...p, selected: true }))
    );
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        setPhases(current => {
            return catalogNutrition.map(p => {
                const existing = current.find(c => c.id === p.id);
                return { ...p, selected: existing ? existing.selected : true };
            });
        });
    }, [catalogNutrition]);

    const [generalTips, setGeneralTips] = useState(
        '1. Mastique cada bocado lentamente y sin prisa.\n2. Separe los líquidos de los sólidos (espere 30 minutos).\n3. Deténgase con la primera sensación de saciedad.'
    );

    const togglePhase = (id: string) => {
        setPhases(phases.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
    };

    const updatePhaseDesc = (id: string, text: string) => {
        setPhases(phases.map(p => p.id === id ? { ...p, desc: text } : p));
    };

    const handleDownloadPDF = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar el plan.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const fileName = `Plan_Nutricion_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, fileName);

            if (pdfBlob && window.confirm('¿Desea enviar este plan de nutrición al correo del paciente?')) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                          <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                          <p>Adjunto encontrarás tu <strong>Plan Nutricional Post-Operatorio</strong> generado en 440 Clinic.</p>
                          <div style="margin-top:20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                            <p style="margin:0"><strong>Médico:</strong> ${doctorName || 'Dr. Giovanni Fuentes'}</p>
                            <p style="margin:0"><strong>RETHUS:</strong> ${rethus || 'CMC2017-222322'}</p>
                          </div>
                          <p>Si tienes alguna duda, puedes contactarnos al 📞 ${contactPhone || '3181800130'}.</p>
                          <div style="margin-top:30px;border-top:1px solid #eee;padding-top:20px">
                            <p style="margin:0;font-weight:600">440 Clinic by Dr. Gio</p>
                            <p style="margin:0;color:#666;font-size:14px">La perfecta armonía de tu cuerpo</p>
                          </div>
                        </div>
                    `;

                    try {
                        await emailService.sendMedicalDocument({
                            to: patient.email,
                            subject: `Plan Nutricional – 440 Clinic`,
                            body: bodyHtml,
                            pdfBase64: base64data,
                            pdfFilename: fileName,
                            documentId: patient.id
                        });
                        alert('¡Plan nutricional enviado correctamente!');
                    } catch (error) {
                        alert('Error al enviar el correo: ' + error);
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
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Recomendaciones Nutricionales (Fases)</h2>
                    {validationError && (
                        <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <X size={16} /> {validationError}
                        </div>
                    )}
                    <button
                        className="action-btn primary"
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        style={{ borderRadius: '8px', padding: '0.6rem 1rem' }}
                    >
                        {downloading ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                        <span>{downloading ? 'Generando...' : 'Descargar PDF'}</span>
                    </button>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Reglas y Tips Generales (Aparece al principio)</label>
                    <textarea
                        className="form-input"
                        value={generalTips}
                        onChange={(e) => setGeneralTips(e.target.value)}
                        style={{ minHeight: '80px' }}
                    />
                </div>

                <div className="item-list">
                    {phases.map((phase) => (
                        <div key={phase.id} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', borderTop: phase.selected ? '2px solid var(--primary)' : '' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={phase.selected}
                                        onChange={() => togglePhase(phase.id)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    {phase.name}
                                </label>
                            </div>

                            {phase.selected && (
                                <div className="form-group">
                                    <textarea
                                        className="form-input"
                                        value={phase.desc}
                                        onChange={(e) => updatePhaseDesc(phase.id, e.target.value)}
                                        style={{ minHeight: '60px' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title="PLAN NUTRICIONAL POST-OPERATORIO">
                    <div style={{ color: '#1f2937', fontSize: '10pt', lineHeight: '1.5' }}>
                        {generalTips && (
                            <div className="recommendations-section" style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#1e40af', borderBottom: '2px solid #93c5fd', paddingBottom: '0.25rem', marginBottom: '0.75rem', fontSize: '11pt', fontWeight: 700 }}>RECOMENDACIONES GENERALES DIARIAS</h3>
                                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#1e3a8a' }}>
                                    {generalTips.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <li key={i} style={{ marginBottom: '0.4rem' }}>{line.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem' }}>
                            {phases.filter(p => p.selected).map((phase, idx) => (
                                <div key={idx} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed #e5e7eb' }}>
                                    <h4 style={{ fontSize: '11pt', color: '#111827', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {phase.name}
                                    </h4>
                                    <p style={{ color: '#4b5563', lineHeight: '1.6', textAlign: 'justify' }}>
                                        {phase.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {phases.filter(p => p.selected).length === 0 && (
                            <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>Seleccione al menos una fase para imprimir el plan nutricional.</p>
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

export default NutritionPhases;
