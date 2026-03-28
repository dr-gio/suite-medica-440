import React, { useState, useRef } from 'react';
import { Plus, X, Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const Imaging: React.FC<Props> = ({ patient }) => {
    const { imaging: catalogImaging } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [searchTerm, setSearchTerm] = useState('');
    const [studies, setStudies] = useState<any[]>([]);
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

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Imagenes_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none', padding: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Imágenes Diagnósticas</h2>
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

                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', height: 'calc(100vh - 300px)' }}>
                    {/* Selection Sidebar */}
                    <div style={{ background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <label className="form-label">Buscar Estudio</label>
                            <input 
                                className="form-input" 
                                placeholder="Ej: Ecografía..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((s) => (
                                    <div 
                                        key={s.id} 
                                        className="item-card" 
                                        style={{ 
                                            padding: '0.75rem', 
                                            marginBottom: '0.5rem', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: '1px solid transparent'
                                        }}
                                        onClick={() => addStudyFromCatalog(s)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{s.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.reason}</div>
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
                    <div className="table-container" style={{ overflowY: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
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
                                                style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
                                                value={study.name} 
                                                onChange={(e) => updateStudy(index, 'name', e.target.value)}
                                                placeholder="Nombre del estudio..."
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem 1rem' }}>
                                            <input 
                                                className="form-input" 
                                                style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
                                                value={study.reason} 
                                                onChange={(e) => updateStudy(index, 'reason', e.target.value)}
                                                placeholder="Ej: Descartar litiasis"
                                            />
                                        </td>
                                        <td style={{ padding: '0.5rem 1rem' }}>
                                            <select 
                                                className="form-input" 
                                                style={{ border: 'none', padding: '0.4rem', background: 'transparent' }} 
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
                                {studies.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Selecciona estudios de la izquierda para solicitarlos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
            `}</style>
        </div>
    );
};

export default Imaging;
