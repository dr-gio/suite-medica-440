import React, { useState, useRef } from 'react';
import { Plus, X, Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';

interface Props {
    patient: any;
}

const Imaging: React.FC<Props> = ({ patient }) => {
    const { imaging: catalogImaging, doctorName, rethus, contactPhone } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [searchTerm, setSearchTerm] = useState('');
    const [studies, setStudies] = useState<any[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [dx, setDx] = useState('');

    const filteredCatalog = catalogImaging.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addStudyFromCatalog = (catalogStudy: any) => {
        setStudies([...studies, { 
            name: catalogStudy.name, 
            reason: catalogStudy.reason, 
            format: catalogStudy.format || 'Digital o Impreso' 
        }]);
    };

    const addCustomStudy = () => {
        setStudies([...studies, { name: '', reason: '', format: 'Digital o Impreso' }]);
    };

    const removeStudy = (index: number) => setStudies(studies.filter((_, i) => i !== index));

    const updateStudy = (index: number, field: string, value: string) => {
        const newStudies = [...studies];
        newStudies[index] = { ...newStudies[index], [field]: value };
        setStudies(newStudies);
    };

    const handleDownload = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar la solicitud.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const filename = `Imagenes_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, filename);
            
            if (pdfBlob && window.confirm(`¿Deseas enviar esta solicitud de imágenes por correo a ${patient.email}?`)) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                            <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                            <p>Adjunto encontrarás tu <strong>Solicitud de Imágenes Diagnósticas</strong> generada en 440 Clinic.</p>
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
                            subject: `Orden de Imágenes Diagnósticas - ${patient.name}`,
                            body: bodyHtml,
                            pdfBase64: base64data,
                            pdfFilename: filename,
                            documentId: patient.id
                        });
                        alert('Correo enviado exitosamente.');
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
            <div className="form-section no-print" style={{ flex: 1, border: 'none', padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Imágenes Diagnósticas</h2>
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

                <div className="form-group" style={{ marginBottom: '1.5rem', padding: '0 1rem' }}>
                    <label className="form-label">Diagnóstico Clínico / Justificación Médica</label>
                    <input className="form-input" placeholder="Ej: Dolor abdominal en estudio" value={dx} onChange={(e) => setDx(e.target.value)} />
                </div>

                <div className="responsive-split-view" style={{ height: 'calc(100vh - 350px)' }}>
                    {/* Selection Sidebar */}
                    <div className="internal-selection-sidebar">
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <label className="form-label">Buscar Estudio</label>
                            <input 
                                id="imaging-search-input"
                                className="form-input" 
                                placeholder="Ej: Ecografía..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="catalog-list">
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((s) => (
                                    <div 
                                        key={s.id} 
                                        className="item-card catalog-item" 
                                        onClick={() => addStudyFromCatalog(s)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <div className="item-title-text">{s.name}</div>
                                                <div className="item-subtitle-text">{s.reason}</div>
                                            </div>
                                            <Plus size={16} color="var(--primary)" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No se encontraron estudios.
                                </div>
                            )}
                        </div>
                        <button 
                            className="action-btn" 
                            onClick={addCustomStudy}
                            style={{ margin: '1rem', justifyContent: 'center', borderStyle: 'dashed' }}
                        >
                            <Plus size={18} />
                            Otro / Personalizado
                        </button>
                    </div>

                    {/* Requested List */}
                    <div className="selected-items-container">
                        {/* Desktop Table */}
                        <div className="desktop-only table-container" style={{ flex: 1, overflowY: 'auto', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 1, borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estudio / Región</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Indicación Médica</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', width: '180px' }}>Formato</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studies.map((study, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={study.name} 
                                                    onChange={(e) => updateStudy(index, 'name', e.target.value)}
                                                    placeholder="Nombre del estudio..."
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={study.reason} 
                                                    onChange={(e) => updateStudy(index, 'reason', e.target.value)}
                                                    placeholder="Ej: Descartar litiasis"
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <select 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={study.format} 
                                                    onChange={(e) => updateStudy(index, 'format', e.target.value)}
                                                >
                                                    <option>Digital o Impreso</option>
                                                    <option>Solo Cd / Digital</option>
                                                    <option>Placas Impresas</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                                                <button className="remove-btn" onClick={() => removeStudy(index)}><X size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="mobile-only" style={{ flex: 1, overflowY: 'auto' }}>
                            {studies.map((study, index) => (
                                <div key={index} className="mobile-card-v2">
                                    <div className="card-v2-header">
                                        <span className="card-v2-badge">Imagen / Ayuda #{index + 1}</span>
                                        <button className="card-v2-remove" onClick={() => removeStudy(index)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="card-v2-body">
                                        <div className="field-group">
                                            <label className="field-label">Estudio / Región</label>
                                            <input 
                                                className="form-input mobile-input" 
                                                value={study.name} 
                                                onChange={(e) => updateStudy(index, 'name', e.target.value)}
                                                placeholder="Nombre del estudio..."
                                            />
                                        </div>
                                        <div className="field-group">
                                            <label className="field-label">Indicación Médica</label>
                                            <input 
                                                className="form-input mobile-input" 
                                                value={study.reason} 
                                                onChange={(e) => updateStudy(index, 'reason', e.target.value)}
                                                placeholder="Ej: Descartar litiasis"
                                            />
                                        </div>
                                        <div className="field-group">
                                            <label className="field-label">Formato de Entrega</label>
                                            <select 
                                                className="form-input mobile-input" 
                                                value={study.format} 
                                                onChange={(e) => updateStudy(index, 'format', e.target.value)}
                                            >
                                                <option>Digital o Impreso</option>
                                                <option>Solo Cd / Digital</option>
                                                <option>Placas Impresas</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {studies.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                Selecciona estudios de la lista para solicitarlos.
                            </div>
                        )}

                        <div className="mobile-only" style={{ padding: '0 0.5rem 2rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {studies.length > 0 && (
                                <>
                                    <button 
                                        className="action-btn" 
                                        onClick={() => {
                                            const searchInput = document.getElementById('imaging-search-input');
                                            if (searchInput) {
                                                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                setTimeout(() => searchInput.focus(), 500);
                                            } else {
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        style={{ justifyContent: 'center', background: 'var(--primary)', color: 'white', width: '100%', padding: '0.75rem', fontSize: '1rem', border: 'none' }}
                                    >
                                        <Plus size={18} />
                                        Buscar en Base de Datos
                                    </button>
                                    <button 
                                        className="action-btn" 
                                        onClick={addCustomStudy}
                                        style={{ justifyContent: 'center', borderStyle: 'dashed', width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                                    >
                                        <Plus size={18} />
                                        Añadir estudio manual
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title="Imágenes Diagnósticas">
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', color: '#1f2937' }}>
                        {dx && <p style={{ marginBottom: '1rem', fontSize: '10pt' }}><strong>Motivo / Diagnóstico:</strong> {dx}</p>}
                        <p style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '10pt' }}>Se solicita amablemente realizar los siguientes estudios imagenológicos:</p>

                        <ul className="print-list" style={{ marginTop: '0.5rem' }}>
                            {studies.filter(s => s.name).map((study, idx) => (
                                <li key={idx} className="print-list-item" style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #e5e7eb' }}>
                                    <div className="print-item-title" style={{ fontSize: '10pt', fontWeight: 700 }}>{idx + 1}. {study.name}</div>
                                    <p className="print-item-desc" style={{ fontSize: '9pt', marginTop: '0.2rem', color: '#4b5563' }}><strong>Indicación:</strong> {study.reason || 'S/A'}</p>
                                    <p className="print-item-desc" style={{ marginTop: '0.25rem', fontSize: '9pt', color: '#64748b', fontStyle: 'italic' }}>Entregar en formato: {study.format}</p>
                                </li>
                            ))}
                            {studies.filter(s => s.name).length === 0 && (
                                <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>No hay estudios solicitados todavía.</p>
                            )}
                        </ul>
                    </div>
                </PrintLayout>
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .item-card:hover { border-color: var(--primary) !important; background: var(--primary-light) !important; }
                
                .responsive-split-view {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 1.5rem;
                    height: calc(100vh - 250px);
                }

                .internal-selection-sidebar {
                    background: var(--bg-main);
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .catalog-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.5rem;
                }

                .catalog-item {
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .item-title-text {
                    font-weight: 600;
                    color: var(--text-main);
                    fontSize: 0.9rem;
                }

                .item-subtitle-text {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .selected-items-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    overflow: hidden;
                }

                .mobile-card-v2 {
                    background: var(--surface);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    margin-bottom: 1.25rem;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }

                .card-v2-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: var(--bg-main);
                    border-bottom: 1px solid var(--border-color);
                }

                .card-v2-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .card-v2-remove {
                    background: none;
                    border: none;
                    color: #ef4444;
                    padding: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                }

                .card-v2-remove:active {
                    opacity: 1;
                    transform: scale(0.9);
                }

                .card-v2-body {
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .field-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                }

                .mobile-input {
                    padding: 0.6rem 0.8rem !important;
                    font-size: 0.9rem !important;
                    background: var(--bg-main) !important;
                    border: 1px solid var(--border-color) !important;
                }

                @media (max-width: 1024px) {
                    .responsive-split-view {
                        grid-template-columns: 300px 1fr;
                        gap: 1rem;
                    }
                }

                @media (max-width: 768px) {
                    .responsive-split-view {
                        display: flex;
                        flex-direction: column;
                        height: auto;
                        gap: 1.5rem;
                    }

                    .internal-selection-sidebar {
                        height: 350px;
                        width: 100%;
                    }

                    .selected-items-container {
                        height: auto;
                        overflow: visible;
                    }
                }
            `}</style>
        </div>
    );
};

export default Imaging;
