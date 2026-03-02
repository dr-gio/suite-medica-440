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

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Formula_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            {/* Editor View */}
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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

                <datalist id="medications-list">
                    {medications.map(m => <option key={m.id} value={m.name} />)}
                </datalist>

                {meds.map((med, index) => (
                    <div key={index} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem', borderLeft: '4px solid var(--primary-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Medicamento #{index + 1}</span>
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

                <button className="action-btn add-btn" onClick={addMed} style={{ borderStyle: 'dashed', width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <Plus size={18} />
                    Agregar Medicamento
                </button>
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
            `}</style>
        </div>
    );
};

export default Prescriptions;
