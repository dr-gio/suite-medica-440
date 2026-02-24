import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Plus, X, Save, ShieldCheck, Mail } from 'lucide-react';
import { getStoredPin, setStoredPin } from './PinLock';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General / Logo' },
        { id: 'contact', label: 'Datos de Contacto' },
        { id: 'medications', label: 'Medicamentos' },
        { id: 'labs', label: 'Laboratorios' },
        { id: 'imaging', label: 'Imágenes' },
        { id: 'surgeries', label: 'Cirugías' },
        { id: 'nutrition', label: 'Nutrición' }
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
    const { logoUrl, signatureUrl, sealUrl, gmailClientId, updateCatalog } = useConfig();
    const [logo, setLogo] = useState<string | undefined>(logoUrl);
    const [signature, setSignature] = useState<string | undefined>(signatureUrl);
    const [seal, setSeal] = useState<string | undefined>(sealUrl);
    const [gmailId, setGmailId] = useState(gmailClientId || '');

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
        updateCatalog('logoUrl', logo);
        updateCatalog('signatureUrl', signature);
        updateCatalog('sealUrl', seal);
        updateCatalog('gmailClientId', gmailId || undefined);
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

            <div>
                <button className="action-btn primary" onClick={handleSave}><Save size={18} /> Guardar Logo, Firma y Sello</button>
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

export default Settings;
