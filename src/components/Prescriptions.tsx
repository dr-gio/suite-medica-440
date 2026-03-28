import { Plus, X, Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { useState, useRef } from 'react';
import { usePDF } from '../hooks/usePDF';

import { emailService } from '../services/emailService';

interface Props {
    patient: any;
}

const Prescriptions: React.FC<Props> = ({ patient }) => {
    const { medications, doctorName, rethus, contactPhone } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [searchTerm, setSearchTerm] = useState('');
    const [meds, setMeds] = useState<any[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);

    const filteredCatalog = medications.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addMedFromCatalog = (catalogMed: any) => {
        setMeds([...meds, { 
            name: catalogMed.name, 
            dosage: catalogMed.dosage, 
            frequency: catalogMed.frequency, 
            duration: catalogMed.duration, 
            indications: catalogMed.indications 
        }]);
    };

    const addCustomMed = () => {
        setMeds([...meds, { name: '', dosage: '', frequency: '', duration: '', indications: '' }]);
    };

    const removeMed = (index: number) => setMeds(meds.filter((_, i) => i !== index));

    const updateMed = (index: number, field: string, value: string) => {
        const newMeds = [...meds];
        newMeds[index] = { ...newMeds[index], [field]: value };
        setMeds(newMeds);
    };

    const handleDownload = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar la fórmula.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const filename = `Formula_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, filename);
            
            if (pdfBlob && window.confirm(`¿Deseas enviar esta fórmula por correo a ${patient.email}?`)) {
                // Convert blob to base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                          <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                          <p>Adjunto encontrarás tu <strong>Fórmula Médica</strong> generada en 440 Clinic.</p>
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

                    const { error } = await emailService.sendMedicalDocument({
                        to: patient.email,
                        subject: `Fórmula Médica – 440 Clinic`,
                        body: bodyHtml,
                        pdfBase64: base64data,
                        pdfFilename: filename,
                        documentId: patient.id
                    });

                    if (error) {
                        alert('Error al enviar el correo: ' + error);
                    } else {
                        alert('¡Fórmula enviada correctamente!');
                    }
                };
                reader.readAsDataURL(pdfBlob);
            }
        }
    };

    return (
        <div className="tool-view">
            {/* Editor View */}
            <div className="form-section no-print" style={{ flex: 1, border: 'none', padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Fórmula Médica</h2>
                    {validationError && (
                    <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

                <div className="responsive-split-view">
                    {/* Selection Sidebar */}
                    <div className="internal-selection-sidebar">
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <label className="form-label">Buscar Medicamento</label>
                            <input 
                                className="form-input" 
                                placeholder="Ej: Amoxicilina..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="catalog-list">
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((m) => (
                                    <div 
                                        key={m.id} 
                                        className="item-card catalog-item" 
                                        onClick={() => addMedFromCatalog(m)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <div className="item-title-text">{m.name}</div>
                                                <div className="item-subtitle-text">{m.dosage}</div>
                                            </div>
                                            <Plus size={16} color="var(--primary)" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No se encontraron medicamentos.
                                </div>
                            )}
                        </div>
                        <button 
                            className="action-btn" 
                            onClick={addCustomMed}
                            style={{ margin: '1rem', justifyContent: 'center', borderStyle: 'dashed' }}
                        >
                            <Plus size={18} />
                            Otro / Personalizado
                        </button>
                    </div>

                    {/* Prescribed List */}
                    <div className="selected-items-container">
                        {/* Desktop Table */}
                        <div className="desktop-only table-container" style={{ flex: 1, overflowY: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 1, borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Medicamento</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', width: '150px' }}>Dosis/Presentación</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', width: '180px' }}>Frecuencia (Horas)</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', width: '150px' }}>Duración (Días)</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meds.map((med, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={med.name} 
                                                    onChange={(e) => updateMed(index, 'name', e.target.value)}
                                                    placeholder="Nombre del medicamento..."
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={med.dosage} 
                                                    onChange={(e) => updateMed(index, 'dosage', e.target.value)}
                                                    placeholder="Ej: Tabletas"
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={med.frequency} 
                                                    onChange={(e) => updateMed(index, 'frequency', e.target.value)}
                                                    placeholder="Ej: Cada 8 horas"
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent', width: '100%' }} 
                                                    value={med.duration} 
                                                    onChange={(e) => updateMed(index, 'duration', e.target.value)}
                                                    placeholder="Ej: Por 7 días"
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                                                <button className="remove-btn" onClick={() => removeMed(index)}><X size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="mobile-only" style={{ flex: 1, overflowY: 'auto' }}>
                            {meds.map((med, index) => (
                                <div key={index} className="mobile-card">
                                    <div className="mobile-card-header">
                                        <div style={{ flex: 1 }}>
                                            <span className="mobile-card-label">Medicamento</span>
                                            <input 
                                                className="form-input" 
                                                value={med.name} 
                                                onChange={(e) => updateMed(index, 'name', e.target.value)}
                                                placeholder="Nombre del medicamento..."
                                                style={{ border: 'none', padding: '0.25rem 0', fontWeight: 600, fontSize: '1rem', width: '100%' }}
                                            />
                                        </div>
                                        <button className="remove-btn" onClick={() => removeMed(index)}><X size={20} /></button>
                                    </div>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: 0 }}>
                                        <div className="mobile-card-row">
                                            <span className="mobile-card-label">Dosis</span>
                                            <input 
                                                className="form-input" 
                                                value={med.dosage} 
                                                onChange={(e) => updateMed(index, 'dosage', e.target.value)}
                                                placeholder="Tabletas/Jarabe"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div className="mobile-card-row">
                                            <span className="mobile-card-label">Frecuencia</span>
                                            <input 
                                                className="form-input" 
                                                value={med.frequency} 
                                                onChange={(e) => updateMed(index, 'frequency', e.target.value)}
                                                placeholder="Ej: 8h"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Duración</span>
                                        <input 
                                            className="form-input" 
                                            value={med.duration} 
                                            onChange={(e) => updateMed(index, 'duration', e.target.value)}
                                            placeholder="Por cuantos días"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {meds.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                Selecciona de la lista para agregar.
                            </div>
                        )}

                        {meds.some(m => m.name) && (
                            <div style={{ padding: '1rem', background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>Indicaciones Globales / Notas:</div>
                                <textarea 
                                    className="form-input"
                                    placeholder="Agregue indicaciones generales si es necesario..."
                                    style={{ width: '100%', minHeight: '80px', background: 'white' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title="Fórmula Médica">
                    <div style={{ lineHeight: '1.5', marginTop: '0.5rem', color: '#1f2937' }}>
                        <ul className="print-list" style={{ marginTop: '0.5rem' }}>
                            {meds.filter(m => m.name).map((med, idx) => (
                                <li key={idx} className="print-list-item" style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #e5e7eb' }}>
                                    <div className="print-item-title" style={{ fontSize: '10pt', fontWeight: 700 }}>{idx + 1}. {med.name} {med.dosage && `- ${med.dosage}`}</div>
                                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.2rem' }}>
                                        {med.frequency && <p className="print-item-desc" style={{ fontSize: '9pt', margin: 0 }}><strong>Frecuencia:</strong> {med.frequency}</p>}
                                        {med.duration && <p className="print-item-desc" style={{ fontSize: '9pt', margin: 0 }}><strong>Duración:</strong> {med.duration}</p>}
                                    </div>
                                    {med.indications && <p className="print-item-desc" style={{ marginTop: '0.25rem', fontSize: '9pt', color: '#4b5563', fontStyle: 'italic' }}>Indicaciones: {med.indications}</p>}
                                </li>
                            ))}
                            {meds.filter(m => m.name).length === 0 && (
                                <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>No hay medicamentos recetados todavía.</p>
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

export default Prescriptions;
