import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ClinicConfig {
  [key: string]: string;
}

interface Asesora {
  id: string;
  nombre: string;
  foto_url: string | null;
  activa: boolean;
}

const SECTIONS = {
  identidad: 'Identidad Visual',
  drgio: 'Perfil Dr. Gio',
  testimonios: 'Testimonios',
  contacto: 'Contacto',
  asesoras: 'Asesoras',
};

type Section = keyof typeof SECTIONS;

export default function ConfiguracionClinic() {
  const [config, setConfig] = useState<ClinicConfig>({});
  const [asesoras, setAsesoras] = useState<Asesora[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Section | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('identidad');
  const [newAsesora, setNewAsesora] = useState({ nombre: '', foto_url: '' });
  const [addingAsesora, setAddingAsesora] = useState(false);

  const fileRefs = {
    logo_url: useRef<HTMLInputElement>(null),
    foto_drgio_url: useRef<HTMLInputElement>(null),
    foto_pacientes_url: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    Promise.all([
      supabase.from('configuracion_clinic').select('clave, valor'),
      supabase.from('asesoras').select('*').order('nombre'),
    ]).then(([{ data: c }, { data: a }]) => {
      const map: ClinicConfig = {};
      (c || []).forEach((r) => { map[r.clave] = r.valor || ''; });
      setConfig(map);
      setAsesoras(a || []);
      setLoading(false);
    });
  }, []);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const set = (key: string, val: string) =>
    setConfig((prev) => ({ ...prev, [key]: val }));

  async function uploadImage(key: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `clinic/${key}_${Date.now()}.${ext}`;
    setUploading(key);
    const { error } = await supabase.storage
      .from('assets-440')
      .upload(fileName, file, { upsert: true, cacheControl: '3600' });
    setUploading(null);
    if (error) { showMsg(`Error subiendo imagen: ${error.message}`, false); return null; }
    const { data } = supabase.storage.from('assets-440').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleImageUpload(key: string, file: File) {
    const url = await uploadImage(key, file);
    if (url) set(key, url);
  }

  async function saveSection(section: Section, keys: string[]) {
    setSaving(section);
    const upserts = keys
      .filter((k) => k in config || config[k] !== undefined)
      .map((k) => ({ clave: k, valor: config[k] || '', updated_at: new Date().toISOString() }));

    if (upserts.length === 0) { setSaving(null); return; }

    const { error } = await supabase
      .from('configuracion_clinic')
      .upsert(upserts, { onConflict: 'clave' });

    setSaving(null);
    if (error) showMsg(`Error guardando: ${error.message}`, false);
    else showMsg('✅ Guardado correctamente.', true);
  }

  async function handleAsesoraImage(asesoraId: string, file: File) {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `asesoras/${asesoraId}_${Date.now()}.${ext}`;
    setUploading(`asesora_${asesoraId}`);
    const { error } = await supabase.storage
      .from('assets-440')
      .upload(fileName, file, { upsert: true });
    setUploading(null);
    if (error) { showMsg('Error subiendo foto.', false); return; }
    const { data } = supabase.storage.from('assets-440').getPublicUrl(fileName);
    const url = data.publicUrl;
    await supabase.from('asesoras').update({ foto_url: url }).eq('id', asesoraId);
    setAsesoras((prev) => prev.map((a) => a.id === asesoraId ? { ...a, foto_url: url } : a));
    showMsg('✅ Foto actualizada.', true);
  }

  async function toggleAsesora(id: string, activa: boolean) {
    await supabase.from('asesoras').update({ activa }).eq('id', id);
    setAsesoras((prev) => prev.map((a) => a.id === id ? { ...a, activa } : a));
  }

  async function handleAddAsesora() {
    if (!newAsesora.nombre.trim()) return;
    setAddingAsesora(true);
    const { data, error } = await supabase
      .from('asesoras')
      .insert({ nombre: newAsesora.nombre.trim(), foto_url: newAsesora.foto_url || null, activa: true })
      .select()
      .single();
    setAddingAsesora(false);
    if (error) { showMsg('Error agregando asesora.', false); return; }
    setAsesoras((prev) => [...prev, data]);
    setNewAsesora({ nombre: '', foto_url: '' });
    showMsg('✅ Asesora agregada.', true);
  }

  async function updateAsesoraNombre(id: string, nombre: string) {
    await supabase.from('asesoras').update({ nombre }).eq('id', id);
    setAsesoras((prev) => prev.map((a) => a.id === id ? { ...a, nombre } : a));
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 6,
    border: '1px solid var(--border-color)', background: 'var(--input-bg, rgba(255,255,255,0.05))',
    color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box',
  };
  const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical' };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' };
  const sectionBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontWeight: active ? 700 : 400, fontSize: 14,
    background: active ? 'rgba(162,123,90,0.15)' : 'transparent',
    color: active ? '#A27B5A' : 'var(--text-secondary)',
    borderBottom: active ? '2px solid #A27B5A' : '2px solid transparent',
  });
  const saveBtn = (section: Section): React.CSSProperties => ({
    padding: '8px 24px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: '#A27B5A', color: '#fff', fontWeight: 700, fontSize: 14,
    opacity: saving === section ? 0.7 : 1,
  });
  const uploadBtn: React.CSSProperties = {
    padding: '6px 16px', borderRadius: 6, border: '1px solid #A27B5A',
    color: '#A27B5A', background: 'transparent', cursor: 'pointer', fontSize: 13,
  };

  if (loading) return <div className="form-section" style={{ color: 'var(--text-secondary)' }}>Cargando configuración...</div>;

  return (
    <div className="form-section">
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Configuración de la Clínica</h2>

      {msg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
          background: msg.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.ok ? '#4ade80' : '#f87171', fontSize: 14,
        }}>
          {msg.text}
        </div>
      )}

      {/* Tabs de sección */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)' }}>
        {(Object.keys(SECTIONS) as Section[]).map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} style={sectionBtnStyle(activeSection === s)}>
            {SECTIONS[s]}
          </button>
        ))}
      </div>

      {/* ── IDENTIDAD VISUAL ── */}
      {activeSection === 'identidad' && (
        <div>
          {(['logo_url', 'foto_drgio_url', 'foto_pacientes_url'] as const).map((key) => {
            const labels: Record<string, string> = {
              logo_url: 'Logo de la clínica',
              foto_drgio_url: 'Foto Dr. Gio (consultorio)',
              foto_pacientes_url: 'Foto Dr. Gio con pacientes',
            };
            return (
              <div key={key} style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>{labels[key]}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {config[key] && (
                    <img src={config[key]} alt={labels[key]}
                      style={{ height: 70, maxWidth: 200, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                  )}
                  <div>
                    <button style={uploadBtn} onClick={() => fileRefs[key]?.current?.click()}>
                      {uploading === key ? 'Subiendo…' : config[key] ? '🔄 Cambiar' : '⬆ Subir imagen'}
                    </button>
                    <input type="file" accept="image/*" ref={fileRefs[key]} style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(key, e.target.files[0]); }} />
                    {config[key] && (
                      <div style={{ marginTop: 6 }}>
                        <input style={{ ...inputStyle, fontSize: 11, color: 'var(--text-secondary)' }}
                          value={config[key]} readOnly />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <button style={saveBtn('identidad')} disabled={saving === 'identidad'}
            onClick={() => saveSection('identidad', ['logo_url', 'foto_drgio_url', 'foto_pacientes_url'])}>
            {saving === 'identidad' ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}

      {/* ── PERFIL DR. GIO ── */}
      {activeSection === 'drgio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'drgio_nombre', label: 'Nombre completo' },
            { key: 'drgio_cirugias', label: 'Número de cirugías (Ej: +3.000)' },
            { key: 'drgio_anios', label: 'Años de experiencia (Ej: +10)' },
            { key: 'drgio_certificacion', label: 'Certificación (Ej: CAMPLASTICO · RETHUS)' },
            { key: 'drgio_rethus_link', label: 'Link verificación RETHUS' },
            { key: 'drgio_frase', label: 'Frase de marca' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input style={inputStyle} value={config[key] || ''} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Bio / ¿Quién soy?</label>
            <textarea style={textareaStyle} rows={4} value={config.drgio_bio || ''}
              onChange={(e) => set('drgio_bio', e.target.value)} />
          </div>
          <div>
            <button style={saveBtn('drgio')} disabled={saving === 'drgio'}
              onClick={() => saveSection('drgio', ['drgio_nombre', 'drgio_bio', 'drgio_cirugias', 'drgio_anios', 'drgio_certificacion', 'drgio_rethus_link', 'drgio_frase'])}>
              {saving === 'drgio' ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* ── TESTIMONIOS ── */}
      {activeSection === 'testimonios' && (
        <div>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: '0.75rem', color: '#A27B5A' }}>Testimonio {n}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={labelStyle}>Nombre</label>
                  <input style={inputStyle} value={config[`testimonio_${n}_nombre`] || ''}
                    onChange={(e) => set(`testimonio_${n}_nombre`, e.target.value)} />
                </div>
                <div style={{ flex: 0.5, minWidth: 100 }}>
                  <label style={labelStyle}>País</label>
                  <input style={inputStyle} value={config[`testimonio_${n}_pais`] || ''}
                    onChange={(e) => set(`testimonio_${n}_pais`, e.target.value)} />
                </div>
                <div style={{ flex: 1.5, minWidth: 200 }}>
                  <label style={labelStyle}>Link al video</label>
                  <input style={inputStyle} placeholder="https://..." value={config[`testimonio_${n}_link`] || ''}
                    onChange={(e) => set(`testimonio_${n}_link`, e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button style={saveBtn('testimonios')} disabled={saving === 'testimonios'}
            onClick={() => saveSection('testimonios', [
              'testimonio_1_nombre','testimonio_1_pais','testimonio_1_link',
              'testimonio_2_nombre','testimonio_2_pais','testimonio_2_link',
              'testimonio_3_nombre','testimonio_3_pais','testimonio_3_link',
            ])}>
            {saving === 'testimonios' ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}

      {/* ── CONTACTO ── */}
      {activeSection === 'contacto' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'whatsapp', label: 'WhatsApp (sin +, Ej: 573044885976)' },
            { key: 'direccion', label: 'Dirección' },
            { key: 'web', label: 'Sitio web (sin https://)' },
            { key: 'instagram_1', label: 'Instagram 1 (sin @)' },
            { key: 'instagram_2', label: 'Instagram 2 (sin @)' },
            { key: 'instagram_3', label: 'Instagram 3 (sin @)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input style={inputStyle} value={config[key] || ''} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}
          <div>
            <button style={saveBtn('contacto')} disabled={saving === 'contacto'}
              onClick={() => saveSection('contacto', ['whatsapp', 'direccion', 'web', 'instagram_1', 'instagram_2', 'instagram_3'])}>
              {saving === 'contacto' ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* ── ASESORAS ── */}
      {activeSection === 'asesoras' && (
        <div>
          {/* Lista */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
            {asesoras.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No hay asesoras registradas.</div>
            )}
            {asesoras.map((a) => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 8,
                opacity: a.activa ? 1 : 0.5,
              }}>
                {/* Foto */}
                <div style={{ position: 'relative' }}>
                  {a.foto_url
                    ? <img src={a.foto_url} alt={a.nombre}
                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #A27B5A' }} />
                    : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(162,123,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#A27B5A' }}>
                        {a.nombre.charAt(0).toUpperCase()}
                      </div>
                  }
                </div>

                {/* Nombre editable */}
                <input
                  style={{ ...inputStyle, flex: 1, maxWidth: 220 }}
                  defaultValue={a.nombre}
                  onBlur={(e) => { if (e.target.value !== a.nombre) updateAsesoraNombre(a.id, e.target.value); }}
                />

                {/* Subir foto */}
                <div>
                  <label style={{ ...uploadBtn, display: 'inline-block', cursor: 'pointer' }}>
                    {uploading === `asesora_${a.id}` ? 'Subiendo…' : '📷 Foto'}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files?.[0]) handleAsesoraImage(a.id, e.target.files[0]); }} />
                  </label>
                </div>

                {/* Toggle activa */}
                <button
                  onClick={() => toggleAsesora(a.id, !a.activa)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    background: a.activa ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
                    color: a.activa ? '#4ade80' : '#f87171',
                  }}>
                  {a.activa ? 'Activa' : 'Inactiva'}
                </button>
              </div>
            ))}
          </div>

          {/* Agregar nueva asesora */}
          <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              + Nueva asesora
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>Nombre</label>
                <input style={inputStyle} value={newAsesora.nombre}
                  onChange={(e) => setNewAsesora((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Nombre completo" />
              </div>
              <button
                onClick={handleAddAsesora}
                disabled={addingAsesora || !newAsesora.nombre.trim()}
                style={{ ...saveBtn('asesoras'), opacity: (addingAsesora || !newAsesora.nombre.trim()) ? 0.5 : 1 }}>
                {addingAsesora ? 'Agregando…' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
