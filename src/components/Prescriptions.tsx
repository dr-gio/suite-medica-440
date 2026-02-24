import { Plus, X } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { useState } from 'react'; // Added useState import

interface Props {
    patient: any;
}

const Prescriptions: React.FC<Props> = ({ patient }) => {
    const { medications } = useConfig();
    const [meds, setMeds] = useState([
        { name: '', dosage: '', frequency: '', duration: '', indications: '' }
    ]);

    const addMed = () => setMeds([...meds, { name: '', dosage: '', frequency: '', duration: '', indications: '' }]);
    const removeMed = (index: number) => setMeds(meds.filter((_, i) => i !== index));

    const updateMed = (index: number, field: string, value: string) => {
        const newMeds = [...meds];
        newMeds[index] = { ...newMeds[index], [field]: value };

        // Auto-fill logic when selecting a name from the list
        if (field === 'name') {
            const foundMatch = medications.find(m => m.name === value);
            if (foundMatch) {
                if (!newMeds[index].dosage) newMeds[index].dosage = foundMatch.dosage;
                if (!newMeds[index].frequency) newMeds[index].frequency = foundMatch.frequency;
                if (!newMeds[index].duration) newMeds[index].duration = foundMatch.duration;
                if (!newMeds[index].indications) newMeds[index].indications = foundMatch.indications;
            }
        }

        setMeds(newMeds);
    };

    return (
        <div className="tool-view">
            {/* Editor View */}
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>Fórmula Médica</h2>

                <datalist id="medications-list">
                    {medications.map(m => <option key={m.id} value={m.name} />)}
                </datalist>

                {meds.map((med, index) => (
                    <div key={index} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Medicamento #{index + 1}</span>
                            <button className="remove-btn" onClick={() => removeMed(index)}><X size={18} /></button>
                        </div>

                        <div className="form-row" style={{ marginBottom: 0 }}>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label className="form-label">Nombre del Medicamento</label>
                                <input className="form-input" list="medications-list" placeholder="Ej: Amoxicilina 500mg" value={med.name} onChange={(e) => updateMed(index, 'name', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dosis / Presentación</label>
                                <input className="form-input" placeholder="Ej: Tabletas" value={med.dosage} onChange={(e) => updateMed(index, 'dosage', e.target.value)} />
                            </div>
                        </div>

                        <div className="form-row" style={{ marginBottom: 0 }}>
                            <div className="form-group">
                                <label className="form-label">Frecuencia</label>
                                <input className="form-input" placeholder="Ej: Cada 8 horas" value={med.frequency} onChange={(e) => updateMed(index, 'frequency', e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duración</label>
                                <input className="form-input" placeholder="Ej: Por 7 días" value={med.duration} onChange={(e) => updateMed(index, 'duration', e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Indicaciones / Observaciones</label>
                            <input className="form-input" placeholder="Ej: Tomar con las comidas" value={med.indications} onChange={(e) => updateMed(index, 'indications', e.target.value)} />
                        </div>
                    </div>
                ))}

                <button className="action-btn add-btn" onClick={addMed}>
                    <Plus size={18} />
                    Agregar Medicamento
                </button>
            </div>

            {/* Print View */}
            <PrintLayout patient={patient} title="Fórmula Médica">
                <ul className="print-list">
                    {meds.filter(m => m.name).map((med, idx) => (
                        <li key={idx} className="print-list-item">
                            <div className="print-item-title">{idx + 1}. {med.name} {med.dosage && `- ${med.dosage}`}</div>
                            {med.frequency && <p className="print-item-desc"><strong>Tomar:</strong> {med.frequency} {med.duration && `por ${med.duration}`}</p>}
                            {med.indications && <p className="print-item-desc" style={{ marginTop: '0.25rem' }}><em>Indicaciones: {med.indications}</em></p>}
                        </li>
                    ))}
                    {meds.filter(m => m.name).length === 0 && (
                        <p>No hay medicamentos recetados todavía.</p>
                    )}
                </ul>
            </PrintLayout>
        </div>
    );
};

export default Prescriptions;
