import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save, FileText, Loader2, Clock, User, Clipboard, Activity } from 'lucide-react';
import PrintLayout from './PrintLayout';

interface Patient {
    name: string;
    id: string;
    date: string;
    age: string;
}

interface SurgicalDescriptionProps {
    patient: Patient;
}

const SurgicalDescription: React.FC<SurgicalDescriptionProps> = ({ patient }) => {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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
                <div className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '10px' }}>
                            <Activity size={24} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Nueva Descripción Quirúrgica</h2>
                    </div>
                </div>

                {/* Form Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

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
                    <div className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', gridColumn: 'span 2' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
                            <Clipboard size={18} /> Diagnósticos y Procedimiento
                        </h3>
                        <div className="form-group">
                            <label className="form-label">Nombre del Procedimiento</label>
                            <input type="text" name="procedureName" className="form-input" placeholder="Ej: Lipoescultura con transferencia glútea" value={formData.procedureName} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Diagnóstico Pre-Operatorio</label>
                                <textarea name="preOpDiagnosis" className="form-input" rows={2} value={formData.preOpDiagnosis} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Diagnóstico Post-Operatorio</label>
                                <textarea name="postOpDiagnosis" className="form-input" rows={2} value={formData.postOpDiagnosis} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Description Details */}
                    <div className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', gridColumn: 'span 2' }}>
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
                    <div className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', gridColumn: 'span 2' }}>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
                    <button className="action-btn" onClick={() => window.print()}>
                        <Share2 size={18} /> Previsualizar PDF
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

            {/* Hidden Print Layout */}
            <div className="print-only">
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
                            <p><strong>PROCEDIMIENTO:</strong> {formData.procedureName}</p>
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

const Check = ({ size, ...props }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const Share2 = ({ size }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="7.51" y2="11.49" /></svg>
);
