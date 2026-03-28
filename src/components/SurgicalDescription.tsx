import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Save, FileText, Loader2, Clock, User, Clipboard, Activity, Search, BookOpen, Download, X, Check } from 'lucide-react';
import PrintLayout from './PrintLayout';
import { useConfig } from '../context/ConfigContext';
import { usePDF } from '../hooks/usePDF';
import { emailService } from '../services/emailService';

interface Patient {
    name: string;
    id: string;
    email: string;
    date: string;
    age: string;
}

interface SurgicalDescriptionProps {
    patient: Patient;
}

const SurgicalDescription: React.FC<SurgicalDescriptionProps> = ({ patient }) => {
    const { surgicalTemplates, frequentDiagnoses, frequentSurgeries } = useConfig();
    const { downloadPDF, downloading: generatingPDF } = usePDF();
    const printRef = useRef<HTMLDivElement>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // UI state for search/selection
    const [showTemplates, setShowTemplates] = useState(false);
    const [showDiagSearch, setShowDiagSearch] = useState<'pre' | 'post' | null>(null);
    const [showSurgerySearch, setShowSurgerySearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        // General
        startTime: '',
        endTime: '',
        anesthesiaType: 'General',

        // Team
        surgeon: 'Dr. Giovanni Fuentes',
        firstAssistant: '',
        secondAssistant: '',
        anesthesiologist: '',
        instrumentalNurse: '',
        circulatingNurse: '',

        // Diagnoses
        preOpDiagnosis: '',
        postOpDiagnosis: '',

        // Procedure Details
        cupsCode: '',
        procedureName: '',
        incisionType: '',
        findings: '',
        techniqueDescription: '',
        hemostasis: 'Rigurosa',
        sutures: '',
        implantsUsed: '',

        // Controls
        spongeCount: 'Correcto',
        needleCount: 'Correcto',
        bloodLoss: '0',
        complications: 'Ninguna',
        specimensSent: 'Ninguna',
        postOpStatus: 'Paciente en recuperación'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const applyTemplate = (template: any) => {
        setFormData(prev => ({
            ...prev,
            techniqueDescription: template.technicalDescription,
            findings: template.findings || prev.findings,
            complications: template.complications || prev.complications,
            postOpStatus: template.postOpStatus || prev.postOpStatus
        }));
        setShowTemplates(false);
    };

    const selectDiagnosis = (diag: any, type: 'pre' | 'post') => {
        const field = type === 'pre' ? 'preOpDiagnosis' : 'postOpDiagnosis';
        setFormData(prev => ({ ...prev, [field]: `${diag.code} - ${diag.name}` }));
        setShowDiagSearch(null);
        setSearchTerm('');
    };

    const selectSurgery = (surgery: any) => {
        setFormData(prev => ({ ...prev, cupsCode: surgery.code, procedureName: surgery.name }));
        setShowSurgerySearch(false);
        setSearchTerm('');
    };

    const handleDownload = async () => {
        if (!patient.id?.trim() || !patient.email?.trim()) {
            setValidationError('Faltan datos obligatorios: Documento y Email.');
            alert('Por favor, ingresa el Documento y el Email del paciente para generar la descripción.');
            return;
        }
        setValidationError(null);

        if (printRef.current) {
            const filename = `Descripcion_Quirurgica_${patient.name || 'Paciente'}.pdf`;
            const pdfBlob = await downloadPDF(printRef.current, filename);

            if (pdfBlob && window.confirm(`¿Deseas enviar esta descripción por correo a ${patient.email}?`)) {
                // Convert blob to base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64data = (reader.result as string).split(',')[1];
                    
                    const bodyHtml = `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:10px auto;color:#333;line-height:1.6">
                          <p>Hola <strong>${patient.name || 'paciente'}</strong>,</p>
                          <p>Adjunto encontrarás la <strong>Descripción Quirúrgica</strong> de tu procedimiento en 440 Clinic.</p>
                          <div style="margin-top:20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                            <p style="margin:0"><strong>Médico:</strong> ${formData.surgeon || 'Dr. Giovanni Fuentes'}</p>
                          </div>
                          <p>Si tienes alguna duda, puedes contactarnos.</p>
                          <div style="margin-top:30px;border-top:1px solid #eee;padding-top:20px">
                            <p style="margin:0;font-weight:600">440 Clinic by Dr. Gio</p>
                            <p style="margin:0;color:#666;font-size:14px">La perfecta armonía de tu cuerpo</p>
                          </div>
                        </div>
                    `;

                    const { error } = await emailService.sendMedicalDocument({
                        to: patient.email,
                        subject: `Descripción Quirúrgica – 440 Clinic`,
                        body: bodyHtml,
                        pdfBase64: base64data,
                        pdfFilename: filename,
                        documentId: patient.id
                    });

                    if (error) {
                        alert('Error al enviar el correo: ' + error);
                    } else {
                        alert('¡Descripción quirúrgica enviada correctamente!');
                    }
                };
                reader.readAsDataURL(pdfBlob);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.from('documents').insert({
                patient_id: null, // Assuming anonymous or linked later via logic if needed
                type: 'surgical_description',
                title: `Descripción Quirúrgica: ${formData.procedureName}`,
                content: {
                    ...formData,
                    patient_name: patient.name,
                    patient_id_doc: patient.id,
                    patient_age: patient.age,
                    date: patient.date
                }
            });

            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving document:', error);
            alert('Error al guardar el documento.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tool-view no-print">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Header Information */}
                <div className="item-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--primary)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '10px' }}>
                            <Activity size={24} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Nueva Descripción Quirúrgica</h2>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button className="action-btn" onClick={() => setShowTemplates(!showTemplates)}>
                            <BookOpen size={18} /> Cargar Plantilla
                        </button>
                        {showTemplates && (
                            <div className="dropdown-menu" style={{ position: 'absolute', right: 0, top: '110%', width: '300px', zIndex: 100, background: 'var(--surface)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', padding: '0.5rem', maxHeight: '400px', overflowY: 'auto', color: 'var(--text-main)' }}>
                                <div style={{ padding: '0.5rem', fontWeight: 600, borderBottom: '1px solid #eee', marginBottom: '0.5rem', color: '#111827' }}>Tus Plantillas</div>
                                {surgicalTemplates.length === 0 ? (
                                    <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay plantillas configuradas.</p>
                                ) : (
                                    surgicalTemplates.map(t => (
                                        <div key={t.id} className="dropdown-item" style={{ padding: '0.8rem', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }} onClick={() => applyTemplate(t)}>
                                            <div style={{ fontWeight: 500 }}>{t.name}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Sections */}
                <div className="surgical-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    {/* General Information */}
                    <div className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
                            <Clock size={18} /> Información General
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Hora Inicio</label>
                                <input type="time" name="startTime" className="form-input" value={formData.startTime} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hora Fin</label>
                                <input type="time" name="endTime" className="form-input" value={formData.endTime} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tipo de Anestesia</label>
                            <select name="anesthesiaType" className="form-input" value={formData.anesthesiaType} onChange={handleChange}>
                                <option>General</option>
                                <option>Regional (Raquídea/Epidural)</option>
                                <option>Sedación</option>
                                <option>Local + Sedación</option>
                                <option>Local</option>
                            </select>
                        </div>
                    </div>

                    {/* Surgical Team */}
                    <div className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
                            <User size={18} /> Equipo Quirúrgico
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Cirujano</label>
                                <input type="text" name="surgeon" className="form-input" value={formData.surgeon} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Anestesiólogo</label>
                                <input type="text" name="anesthesiologist" className="form-input" value={formData.anesthesiologist} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">1er Ayudante</label>
                                <input type="text" name="firstAssistant" className="form-input" value={formData.firstAssistant} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Instrumentadora</label>
                                <input type="text" name="instrumentalNurse" className="form-input" value={formData.instrumentalNurse} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Diagnoses */}
                    <div className="item-card surgical-full-width" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', gridColumn: 'span 2' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
                            <Clipboard size={18} /> Diagnósticos y Procedimiento
                        </h3>
                        <div className="form-row">
                            <div className="form-group" style={{ flex: '0 0 180px', position: 'relative' }}>
                                <label className="form-label">Código CUPS</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" name="cupsCode" className="form-input" placeholder="Ej: 86.83" value={formData.cupsCode} onChange={handleChange} />
                                    <button className="action-btn" title="Buscar CUPS" onClick={() => { setShowSurgerySearch(!showSurgerySearch); setSearchTerm(''); }}><Search size={18} /></button>
                                </div>
                                {showSurgerySearch && (
                                    <div className="search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, width: '360px', zIndex: 10, background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '0.5rem' }}>
                                        <input autoFocus className="form-input" placeholder="Buscar cirugía o código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                            {frequentSurgeries.filter(s =>
                                                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                s.code.toLowerCase().includes(searchTerm.toLowerCase())
                                            ).map(s => (
                                                <div key={s.id} className="dropdown-item" onClick={() => selectSurgery(s)} style={{ color: '#111827' }}>
                                                    <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: '0.5rem' }}>{s.code}</span>{s.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Nombre del Procedimiento</label>
                                <input type="text" name="procedureName" className="form-input" placeholder="Ej: Lipoescultura con transferencia glútea" value={formData.procedureName} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="form-label">Diagnóstico Pre-Operatorio</label>
                                    <button className="link-btn" style={{ fontSize: '0.8rem' }} onClick={() => { setShowDiagSearch('pre'); setSearchTerm(''); }}><Search size={14} /> Buscar</button>
                                </div>
                                <label className="form-label">Diagnóstico Pre-Operatorio</label>
                                <textarea name="preOpDiagnosis" className="form-input" rows={2} value={formData.preOpDiagnosis} onChange={handleChange} />
                                {showDiagSearch === 'pre' && (
                                    <div className="search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '0.5rem' }}>
                                        <input autoFocus className="form-input" placeholder="Buscar diagnóstico..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {frequentDiagnoses.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
                                                <div key={d.id} className="dropdown-item" onClick={() => selectDiagnosis(d, 'pre')} style={{ color: '#111827' }}>
                                                    {d.code} - {d.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="form-label">Diagnóstico Post-Operatorio</label>
                                    <button className="link-btn" style={{ fontSize: '0.8rem' }} onClick={() => { setShowDiagSearch('post'); setSearchTerm(''); }}><Search size={14} /> Buscar</button>
                                </div>
                                <textarea name="postOpDiagnosis" className="form-input" rows={2} value={formData.postOpDiagnosis} onChange={handleChange} />
                                {showDiagSearch === 'post' && (
                                    <div className="search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '0.5rem' }}>
                                        <input autoFocus className="form-input" placeholder="Buscar diagnóstico..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {frequentDiagnoses.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
                                                <div key={d.id} className="dropdown-item" onClick={() => selectDiagnosis(d, 'post')} style={{ color: '#111827' }}>
                                                    {d.code} - {d.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description Details */}
                    <div className="item-card surgical-full-width" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', gridColumn: 'span 2' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
                            <FileText size={18} /> Descripción del Acto Quirúrgico
                        </h3>
                        <div className="form-group">
                            <label className="form-label">Tipo de Incisión / Abordaje</label>
                            <input type="text" name="incisionType" className="form-input" value={formData.incisionType} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Hallazgos Quirúrgicos</label>
                            <textarea name="findings" className="form-input" rows={3} value={formData.findings} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descripción de la Técnica (Paso a paso)</label>
                            <textarea name="techniqueDescription" className="form-input" rows={6} value={formData.techniqueDescription} onChange={handleChange} placeholder="Bajo anestesia general, previa asepsia y antisepsia..." />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Hemostasia</label>
                                <input type="text" name="hemostasis" className="form-input" value={formData.hemostasis} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Suturas utilizadas</label>
                                <input type="text" name="sutures" className="form-input" value={formData.sutures} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Implantes / Dispositivos (Marca, Lote, Especificaciones)</label>
                            <input type="text" name="implantsUsed" className="form-input" value={formData.implantsUsed} onChange={handleChange} placeholder="Si aplica, registrar datos de prótesis o cánulas especiales" />
                        </div>
                    </div>

                    {/* Control and Closure */}
                    <div className="item-card surgical-full-width" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', gridColumn: 'span 2' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
                            <Check size={18} /> Cierre y Resultados
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Recuento de Compresas/Gasas</label>
                                <select name="spongeCount" className="form-input" value={formData.spongeCount} onChange={handleChange}>
                                    <option>Correcto</option>
                                    <option>Incorrecto</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Recuento de Agujas</label>
                                <select name="needleCount" className="form-input" value={formData.needleCount} onChange={handleChange}>
                                    <option>Correcto</option>
                                    <option>Incorrecto</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pérdida Sanguínea (ml)</label>
                                <input type="number" name="bloodLoss" className="form-input" value={formData.bloodLoss} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Complicaciones</label>
                                <input type="text" name="complications" className="form-input" value={formData.complications} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Muestras a Patología</label>
                                <input type="text" name="specimensSent" className="form-input" value={formData.specimensSent} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado Post-Operatorio Inmediato</label>
                            <input type="text" name="postOpStatus" className="form-input" value={formData.postOpStatus} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem 0', alignItems: 'center' }}>
                    {validationError && (
                        <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: 'auto' }}>
                            <X size={16} /> {validationError}
                        </div>
                    )}
                    <button className="action-btn" onClick={handleDownload} disabled={generatingPDF}>
                        {generatingPDF ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {generatingPDF ? 'Generando PDF...' : 'Descargar / Enviar PDF'}
                    </button>
                    <button
                        className="action-btn primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Guardando...' : 'Guardar en Historia Clínica'}
                    </button>
                </div>
                {saved && (
                    <div style={{ textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>
                        ✅ Descripción quirúrgica guardada con éxito
                    </div>
                )}
            </div>

            <style>{`
                .dropdown-item {
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #111827;
                }
                .dropdown-item:hover {
                    background-color: var(--primary-light);
                    color: var(--primary);
                }
                .link-btn {
                    background: none;
                    border: none;
                    color: var(--primary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 0;
                    font-weight: 500;
                }
                .link-btn:hover {
                    text-decoration: underline;
                }
                @media (max-width: 768px) {
                    .surgical-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .surgical-full-width {
                        grid-column: span 1 !important;
                    }
                }
            `}</style>

            {/* Hidden Print Layout */}
            <div ref={printRef} className="print-only">
                <PrintLayout title="Descripción Quirúrgica" patient={patient}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10pt', fontSize: '9pt' }}>
                        <div style={{ gridColumn: 'span 2', borderBottom: '1px solid #eee', paddingBottom: '4pt', marginBottom: '4pt' }}>
                            <h4 style={{ margin: '0 0 4pt 0', color: 'var(--primary)' }}>INFORMACIÓN GENERAL Y EQUIPO</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5pt' }}>
                                <div><strong>Inicio:</strong> {formData.startTime}</div>
                                <div><strong>Fin:</strong> {formData.endTime}</div>
                                <div style={{ gridColumn: 'span 2' }}><strong>Anestesia:</strong> {formData.anesthesiaType}</div>
                            </div>
                        </div>

                        <div style={{ borderRight: '1px solid #eee', paddingRight: '10pt' }}>
                            <p><strong>Cirujano:</strong> {formData.surgeon}</p>
                            <p><strong>1er Ayudante:</strong> {formData.firstAssistant}</p>
                            <p><strong>2do Ayudante:</strong> {formData.secondAssistant}</p>
                        </div>
                        <div>
                            <p><strong>Anestesiólogo:</strong> {formData.anesthesiologist}</p>
                            <p><strong>Instrumentadora:</strong> {formData.instrumentalNurse}</p>
                            <p><strong>Circulante:</strong> {formData.circulatingNurse}</p>
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '10pt' }}>
                            <p><strong>CUPS:</strong> {formData.cupsCode} &nbsp;&nbsp; <strong>PROCEDIMIENTO:</strong> {formData.procedureName}</p>
                            <p><strong>Dx Pre-Operatorio:</strong> {formData.preOpDiagnosis}</p>
                            <p><strong>Dx Post-Operatorio:</strong> {formData.postOpDiagnosis}</p>
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '10pt' }}>
                            <h4 style={{ margin: '0 0 4pt 0', borderBottom: '1px solid #eee' }}>DESCRIPCIÓN DE LA TÉCNICA</h4>
                            <p><strong>Abordaje:</strong> {formData.incisionType}</p>
                            <p><strong>Hallazgos:</strong> {formData.findings}</p>
                            <p style={{ whiteSpace: 'pre-wrap' }}><strong>Técnica Paso a Paso:</strong><br />{formData.techniqueDescription}</p>
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '10pt' }}>
                            <h4 style={{ margin: '0 0 4pt 0', borderBottom: '1px solid #eee' }}>CONTROLES Y CIERRE</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5pt' }}>
                                <div><strong>Hemostasia:</strong> {formData.hemostasis}</div>
                                <div><strong>Suturas:</strong> {formData.sutures}</div>
                                <div><strong>Muestras:</strong> {formData.specimensSent}</div>
                            </div>
                            <p><strong>Implantes/Lotes:</strong> {formData.implantsUsed}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5pt', marginTop: '5pt' }}>
                                <div><strong>Gasas:</strong> {formData.spongeCount}</div>
                                <div><strong>Agujas:</strong> {formData.needleCount}</div>
                                <div><strong>Sangrado:</strong> {formData.bloodLoss} ml</div>
                            </div>
                            <p style={{ marginTop: '5pt' }}><strong>Complicaciones:</strong> {formData.complications}</p>
                            <p><strong>Estado Post-Op:</strong> {formData.postOpStatus}</p>
                        </div>
                    </div>
                </PrintLayout>
            </div>
        </div>
    );
};


export default SurgicalDescription;



