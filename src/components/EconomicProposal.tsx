import React, { useState, useEffect, useMemo, useRef } from 'react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { supabase } from '../lib/supabase';
import { Search, Plus, Trash2, Download, Printer, Loader2, X, Check } from 'lucide-react';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';

interface QuoteService {
    id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    active: boolean;
}

interface CartItem {
    id: string;
    service: QuoteService;
    quantity: number;
    unitPrice: number;
}

interface Props {
    patient: any;
}

function formatCOP(value: number): string {
    return '$ ' + Math.round(value).toLocaleString('es-CO');
}

const CATEGORY_ORDER = ['Cirugías Corporales', 'Cirugías Faciales', 'Medicina Estética', 'Metabolismo y Funcional', 'Tecnologías', 'Gastos Adicionales', 'Otros'];

const EconomicProposal: React.FC<Props> = ({ patient }) => {
    const { doctorName, proposalIntro, proposalPolicies, rethus, contactPhone } = useConfig();
    const printRef = useRef<HTMLDivElement>(null);
    const { downloadPDF, downloading } = usePDF();
    const [validationError, setValidationError] = useState<string | null>(null);

    const [services, setServices] = useState<QuoteService[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(CATEGORY_ORDER[0]);

    const [location, setLocation] = useState('España');
    const [surgeryDate, setSurgeryDate] = useState('28 de febrero de 2026');
    const [advisor, setAdvisor] = useState(doctorName || 'Dr. Giovanni Fuentes');

    const [cart, setCart] = useState<CartItem[]>([]);
    const [globalDiscount, setGlobalDiscount] = useState(5);
    const [globalDiscountName, setGlobalDiscountName] = useState('Descuento Pronto Pago (5%)');

    const processedIntro = useMemo(() => {
        if (!proposalIntro) return '';
        return proposalIntro.replace(/\{\{paciente\}\}/g, patient?.name || 'paciente');
    }, [proposalIntro, patient]);

    const [inclusions] = useState([
        'Medicamentos e insumos de la más alta calidad en sala de cirugía.',
        'Derechos de sala y quirófano, garantizando un entorno seguro y de vanguardia.',
        'Equipo y honorarios del equipo de anestesia, expertos en tu confort.',
        'Instrumentador quirúrgico y auxiliares, un equipo altamente calificado a tu servicio.',
        'Sala de recuperación, un espacio diseñado para tu pronta y serena recuperación.',
        'Controles postoperatorios ilimitados, tu seguimiento es clave para nosotros.'
    ]);

    useEffect(() => {
        async function loadServices() {
            setLoading(true);
            const { data, error } = await supabase
                .from('quote_services')
                .select('*')
                .eq('active', true)
                .in('category', CATEGORY_ORDER)
                .order('name');
            if (!error && data) setServices(data);
            setLoading(false);
        }
        loadServices();
    }, []);

    const groupedServices = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filtered = services.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.category.toLowerCase().includes(query)
        );

        const groups: Record<string, QuoteService[]> = {};
        CATEGORY_ORDER.forEach(cat => groups[cat] = []);
        filtered.forEach(s => { if (groups[s.category]) groups[s.category].push(s); });
        return groups;
    }, [services, searchQuery]);

    const toggleCartItem = (service: QuoteService) => {
        setCart(prev => {
            const isSelected = prev.some(i => i.service.id === service.id);
            if (isSelected) {
                return prev.filter(i => i.service.id !== service.id);
            } else {
                const newItem: CartItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    service,
                    quantity: 1,
                    unitPrice: service.price
                };
                return [...prev, newItem];
            }
        });
    };

    const removeFromCart = (itemId: string) => setCart(prev => prev.filter(i => i.id !== itemId));
    const updateItemPrice = (itemId: string, price: number) => {
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, unitPrice: price } : i));
    };

    const surgeryItems = cart.filter(i => i.service.category.includes('Cirugías') || i.service.category === 'Tecnologías' || i.service.category === 'Medicina Estética' || i.service.category === 'Metabolismo y Funcional');
    const additionalItems = cart.filter(i => i.service.category === 'Gastos Adicionales' || i.service.category === 'Otros');

    const subtotalSurgery = surgeryItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discountValue = subtotalSurgery * (globalDiscount / 100);
    const netSurgery = subtotalSurgery - discountValue;
    const subtotalAdditional = additionalItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const grandTotal = netSurgery + subtotalAdditional;

    const handleDownload = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar la propuesta.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const filename = `Presupuesto_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, filename, {
                margin: [10, 5, 10, 5]
            });

            if (pdfBlob && window.confirm(`¿Deseas enviar este presupuesto por correo a ${patient.email}?`)) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                          <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                          <p>Adjunto encontrarás tu <strong>Propuesta Económica</strong> para tu procedimiento en 440 Clinic.</p>
                          <div style="margin-top:20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                            <p style="margin:0"><strong>Médico:</strong> ${doctorName || 'Dr. Giovanni Fuentes'}</p>
                            <p style="margin:0"><strong>RETHUS:</strong> ${rethus || 'CMC2017-222322'}</p>
                          </div>
                          <p>Si tienes alguna duda, puedes contactarnos al 📞 ${contactPhone || '3181800130'}.</p>
                          <div style="margin-top:30px;border-top:1px solid #eee;padding-top:20px">
                            <p style="margin:0;font-weight:600">440 Clinic by Dr. Gio</p>
                            <p style="margin:0;color:#666;font-size:14px">La perfecta armonía de tu cuerpo</p>
                          </div>
                        </div>
                    `;

                    try {
                        await emailService.sendMedicalDocument({
                            to: patient.email,
                            subject: `Propuesta Económica - ${patient.name}`,
                            body: bodyHtml,
                            pdfBase64: base64data,
                            pdfFilename: filename
                        });
                        alert('Correo enviado exitosamente.');
                    } catch (error) {
                        alert('Error al enviar el correo: ' + error);
                    }
                };
                reader.readAsDataURL(pdfBlob);
            }
        }
    };

    return (
        <div className="tool-view">
            <div className="builder-layout no-print" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 380px',
                gap: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-main)',
                minHeight: 'calc(100vh - 70px)',
                alignItems: 'start'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0 }}>Presupuesto / Propuesta Económica</h2>
                        {validationError && (
                            <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <X size={16} /> {validationError}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ minWidth: '150px' }}><label className="form-label">Ubicación</label><input className="form-input" value={location} onChange={e => setLocation(e.target.value)} /></div>
                            <div className="form-group" style={{ minWidth: '150px' }}><label className="form-label">Asesor(a)</label><input className="form-input" value={advisor} onChange={e => setAdvisor(e.target.value)} /></div>
                            <div className="form-group" style={{ minWidth: '150px' }}><label className="form-label">Fecha Cirugía</label><input className="form-input" value={surgeryDate} onChange={e => setSurgeryDate(e.target.value)} /></div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface)' }}>
                            <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="form-input" style={{ paddingLeft: '2.8rem', borderRadius: '10px' }} placeholder="Busca servicios o tecnologías..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                                {CATEGORY_ORDER.map(cat => {
                                    const count = cart.filter(i => i.service.category === cat).length;
                                    const isActive = activeTab === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveTab(cat)}
                                            style={{
                                                padding: '0.6rem 1rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-main)',
                                                color: isActive ? 'white' : 'var(--text-muted)',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {cat}
                                            {count > 0 && (
                                                <span style={{
                                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', minHeight: '300px' }}>
                            {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="spin" /> Cargando catálogo...</div> : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {(groupedServices[activeTab] || []).map(svc => {
                                        const isSelected = cart.some(i => i.service.id === svc.id);
                                        return (
                                            <div key={svc.id} onClick={() => toggleCartItem(svc)} style={{
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem',
                                                backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                borderLeft: isSelected ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                                                boxShadow: isSelected ? '0 4px 6px rgba(37, 99, 235, 0.08)' : '0 1px 2px rgba(0,0,0,0.03)',
                                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                position: 'relative'
                                            }}
                                                className="catalog-item-card"
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ fontWeight: 700, color: isSelected ? 'var(--primary)' : '#1e293b', paddingRight: '1rem' }}>{svc.name}</div>
                                                    <div style={{ flexShrink: 0 }}>
                                                        {isSelected ?
                                                            <Check size={18} color="white" style={{ backgroundColor: 'var(--primary)', borderRadius: '50%', padding: '3px' }} /> :
                                                            <Plus size={16} color="var(--text-muted)" />
                                                        }
                                                    </div>
                                                </div>
                                                <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.95rem', marginTop: 'auto' }}>
                                                    {formatCOP(svc.price)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {groupedServices[activeTab]?.length === 0 && (
                                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No se encontraron elementos en esta categoría.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: 'calc(100vh - 100px)' }}>
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Resumen de Presupuesto</h3>
                            <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>{cart.length} ítems</span>
                        </div>

                        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {cart.map((item) => (
                                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface)', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>{item.service.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.service.category}</div>
                                        <div style={{ marginTop: '0.4rem' }}>
                                            <input
                                                type="number"
                                                className="form-input"
                                                style={{ width: '100%', height: '32px', fontSize: '0.85rem', padding: '0 0.5rem', fontWeight: 600 }}
                                                value={item.unitPrice}
                                                onChange={e => updateItemPrice(item.id, Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed #e2e8f0', borderRadius: '10px' }}>
                                    Empieza seleccionando servicios del catálogo a la izquierda
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.25rem', borderTop: '2px solid var(--border-color)', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                                    <span>Subtotal:</span>
                                    <span>{formatCOP(subtotalSurgery)}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input className="form-input" style={{ flex: 1, height: '32px', fontSize: '0.8rem' }} value={globalDiscountName} onChange={e => setGlobalDiscountName(e.target.value)} placeholder="Nombre descuento" />
                                    <div style={{ position: 'relative', width: '60px' }}>
                                        <input type="number" className="form-input" style={{ width: '100%', height: '32px', fontSize: '0.8rem', paddingRight: '1rem' }} value={globalDiscount} onChange={e => setGlobalDiscount(Number(e.target.value))} />
                                        <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#94a3b8' }}>%</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>INVERSIÓN TOTAL:</span>
                                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>{formatCOP(grandTotal)}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    className="action-btn primary"
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: '10px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                                >
                                    {downloading ? <Loader2 className="spin" size={20} /> : <Download size={20} />}
                                    {downloading ? 'Generando PDF...' : 'Descargar Presupuesto (PDF)'}
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={() => window.print()}
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', borderRadius: '10px', fontSize: '0.9rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                                >
                                    <Printer size={18} /> Ver / Imprimir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={printRef} className="print-budget-container print-only">
                <PrintLayout patient={patient} title="PRESUPUESTO MÉDICO" hideSeal={true}>
                    <div style={{ color: '#1f2937', padding: '0 0.5rem' }}>
                        <div className="print-patient-info" style={{ marginTop: '0.2rem', borderTop: 'none' }}>
                            <div className="info-field"><span className="info-label">Ubicación</span><span className="info-value">{location}</span></div>
                            <div className="info-field"><span className="info-label">Asesor(a)</span><span className="info-value">{advisor}</span></div>
                            <div className="info-field"><span className="info-label">Fecha Cirugía</span><span className="info-value">{surgeryDate}</span></div>
                        </div>

                        <p style={{ margin: '1.5rem 0', lineHeight: '1.6', color: '#4b5563', fontSize: '9.5pt', fontStyle: 'italic' }}>{processedIntro}</p>

                        <div className="recommendations-section">
                            <h3>Plan Quirúrgico Recomendado</h3>
                            <ul className="print-list" style={{ gap: '1.2rem' }}>
                                {surgeryItems.map((item) => (
                                    <li key={item.id} className="print-list-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="print-item-title" style={{ fontSize: '10.5pt', fontWeight: 700 }}>{item.service.name}</div>
                                            <div style={{ fontWeight: 700, fontSize: '11pt', color: '#2563eb' }}>{formatCOP(item.unitPrice)}</div>
                                        </div>
                                        {item.service.description && (
                                            <p style={{ color: '#64748b', fontSize: '8.5pt', lineHeight: '1.4', margin: 0, paddingRight: '4rem' }}>
                                                {item.service.description}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ margin: '2rem 0' }}>
                            <h3 style={{ color: '#2563eb', borderBottom: '1px solid #bfdbfe', paddingBottom: '0.2rem', marginBottom: '1rem', fontSize: '10pt', fontWeight: 600 }}>Resumen de Inversión</h3>
                            <div style={{ padding: '0 0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5pt', padding: '0.4rem 0' }}><span>Subtotal Procedimientos y Tecnologías</span><span>{formatCOP(subtotalSurgery)}</span></div>
                                {globalDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5pt', padding: '0.4rem 0', color: '#059669' }}><span>{globalDiscountName}</span><span>-{formatCOP(discountValue)}</span></div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5pt', fontWeight: 700, padding: '0.6rem 0', borderTop: '1px solid #e1e8f0', marginTop: '0.4rem', color: '#1e293b' }}><span>Neto Cirugía</span><span>{formatCOP(netSurgery)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5pt', padding: '0.4rem 0', color: '#64748b' }}><span>Gastos Adicionales No Incluidos</span><span>{formatCOP(subtotalAdditional)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderRadius: '10px', marginTop: '1.5rem', border: '1px solid #e2e8f0' }}>
                                    <span style={{ color: '#111827', fontSize: '11pt', fontWeight: 700, letterSpacing: '0.3px' }}>INVERSIÓN TOTAL ESTIMADA</span><span style={{ color: '#2563eb', fontSize: '14pt', fontWeight: 800 }}>{formatCOP(grandTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3rem', marginTop: '3rem' }}>
                            <div>
                                <h3 style={{ borderBottom: '1px solid #bfdbfe', color: '#2563eb', paddingBottom: '0.2rem', fontSize: '10pt', marginBottom: '1rem' }}>Tu Experiencia 440 Clinic Incluye</h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                                    {inclusions.map((text, idx) => (
                                        <li key={idx} style={{ display: 'flex', gap: '0.7rem', fontSize: '8.8pt', color: '#4b5563', lineHeight: '1.4' }}><Check size={14} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} strokeWidth={3} /><span>{text}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 style={{ borderBottom: '1px solid #bfdbfe', color: '#2563eb', paddingBottom: '0.2rem', fontSize: '10pt', marginBottom: '1rem' }}>Gastos Adicionales Detalle</h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {additionalItems.map((item) => (
                                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.8pt', color: '#475569', borderBottom: '1px dashed #f1f5f9', paddingBottom: '0.4rem' }}><span>• {item.service.name}:</span><span style={{ fontWeight: 600 }}>{formatCOP(item.unitPrice)}</span></li>
                                    ))}
                                    {additionalItems.length === 0 && <li style={{ fontSize: '8.8pt', color: '#94a3b8', fontStyle: 'italic' }}>No se incluyeron gastos adicionales</li>}
                                </ul>
                            </div>
                        </div>

                        <div style={{ marginTop: '5rem', paddingTop: '1.5rem', borderTop: '2px solid #f1f5f9' }}>
                            <h4 style={{ fontSize: '9pt', fontWeight: 700, color: '#334155', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Políticas Comerciales</h4>
                            <p style={{ fontSize: '8.5pt', color: '#64748b', whiteSpace: 'pre-wrap', lineHeight: '1.7', textAlign: 'justify' }}>{proposalPolicies}</p>
                        </div>
                    </div>
                </PrintLayout>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                .catalog-item-card:hover {
                    border-color: var(--primary) !important;
                    background-color: #f0f9ff !important;
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    z-index: 1;
                }
                .catalog-item-card:active {
                    transform: scale(0.98);
                }
                 @media (max-width: 1100px) {
                    .builder-layout {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                        padding: 1rem !important;
                    }
                    .builder-layout > div:last-child {
                        position: static !important;
                        max-height: none !important;
                    }
                }
                @media (max-width: 600px) {
                    .builder-layout {
                        padding: 0.5rem !important;
                        gap: 1rem !important;
                    }
                    .catalog-item-card {
                        padding: 0.75rem !important;
                    }
                    h2.form-label {
                        font-size: 1.1rem !important;
                    }
                }
                /* Ensure print container doesn't show in UI but is available for html2pdf */
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

export default EconomicProposal;
