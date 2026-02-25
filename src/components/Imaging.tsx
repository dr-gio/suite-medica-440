import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';

interface Props {
    patient: any;
}

const Imaging: React.FC<Props> = ({ patient }) => {
    const { imaging: catalogImaging } = useConfig();
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

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Imágenes Diagnósticas</h2>

                <datalist id="imaging-list">
                    {catalogImaging.map(l => <option key={l.id} value={l.name} />)}
                </datalist>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Diagnóstico Clínico / Justificación Médica</label>
                    <input className="form-input" placeholder="Ej: Dolor abdominal en estudio" value={dx} onChange={(e) => setDx(e.target.value)} />
                </div>

                {studies.map((study, index) => (
                    <div key={index} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Estudio #{index + 1}</span>
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

                <button className="action-btn add-btn" onClick={addStudy}>
                    <Plus size={18} />
                    Agregar Estudio Diagnóstico
                </button>
            </div>

            <PrintLayout patient={patient} title="Imágenes Diagnósticas">
                <div style={{ fontSize: '0.8rem', lineHeight: '1.4', marginTop: '0.5rem', color: '#1f2937' }}>
                    {dx && <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}><strong>Motivo / Diagnóstico:</strong> {dx}</p>}
                    <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Se solicita amablemente realizar los siguientes estudios imagenológicos:</p>

                    <ul className="print-list" style={{ marginTop: '0.5rem' }}>
                        {studies.filter(s => s.name).map((study, idx) => (
                            <li key={idx} className="print-list-item" style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
                                <div className="print-item-title" style={{ fontSize: '0.85rem' }}>{idx + 1}. {study.name}</div>
                                <p className="print-item-desc" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}><strong>Indicación:</strong> {study.reason || 'S/A'}</p>
                                <p className="print-item-desc" style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}><em>Entregar en formato: {study.format}</em></p>
                            </li>
                        ))}
                        {studies.filter(s => s.name).length === 0 && (
                            <p>No hay estudios solicitados todavía.</p>
                        )}
                    </ul>
                </div>
            </PrintLayout>
        </div>
    );
};

export default Imaging;
