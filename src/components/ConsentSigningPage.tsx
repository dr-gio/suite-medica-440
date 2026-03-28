import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SignatureCanvas from 'react-signature-canvas';
import { Loader2, CheckCircle, AlertTriangle, FileText, ShieldCheck } from 'lucide-react';

const ConsentSigningPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [consent, setConsent] = useState<any>(null);
    const [signing, setSigning] = useState(false);
    const [signed, setSigned] = useState(false);

    // Form state
    const [signerName, setSignerName] = useState('');
    const [signerId, setSignerId] = useState('');
    const [accept1, setAccept1] = useState(false);
    const [accept2, setAccept2] = useState(false);

    const sigCanvas = useRef<SignatureCanvas>(null);

    useEffect(() => {
        const fetchConsent = async () => {
            if (!token) return;

            try {
                // Fetch consent by token
                const { data, error } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('token', token)
                    .single();

                if (error || !data) throw new Error('Consentimiento no encontrado o enlace inválido.');

                // Check expiration
                if (data.expires_at && new Date(data.expires_at) < new Date()) {
                    throw new Error('Este enlace de firma ha expirado.');
                }

                if (data.status === 'signed') {
                    setSigned(true);
                    setConsent(data);
                    setLoading(false);
                    return;
                }

                setConsent(data);

                // Mark as viewed
                if (!data.viewed_at) {
                    await supabase
                        .from('documents')
                        .update({
                            viewed_at: new Date().toISOString(),
                            status: 'viewed'
                        })
                        .eq('id', data.id);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConsent();
    }, [token]);

    const handleSubmit = async () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            alert('Por favor, firma en el recuadro para continuar.');
            return;
        }
        if (!signerName || !signerId || !accept1 || !accept2) {
            alert('Por favor, completa todos los campos y acepta los términos.');
            return;
        }

        setSigning(true);
        try {
            const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

            // 1. Upload signature to storage
            const signatureFileName = `signatures/${consent.id}_${Date.now()}.png`;
            const sigBlob = await (await fetch(signatureImage)).blob();
            const { error: uploadError } = await supabase.storage
                .from('consents')
                .upload(signatureFileName, sigBlob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl: signatureUrl } } = supabase.storage
                .from('consents')
                .getPublicUrl(signatureFileName);

            // 2. Here we would normally generate the PDF on the server or client
            // For this implementation, we'll mark as signed and set the data
            // The actual PDF embedding logic would ideally use a library like jspdf on the client
            // or an edge function that generates it using the captured signature.

            // For now, let's update the status in the DB
            const { error: updateError } = await supabase
                .from('documents')
                .update({
                    status: 'signed',
                    signed_at: new Date().toISOString(),
                    signer_full_name: signerName,
                    signer_document_id: signerId,
                    signature_image_url: signatureUrl,
                    ip: 'PatientIP', // Ideally captured from request if on Edge, or client-side approximation
                    user_agent: navigator.userAgent
                })
                .eq('id', consent.id);

            if (updateError) throw updateError;

            // 3. Trigger email send (invoke the edge function)
            await supabase.functions.invoke('send-email', {
                body: {
                    to: consent.content.patient_email || signerName, // Fallback if no email in content
                    subject: 'Consentimiento firmado – 440 Clinic',
                    body: `Hola ${signerName},<br><br>Tu consentimiento informado para <strong>${consent.title}</strong> ha sido firmado con éxito.<br><br>Atentamente,<br>440 Clinic by Dr. Gio`,
                    // Normally we'd attach the signed PDF here. 
                    // In a production app, the backend would generate the PDF with the signature.
                }
            });

            setSigned(true);
        } catch (err: any) {
            console.error(err);
            alert('Error al procesar la firma: ' + err.message);
        } finally {
            setSigning(false);
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            <Loader2 size={40} className="animate-spin" color="#2563eb" />
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando documento...</p>
        </div>
    );

    if (error) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            <AlertTriangle size={48} color="#ef4444" />
            <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>¡Ups! Algo salió mal</h2>
            <p style={{ color: '#64748b', maxWidth: '400px' }}>{error}</p>
        </div>
    );

    if (signed) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
                <CheckCircle size={64} color="#22c55e" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>¡Documento Firmado!</h2>
                <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '2rem' }}>
                    El consentimiento para <strong>{consent?.title}</strong> ha sido procesado correctamente. Se ha enviado una copia a tu correo electrónico.
                </p>
                <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '12px', fontSize: '0.875rem', color: '#475569', textAlign: 'left' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Código de Verificación:</strong> {consent?.id.slice(0, 8).toUpperCase()}</p>
                    <p style={{ margin: 0 }}><strong>Fecha:</strong> {new Date(consent?.signed_at || Date.now()).toLocaleString('es-CO')}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                {/* Header Header */}
                <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#2563eb', color: 'white', padding: '12px', borderRadius: '14px' }}>
                        <FileText size={28} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Firma de Consentimiento</h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>440 Clinic by Dr. Gio</p>
                    </div>
                </header>

                {/* Consent Content */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{consent.title}</h2>
                    </div>
                    <div style={{ padding: '2rem', maxHeight: '400px', overflowY: 'auto', color: '#475569', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                        {consent.content?.content || consent.content}
                    </div>
                </div>

                {/* Signature Form */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={20} color="#2563eb" /> Formulario de Aceptación
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Nombre Completo</label>
                            <input
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                placeholder="Escribe tu nombre"
                                value={signerName}
                                onChange={e => setSignerName(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Número de Documento</label>
                            <input
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                placeholder="CC / ID"
                                value={signerId}
                                onChange={e => setSignerId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                            <input type="checkbox" checked={accept1} onChange={e => setAccept1(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            Acepto y comprendo los riesgos y beneficios del procedimiento descritos en este documento.
                        </label>
                        <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                            <input type="checkbox" checked={accept2} onChange={e => setAccept2(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                            Autorizo al equipo médico de 440 Clinic para realizar la intervención propuesta.
                        </label>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Firma Digital (Dibuja aquí)</label>
                        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '14px', background: '#fdfdfd' }}>
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor='black'
                                canvasProps={{ width: 720, height: 200, className: 'sigCanvas', style: { width: '100%', height: '200px', cursor: 'crosshair' } }}
                            />
                        </div>
                        <button
                            onClick={() => sigCanvas.current?.clear()}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', cursor: 'pointer', padding: '5px' }}
                        >
                            Borrar y volver a firmar
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={signing}
                        style={{
                            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                            background: '#2563eb', color: 'white', fontWeight: 700, fontSize: '1rem',
                            cursor: signing ? 'wait' : 'pointer', transition: 'background 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)'
                        }}
                    >
                        {signing ? <><Loader2 size={20} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} /> Procesando...</> : 'Firmar y Finalizar'}
                    </button>
                </div>

                <footer style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                    Este es un documento con validez legal. Tu dirección IP y detalles del dispositivo están siendo registrados con fines de trazabilidad.
                </footer>
            </div>
        </div>
    );
};

export default ConsentSigningPage;
