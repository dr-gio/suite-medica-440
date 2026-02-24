import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';

interface Props {
    patient: any;
}

const LabRequests: React.FC<Props> = ({ patient }) => {
    const { labs: catalogLabs } = useConfig(); // Added useConfig hook
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

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Solicitud de Laboratorios</h2>

                <datalist id="labs-list">
                    {catalogLabs.map(l => <option key={l.id} value={l.name} />)}
                </datalist>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Diagnóstico Clínico (Requerido para EPS/Prepaga)</label>
                    <input className="form-input" placeholder="Ej: Control Post-operatorio" value={dx} onChange={(e) => setDx(e.target.value)} />
                </div>

                {labs.map((lab, index) => (
                    <div key={index} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Examen #{index + 1}</span>
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

                <button className="action-btn add-btn" onClick={addLab}>
                    <Plus size={18} />
                    Agregar Examen
                </button>
            </div>

            <PrintLayout patient={patient} title="Solicitud de Laboratorios">
                {dx && <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}><strong>Diagnóstico Clínico:</strong> {dx}</p>}
                <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Se solicita amablemente realizar los siguientes exámenes:</p>

                <ul className="print-list">
                    {labs.filter(l => l.name).map((lab, idx) => (
                        <li key={idx} className="print-list-item">
                            <div className="print-item-title">{idx + 1}. {lab.name}</div>
                            {lab.indications && <p className="print-item-desc"><em>Indicaciones: {lab.indications}</em></p>}
                        </li>
                    ))}
                    {labs.filter(l => l.name).length === 0 && (
                        <p>No hay exámenes solicitados todavía.</p>
                    )}
                </ul>
            </PrintLayout>
        </div>
    );
};

export default LabRequests;
