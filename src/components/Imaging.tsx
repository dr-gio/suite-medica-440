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
    const [studies, setStudies] = useState([
        { name: '', reason: '', format: 'Digital o Impreso' }
    ]);
    const [dx, setDx] = useState('');

    const addStudy = () => setStudies([...studies, { name: '', reason: '', format: 'Digital o Impreso' }]);
    const removeStudy = (index: number) => setStudies(studies.filter((_, i) => i !== index));

    const updateStudy = (index: number, field: string, value: string) => {
        const newStudies = [...studies];
        newStudies[index] = { ...newStudies[index], [field]: value };

        if (field === 'name') {
            const match = catalogImaging.find(l => l.name === value);
            if (match) {
                if (!newStudies[index].reason) newStudies[index].reason = match.reason;
                if (match.format) newStudies[index].format = match.format;
            }
        }

        setStudies(newStudies);
    };

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Imagenes_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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

                <datalist id="imaging-list">
                    {catalogImaging.map(l => <option key={l.id} value={l.name} />)}
                </datalist>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Diagnóstico Clínico / Justificación Médica</label>
                    <input className="form-input" placeholder="Ej: Dolor abdominal en estudio" value={dx} onChange={(e) => setDx(e.target.value)} />
                </div>

                {studies.map((study, index) => (
                    <div key={index} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem', borderLeft: '4px solid var(--primary-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Estudio #{index + 1}</span>
                            <button className="remove-btn" onClick={() => removeStudy(index)}><X size={18} /></button>
                        </div>

                        <div className="form-row" style={{ marginBottom: 0 }}>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label className="form-label">Nombre del Estudio / Región Anatómica</label>
                                <input className="form-input" list="imaging-list" placeholder="Ej: Ecografía Abdominal Total" value={study.name} onChange={(e) => updateStudy(index, 'name', e.target.value)} />
                            </div>
                        </div>

                        <div className="form-row" style={{ marginBottom: 0 }}>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label className="form-label">Indicación Médica</label>
                                <input className="form-input" placeholder="Ej: Descartar litiasis" value={study.reason} onChange={(e) => updateStudy(index, 'reason', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Formato Deseado</label>
                                <select className="form-input" value={study.format} onChange={(e) => updateStudy(index, 'format', e.target.value)}>
                                    <option>Digital o Impreso</option>
                                    <option>Solo Cd / Digital</option>
                                    <option>Placas Impresas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                <button className="action-btn add-btn" onClick={addStudy} style={{ borderStyle: 'dashed', width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <Plus size={18} />
                    Agregar Estudio Diagnóstico
                </button>
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
