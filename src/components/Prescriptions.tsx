import { Plus, X, Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { useState, useRef } from 'react';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const Prescriptions: React.FC<Props> = ({ patient }) => {
    const { medications } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [searchTerm, setSearchTerm] = useState('');
    const [meds, setMeds] = useState<any[]>([]);

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

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Formula_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            {/* Editor View */}
            <div className="form-section no-print" style={{ flex: 1, border: 'none', padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Fórmula Médica</h2>
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

                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', height: 'calc(100vh - 250px)' }}>
                    {/* Selection Sidebar */}
                    <div style={{ background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <label className="form-label">Buscar Medicamento</label>
                            <input 
                                className="form-input" 
                                placeholder="Ej: Amoxicilina..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((m) => (
                                    <div 
                                        key={m.id} 
                                        className="item-card" 
                                        style={{ 
                                            padding: '0.75rem', 
                                            marginBottom: '0.5rem', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: '1px solid transparent'
                                        }}
                                        onClick={() => addMedFromCatalog(m)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{m.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.dosage}</div>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="table-container" style={{ flex: 1, overflowY: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
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
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
                                                    value={med.name} 
                                                    onChange={(e) => updateMed(index, 'name', e.target.value)}
                                                    placeholder="Nombre del medicamento..."
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
                                                    value={med.dosage} 
                                                    onChange={(e) => updateMed(index, 'dosage', e.target.value)}
                                                    placeholder="Ej: Tabletas"
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
                                                    value={med.frequency} 
                                                    onChange={(e) => updateMed(index, 'frequency', e.target.value)}
                                                    placeholder="Ej: Cada 8 horas"
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem 1rem' }}>
                                                <input 
                                                    className="form-input" 
                                                    style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
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
                                    {meds.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Selecciona medicamentos de la izquierda para agregarlos a la fórmula.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {meds.some(m => m.name) && (
                            <div style={{ padding: '1rem', background: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem' }}>Indicaciones Globales / Notas:</div>
                                <textarea 
                                    className="form-input"
                                    placeholder="Agregue indicaciones generales si es necesario..."
                                    style={{ width: '100%', minHeight: '80px', background: 'white' }}
                                    // Note: we could add a root field for global indications if needed, 
                                    // for now we'll just keep it simple or use the last one's indications
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
            `}</style>
        </div>
    );
};

export default Prescriptions;
