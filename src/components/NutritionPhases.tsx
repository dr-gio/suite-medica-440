import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const NutritionPhases: React.FC<Props> = ({ patient }) => {
    const { nutrition: catalogNutrition } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [phases, setPhases] = useState(
        catalogNutrition.map(p => ({ ...p, selected: true }))
    );

    useEffect(() => {
        setPhases(current => {
            return catalogNutrition.map(p => {
                const existing = current.find(c => c.id === p.id);
                return { ...p, selected: existing ? existing.selected : true };
            });
        });
    }, [catalogNutrition]);

    const [generalTips, setGeneralTips] = useState(
        '1. Mastique cada bocado lentamente y sin prisa.\n2. Separe los líquidos de los sólidos (espere 30 minutos).\n3. Deténgase con la primera sensación de saciedad.'
    );

    const togglePhase = (id: string) => {
        setPhases(phases.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
    };

    const updatePhaseDesc = (id: string, text: string) => {
        setPhases(phases.map(p => p.id === id ? { ...p, desc: text } : p));
    };

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `PlanNutricional_${patient.name || 'Paciente'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Recomendaciones Nutricionales (Fases)</h2>
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

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Reglas y Tips Generales (Aparece al principio)</label>
                    <textarea
                        className="form-input"
                        value={generalTips}
                        onChange={(e) => setGeneralTips(e.target.value)}
                        style={{ minHeight: '80px' }}
                    />
                </div>

                <div className="item-list">
                    {phases.map((phase) => (
                        <div key={phase.id} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', borderTop: phase.selected ? '2px solid var(--primary)' : '' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={phase.selected}
                                        onChange={() => togglePhase(phase.id)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    {phase.name}
                                </label>
                            </div>

                            {phase.selected && (
                                <div className="form-group">
                                    <textarea
                                        className="form-input"
                                        value={phase.desc}
                                        onChange={(e) => updatePhaseDesc(phase.id, e.target.value)}
                                        style={{ minHeight: '60px' }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title="PLAN NUTRICIONAL POST-OPERATORIO">
                    <div style={{ color: '#1f2937', fontSize: '10pt', lineHeight: '1.5' }}>
                        {generalTips && (
                            <div className="recommendations-section" style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#1e40af', borderBottom: '2px solid #93c5fd', paddingBottom: '0.25rem', marginBottom: '0.75rem', fontSize: '11pt', fontWeight: 700 }}>RECOMENDACIONES GENERALES DIARIAS</h3>
                                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#1e3a8a' }}>
                                    {generalTips.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <li key={i} style={{ marginBottom: '0.4rem' }}>{line.replace(/^\d+\.\s*/, '')}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem' }}>
                            {phases.filter(p => p.selected).map((phase, idx) => (
                                <div key={idx} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed #e5e7eb' }}>
                                    <h4 style={{ fontSize: '11pt', color: '#111827', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {phase.name}
                                    </h4>
                                    <p style={{ color: '#4b5563', lineHeight: '1.6', textAlign: 'justify' }}>
                                        {phase.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {phases.filter(p => p.selected).length === 0 && (
                            <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>Seleccione al menos una fase para imprimir el plan nutricional.</p>
                        )}
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

export default NutritionPhases;
