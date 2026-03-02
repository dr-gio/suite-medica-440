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
    const [labs, setLabs] = useState([
        { name: '', indications: '' }
    ]);
    const [dx, setDx] = useState('');

    const addLab = () => setLabs([...labs, { name: '', indications: '' }]);
    const removeLab = (index: number) => setLabs(labs.filter((_, i) => i !== index));

    const updateLab = (index: number, field: string, value: string) => {
        const newLabs = [...labs];
        newLabs[index] = { ...newLabs[index], [field]: value };

        // Auto-fill
        if (field === 'name') {
            const match = catalogLabs.find(l => l.name === value);
            if (match && !newLabs[index].indications) {
                newLabs[index].indications = match.indications;
            }
        }

        setLabs(newLabs);
    };

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Laboratorios_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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

                <datalist id="labs-list">
                    {catalogLabs.map(l => <option key={l.id} value={l.name} />)}
                </datalist>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Diagnóstico Clínico (Requerido para EPS/Prepaga)</label>
                    <input className="form-input" placeholder="Ej: Control Post-operatorio" value={dx} onChange={(e) => setDx(e.target.value)} />
                </div>

                {labs.map((lab, index) => (
                    <div key={index} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem', borderLeft: '4px solid var(--primary-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Examen #{index + 1}</span>
                            <button className="remove-btn" onClick={() => removeLab(index)}><X size={18} /></button>
                        </div>

                        <div className="form-row" style={{ marginBottom: 0 }}>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label className="form-label">Nombre del Examen</label>
                                <input className="form-input" list="labs-list" placeholder="Ej: Hemograma Completo" value={lab.name} onChange={(e) => updateLab(index, 'name', e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Indicaciones Especiales (Opcional)</label>
                            <input className="form-input" placeholder="Ej: Ayuno de 8 horas" value={lab.indications} onChange={(e) => updateLab(index, 'indications', e.target.value)} />
                        </div>
                    </div>
                ))}

                <button className="action-btn add-btn" onClick={addLab} style={{ borderStyle: 'dashed', width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <Plus size={18} />
                    Agregar Examen
                </button>
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
