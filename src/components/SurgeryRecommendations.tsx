import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';

interface Props {
    patient: any;
}

const SurgeryRecommendations: React.FC<Props> = ({ patient }) => {
    const { surgeries, doctorName, rethus, contactPhone } = useConfig();
    const preRef = useRef<HTMLDivElement>(null);
    const postRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [surgery, setSurgery] = useState('');
    const [preText, setPreText] = useState('');
    const [postText, setPostText] = useState('');
    const [activeTab, setActiveTab] = useState<'pre' | 'post'>('pre');
    const [downloadingPost, setDownloadingPost] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

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

    const handleDownloadPre = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar las recomendaciones.');
            return;
        }
        setValidationError(null);

        if (preRef.current) {
            const filename = `Pre-Quirurgicas_${surgery || 'Cirugia'}.pdf`;
            const pdfBlob = await downloadPDF(preRef.current, filename);
            
            if (pdfBlob && window.confirm(`¿Deseas enviar estas recomendaciones por correo a ${patient.email}?`)) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                            <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                            <p>Adjunto encontrarás tus <strong>Recomendaciones Pre-Quirúrgicas</strong> generadas en 440 Clinic.</p>
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
                            subject: `Recomendaciones Pre-Quirúrgicas – 440 Clinic`,
                            body: bodyHtml,
                            pdfBase64: base64data,
                            pdfFilename: filename,
                            documentId: patient.id
                        });
                        alert('¡Recomendaciones enviadas correctamente!');
                    } catch (error) {
                        alert('Error al enviar el correo: ' + error);
                    }
                };
                reader.readAsDataURL(pdfBlob);
            }
        }
    };

    const handleDownloadPost = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar las recomendaciones.');
            return;
        }
        setValidationError(null);

        if (postRef.current) {
            setDownloadingPost(true);
            const filename = `Post-Quirurgicas_${surgery || 'Cirugia'}.pdf`;
            const pdfBlob = await downloadPDF(postRef.current, filename);
            setDownloadingPost(false);

            if (pdfBlob && window.confirm(`¿Deseas enviar estas recomendaciones por correo a ${patient.email}?`)) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                            <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                            <p>Adjunto encontrarás tus <strong>Recomendaciones Post-Quirúrgicas</strong> generadas en 440 Clinic.</p>
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
                            subject: `Recomendaciones Post-Quirúrgicas – 440 Clinic`,
                            body: bodyHtml,
                            pdfBase64: base64data,
                            pdfFilename: filename,
                            documentId: patient.id
                        });
                        alert('¡Recomendaciones enviadas correctamente!');
                    } catch (error) {
                        alert('Error al enviar el correo: ' + error);
                    }
                };
                reader.readAsDataURL(pdfBlob);
            }
        }
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        flex: 1,
        padding: '0.75rem 1rem',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.95rem',
        transition: 'all 0.2s',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
    });

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Recomendaciones Quirúrgicas</h2>
                    {validationError && (
                        <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <X size={16} /> {validationError}
                        </div>
                    )}
                </div>

                {/* Procedure selector */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Procedimiento Quirúrgico (Plantilla Rápida)</label>
                    <select className="form-input" value={surgery} onChange={(e) => setSurgery(e.target.value)}>
                        <option value="">-- Seleccionar Procedimiento --</option>
                        {surgeries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        <option value="custom">-- Otro (Personalizado) --</option>
                    </select>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--card-bg)', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
                    <button style={tabStyle(activeTab === 'pre')} onClick={() => setActiveTab('pre')}>
                        📋 Pre-Quirúrgicas
                    </button>
                    <button style={tabStyle(activeTab === 'post')} onClick={() => setActiveTab('post')}>
                        📋 Post-Quirúrgicas
                    </button>
                </div>

                {/* Pre tab */}
                {activeTab === 'pre' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>Instrucciones Preoperatorias</label>
                            <button
                                className="action-btn primary"
                                onClick={handleDownloadPre}
                                disabled={downloading}
                                style={{ borderRadius: '8px', padding: '0.6rem 1rem' }}
                            >
                                {downloading ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                                <span>{downloading ? 'Generando...' : 'Descargar PDF Pre-Op'}</span>
                            </button>
                        </div>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '220px' }}
                            value={preText}
                            onChange={(e) => setPreText(e.target.value)}
                            placeholder="Indíquele al paciente qué debe hacer antes de la operación..."
                        />
                    </div>
                )}

                {/* Post tab */}
                {activeTab === 'post' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>Instrucciones Postoperatorias</label>
                            <button
                                className="action-btn primary"
                                onClick={handleDownloadPost}
                                disabled={downloadingPost}
                                style={{ borderRadius: '8px', padding: '0.6rem 1rem' }}
                            >
                                {downloadingPost ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
                                <span>{downloadingPost ? 'Generando...' : 'Descargar PDF Post-Op'}</span>
                            </button>
                        </div>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '220px' }}
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="Escriba los cuidados posteriores a la cirugía..."
                        />
                    </div>
                )}
            </div>

            {/* Hidden print area - Pre */}
            <div ref={preRef} className="print-only">
                <PrintLayout patient={patient} title={`PRE-QUIRÚRGICAS: ${surgery.toUpperCase() || 'PROCEDIMIENTO'}`}>
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', color: '#1f2937', fontSize: '10pt' }}>
                        {preText ? (
                            <div style={{ border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem', backgroundColor: '#eff6ff' }}>
                                <h3 style={{ fontSize: '11pt', marginBottom: '0.75rem', color: '#2563eb', fontWeight: 700, borderBottom: '1px solid #bfdbfe', paddingBottom: '0.25rem' }}>
                                    INSTRUCCIONES PREOPERATORIAS
                                </h3>
                                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#1f2937' }}>
                                    {preText.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{line.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>No hay instrucciones preoperatorias.</p>
                        )}
                    </div>
                </PrintLayout>
            </div>

            {/* Hidden print area - Post */}
            <div ref={postRef} className="print-only">
                <PrintLayout patient={patient} title={`POST-QUIRÚRGICAS: ${surgery.toUpperCase() || 'PROCEDIMIENTO'}`}>
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', color: '#1f2937', fontSize: '10pt' }}>
                        {postText ? (
                            <div style={{ border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1rem', backgroundColor: '#f0fdf4' }}>
                                <h3 style={{ fontSize: '11pt', marginBottom: '0.75rem', color: '#10b981', fontWeight: 700, borderBottom: '1px solid #a7f3d0', paddingBottom: '0.25rem' }}>
                                    INSTRUCCIONES POSTOPERATORIAS
                                </h3>
                                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#1f2937' }}>
                                    {postText.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{line.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>No hay instrucciones postoperatorias.</p>
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

export default SurgeryRecommendations;
