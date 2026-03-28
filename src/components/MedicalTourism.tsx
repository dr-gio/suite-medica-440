import React, { useState, useRef } from 'react';
import PrintLayout from './PrintLayout';
import { Download, Printer, Loader2, Plane, Share2 } from 'lucide-react';
import { usePDF } from '../hooks/usePDF';
import SharePanel from './SharePanel';

interface ProviderService {
    name: string;
    time: string;
}

interface Provider {
    id: string;
    name: string;
    ratePerNight: number;
    motto: string;
    services: ProviderService[];
    defaultCurrency?: 'COP' | 'USD';
    defaultCompanionRate?: number;
    minNights?: number;
}

const PROVIDERS: Provider[] = [
    {
        id: 'recovery-house-1-shared',
        name: 'Recovery House 1 (Hab. Compartida)',
        ratePerNight: 380000,
        defaultCurrency: 'COP',
        defaultCompanionRate: 180000,
        motto: '¡Pasión por tu Bienestar!',
        services: [
            { name: 'Alojamiento cama hospitalaria ó normal', time: 'Durante toda la estancia' },
            { name: 'Enfermeria 24 Horas', time: 'Durante toda la estancia' },
            { name: 'Alimentación completa', time: 'Tres comidas diarias' },
            { name: 'Batidos para subir la hemoglobina', time: '6 tomas (2 diarias)' },
            { name: 'Infusiones para hidratar, desinflamar, sueño', time: 'Ilimitadas' },
            { name: 'Acompañamiento a citas médicas (Dr)', time: 'Pre y post quirúrgicas' },
            { name: 'Lavado de ropa', time: 'Ropa, fajas y medias' },
            { name: 'Transporte citas médicas antes y después', time: 'Durante toda la estancia' },
            { name: 'Transporte a postoperatorio', time: 'Ida y regreso' },
            { name: 'Transporte aeropuerto', time: 'Recogida y regreso' }
        ]
    },
    {
        id: 'recovery-house-1-individual',
        name: 'Recovery House 1 (Hab. Individual)',
        ratePerNight: 400000,
        defaultCurrency: 'COP',
        defaultCompanionRate: 180000,
        motto: '¡Pasión por tu Bienestar!',
        services: [
            { name: 'Alojamiento cama hospitalaria ó normal', time: 'Durante toda la estancia' },
            { name: 'Enfermeria 24 Horas', time: 'Durante toda la estancia' },
            { name: 'Alimentación completa', time: 'Tres comidas diarias' },
            { name: 'Batidos para subir la hemoglobina', time: '6 tomas (2 diarias)' },
            { name: 'Infusiones para hidratar, desinflamar, sueño', time: 'Ilimitadas' },
            { name: 'Acompañamiento a citas médicas (Dr)', time: 'Pre y post quirúrgicas' },
            { name: 'Lavado de ropa', time: 'Ropa, fajas y medias' },
            { name: 'Transporte citas médicas antes y después', time: 'Durante toda la estancia' },
            { name: 'Transporte a postoperatorio', time: 'Ida y regreso' },
            { name: 'Transporte aeropuerto', time: 'Recogida y regreso' }
        ]
    },
    {
        id: 'recovery-house-1-private',
        name: 'Recovery House 1 (Hab. Privada)',
        ratePerNight: 420000,
        defaultCurrency: 'COP',
        defaultCompanionRate: 180000,
        motto: '¡Pasión por tu Bienestar!',
        services: [
            { name: 'Alojamiento cama hospitalaria ó normal', time: 'Durante toda la estancia' },
            { name: 'Enfermeria 24 Horas', time: 'Durante toda la estancia' },
            { name: 'Alimentación completa', time: 'Tres comidas diarias' },
            { name: 'Batidos para subir la hemoglobina', time: '6 tomas (2 diarias)' },
            { name: 'Infusiones para hidratar, desinflamar, sueño', time: 'Ilimitadas' },
            { name: 'Acompañamiento a citas médicas (Dr)', time: 'Pre y post quirúrgicas' },
            { name: 'Lavado de ropa', time: 'Ropa, fajas y medias' },
            { name: 'Transporte citas médicas antes y después', time: 'Durante toda la estancia' },
            { name: 'Transporte a postoperatorio', time: 'Ida y regreso' },
            { name: 'Transporte aeropuerto', time: 'Recogida y regreso' }
        ]
    },
    {
        id: 'recovery-house-2-shared',
        name: 'Recovery House 2 (Habitación Compartida)',
        ratePerNight: 115,
        defaultCurrency: 'USD',
        defaultCompanionRate: 90,
        minNights: 10,
        motto: 'Confort, cuidado y experiencia cultural',
        services: [
            { name: 'Alojamiento (Cama normal / reclinables)', time: 'Durante toda la estancia' },
            { name: 'Alimentación nutricional completa (Desayuno, Almuerzo, Cena)', time: 'Tres comidas diarias' },
            { name: '6 Smoothies, Tea and Coffee Bar', time: 'Diarios / Constante' },
            { name: 'Enfermería 24/7 y Acompañamiento médico', time: '24 Horas' },
            { name: 'Monitoreo de signos vitales, medicamentos, heridas', time: 'Durante toda la estancia' },
            { name: 'Acompañamiento a citas, apoyo movilidad/higiene/alimento', time: 'Constante' },
            { name: 'Transporte privado completo (Aeropuerto, Cirugía, Control)', time: 'Ida y regreso / Según cita' },
            { name: 'Lavado de prendas post operatoria y cotidianas', time: 'Durante toda la estancia' },
            { name: 'Experiencia Turística Corta en B/quilla (Monumentos, Cultura, Souvenir)', time: 'Opcional (con aval médico)' }
        ]
    },
    {
        id: 'recovery-house-2-private',
        name: 'Recovery House 2 (Habitación Privada)',
        ratePerNight: 160,
        defaultCurrency: 'USD',
        defaultCompanionRate: 90,
        motto: 'Confort, cuidado y experiencia cultural',
        services: [
            { name: 'Alojamiento (Cama normal / reclinables)', time: 'Durante toda la estancia' },
            { name: 'Alimentación nutricional completa (Desayuno, Almuerzo, Cena)', time: 'Tres comidas diarias' },
            { name: '6 Smoothies, Tea and Coffee Bar', time: 'Diarios / Constante' },
            { name: 'Enfermería 24/7 y Acompañamiento médico', time: '24 Horas' },
            { name: 'Monitoreo de signos vitales, medicamentos, heridas', time: 'Durante toda la estancia' },
            { name: 'Acompañamiento a citas, apoyo movilidad/higiene/alimento', time: 'Constante' },
            { name: 'Transporte privado completo (Aeropuerto, Cirugía, Control)', time: 'Ida y regreso / Según cita' },
            { name: 'Lavado de prendas post operatoria y cotidianas', time: 'Durante toda la estancia' },
            { name: 'Experiencia Turística Corta en B/quilla (Monumentos, Cultura, Souvenir)', time: 'Opcional (con aval médico)' }
        ]
    }
];

interface Props {
    patient: any;
}

function formatCOP(value: number): string {
    return '$ ' + Math.round(value).toLocaleString('es-CO') + ' COP';
}

function formatUSD(value: number): string {
    return '$ ' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' USD';
}

const MedicalTourism: React.FC<Props> = ({ patient }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();

    const [selectedProviderId, setSelectedProviderId] = useState<string>(PROVIDERS[0].id);
    const [nights, setNights] = useState<number>(7);
    const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
    const [customRate, setCustomRate] = useState<number | string>(PROVIDERS[0].ratePerNight);
    const [checkInDate, setCheckInDate] = useState<string>('');
    const [checkOutDate, setCheckOutDate] = useState<string>('');
    const [hasCompanion, setHasCompanion] = useState<boolean>(false);
    const [companionRate, setCompanionRate] = useState<number | string>(0);
    const [showSharePanel, setShowSharePanel] = useState<boolean>(false);

    const formatCurrency = (val: number) => currency === 'COP' ? formatCOP(val) : formatUSD(val);

    const selectedProvider = PROVIDERS.find(p => p.id === selectedProviderId) || PROVIDERS[0];
    const rateToUse = Number(customRate) || 0;
    const stayTotalCost = rateToUse * nights;
    const companionTotalCost = hasCompanion ? (Number(companionRate) || 0) * nights : 0;
    const totalCost = stayTotalCost + companionTotalCost;

    // React to provider changes to update the custom rate default and other defaults
    React.useEffect(() => {
        setCustomRate(selectedProvider.ratePerNight);
        setCurrency(selectedProvider.defaultCurrency || 'COP');
        setCompanionRate(selectedProvider.defaultCompanionRate || 0);

        if (selectedProvider.minNights && nights < selectedProvider.minNights) {
            setNights(selectedProvider.minNights);
        }
    }, [selectedProviderId, selectedProvider]);

    const handleDownloadPDF = () => {
        if (printRef.current) {
            downloadPDF(printRef.current, `Turismo_Medico_${patient.name || 'Paciente'}.pdf`, {
                margin: [10, 5, 10, 5]
            });
        }
    };

    return (
        <div className="tool-view">
            <div className="builder-layout no-print" style={{
                maxWidth: '650px',
                margin: '0 auto',
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                minHeight: 'calc(100vh - 70px)',
            }}>
                {/* Column Left: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plane size={20} /> Detalles de Estadía
                        </h2>

                        <div className="form-group mb-4">
                            <label className="form-label">Proveedor de Alojamiento</label>
                            <select
                                className="form-input"
                                value={selectedProviderId}
                                onChange={(e) => setSelectedProviderId(e.target.value)}
                            >
                                {PROVIDERS.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Cantidad de Noches {selectedProvider.minNights ? `(Mínimo ${selectedProvider.minNights})` : ''}</span>
                            </label>
                            <input
                                type="number"
                                min={selectedProvider.minNights || 1}
                                className="form-input"
                                value={nights}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (selectedProvider.minNights && val < selectedProvider.minNights) {
                                        // Optional: alert the user or just keep the min restriction
                                    }
                                    setNights(val);
                                }}
                                onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (selectedProvider.minNights && val < selectedProvider.minNights) {
                                        setNights(selectedProvider.minNights);
                                    } else if (!val || val < 1) {
                                        setNights(1);
                                    }
                                }}
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                Tarifa por Noche
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as 'COP' | 'USD')}
                                    style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}
                                >
                                    <option value="COP">COP ($)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>$</span>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-input"
                                    style={{ paddingLeft: '2rem' }}
                                    value={customRate}
                                    onChange={(e) => setCustomRate(e.target.value === '' ? '' : Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="mb-4 date-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Fecha Llegada</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    style={{ width: '100%' }}
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fecha Salida</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    style={{ width: '100%' }}
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={hasCompanion}
                                    onChange={(e) => setHasCompanion(e.target.checked)}
                                />
                                Viene con acompañante (Mujer exclusivamente)
                            </label>

                            {hasCompanion && (
                                <div style={{ marginTop: '1rem' }}>
                                    <label className="form-label" style={{ color: '#475569', fontSize: '0.85rem' }}>Tarifa Acompañante por Noche</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-input"
                                            style={{ paddingLeft: '2rem' }}
                                            value={companionRate}
                                            onChange={(e) => setCompanionRate(e.target.value === '' ? '' : Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
                                <span>Tarifa Alojamiento ({nights} noches):</span>
                                <span style={{ fontWeight: 600 }}>{formatCurrency(stayTotalCost)}</span>
                            </div>
                            {hasCompanion && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
                                    <span>Tarifa Acompañante ({nights} noches):</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(companionTotalCost)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e293b', fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
                                <span>Total Estimado:</span>
                                <span style={{ color: 'var(--primary)' }}>{formatCurrency(totalCost)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button
                                className="action-btn"
                                onClick={() => setShowSharePanel(true)}
                                style={{
                                    width: '100%', justifyContent: 'center', padding: '0.85rem',
                                    borderRadius: '10px', fontSize: '1rem',
                                    backgroundColor: '#10b981', color: 'white',
                                    border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                <Share2 size={20} /> Compartir / Enviar
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: '10px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                            >
                                {downloading ? <Loader2 className="spin" size={20} /> : <Download size={20} />}
                                {downloading ? 'Generando PDF...' : 'Descargar Cotización'}
                            </button>
                            <button
                                className="action-btn"
                                onClick={() => window.print()}
                                style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', borderRadius: '10px', fontSize: '0.9rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                            >
                                <Printer size={18} /> Imprimir / Vista Previa
                            </button>
                        </div>
                    </div>
                </div>
                {/* Include SharePanel */}
                {showSharePanel && (
                    <SharePanel
                        patient={patient}
                        documentTitle="Cotización de Estadía"
                        onClose={() => setShowSharePanel(false)}
                    />
                )}
            </div>

            {/* Print Layout */}
            <div ref={printRef} className="print-budget-container print-only">
                <PrintLayout patient={patient} title="COTIZACIÓN DE ESTADÍA" hideSeal={true}>
                    <div style={{ color: '#1f2937', padding: '0 0.5rem' }}>
                        <div className="print-patient-info" style={{ marginTop: '0.2rem', borderTop: 'none' }}>
                            <div className="info-field"><span className="info-label">Proveedor</span><span className="info-value">{selectedProvider.name}</span></div>
                            <div className="info-field"><span className="info-label">Noches</span><span className="info-value">{nights}</span></div>
                            {(checkInDate || checkOutDate) && (
                                <div className="info-field">
                                    <span className="info-label">Fechas</span>
                                    <span className="info-value">
                                        {checkInDate ? new Date(checkInDate).toLocaleDateString() : 'N/A'} - {checkOutDate ? new Date(checkOutDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{ margin: '2rem 0', textAlign: 'center' }}>
                            <h2 style={{ color: '#1e293b', fontSize: '16pt', marginBottom: '0.5rem' }}>{selectedProvider.name}</h2>
                            <p style={{ color: 'var(--primary)', fontStyle: 'italic', fontSize: '11pt', fontWeight: 600 }}>{selectedProvider.motto}</p>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--primary)', borderBottom: '2px solid #bfdbfe', paddingBottom: '0.4rem', marginBottom: '1.5rem', fontSize: '12pt', fontWeight: 700, textTransform: 'uppercase' }}>
                                Servicios Incluidos
                            </h3>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                <thead>
                                    <tr>
                                        <th style={{ backgroundColor: '#d1c4a5', padding: '12px', textAlign: 'left', fontWeight: 'bold', border: '1px solid #bda880', width: '60%' }}>SERVICIOS</th>
                                        <th style={{ backgroundColor: '#d1c4a5', padding: '12px', textAlign: 'left', fontWeight: 'bold', border: '1px solid #bda880', width: '40%' }}>TIEMPO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProvider.services.map((service, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '10pt', color: '#334155' }}>{service.name}</td>
                                            <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '10pt', color: '#475569' }}>{service.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '3rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '1rem' }}>
                                <span style={{ fontSize: '11pt', color: '#64748b' }}>Tarifa Alojamiento ({nights} noches):</span>
                                <span style={{ fontSize: '12pt', fontWeight: 600, color: '#334155' }}>{formatCurrency(stayTotalCost)}</span>
                            </div>
                            {hasCompanion && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '1rem' }}>
                                    <span style={{ fontSize: '11pt', color: '#64748b' }}>Tarifa Acompañante mujer ({nights} noches):</span>
                                    <span style={{ fontSize: '12pt', fontWeight: 600, color: '#334155' }}>{formatCurrency(companionTotalCost)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13pt', fontWeight: 700, color: '#1e293b' }}>TOTAL ESTADÍA:</span>
                                <span style={{ fontSize: '16pt', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(totalCost)}</span>
                            </div>
                        </div>
                    </div>
                </PrintLayout>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }

                @media (max-width: 900px) {
                    .builder-layout {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 480px) {
                    .date-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                
                .print-budget-container {
                    display: none;
                }
                @media print {
                    .print-budget-container {
                        display: block !important;
                        position: static !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MedicalTourism;
