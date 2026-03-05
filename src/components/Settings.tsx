import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Plus, X, Save, ShieldCheck, Mail, Loader2, ToggleLeft, ToggleRight, Trash2, FileText, Upload } from 'lucide-react';
import { getStoredPin, setStoredPin } from './PinLock';
import { supabase } from '../lib/supabase';
import KnowledgeBaseEditor from './KnowledgeBaseEditor';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General / Logo' },
        { id: 'contact', label: 'Datos de Contacto' },
        { id: 'medications', label: 'Medicamentos' },
        { id: 'labs', label: 'Laboratorios' },
        { id: 'imaging', label: 'Imágenes' },
        { id: 'surgeries', label: 'Cirugías' },
        { id: 'nutrition', label: 'Nutrición' },
        { id: 'documents', label: 'Archivos de Venta' },
        { id: 'services', label: '💰 Catálogo Servicios' },
        { id: 'proposal', label: '📄 Textos Presupuesto' },
        { id: 'consent-templates', label: '📝 Consentimientos' },
        { id: 'ai-knowledge', label: '🧠 Base de IA' },
        { id: 'results', label: '📸 Resultados' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralConfig />;
            case 'contact':
                return <ContactConfig />;
            case 'medications':
                return <MedicationConfig />;
            case 'labs':
                return <LabConfig />;
            case 'imaging':
                return <ImagingConfig />;
            case 'surgeries':
                return <SurgeryConfig />;
            case 'nutrition':
                return <NutritionConfig />;
            case 'documents':
                return <DocumentsConfig />;
            case 'services':
                return <ServicesConfig />;
            case 'proposal':
                return <ProposalConfig />;
            case 'consent-templates':
                return <ConsentConfig />;
            case 'ai-knowledge':
                return <KnowledgeBaseEditor />;
            case 'results':
                return <SurgeryResultsConfig />;
            default:
                return null;
        }
    };

    return (
        <div className="tool-view no-print">
            <div className="form-section" style={{ flex: 1, border: 'none' }}>
                <h2 className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                    Configuración y Catálogos
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Aquí puedes personalizar los ítems que aparecen en las listas desplegables y opciones de auto-completado.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
                                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-color)',
                                color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                                fontWeight: 500
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// Config Components for each Catalog
const GeneralConfig: React.FC = () => {
    const { logoUrl, signatureUrl, sealUrl, gmailClientId, updateCatalog, updateImagesBatch } = useConfig() as any;
    const [logo, setLogo] = useState<string | undefined>(logoUrl);
    const [signature, setSignature] = useState<string | undefined>(signatureUrl);
    const [seal, setSeal] = useState<string | undefined>(sealUrl);
    const [gmailId, setGmailId] = useState(gmailClientId || '');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setLogo(logoUrl);
        setSignature(signatureUrl);
        setSeal(sealUrl);
    }, [logoUrl, signatureUrl, sealUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | undefined>>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // Use batch update to avoid multiple localStorage writes/reads and state race conditions
        if (updateImagesBatch) {
            updateImagesBatch({ logo, signature, seal });
        } else {
            // Fallback if not updated (should not happen)
            updateCatalog('logoUrl', logo);
            updateCatalog('signatureUrl', signature);
            updateCatalog('sealUrl', seal);
        }

        updateCatalog('gmailClientId', gmailId || undefined);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Logo de la Clínica</h3>
                <p style={{ color: 'var(--text-muted)' }}>Carga una imagen para el membrete y el encabezado lateral de la aplicación (Se recomienda formato PNG horizontal sin fondo).</p>

                {logo && (
                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'white' }}>
                        <img src={logo} alt="Logo Prev" style={{ maxHeight: '80px', maxWidth: '300px', objectFit: 'contain' }} />
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                    <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => handleFileChange(e, setLogo)} />
                    {logo && <button className="action-btn" onClick={() => setLogo(undefined)} style={{ color: '#ef4444' }}><X size={18} /> Quitar Logo</button>}
                </div>
            </div>

            <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Firma y Sello Digital</h3>
                <p style={{ color: 'var(--text-muted)' }}>Carga imágenes con fondo transparente (PNG) para firmar y sellar automáticamente los documentos.</p>

                <div style={{ display: 'flex', gap: '2rem', width: '100%', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>Firma Médica</h4>
                        {signature && (
                            <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', background: 'white' }}>
                                <img src={signature} alt="Firma Prev" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, setSignature)} />
                            {signature && <button className="action-btn" onClick={() => setSignature(undefined)} style={{ color: '#ef4444' }}><X size={18} /> Quitar</button>}
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>Sello Profesional</h4>
                        {seal && (
                            <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', background: 'white' }}>
                                <img src={seal} alt="Sello Prev" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, setSeal)} />
                            {seal && <button className="action-btn" onClick={() => setSeal(undefined)} style={{ color: '#ef4444' }}><X size={18} /> Quitar</button>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={20} /> Envío por Gmail (API)
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    Para enviar documentos automáticamente desde tu correo de Google, ingresa tu <strong>Gmail OAuth Client ID</strong>.
                    La primera vez se pedirá autorizar el acceso una sola vez.<br />
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                        → Obtener Client ID en Google Cloud Console
                    </a>
                </p>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <label className="form-label">Gmail OAuth Client ID</label>
                    <input
                        className="form-input"
                        placeholder="xxxxxxxxxx.apps.googleusercontent.com"
                        value={gmailId}
                        onChange={e => setGmailId(e.target.value)}
                    />
                </div>
            </div>

            <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={20} /> Seguridad &mdash; PIN de Acceso</h3>
                <p style={{ color: 'var(--text-muted)' }}>El PIN tiene 6 dígitos y se solicita al abrir la app o al bloquear la sesión. El PIN por defecto es <strong>440440</strong>.</p>
                <PinChangeConfig />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Logo, Firma y Sello</button>
                {saved && <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.95rem' }}>✅ ¡Guardado correctamente!</span>}
            </div>
        </div>
    );
};

const ContactConfig: React.FC = () => {
    const { doctorName, rethus, address, contactPhone, websiteUrl, updateCatalog } = useConfig();
    const [name, setName] = useState(doctorName || '');
    const [ret, setRet] = useState(rethus || '');
    const [addr, setAddr] = useState(address || '');
    const [phone, setPhone] = useState(contactPhone || '');
    const [web, setWeb] = useState(websiteUrl || '');

    const handleSave = () => {
        updateCatalog('doctorName', name);
        updateCatalog('rethus', ret);
        updateCatalog('address', addr);
        updateCatalog('contactPhone', phone);
        updateCatalog('websiteUrl', web);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Información Profesional y de Contacto</h3>
                <p style={{ color: 'var(--text-muted)' }}>Esta información aparecerá en el encabezado y pie de página de todos los documentos impresos y compartidos.</p>

                <div className="form-row" style={{ width: '100%', marginBottom: 0 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Nombre del Profesional</label>
                        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Dr. Giovanni Fuentes" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Registro Médico / RETHUS</label>
                        <input className="form-input" value={ret} onChange={e => setRet(e.target.value)} placeholder="Ej: CMC2017-222322" />
                    </div>
                </div>

                <div className="form-group" style={{ width: '100%' }}>
                    <label className="form-label">Dirección del Consultorio / Clínica</label>
                    <input className="form-input" value={addr} onChange={e => setAddr(e.target.value)} placeholder="Ej: Cra 47 # 79-191, Barranquilla" />
                </div>

                <div className="form-row" style={{ width: '100%', marginBottom: 0 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Teléfono de Contacto</label>
                        <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: 318 180 0130" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Sitio Web</label>
                        <input className="form-input" value={web} onChange={e => setWeb(e.target.value)} placeholder="Ej: www.drgiovannifuentes.com" />
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Datos de Contacto</button>
                </div>
            </div>
        </div>
    );
};

const PinChangeConfig: React.FC = () => {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const handleChange = () => {
        setMsg(null);
        if (currentPin !== getStoredPin()) {
            setMsg({ text: 'El PIN actual es incorrecto.', ok: false }); return;
        }
        if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
            setMsg({ text: 'El nuevo PIN debe tener exactamente 6 dígitos numéricos.', ok: false }); return;
        }
        if (newPin !== confirmPin) {
            setMsg({ text: 'Los PINs no coinciden.', ok: false }); return;
        }
        setStoredPin(newPin);
        setCurrentPin(''); setNewPin(''); setConfirmPin('');
        setMsg({ text: '✅ PIN actualizado correctamente.', ok: true });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '340px' }}>
            <div>
                <label className="form-label">PIN Actual</label>
                <input className="form-input" type="password" maxLength={6} inputMode="numeric" placeholder="••••••" value={currentPin} onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div>
                <label className="form-label">Nuevo PIN (6 dígitos)</label>
                <input className="form-input" type="password" maxLength={6} inputMode="numeric" placeholder="••••••" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div>
                <label className="form-label">Confirmar Nuevo PIN</label>
                <input className="form-input" type="password" maxLength={6} inputMode="numeric" placeholder="••••••" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} />
            </div>
            {msg && (
                <p style={{ color: msg.ok ? '#22c55e' : '#ef4444', fontWeight: 500, fontSize: '0.9rem' }}>{msg.text}</p>
            )}
            <button className="action-btn primary" onClick={handleChange} style={{ marginTop: '0.5rem' }}>
                <ShieldCheck size={16} /> Cambiar PIN
            </button>
        </div>
    );
};

const MedicationConfig: React.FC = () => {
    const { medications, updateCatalog } = useConfig();
    const [items, setItems] = useState(medications);

    const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', dosage: '', frequency: '', duration: '', indications: '' }]);
    const updateItem = (index: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSave = () => updateCatalog('medications', items);

    return (
        <div>
            {items.map((m, i) => (
                <div key={m.id} className="item-card" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <input className="form-input" style={{ flex: 2 }} placeholder="Nombre (ej: Amoxicilina)" value={m.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                    <input className="form-input" style={{ flex: 1 }} placeholder="Dosis" value={m.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} />
                    <input className="form-input" style={{ flex: 1 }} placeholder="Frecuencia" value={m.frequency} onChange={(e) => updateItem(i, 'frequency', e.target.value)} />
                    <input className="form-input" style={{ flex: 1 }} placeholder="Duración" value={m.duration} onChange={(e) => updateItem(i, 'duration', e.target.value)} />
                    <input className="form-input" style={{ flex: 2 }} placeholder="Indicaciones" value={m.indications} onChange={(e) => updateItem(i, 'indications', e.target.value)} />
                    <button className="remove-btn" onClick={() => removeItem(i)}><X size={18} /></button>
                </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="action-btn" onClick={addItem}><Plus size={18} /> Agregar Medicamento</button>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Catálogo</button>
            </div>
        </div>
    );
};

const LabConfig: React.FC = () => {
    const { labs, updateCatalog } = useConfig();
    const [items, setItems] = useState(labs);

    const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', indications: '' }]);
    const updateItem = (index: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSave = () => updateCatalog('labs', items);

    return (
        <div>
            {items.map((m, i) => (
                <div key={m.id} className="item-card" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <input className="form-input" style={{ flex: 2 }} placeholder="Nombre (ej: Hemograma)" value={m.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                    <input className="form-input" style={{ flex: 2 }} placeholder="Indicaciones (ej: Ayuno 8h)" value={m.indications} onChange={(e) => updateItem(i, 'indications', e.target.value)} />
                    <button className="remove-btn" onClick={() => removeItem(i)}><X size={18} /></button>
                </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="action-btn" onClick={addItem}><Plus size={18} /> Agregar Laboratorio</button>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Catálogo</button>
            </div>
        </div>
    );
};

const ImagingConfig: React.FC = () => {
    const { imaging, updateCatalog } = useConfig();
    const [items, setItems] = useState(imaging);

    const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', reason: '', format: 'Digital o Impreso' }]);
    const updateItem = (index: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSave = () => updateCatalog('imaging', items);

    return (
        <div>
            {items.map((m, i) => (
                <div key={m.id} className="item-card" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <input className="form-input" style={{ flex: 2 }} placeholder="Nombre (ej: Ecografía)" value={m.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                    <select className="form-input" style={{ flex: 1 }} value={m.format} onChange={(e) => updateItem(i, 'format', e.target.value)}>
                        <option>Digital o Impreso</option>
                        <option>Solo Cd / Digital</option>
                        <option>Placas Impresas</option>
                    </select>
                    <button className="remove-btn" onClick={() => removeItem(i)}><X size={18} /></button>
                </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="action-btn" onClick={addItem}><Plus size={18} /> Agregar Imagen</button>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Catálogo</button>
            </div>
        </div>
    );
};

const SurgeryConfig: React.FC = () => {
    const { surgeries, updateCatalog } = useConfig();
    const [items, setItems] = useState(surgeries);

    const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', preText: '', postText: '' }]);
    const updateItem = (index: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
    const handleSave = () => updateCatalog('surgeries', items);

    return (
        <div>
            {items.map((m, i) => (
                <div key={m.id} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <input className="form-input" style={{ flex: 1, fontWeight: 'bold' }} placeholder="Nombre Cirugía" value={m.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                        <button className="remove-btn" onClick={() => removeItem(i)}><X size={18} /></button>
                    </div>
                    <textarea className="form-input" style={{ minHeight: '80px' }} placeholder="Texto Pre-operatorio..." value={m.preText} onChange={(e) => updateItem(i, 'preText', e.target.value)} />
                    <textarea className="form-input" style={{ minHeight: '100px' }} placeholder="Texto Post-operatorio..." value={m.postText} onChange={(e) => updateItem(i, 'postText', e.target.value)} />
                </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="action-btn" onClick={addItem}><Plus size={18} /> Agregar Cirugía</button>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Catálogo</button>
            </div>
        </div>
    );
};

const NutritionConfig: React.FC = () => {
    const { nutrition, updateCatalog } = useConfig();
    const [items, setItems] = useState(nutrition);

    const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', desc: '' }]);
    const updateItem = (index: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
    const handleSave = () => updateCatalog('nutrition', items);

    return (
        <div>
            {items.map((m, i) => (
                <div key={m.id} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <input className="form-input" style={{ flex: 1, fontWeight: 'bold' }} placeholder="Nombre Fase / Título" value={m.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                        <button className="remove-btn" onClick={() => removeItem(i)}><X size={18} /></button>
                    </div>
                    <textarea className="form-input" style={{ minHeight: '80px' }} placeholder="Descripción de la fase nutriocional..." value={m.desc} onChange={(e) => updateItem(i, 'desc', e.target.value)} />
                </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="action-btn" onClick={addItem}><Plus size={18} /> Agregar Fase</button>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Catálogo</button>
            </div>
        </div>
    );
};

// ─── Services Catalog Config (Supabase) ───────────────────────────────────────
const QUOTE_CATEGORIES = ['Cirugías Corporales', 'Cirugías Faciales', 'Tecnologías', 'Gastos Adicionales'];

interface QuoteService {
    id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    active: boolean;
}

const ServicesConfig: React.FC = () => {
    const [services, setServices] = useState<QuoteService[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    // New service form
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState(QUOTE_CATEGORIES[0]);
    const [newPrice, setNewPrice] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const showMsg = (text: string, ok: boolean) => {
        setMsg({ text, ok });
        setTimeout(() => setMsg(null), 3000);
    };

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('quote_services').select('*').order('category').order('name');
        if (data) setServices(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const toggleActive = async (svc: QuoteService) => {
        setSaving(svc.id);
        const { error } = await supabase.from('quote_services').update({ active: !svc.active }).eq('id', svc.id);
        if (!error) setServices(prev => prev.map(s => s.id === svc.id ? { ...s, active: !s.active } : s));
        else showMsg('Error actualizando el servicio.', false);
        setSaving(null);
    };

    const deleteService = async (id: string) => {
        if (!confirm('¿Eliminar este servicio del catálogo?')) return;
        setSaving(id);
        const { error } = await supabase.from('quote_services').delete().eq('id', id);
        if (!error) setServices(prev => prev.filter(s => s.id !== id));
        else showMsg('Error eliminando el servicio.', false);
        setSaving(null);
    };

    const addService = async () => {
        if (!newName.trim() || !newPrice) { showMsg('Nombre y precio son obligatorios.', false); return; }
        const price = parseFloat(newPrice.replace(/[^0-9.]/g, ''));
        if (isNaN(price) || price < 0) { showMsg('El precio debe ser un número válido.', false); return; }
        setSaving('new');
        const { data, error } = await supabase.from('quote_services')
            .insert({ name: newName.trim(), category: newCategory, price, description: newDesc.trim() || null })
            .select().single();
        if (!error && data) {
            setServices(prev => [...prev, data].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));
            setNewName(''); setNewPrice(''); setNewDesc('');
            showMsg('✅ Servicio agregado correctamente.', true);
        } else showMsg('Error al agregar el servicio.', false);
        setSaving(null);
    };

    const grouped = QUOTE_CATEGORIES.map(cat => ({
        category: cat,
        items: services.filter(s => s.category === cat),
    })).filter(g => g.items.length > 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Add New Service */}
            <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Agregar Nuevo Servicio</h3>
                <div className="form-row" style={{ width: '100%', marginBottom: 0 }}>
                    <div className="form-group" style={{ flex: 2 }}>
                        <label className="form-label">Nombre del Servicio *</label>
                        <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Toxina Botulínica" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Categoría *</label>
                        <select className="form-input" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                            {QUOTE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Precio Base (COP) *</label>
                        <input className="form-input" type="number" min={0} value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Ej: 450000" />
                    </div>
                </div>
                <div className="form-group" style={{ width: '100%' }}>
                    <label className="form-label">Descripción Informativa para el Paciente (aparecerá en el presupuesto)</label>
                    <textarea className="form-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Ej: Cirugía diseñada para mejorar el contorno corporal mediante la extracción de grasa..." style={{ minHeight: '80px' }} />
                </div>
                <button
                    className="action-btn primary"
                    onClick={addService}
                    disabled={saving === 'new'}
                >
                    {saving === 'new' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                    {saving === 'new' ? 'Guardando...' : 'Agregar Servicio'}
                </button>
                {msg && (
                    <p style={{ color: msg.ok ? '#22c55e' : '#ef4444', fontWeight: 500, fontSize: '0.9rem', margin: 0 }}>{msg.text}</p>
                )}
            </div>

            {/* Services List */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', padding: '1.5rem' }}>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Cargando catálogo...
                </div>
            ) : (
                grouped.map(group => (
                    <div key={group.category}>
                        <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                            {group.category} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({group.items.length})</span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {group.items.map(svc => (
                                <div key={svc.id} className="item-card" style={{
                                    opacity: svc.active ? 1 : 0.5,
                                    gap: '0.75rem',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                }}>
                                    <div style={{ flex: 2, minWidth: '160px' }}>
                                        <div style={{ fontWeight: 600 }}>{svc.name}</div>
                                        {svc.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.2rem' }}>{svc.description}</div>}
                                    </div>
                                    <div style={{ color: 'var(--primary)', fontWeight: 700, minWidth: '110px', textAlign: 'right' }}>
                                        $ {svc.price.toLocaleString('es-CO')}
                                    </div>
                                    <button
                                        onClick={() => toggleActive(svc)}
                                        disabled={saving === svc.id}
                                        title={svc.active ? 'Desactivar' : 'Activar'}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: svc.active ? '#22c55e' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 500 }}
                                    >
                                        {saving === svc.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : svc.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        {svc.active ? 'Activo' : 'Inactivo'}
                                    </button>
                                    <button
                                        onClick={() => deleteService(svc.id)}
                                        disabled={saving === svc.id}
                                        className="remove-btn"
                                        title="Eliminar servicio"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const ProposalConfig: React.FC = () => {
    const { proposalIntro, proposalPolicies, updateCatalog } = useConfig();
    const [intro, setIntro] = useState(proposalIntro || '');
    const [pol, setPol] = useState(proposalPolicies || '');

    const handleSave = () => {
        updateCatalog('proposalIntro', intro);
        updateCatalog('proposalPolicies', pol);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Textos Predeterminados para Presupuesto Médico</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    Configura los textos que aparecerán automáticamente en cada nuevo presupuesto creado.
                    Puedes usar el marcador <strong>{`{{paciente}}`}</strong> para que la aplicación inserte el nombre del paciente automáticamente.
                </p>

                <div className="form-group" style={{ width: '100%' }}>
                    <label className="form-label">Introducción del Presupuesto</label>
                    <textarea
                        className="form-input"
                        value={intro}
                        onChange={e => setIntro(e.target.value)}
                        placeholder="Ej: Estimada(o) {{paciente}}, es un placer..."
                        style={{ minHeight: '120px', lineHeight: '1.5' }}
                    />
                </div>

                <div className="form-group" style={{ width: '100%' }}>
                    <label className="form-label">Políticas y Notas Comerciales</label>
                    <textarea
                        className="form-input"
                        value={pol}
                        onChange={e => setPol(e.target.value)}
                        placeholder="Ej: • El descuento por pronto pago..."
                        style={{ minHeight: '180px', lineHeight: '1.5' }}
                    />
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Textos Predeterminados</button>
                </div>
            </div>
        </div>
    );
};

const DocumentsConfig: React.FC = () => {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const showMsg = (text: string, ok: boolean) => {
        setMsg({ text, ok });
        setTimeout(() => setMsg(null), 3000);
    };

    const loadFiles = async () => {
        setLoading(true);
        const { data, error } = await supabase.storage.from('sales_documents').list();
        if (error) {
            console.error(error);
            showMsg('Error cargando documentos. ¿Existe el bucket "sales_documents"?', false);
        } else if (data) {
            setFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
        }
        setLoading(false);
    };

    useEffect(() => { loadFiles(); }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const baseName = file.name.replace(/\.[^.]+$/, '');
        setPendingFile(file);
        setCustomName(baseName);
        e.target.value = '';
    };

    const handleUpload = async () => {
        if (!pendingFile || !customName.trim()) return;

        setUploading(true);
        const ext = pendingFile.name.split('.').pop() || '';
        const safeName = customName.trim().replace(/[^a-zA-Z0-9\-_ ]/g, '');
        const fileName = `${Date.now()}_${safeName}${ext ? '.' + ext : ''}`;

        const { error } = await supabase.storage.from('sales_documents').upload(fileName, pendingFile, {
            cacheControl: '3600',
            upsert: false
        });

        if (error) {
            console.error(error);
            showMsg('Error subiendo al archivo.', false);
        } else {
            showMsg('Archivo subido correctamente.', true);
            loadFiles();
        }
        setUploading(false);
        setPendingFile(null);
        setCustomName('');
    };

    const cancelUpload = () => {
        setPendingFile(null);
        setCustomName('');
    };

    const handleDelete = async (fileName: string) => {
        if (!confirm(`¿Eliminar el archivo ${fileName}?`)) return;

        const { error } = await supabase.storage.from('sales_documents').remove([fileName]);
        if (error) {
            console.error(error);
            showMsg('Error eliminando el archivo.', false);
        } else {
            showMsg('Archivo eliminado.', true);
            setFiles(prev => prev.filter(f => f.name !== fileName));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Gestión de Archivos de Venta</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    Sube documentos (PDF, DOCX, imágenes) para que el equipo de ventas pueda descargarlos desde la sección principal.
                </p>

                {!pendingFile ? (
                    <div style={{ padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '8px', width: '100%', textAlign: 'center', backgroundColor: 'var(--bg-color)' }}>
                        <input
                            type="file"
                            id="doc-upload"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <button className="action-btn" onClick={() => fileInputRef.current?.click()}>
                            <Upload size={20} /> Seleccionar Archivo para Subir
                        </button>
                    </div>
                ) : (
                    <div className="item-card" style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--primary)' }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Nombre del Documento (Cómo lo verá el equipo)</label>
                            <input className="form-input" value={customName} onChange={e => setCustomName(e.target.value)} />
                            <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>Archivo: {pendingFile.name}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="action-btn primary" onClick={handleUpload} disabled={uploading}>
                                {uploading ? <Loader2 size={18} className="spin" /> : <Save size={18} />} Guardar
                            </button>
                            <button className="action-btn" onClick={cancelUpload}>Cancelar</button>
                        </div>
                    </div>
                )}

                {msg && (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', backgroundColor: msg.ok ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: msg.ok ? '#15803d' : '#b91c1c', width: '100%', fontWeight: 500 }}>
                        {msg.text}
                    </div>
                )}

                {loading ? (
                    <p>Cargando archivos...</p>
                ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {files.map(f => (
                            <div key={f.name} className="item-card">
                                <FileText size={20} color="var(--primary)" />
                                <span style={{ flex: 1, fontWeight: 500 }}>{f.name.split('_').slice(1).join('_')}</span>
                                <button className="remove-btn" onClick={() => handleDelete(f.name)}><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ConsentConfig: React.FC = () => {
    const { consentTemplates, updateCatalog } = useConfig();
    const [items, setItems] = useState(consentTemplates);

    const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', content: '' }]);
    const updateItem = (index: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
    const handleSave = () => updateCatalog('consentTemplates', items);

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Define las plantillas de consentimiento para los diferentes procedimientos quirúrgicos.
                </p>
            </div>
            {items.map((m, i) => (
                <div key={m.id} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <input
                            className="form-input"
                            style={{ flex: 1, fontWeight: 'bold' }}
                            placeholder="Nombre del Procedimiento (ej: Lipoescultura)"
                            value={m.name}
                            onChange={(e) => updateItem(i, 'name', e.target.value)}
                        />
                        <button className="remove-btn" onClick={() => removeItem(i)}><X size={18} /></button>
                    </div>
                    <div>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Texto Completo del Consentimiento (Incluyendo Riesgos)</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '220px' }}
                            placeholder="Redacta aquí todo el texto del consentimiento, incluyendo los riesgos..."
                            value={m.content}
                            onChange={(e) => updateItem(i, 'content', e.target.value)}
                        />
                    </div>
                </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="action-btn" onClick={addItem}><Plus size={18} /> Agregar Nueva Plantilla</button>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Consentimientos</button>
            </div>
        </div>
    );
};

const SurgeryResultsConfig: React.FC = () => {
    const { surgeryResults, updateCatalog } = useConfig();
    const [items, setItems] = useState(surgeryResults);

    const addItem = () => setItems([...items, { id: Date.now().toString(), name: '', url: '', description: '' }]);
    const updateItem = (index: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: val };
        setItems(newItems);
    };
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const handleSave = () => updateCatalog('surgeryResults', items);

    return (
        <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Configura los enlaces a las landing pages de resultados (Antes & Después) para que las asesoras puedan compartirlos fácilmente.
            </p>
            {items.map((m, i) => (
                <div key={m.id} className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <input
                            className="form-input"
                            style={{ flex: 1, fontWeight: 'bold' }}
                            placeholder="Nombre de la Cirugía (ej: Rinoplastia)"
                            value={m.name}
                            onChange={(e) => updateItem(i, 'name', e.target.value)}
                        />
                        <button className="remove-btn" onClick={() => removeItem(i)}><X size={18} /></button>
                    </div>
                    <input
                        className="form-input"
                        placeholder="URL de la Landing Page (https://...)"
                        value={m.url}
                        onChange={(e) => updateItem(i, 'url', e.target.value)}
                    />
                    <input
                        className="form-input"
                        placeholder="Descripción breve (opcional)"
                        value={m.description || ''}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                    />
                </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="action-btn" onClick={addItem}><Plus size={18} /> Agregar Enlace de Resultado</button>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Catálogo</button>
            </div>
        </div>
    );
};

export default Settings;
