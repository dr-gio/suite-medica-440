import React, { useState, useRef } from 'react';
import { Plus, X, Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';

interface Props {
    patient: any;
}

const LabRequests: React.FC<Props> = ({ patient }) => {
    const { labs: catalogLabs, doctorName, rethus, contactPhone } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [searchTerm, setSearchTerm] = useState('');
    const [labs, setLabs] = useState<any[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [dx, setDx] = useState('');

    const filteredCatalog = catalogLabs.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addLabFromCatalog = (catalogLab: any) => {
        setLabs([...labs, { 
            name: catalogLab.name, 
            indications: catalogLab.indications 
        }]);
    };

    const addCustomLab = () => {
        setLabs([...labs, { name: '', indications: '' }]);
    };

    const removeLab = (index: number) => setLabs(labs.filter((_, i) => i !== index));

    const updateLab = (index: number, field: string, value: string) => {
        const newLabs = [...labs];
        newLabs[index] = { ...newLabs[index], [field]: value };
        setLabs(newLabs);
    };

    const handleDownload = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar la solicitud.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const filename = `Laboratorios_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, filename);
            
            if (pdfBlob && window.confirm(`¿Deseas enviar esta solicitud por correo a ${patient.email}?`)) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                          <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                          <p>Adjunto encontrarás tu <strong>Solicitud de Laboratorios</strong> generada en 440 Clinic.</p>
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
                            subject: `Orden de Laboratorio - ${patient.name}`,
                            body: bodyHtml,
                            pdfBase64: base64data,
                            pdfFilename: filename
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
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Laboratorios y Exámenes</h2>
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
                    <label className="form-label">Diagnóstico Clínico (Requerido para EPS/Prepaga)</label>
                    <input className="form-input" placeholder="Ej: Control Post-operatorio" value={dx} onChange={(e) => setDx(e.target.value)} />
                </div>                <div className="responsive-split-view" style={{ height: 'calc(100vh - 350px)' }}>
                    {/* Selection Sidebar */}
                    <div className="internal-selection-sidebar">
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <label className="form-label">Buscar Examen</label>
                            <input 
                                className="form-input" 
                                placeholder="Ej: Hemograma..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="catalog-list">
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((l) => (
                                    <div 
                                        key={l.id} 
                                        className="item-card catalog-item" 
                                        onClick={() => addLabFromCatalog(l)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <div className="item-title-text">{l.name}</div>
                                                <div className="item-subtitle-text">{l.indications}</div>
                                            </div>
                                            <Plus size={16} color="var(--primary)" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No se encontraron exámenes.
                                </div>
                            )}
                        </div>
                        <button 
                            className="action-btn" 
                            onClick={addCustomLab}
                            style={{ margin: '1rem', justifyContent: 'center', borderStyle: 'dashed' }}
                        >
                            <Plus size={18} />
                            Otro / Personalizado
                        </button>
                    </div>

                    {/* Requested List */}
                    <div className="selected-items-container">
                        {/* Desktop Table */}
                        <div className="desktop-only table-container" style={{ flex: 1, overflowY: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 1, borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre del Examen</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Indicaciones Especiales</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labs.map((lab, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={lab.name} 
                                                    onChange={(e) => updateLab(index, 'name', e.target.value)}
                                                    placeholder="Nombre del examen..."
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={lab.indications} 
                                                    onChange={(e) => updateLab(index, 'indications', e.target.value)}
                                                    placeholder="Ej: Ayuno de 8 horas"
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                                                <button className="remove-btn" onClick={() => removeLab(index)}><X size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="mobile-only" style={{ flex: 1, overflowY: 'auto' }}>
                            {labs.map((lab, index) => (
                                <div key={index} className="mobile-card">
                                    <div className="mobile-card-header">
                                        <div style={{ flex: 1 }}>
                                            <span className="mobile-card-label">Examen</span>
                                            <input 
                                                className="form-input" 
                                                value={lab.name} 
                                                onChange={(e) => updateLab(index, 'name', e.target.value)}
                                                placeholder="Nombre del examen..."
                                                style={{ border: 'none', padding: '0.25rem 0', fontWeight: 600, fontSize: '1rem', width: '100%' }}
                                            />
                                        </div>
                                        <button className="remove-btn" onClick={() => removeLab(index)}><X size={20} /></button>
                                    </div>
                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Indicaciones Especiales</span>
                                        <input 
                                            className="form-input" 
                                            value={lab.indications} 
                                            onChange={(e) => updateLab(index, 'indications', e.target.value)}
                                            placeholder="Ej: Ayuno de 8 horas"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {labs.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                Selecciona exámenes de la lista para solicitarlos.
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title="Solicitud de Laboratorios">
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', color: '#1f2937' }}>
                        {dx && <p style={{ marginBottom: '1rem', fontSize: '10pt' }}><strong>Diagnóstico Clínico:</strong> {dx}</p>}
                        <p style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '10pt' }}>Se solicita amablemente realizar los siguientes exámenes:</p>

                        <ul className="print-list" style={{ marginTop: '0.5rem' }}>
                            {labs.filter(l => l.name).map((lab, idx) => (
                                <li key={idx} className="print-list-item" style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #e5e7eb' }}>
                                    <div className="print-item-title" style={{ fontSize: '10pt', fontWeight: 700 }}>{idx + 1}. {lab.name}</div>
                                    {lab.indications && <p className="print-item-desc" style={{ fontSize: '9pt', marginTop: '0.2rem', color: '#4b5563' }}><em>Indicaciones: {lab.indications}</em></p>}
                                </li>
                            ))}
                            {labs.filter(l => l.name).length === 0 && (
                                <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>No hay exámenes solicitados todavía.</p>
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

export default LabRequests;
