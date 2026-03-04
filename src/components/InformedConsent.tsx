import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';

interface Props {
    patient: any;
}

const InformedConsent: React.FC<Props> = ({ patient }) => {
    const { consentTemplates, doctorName, rethus } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [content, setContent] = useState('');
    const [procedureName, setProcedureName] = useState('');
    const [surgeryDate, setSurgeryDate] = useState(new Date().toISOString().split('T')[0]);

    // Load template when selected
    useEffect(() => {
        const match = consentTemplates.find(t => t.name === selectedTemplate);
        if (match) {
            setProcedureName(match.name);
            setContent(match.content);
        } else if (selectedTemplate === '') {
            setProcedureName('');
            setContent('');
        }
    }, [selectedTemplate, consentTemplates]);

    const handleDownload = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Consentimiento_${procedureName || 'Procedimiento'}.pdf`);
        }
    };

    return (
        <div className="tool-view">
            <div className="form-section no-print" style={{ flex: 1, border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Consentimiento Informado</h2>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                </div>

                <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Procedimiento</label>
                        <select className="form-input" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                            <option value="">-- Seleccionar --</option>
                            {consentTemplates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            <option value="custom">-- Otro (Personalizado) --</option>
                        </select>
                    </div>
                    {selectedTemplate === 'custom' && (
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Nombre del Procedimiento</label>
                            <input
                                className="form-input"
                                value={procedureName}
                                onChange={(e) => setProcedureName(e.target.value)}
                                placeholder="Ej: Rinoplastia Funcional"
                            />
                        </div>
                    )}
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Fecha de Cirugía</label>
                        <input
                            type="date"
                            className="form-input"
                            value={surgeryDate}
                            onChange={(e) => setSurgeryDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Contenido Completo del Consentimiento</label>
                    <textarea
                        className="form-input"
                        style={{ minHeight: '300px' }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Redacta aquí todo el texto del consentimiento..."
                    />
                </div>
            </div>

            <div ref={printRef} className="print-only">
                <PrintLayout patient={patient} title={`CONSENTIMIENTO INFORMADO: ${procedureName.toUpperCase() || 'PROCEDIMIENTO'}`}>
                    <div style={{ lineHeight: '1.6', marginTop: '1rem', color: '#1f2937', fontSize: '10.5pt', textAlign: 'justify' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div>
                                <strong>PACIENTE:</strong> {patient.name}<br />
                                <strong>DOCUMENTO:</strong> {patient.id}<br />
                                <strong>EDAD:</strong> {patient.age} años
                            </div>
                            <div>
                                <strong>FECHA CIRUGÍA:</strong> {surgeryDate}<br />
                                <strong>MÉDICO TRATANTE:</strong> {doctorName}<br />
                                <strong>INSTITUCIÓN:</strong> 440 Clinic
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem', minHeight: '400px' }}>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{content || '__________________________________________________________________________________________________'}</p>
                        </div>

                        <p style={{ fontSize: '9pt', color: '#4b5563', fontStyle: 'italic', marginTop: '1.5rem' }}>
                            Declaro que he sido informado de las alternativas al tratamiento, así como de las posibles consecuencias de no realizarlo.
                            He tenido la oportunidad de realizar todas las preguntas que he considerado necesarias y todas ellas han sido contestadas a mi entera satisfacción.
                            Comprendo que en medicina no se pueden garantizar resultados exactos al 100%.
                        </p>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                            <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '9pt', fontWeight: 'bold', margin: '0' }}>FIRMA DEL PACIENTE</p>
                                <p style={{ fontSize: '8.5pt', margin: '0.25rem 0' }}>C.C. {patient.id}</p>
                                <div style={{ height: '50px', width: '50px', border: '1px solid #000', margin: '0.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7pt' }}>
                                    HUELLA
                                </div>
                            </div>
                            <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '9pt', fontWeight: 'bold', margin: '0' }}>FIRMA MÉDICO TRATANTE</p>
                                <p style={{ fontSize: '8.5pt', margin: '0.25rem 0' }}>{doctorName}</p>
                                <p style={{ fontSize: '8pt', color: '#64748b' }}>Reg. Med: {rethus}</p>
                            </div>
                            <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: '0.5rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '9pt', fontWeight: 'bold', margin: '0' }}>FIRMA TESTIGO (SI LO HAY)</p>
                                <p style={{ fontSize: '8.5pt', margin: '0.25rem 0' }}>C.C. ___________________</p>
                            </div>
                        </div>

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

export default InformedConsent;
