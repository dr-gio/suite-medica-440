import React, { useState } from 'react';
import { Mail, Share2, CheckCircle, Send, Loader2, Download, MessageCircle, X } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { supabase } from '../lib/supabase';

interface Props {
    patient: { name: string; id: string; date: string; age: string };
    documentTitle: string;
    onClose: () => void;
}

const SharePanel: React.FC<Props> = ({ patient, documentTitle, onClose }) => {
    const { doctorName, rethus, address, contactPhone, websiteUrl } = useConfig();
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [downloaded, setDownloaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const buildWhatsAppText = () => {
        const date = new Date(patient.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
        return encodeURIComponent(
            `Estimado/a ${patient.name || 'paciente'},\n\n` +
            `Le enviamos su *${documentTitle}* generado el ${date} en 440 Clinic.\n\n` +
            `_${doctorName || 'Dr. Giovanni Fuentes'}_\n_Cirujano Plástico Estético y Reconstructivo_\n_RETHUS: ${rethus || 'CMC2017-222322'}_\n` +
            `📞 +57 ${contactPhone || '3181800130'}\n🌐 ${websiteUrl || 'www.drgio440.com'}`
        );
    };

    const handleWhatsApp = () => {
        const rawPhone = phone.replace(/\D/g, '');
        const fullPhone = rawPhone.startsWith('57') ? rawPhone : `57${rawPhone}`;
        const url = `https://wa.me/${fullPhone}?text=${buildWhatsAppText()}`;
        window.open(url, '_blank');
    };

    const handleEmail = async () => {
        setSending(true);
        setSendError(null);
        setSent(false);
        try {
            // Generate PDF blob
            const printEl = document.querySelector('.printable-document') as HTMLElement;
            let pdfBlob: Blob | undefined;
            let pdfFilename: string | undefined;
            if (printEl) {
                const html2pdf = (await import('html2pdf.js')).default;
                const patientSafe = (patient.name || 'paciente').replace(/\s+/g, '_');
                pdfFilename = `${documentTitle.replace(/\s+/g, '_')}_${patientSafe}.pdf`;
                pdfBlob = await html2pdf()
                    .set({
                        margin: [10, 10, 10, 10],
                        filename: pdfFilename,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    })
                    .from(printEl)
                    .outputPdf('blob');
            }

            // Convert blob to base64 for the edge function
            let pdfBase64: string | undefined;
            if (pdfBlob) {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                        const base64data = (reader.result as string).split(',')[1];
                        resolve(base64data);
                    };
                });
                reader.readAsDataURL(pdfBlob);
                pdfBase64 = await base64Promise;
            }

            const bodyHtml = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                  <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                  <p>Adjunto encontrarás tu documento médico (<strong>${documentTitle}</strong>).</p>
                  <p>Si tienes alguna duda, responde este correo.</p>
                  <div style="margin-top:30px;border-top:1px solid #eee;padding-top:20px">
                    <p style="margin:0;font-weight:600">440 Clinic by Dr. Gio</p>
                    <p style="margin:0;color:#666;font-size:14px">La perfecta armonía de tu cuerpo</p>
                  </div>
                </div>
            `;

            const { error } = await supabase.functions.invoke('send-email', {
                body: {
                    to: `${email}, drgio440@documentos.440clinic.online`,
                    subject: `Documento médico – 440 Clinic`,
                    body: bodyHtml,
                    pdfBase64,
                    pdfFilename,
                    documentId: patient.id // Patient ID is used as documentId if direct doc id isn't available
                }
            });

            if (error) throw error;

            setSent(true);
            setTimeout(() => setSent(false), 4000);
        } catch (err: any) {
            console.error('Email error:', err);
            setSendError(err.message || 'Error al enviar el correo.');
        }
        setSending(false);
    };

    const handleDownloadPdf = async () => {
        setLoading(true);
        try {
            const printEl = document.querySelector('.printable-document') as HTMLElement;
            if (!printEl) {
                alert('Primero genera el contenido del documento en la vista activa.');
                setLoading(false);
                return;
            }

            const html2pdf = (await import('html2pdf.js')).default;
            const patientSafe = (patient.name || 'documento').replace(/\s+/g, '_');
            const filename = `${documentTitle.replace(/\s+/g, '_')}_${patientSafe}.pdf`;

            await html2pdf()
                .set({
                    margin: [10, 10, 10, 10],
                    filename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                })
                .from(printEl)
                .save();

            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Error al generar el PDF. Intenta usando Imprimir → Guardar como PDF.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 8000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif",
        }} onClick={onClose}>
            <div
                style={{
                    background: 'var(--glass-bg, white)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    padding: '1.5rem',
                    width: '95%', maxWidth: '480px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Share2 size={22} color="var(--primary, #2563eb)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Compartir Documento</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '6px' }}>
                        <X size={20} color="var(--text-muted, #6b7280)" />
                    </button>
                </div>

                <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Documento: <strong style={{ color: 'var(--text-main, #111)' }}>{documentTitle}</strong> — {patient.name || 'Paciente sin nombre'}
                </p>

                {/* Download PDF */}
                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8' }}>
                        <Download size={18} /> Descargar como PDF
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                        Genera un PDF del documento activo para adjuntar en cualquier mensaje.
                    </p>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 1.25rem', borderRadius: '8px',
                            border: 'none', background: '#2563eb', color: 'white',
                            fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontSize: '0.9rem',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {downloaded ? <><CheckCircle size={16} /> ¡Descargado!</> : loading ? 'Generando...' : <><Download size={16} /> Descargar PDF</>}
                    </button>
                </div>

                {/* WhatsApp */}
                <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a' }}>
                        <MessageCircle size={18} /> Enviar por WhatsApp
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                        Abre WhatsApp con un mensaje pre-redactado. Adjunta el PDF descargado manualmente.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="tel"
                            className="form-input"
                            placeholder="Ej: 3182901230"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={handleWhatsApp}
                            disabled={!phone}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.65rem 1.1rem', borderRadius: '8px',
                                border: 'none', background: phone ? '#25d366' : '#d1d5db',
                                color: 'white', fontWeight: 600, cursor: phone ? 'pointer' : 'not-allowed',
                                whiteSpace: 'nowrap', fontSize: '0.9rem',
                            }}
                        >
                            <MessageCircle size={16} /> Abrir
                        </button>
                    </div>
                </div>

                {/* Email - SMTP */}
                <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8' }}>
                        <Mail size={18} /> Enviar por correo electrónico
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                        Se enviará un correo automático desde <strong>drgio440@documentos.440clinic.online</strong> con el documento adjunto.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="correo@paciente.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button
                                onClick={handleEmail}
                                disabled={!email || sending}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.65rem 1.1rem', borderRadius: '8px',
                                    border: 'none',
                                    background: (email && !sending) ? 'var(--primary, #2563eb)' : '#d1d5db',
                                    color: 'white', fontWeight: 600,
                                    cursor: (email && !sending) ? 'pointer' : 'not-allowed',
                                    whiteSpace: 'nowrap', fontSize: '0.9rem',
                                }}
                            >
                                {sent ? <><CheckCircle size={16} /> ¡Enviado!</> : sending ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><Send size={16} /> Enviar</>}
                            </button>
                        </div>
                        {sendError && (
                            <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: 0 }}>❌ {sendError}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharePanel;
