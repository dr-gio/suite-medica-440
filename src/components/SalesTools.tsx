import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, FileText, Download } from 'lucide-react';

const SalesTools: React.FC = () => {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFiles = async () => {
        setLoading(true);
        const { data, error } = await supabase.storage.from('sales_documents').list();
        if (error) {
            console.error('Error fetching sales documents:', error);
        } else if (data) {
            // Filter out empty folder placeholders or hidden files
            setFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
        }
        setLoading(false);
    };

    useEffect(() => { loadFiles(); }, []);

    const handleDownload = async (fileName: string) => {
        // Request a short-lived signed URL to securely download the file
        const { data, error } = await supabase.storage.from('sales_documents').createSignedUrl(fileName, 60);
        if (error) {
            console.error('Error creating signed URL:', error);
            alert('Error al intentar descargar el archivo.');
            return;
        }

        // Open the document in a new tab (which triggers download for files like PDF/DOCX)
        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank');
        }
    };

    return (
        <div className="tool-view no-print">
            <div className="form-section" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                    Herramientas de Ventas
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Documentos pre-diseñados, PDFs informativos y recursos listos para descargar y compartir con tus pacientes.
                </p>

                <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem', width: '100%', background: 'transparent', border: 'none', padding: 0 }}>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', padding: '3rem', justifyContent: 'center', width: '100%', background: 'var(--bg-color)', borderRadius: '12px' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> Cargando documentos...
                        </div>
                    ) : files.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', width: '100%', color: 'var(--text-muted)', background: 'var(--bg-color)', borderRadius: '12px' }}>
                            <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--primary)' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No hay documentos disponibles en este momento.</p>
                            <p style={{ fontSize: '0.9rem' }}>Puedes gestionar (subir y eliminar) documentos desde la sección de <strong>Configuración &gt; Archivos de Venta</strong>.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
                            {files.map(f => (
                                <div key={f.id} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    padding: '1.5rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                    height: '100%'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '10px', color: 'var(--primary)' }}>
                                            <FileText size={28} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3' }} title={f.name.replace(/^\d+_/, '')}>
                                                {f.name.replace(/^\d+_/, '')}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                {f.metadata?.size ? (f.metadata.size / 1024 / 1024).toFixed(2) : 0} MB
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="action-btn primary"
                                        onClick={() => handleDownload(f.name)}
                                        style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', padding: '0.75rem' }}
                                    >
                                        <Download size={18} /> Descargar Archivo
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default SalesTools;
