import React, { useState, useRef } from 'react';
import { Plus, X, Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const LabRequests: React.FC<Props> = ({ patient }) => {
    const { labs: catalogLabs } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [searchTerm, setSearchTerm] = useState('');
    const [labs, setLabs] = useState<any[]>([]);
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

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Laboratorios_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none', padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Solicitud de Laboratorios</h2>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', height: 'calc(100vh - 300px)' }}>
                    {/* Selection Sidebar */}
                    <div style={{ background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <label className="form-label">Buscar Examen</label>
                            <input 
                                className="form-input" 
                                placeholder="Ej: Hemograma..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((l) => (
                                    <div 
                                        key={l.id} 
                                        className="item-card" 
                                        style={{ 
                                            padding: '0.75rem', 
                                            marginBottom: '0.5rem', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: '1px solid transparent'
                                        }}
                                        onClick={() => addLabFromCatalog(l)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{l.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.indications}</div>
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
                    <div className="table-container" style={{ overflowY: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
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
                                                style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
                                                value={lab.name} 
                                                onChange={(e) => updateLab(index, 'name', e.target.value)}
                                                placeholder="Nombre del examen..."
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem 1rem' }}>
                                            <input 
                                                className="form-input" 
                                                style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
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
                                {labs.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Selecciona exámenes de la izquierda para solicitarlos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
            `}</style>
        </div>
    );
};

export default LabRequests;
