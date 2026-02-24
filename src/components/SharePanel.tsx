import React, { useState } from 'react';
import { X, Download, MessageCircle, Mail, Share2, CheckCircle, Send } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { sendGmailWithAttachment } from '../services/GmailService';

interface Props {
    patient: { name: string; id: string; date: string; age: string };
    documentTitle: string;
    onClose: () => void;
}

const SharePanel: React.FC<Props> = ({ patient, documentTitle, onClose }) => {
    const { gmailClientId, doctorName, rethus, address, contactPhone, websiteUrl } = useConfig();
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
            `📞 +57 ${contactPhone || '3181800130'}\n🌐 ${websiteUrl || 'www.drgiovannifuentes.com'}`
        );
    };

    const handleWhatsApp = () => {
        const rawPhone = phone.replace(/\D/g, '');
        const fullPhone = rawPhone.startsWith('57') ? rawPhone : `57${rawPhone}`;
        const url = `https://wa.me/${fullPhone}?text=${buildWhatsAppText()}`;
        window.open(url, '_blank');
    };

    const handleEmail = async () => {
        if (!gmailClientId) {
            alert('Configura el Gmail Client ID primero en Configuración → General / Logo.');
            return;
        }
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

            const date = new Date(patient.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            const bodyHtml = `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
                  <p>Estimado/a <strong>${patient.name || 'paciente'}</strong>,</p>
                  <p>Adjunto encontrará su <strong>${documentTitle}</strong> generado el ${date} en <strong>440 Clinic</strong>.</p>
                  <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
                  <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
                  <p style="margin:0;font-weight:600">${doctorName || 'Dr. Giovanni Fuentes'}</p>
                  <p style="margin:4px 0;color:#555">Cirujano Plástico Estético y Reconstructivo</p>
                  <p style="margin:4px 0;color:#555">RETHUS: ${rethus || 'CMC2017-222322'}</p>
                  <p style="margin:4px 0;color:#555">440 Clinic &mdash; ${address || 'Cra 47 # 79-191, Barranquilla'}</p>
                  <p style="margin:4px 0;color:#555">📞 +57 ${contactPhone || '3181800130'} &nbsp;|&nbsp; 🌐 ${websiteUrl || 'www.drgiovannifuentes.com'}</p>
                </div>
            `;

            await sendGmailWithAttachment({
                clientId: gmailClientId,
                to: email,
                subject: `${documentTitle} — ${patient.name} — 440 Clinic`,
                bodyHtml,
                pdfBlob,
                pdfFilename,
            });

            setSent(true);
            setTimeout(() => setSent(false), 4000);
        } catch (err: any) {
            setSendError(err.message || 'Error al enviar el correo.');
        }
        setSending(false);
    };

    const handleDownloadPdf = async () => {
        setLoading(true);
        try {
            // Trigger print and let browser handle it as Save PDF
            // We use a custom approach using dynamic CSS to show the printable area
            const printEl = document.querySelector('.printable-document') as HTMLElement;
            if (!printEl) {
                alert('Primero genera el contenido del documento en la vista activa.');
                setLoading(false);
                return;
            }

            // Dynamically import html2pdf
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

                {/* Email - Gmail */}
                <div style={{ background: 'rgba(234,67,53,0.05)', border: '1px solid rgba(234,67,53,0.25)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b91c1c' }}>
                        <Mail size={18} /> Enviar desde Gmail
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                        Abre Gmail en una nueva pestaña con el correo ya redactado. Solo da clic en <strong>Enviar</strong>.
                        Asegúrate de estar con sesión iniciada en Gmail.
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
                                disabled={!email || sending || !gmailClientId}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.65rem 1.1rem', borderRadius: '8px',
                                    border: 'none',
                                    background: (email && gmailClientId && !sending) ? 'linear-gradient(135deg, #ea4335, #c5221f)' : '#d1d5db',
                                    color: 'white', fontWeight: 600,
                                    cursor: (email && gmailClientId && !sending) ? 'pointer' : 'not-allowed',
                                    whiteSpace: 'nowrap', fontSize: '0.9rem',
                                }}
                            >
                                {sent ? <><CheckCircle size={16} /> ¡Enviado!</> : sending ? 'Enviando...' : <><Send size={16} /> Enviar</>}
                            </button>
                        </div>
                        {!gmailClientId && (
                            <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: 0 }}>
                                ⚠️ Configura tu Gmail Client ID en <strong>Configuración → General / Logo</strong> para activar el envío automático.
                            </p>
                        )}
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
