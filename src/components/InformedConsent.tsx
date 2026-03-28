import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Send, History, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const InformedConsent: React.FC<Props> = ({ patient }) => {
    const { consentTemplates, doctorName } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [content, setContent] = useState('');
    const [procedureName, setProcedureName] = useState('');
    const [surgeryDate, setSurgeryDate] = useState(new Date().toISOString().split('T')[0]);
    const [signingDate, setSigningDate] = useState(new Date().toISOString().split('T')[0]);
    const [patientEmail, setPatientEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [viewingConsent, setViewingConsent] = useState<any>(null);
    const [forwardEmail, setForwardEmail] = useState('');
    const [forwardingDoc, setForwardingDoc] = useState(false);
    const [historySearch, setHistorySearch] = useState('');

    // Load template when selected
    useEffect(() => {
        const match = consentTemplates.find(t => t.name === selectedTemplate);
        if (match) {
            setProcedureName(match.name);
            setContent(match.content);
        } else if (selectedTemplate === '') {
            setProcedureName('');
            setContent('');
        }
    }, [selectedTemplate, consentTemplates]);

    useEffect(() => {
        fetchHistory();
    }, [patient.id]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('type', 'informed_consent')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setHistory(data || []);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Consentimiento_${procedureName || 'Procedimiento'}.pdf`);
        }
    };

    const handleDeleteConsent = async (id: string) => {
        const confirm1 = window.confirm("¿Estás seguro de que quieres eliminar este consentimiento del historial?");
        if (!confirm1) return;

        const confirm2 = window.confirm("¡ADVERTENCIA! Esta acción es irreversible. ¿Confirmas que deseas ELIMINAR PERMANENTEMENTE este documento?");
        if (!confirm2) return;

        try {
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('Consentimiento eliminado correctamente.');
            fetchHistory(); // Refresh the list
        } catch (err: any) {
            console.error('Error deleting consent:', err);
            alert('Error al eliminar: ' + err.message);
        }
    };

    const handleSaveAndSend = async () => {
        if (!procedureName || !content || !patientEmail) {
            alert('Por favor, completa el nombre del procedimiento, el contenido y el correo del paciente.');
            return;
        }

        setSending(true);
        try {
            const sanitizeText = (text: string) => text ? text.replace(/\u0000/g, '') : text;
            const safeContent = sanitizeText(content);
            const safeProcedureName = sanitizeText(procedureName);

            const token = crypto.randomUUID();
            const { error: saveError } = await supabase
                .from('documents')
                .insert({
                    type: 'informed_consent',
                    title: `Consentimiento: ${safeProcedureName}`,
                    content: {
                        content: safeContent,
                        procedureName: safeProcedureName,
                        surgeryDate,
                        signingDate,
                        patient_email: patientEmail,
                        doctor: doctorName,
                        patient_name: patient.name,
                        patient_id_doc: patient.id
                    },
                    token,
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
                })
                .select()
                .single();

            if (saveError) throw saveError;

            const signLink = `${window.location.origin}/sign/consent/${token}`;

            // Send Email via Edge Function
            const { error: emailError } = await supabase.functions.invoke('send-email', {
                body: {
                    to: patientEmail,
                    subject: `Firma Requerida: Consentimiento Informado - ${safeProcedureName}`,
                    body: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
                            <h2 style="color: #2563eb;">Hola ${patient.name},</h2>
                            <p>Se ha generado un documento de <strong>Consentimiento Informado</strong> para tu próximo procedimiento: <strong>${safeProcedureName}</strong>.</p>
                            <p>Por favor, haz clic en el siguiente botón para revisar y firmar el documento digitalmente:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${signLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Firmar Consentimiento</a>
                            </div>
                            <p style="font-size: 0.85rem; color: #64748b;">Este enlace es único y expirará en 7 días.</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                            <p style="font-size: 0.8rem; color: #94a3b8;">440 Clinic by Dr. Gio - Documentación Digital</p>
                        </div>
                    `
                }
            });

            if (emailError) throw emailError;

            alert('Consentimiento guardado y enviado al paciente con éxito.');
            fetchHistory();
        } catch (err: any) {
            console.error(err);
            alert('Error al procesar: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const handleForwardSignedDocument = async () => {
        if (!forwardEmail || !forwardEmail.includes('@')) {
            alert('Por favor ingresa un correo electrónico válido para enviar el documento.');
            return;
        }

        const el = document.getElementById('signed-consent-print-area');
        if (!el) {
            alert('No se pudo encontrar el contenido del documento.');
            return;
        }

        setForwardingDoc(true);
        try {
            // Import html2pdf dynamically like in SharePanel
            const html2pdf = (await import('html2pdf.js')).default;
            const patientNameSafe = (viewingConsent.signer_full_name || 'Paciente_anonimo').replace(/\s+/g, '_');
            const pdfFilename = `Consentimiento_Firmado_${patientNameSafe}.pdf`;

            // Generate Blob
            const pdfBlob = await html2pdf()
                .set({
                    margin: [10, 10, 10, 10],
                    filename: pdfFilename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                })
                .from(el)
                .outputPdf('blob');

            // Convert to Base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64data = (reader.result as string).split(',')[1];
                    resolve(base64data);
                };
            });
            reader.readAsDataURL(pdfBlob);
            const pdfBase64 = await base64Promise;

            // Send via Edge Function
            const { error: emailError } = await supabase.functions.invoke('send-email', {
                body: {
                    to: forwardEmail,
                    cc: 'historias@440clinic.online',
                    subject: `Consentimiento Firmado - ${viewingConsent.title || '440 Clinic'}`,
                    body: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2>Documento Firmado - 440 Clinic</h2>
                            <p>Adjuntamos copia en formato PDF del consentimiento informado firmado por el paciente <strong>${viewingConsent.signer_full_name}</strong>.</p>
                            <p>Verifica el archivo adjunto para más detalles.</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                            <p style="font-size: 0.8rem; color: #94a3b8;">440 Clinic by Dr. Gio - Sistema Interno de Documentación</p>
                        </div>
                    `,
                    pdfBase64,
                    pdfFilename,
                    documentId: viewingConsent.id
                }
            });

            if (emailError) throw emailError;

            alert('Documento enviado correctamente al correo proporcionado.');
            setForwardEmail('');
        } catch (err: any) {
            console.error('Error forwarding document:', err);
            alert('Error al enviar el documento: ' + err.message);
        } finally {
            setForwardingDoc(false);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Consentimiento Informado</h2>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="action-btn"
                            onClick={handleSaveAndSend}
                            disabled={sending}
                            style={{ borderRadius: '8px', padding: '0.6rem 1rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none' }}
                        >
                            {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                            <span>{sending ? 'Enviando...' : 'Enviar para Firma'}</span>
                        </button>
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
                </div>

                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Procedimiento</label>
                        <select className="form-input" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                            <option value="">-- Seleccionar --</option>
                            {consentTemplates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            <option value="custom">-- Otro (Personalizado) --</option>
                        </select>
                    </div>
                    {selectedTemplate === 'custom' && (
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Nombre del Procedimiento</label>
                            <input
                                className="form-input"
                                value={procedureName}
                                onChange={(e) => setProcedureName(e.target.value)}
                                placeholder="Ej: Rinoplastia Funcional"
                            />
                        </div>
                    )}
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Fecha de Cirugía</label>
                        <input
                            type="date"
                            className="form-input"
                            value={surgeryDate}
                            onChange={(e) => setSurgeryDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Fecha de Firma</label>
                        <input
                            type="date"
                            className="form-input"
                            value={signingDate}
                            onChange={(e) => setSigningDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Email del Paciente (para firma)</label>
                        <input
                            type="email"
                            className="form-input"
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            placeholder="paciente@ejemplo.com"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Contenido Completo del Consentimiento</label>
                    <textarea
                        className="form-input"
                        style={{ minHeight: '300px' }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Redacta aquí todo el texto del consentimiento..."
                    />
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="form-label" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <History size={18} /> Historial de Consentimientos
                        </h3>
                        {history.length > 0 && (
                            <div style={{ position: 'relative', width: '250px' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por paciente o procedimiento..."
                                    className="form-input"
                                    style={{ paddingLeft: '2rem', margin: 0, fontSize: '0.85rem' }}
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                />
                                <div style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {loadingHistory ? (
                            <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>Cargando historial...</div>
                        ) : history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>No hay consentimientos previos.</div>
                        ) : (() => {
                            const filteredHistory = history.filter(item => {
                                const patientName = item.content?.patient_name || item.signer_full_name || '';
                                const title = item.title || '';
                                const search = historySearch.toLowerCase();
                                return patientName.toLowerCase().includes(search) || title.toLowerCase().includes(search);
                            });

                            if (filteredHistory.length === 0) {
                                return <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>No hay resultados para "{historySearch}"</div>;
                            }

                            return filteredHistory.map(item => (
                                <div key={item.id} className="item-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</div>
                                        <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#3b82f6', marginTop: '2px', marginBottom: '4px' }}>
                                            Paciente: {item.content?.patient_name || item.signer_full_name || 'No registrado'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            Enviado: {new Date(item.sent_at).toLocaleDateString()} | Estado:
                                            <span style={{
                                                marginLeft: '4px', padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                                                backgroundColor: item.status === 'signed' ? '#dcfce7' : item.status === 'viewed' ? '#fef9c3' : '#f1f5f9',
                                                color: item.status === 'signed' ? '#166534' : item.status === 'viewed' ? '#854d0e' : '#475569'
                                            }}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {item.status !== 'signed' && (
                                            <a href={`/sign/consent/${item.token}`} target="_blank" rel="noopener noreferrer" className="action-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                                <ExternalLink size={14} /> Link
                                            </a>
                                        )}
                                        {item.status === 'signed' && (
                                            <button
                                                className="action-btn secondary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                onClick={() => setViewingConsent(item)}
                                            >
                                                Ver Firma
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteConsent(item.id)}
                                            style={{
                                                background: 'none', border: 'none', color: '#ef4444',
                                                cursor: 'pointer', padding: '0.4rem', borderRadius: '6px'
                                            }}
                                            title="Eliminar registro"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>
                </div>
            </div>

            <div ref={printRef} className="print-only">
                <PrintLayout
                    patient={patient}
                    title={`CONSENTIMIENTO INFORMADO: ${procedureName.toUpperCase() || 'PROCEDIMIENTO'}`}
                    hidePatientInfo={true}
                >
                    <div style={{ lineHeight: '1.6', marginTop: '0.5rem', color: '#1f2937', fontSize: '10.5pt', textAlign: 'justify' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1fr 1fr',
                            gap: '0.75rem',
                            marginBottom: '1rem',
                            background: '#f8fafc',
                            padding: '0.8rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '9.5pt'
                        }}>
                            <div>
                                <strong>PACIENTE:</strong> {patient.name}<br />
                                <strong>CC / ID:</strong> {patient.id}
                            </div>
                            <div>
                                <strong>FECHA CIRUGÍA:</strong> {surgeryDate}<br />
                                <strong>EDAD:</strong> {patient.age} años
                            </div>
                            <div>
                                <strong>FECHA FIRMA:</strong> {signingDate}<br />
                                <strong>MÉDICO:</strong> {doctorName}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ whiteSpace: 'pre-wrap', minHeight: '300px' }}>{content || '__________________________________________________________________________________________________'}</p>
                        </div>

                        <p style={{ fontSize: '10pt', color: '#1f2937', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
                            El presente consentimiento se firma el día <strong>{signingDate}</strong> en señal de aceptación en pleno conocimiento y facultades cognitivas.
                        </p>

                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '4rem' }}>
                            <div style={{ width: '200px', borderTop: '1px solid #000', paddingTop: '0.4rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '8.5pt', fontWeight: 'bold', margin: '0' }}>FIRMA DEL PACIENTE</p>
                                <p style={{ fontSize: '8pt', margin: '0.2rem 0' }}>C.C. {patient.id}</p>
                                <div style={{ height: '55px', width: '55px', border: '1px solid #000', margin: '0.4rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6.5pt' }}>
                                    HUELLA
                                </div>
                            </div>
                            <div style={{ width: '200px', borderTop: '1px solid #000', paddingTop: '0.4rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '8.5pt', fontWeight: 'bold', margin: '0' }}>FIRMA TESTIGO (SI LO HAY)</p>
                                <p style={{ fontSize: '8pt', margin: '0.2rem 0' }}>C.C. ___________________</p>
                            </div>
                        </div>

                    </div>
                </PrintLayout>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* View Signed Consent Modal */}
            {viewingConsent && (() => {
                const safeContent = typeof viewingConsent.content === 'string'
                    ? { content: viewingConsent.content, surgeryDate: 'N/A', doctor: 'No registrado', patient_email: '' }
                    : (viewingConsent.content || {});

                return (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '2rem'
                    }}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '16px',
                            width: '100%', maxWidth: '800px', maxHeight: '90vh',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                        }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Consentimiento Firmado</h3>
                                <button onClick={() => setViewingConsent(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                            </div>
                            <div id="signed-consent-print-area" style={{ overflowY: 'auto', padding: '2rem', flex: 1, backgroundColor: 'white' }}>
                                <PrintLayout
                                    patient={{ name: viewingConsent.signer_full_name || patient.name, id: viewingConsent.signer_document_id || patient.id, age: patient.age }}
                                    title={(viewingConsent.title || 'Consentimiento').toUpperCase()}
                                    hidePatientInfo={true}
                                >
                                    <div style={{ lineHeight: '1.6', marginTop: '0.5rem', color: '#1f2937', fontSize: '10.5pt', textAlign: 'justify' }}>
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem',
                                            background: '#f8fafc', padding: '0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '9.5pt'
                                        }}>
                                            <div>
                                                <strong>PACIENTE:</strong> {viewingConsent.signer_full_name || patient.name}<br />
                                                <strong>CC / ID:</strong> {viewingConsent.signer_document_id || patient.id}
                                            </div>
                                            <div>
                                                <strong>FECHA CIRUGÍA:</strong> {safeContent.surgeryDate}<br />
                                                <strong>IP FIRMA:</strong> {viewingConsent.ip || 'N/A'}
                                            </div>
                                            <div>
                                                <strong>FECHA FIRMA:</strong> {viewingConsent.signed_at ? new Date(viewingConsent.signed_at).toLocaleDateString() : 'N/A'}<br />
                                                <strong>MÉDICO:</strong> {safeContent.doctor}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <p style={{ whiteSpace: 'pre-wrap', minHeight: '300px' }}>{safeContent.content}</p>
                                        </div>

                                        <p style={{ fontSize: '10pt', color: '#1f2937', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
                                            El presente consentimiento fue firmado digitalmente el día <strong>{viewingConsent.signed_at ? new Date(viewingConsent.signed_at).toLocaleString('es-CO') : 'N/A'}</strong>.
                                        </p>

                                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '4rem' }}>
                                            <div style={{ width: '250px', textAlign: 'center' }}>
                                                {viewingConsent.signature_image_url ? (
                                                    <img
                                                        src={viewingConsent.signature_image_url}
                                                        alt="Firma del paciente"
                                                        style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain', borderBottom: '1px solid #000', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}
                                                    />
                                                ) : (
                                                    <div style={{ borderTop: '1px solid #000', paddingTop: '0.4rem', marginTop: '60px' }}></div>
                                                )}
                                                <p style={{ fontSize: '8.5pt', fontWeight: 'bold', margin: '0' }}>FIRMA DEL PACIENTE</p>
                                                <p style={{ fontSize: '8pt', margin: '0.2rem 0' }}>{viewingConsent.signer_full_name}</p>
                                                <p style={{ fontSize: '8pt', margin: '0.2rem 0' }}>C.C. {viewingConsent.signer_document_id}</p>
                                            </div>
                                        </div>
                                    </div>
                                </PrintLayout>
                            </div>

                            {/* Modal Footer (Actions) */}
                            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                    <input
                                        type="email"
                                        placeholder="correo@clinica.com o @paciente.com"
                                        className="form-input"
                                        style={{ margin: 0, flex: 1, maxWidth: '300px' }}
                                        value={forwardEmail}
                                        onChange={e => setForwardEmail(e.target.value)}
                                    />
                                    <button
                                        className="action-btn"
                                        style={{ background: '#10b981', color: 'white', border: 'none' }}
                                        disabled={forwardingDoc}
                                        onClick={handleForwardSignedDocument}
                                    >
                                        {forwardingDoc ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                                        <span style={{ marginLeft: '6px' }}>{forwardingDoc ? 'Enviando...' : 'Reenviar'}</span>
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button className="action-btn" onClick={async () => {
                                        const el = document.getElementById('signed-consent-print-area');
                                        if (el) {
                                            const html2pdf = (await import('html2pdf.js')).default;
                                            const patientNameSafe = (viewingConsent.signer_full_name || 'Paciente').replace(/\s+/g, '_');
                                            html2pdf().set({
                                                margin: [10, 10, 10, 10],
                                                filename: `Consentimiento_Firmado_${patientNameSafe}.pdf`,
                                                image: { type: 'jpeg', quality: 0.98 },
                                                html2canvas: { scale: 2, useCORS: true },
                                                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                                            }).from(el).save();
                                        }
                                    }}>
                                        <Download size={16} /> Descargar PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default InformedConsent;
