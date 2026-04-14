import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ClinicConfig {
  [key: string]: string;
}

interface Registro {
  id: string;
  created_at: string;
  prospecto_nombre: string;
  procedimiento: string;
  precio_desde: number | null;
  estado: string;
  asesora_id: string | null;
  usuarios_suite?: { nombre: string } | null;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    html2pdf: any;
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Prediagnostico() {
  // Usuario logueado
  const usuarioId    = localStorage.getItem('suiteUsuarioId') || '';
  const usuarioNombre = localStorage.getItem('suiteUsuarioNombre') || 'Asesor/a';
  const usuarioFoto  = localStorage.getItem('suiteUsuarioFoto') || '';

  const [config, setConfig] = useState<ClinicConfig>({});
  const [historial, setHistorial] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    // Sección 1 — Prospecto
    prospecto_nombre: '',
    prospecto_edad: '',
    prospecto_telefono: '',
    prospecto_correo: '',
    prospecto_ciudad: '',
    // Sección 2 — Comercial
    procedimiento: '',
    precio_desde: '',
    observaciones: '',
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('configuracion_clinic').select('clave, valor'),
      supabase
        .from('prediagnosticos')
        .select('id, created_at, prospecto_nombre, procedimiento, precio_desde, estado, asesora_id, usuarios_suite(nombre)')
        .order('created_at', { ascending: false })
        .limit(50),
    ]).then(([{ data: c }, { data: h }]) => {
      const map: ClinicConfig = {};
      (c || []).forEach((r) => { map[r.clave] = r.valor || ''; });
      setConfig(map);
      setHistorial((h as Registro[]) || []);
      setLoading(false);
    });
  }, []);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 5000);
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  async function handleGenerar() {
    if (!form.prospecto_nombre.trim() || !form.procedimiento.trim()) {
      showMsg('Nombre del prospecto y procedimiento son obligatorios.', false);
      return;
    }
    setGenerating(true);

    const { data: record, error: dbErr } = await supabase
      .from('prediagnosticos')
      .insert({
        asesora_id: usuarioId || null,
        prospecto_nombre: form.prospecto_nombre.trim(),
        prospecto_telefono: form.prospecto_telefono.trim() || null,
        prospecto_correo: form.prospecto_correo.trim() || null,
        procedimiento: form.procedimiento.trim(),
        precio_desde: form.precio_desde ? parseFloat(form.precio_desde) : null,
        observaciones: form.observaciones.trim() || null,
        estado: 'generado',
      })
      .select()
      .single();

    if (dbErr || !record) {
      showMsg('Error guardando el registro: ' + (dbErr?.message || ''), false);
      setGenerating(false);
      return;
    }

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const el = pdfRef.current!;
      el.style.display = 'block';

      const pdfBlob: Blob = await new Promise((resolve) => {
        html2pdf()
          .set({
            margin: 0,
            filename: `prediagnostico_${record.id}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          })
          .from(el)
          .outputPdf('blob')
          .then(resolve);
      });

      el.style.display = 'none';

      // Subir a Storage
      const fileName = `prediagnosticos/${record.id}.pdf`;
      const { error: storErr } = await supabase.storage
        .from('assets-440')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });

      if (!storErr) {
        const { data: urlData } = supabase.storage.from('assets-440').getPublicUrl(fileName);
        await supabase.from('prediagnosticos').update({ pdf_url: urlData.publicUrl }).eq('id', record.id);
      }

      // Descarga local
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Prediagnostico_${form.prospecto_nombre.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Actualizar historial
      setHistorial((prev) => [{
        id: record.id,
        created_at: record.created_at,
        prospecto_nombre: form.prospecto_nombre,
        procedimiento: form.procedimiento,
        precio_desde: form.precio_desde ? parseFloat(form.precio_desde) : null,
        estado: 'generado',
        asesora_id: usuarioId || null,
        usuarios_suite: usuarioNombre ? { nombre: usuarioNombre } : null,
      }, ...prev]);

      showMsg('✅ PDF generado y guardado correctamente.', true);

      // Limpiar formulario
      setForm({
        prospecto_nombre: '', prospecto_edad: '', prospecto_telefono: '',
        prospecto_correo: '', prospecto_ciudad: '',
        procedimiento: '', precio_desde: '', observaciones: '',
      });
    } catch (e) {
      console.error(e);
      showMsg('Error generando el PDF.', false);
    }

    setGenerating(false);
  }

  const precioDesde = form.precio_desde ? parseFloat(form.precio_desde) : null;

  const inputStyle: React.CSSProperties = { width: '100%' };

  if (loading) return <div className="form-section" style={{ color: 'var(--text-secondary)' }}>Cargando...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900 }}>

      {msg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem',
          background: msg.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.ok ? '#4ade80' : '#f87171', fontSize: 14,
        }}>
          {msg.text}
        </div>
      )}

      {/* ── SECCIÓN 1: Datos del prospecto ── */}
      <div className="form-section" style={{ marginBottom: '1.25rem' }}>
        <h3 className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
          1. Datos del prospecto
        </h3>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1.5 }}>
            <label className="form-label">Nombre completo *</label>
            <input className="form-input" style={inputStyle} value={form.prospecto_nombre}
              onChange={(e) => set('prospecto_nombre', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 0.3 }}>
            <label className="form-label">Edad</label>
            <input type="number" className="form-input" style={inputStyle} value={form.prospecto_edad}
              onChange={(e) => set('prospecto_edad', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 0.7 }}>
            <label className="form-label">Teléfono</label>
            <input className="form-input" style={inputStyle} value={form.prospecto_telefono}
              onChange={(e) => set('prospecto_telefono', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Correo electrónico</label>
            <input type="email" className="form-input" style={inputStyle} value={form.prospecto_correo}
              onChange={(e) => set('prospecto_correo', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">País / Ciudad</label>
            <input className="form-input" style={inputStyle} placeholder="Ej: Barranquilla, Colombia"
              value={form.prospecto_ciudad} onChange={(e) => set('prospecto_ciudad', e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: Datos comerciales ── */}
      <div className="form-section" style={{ marginBottom: '1.25rem' }}>
        <h3 className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
          2. Datos comerciales
        </h3>

        {/* Asesora: usuario logueado */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Asesora</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            {usuarioFoto ? (
              <img src={usuarioFoto} alt={usuarioNombre}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#A27B5A', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
              }}>
                {usuarioNombre.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')}
              </div>
            )}
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{usuarioNombre}</span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Procedimiento indicado *</label>
          <input className="form-input" style={inputStyle}
            placeholder="Ej: Lipoescultura de alta definición + abdominoplastia"
            value={form.procedimiento} onChange={(e) => set('procedimiento', e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Precio aproximado desde (COP)</label>
          <input type="number" className="form-input" style={inputStyle} placeholder="0"
            value={form.precio_desde} onChange={(e) => set('precio_desde', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Observaciones</label>
          <textarea className="form-input" rows={3} style={{ ...inputStyle, resize: 'vertical' }}
            value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} />
        </div>
      </div>

      {/* ── SECCIÓN 3: Acción ── */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={handleGenerar} disabled={generating}
          style={{
            background: '#A27B5A', color: '#fff', border: 'none',
            padding: '0.8rem 2.5rem', borderRadius: 8, fontWeight: 700,
            fontSize: 15, cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
          }}>
          {generating ? 'Generando…' : '📄 Generar PDF y enviar correo'}
        </button>
      </div>

      {/* ── SECCIÓN 4: Historial ── */}
      <div className="form-section">
        <h3 className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
          Historial de prospectos
        </h3>
        {historial.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sin registros aún.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['Fecha', 'Nombre', 'Procedimiento', 'Precio desde', 'Asesora', 'Estado'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '9px 10px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {fmtFecha(r.created_at)}
                    </td>
                    <td style={{ padding: '9px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.prospecto_nombre}
                    </td>
                    <td style={{ padding: '9px 10px', color: 'var(--text-primary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.procedimiento}
                    </td>
                    <td style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>
                      {r.precio_desde ? fmt(r.precio_desde) : '—'}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      {r.usuarios_suite?.nombre || '—'}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: r.estado === 'generado' ? 'rgba(59,130,246,0.12)' : 'rgba(34,197,94,0.12)',
                        color: r.estado === 'generado' ? '#60a5fa' : '#4ade80',
                      }}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── PDF Template (oculto) ── */}
      <div ref={pdfRef} style={{ display: 'none' }}>
        <PDFTemplate form={form} asesoraNombre={usuarioNombre} asesoraFoto={usuarioFoto} config={config}
          precioDesde={precioDesde} />
      </div>
    </div>
  );
}

/* ─── PDF Template — 2 páginas ─────────────────────────────── */
function PDFTemplate({
  form, asesoraNombre, asesoraFoto, config, precioDesde,
}: {
  form: {
    prospecto_nombre: string; prospecto_edad: string; prospecto_ciudad: string;
    procedimiento: string; observaciones: string;
  };
  asesoraNombre: string;
  asesoraFoto: string;
  config: ClinicConfig;
  precioDesde: number | null;
}) {
  const instagramAccounts = [config.instagram_1, config.instagram_2, config.instagram_3]
    .filter(Boolean).map((i) => `@${i}`).join(' · ');

  const testimonios = [
    { nombre: config.testimonio_1_nombre, pais: config.testimonio_1_pais, link: config.testimonio_1_link },
    { nombre: config.testimonio_2_nombre, pais: config.testimonio_2_pais, link: config.testimonio_2_link },
    { nombre: config.testimonio_3_nombre, pais: config.testimonio_3_pais, link: config.testimonio_3_link },
  ];

  const pageStyle: React.CSSProperties = {
    width: '210mm', minHeight: '297mm', background: '#fff',
    fontFamily: 'Georgia, serif', pageBreakAfter: 'always',
  };

  return (
    <div>
      {/* ══ PÁGINA 1 ══ */}
      <div style={pageStyle}>
        {/* Header */}
        <div style={{ background: '#26364D', padding: '28px 36px', display: 'flex', alignItems: 'center' }}>
          {config.logo_url
            ? <img src={config.logo_url} alt="Logo" style={{ maxHeight: 52, maxWidth: 160, objectFit: 'contain' }} />
            : <span style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>440 Clinic</span>
          }
        </div>

        {/* Strip asesora + prospecto */}
        <div style={{ background: '#F5F0E8', padding: '14px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asesoraFoto && (
              <img src={asesoraFoto} alt={asesoraNombre}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #A27B5A' }} />
            )}
            <div>
              <div style={{ fontSize: 10, color: '#A27B5A', letterSpacing: 2, textTransform: 'uppercase' }}>Asesora</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#26364D' }}>{asesoraNombre || '—'}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#A27B5A', letterSpacing: 2, textTransform: 'uppercase' }}>Prospecto</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#26364D' }}>{form.prospecto_nombre}</div>
            {form.prospecto_ciudad && (
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{form.prospecto_ciudad}</div>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 36px' }}>
          <div style={{ fontSize: 11, color: '#A27B5A', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
            Procedimiento indicado
          </div>
          <div style={{ fontSize: 26, color: '#26364D', fontWeight: 700, lineHeight: 1.25, marginBottom: 24 }}>
            {form.procedimiento}
          </div>

          {precioDesde && (
            <div style={{ background: '#26364D', color: '#fff', borderRadius: 8, padding: '18px 24px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#A27B5A', textTransform: 'uppercase', marginBottom: 6 }}>
                Inversión estimada
              </div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                Desde {fmt(precioDesde)} COP
              </div>
            </div>
          )}

          {form.observaciones && (
            <div style={{ borderLeft: '4px solid #A27B5A', paddingLeft: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: '#A27B5A', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
                Observaciones
              </div>
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{form.observaciones}</div>
            </div>
          )}

          <div style={{ background: '#F8F6F2', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#64748B', lineHeight: 1.6, marginBottom: 20 }}>
            <strong>Valor orientativo.</strong> El precio definitivo se establece en consulta médica con el {config.drgio_nombre || 'Dr. Giovanni Fuentes'}, Cirujano Plástico Certificado CAMPLASTICO. Este documento no constituye contrato ni compromiso de precio.
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {[{ tipo: 'Consulta presencial', precio: '$250.000' }, { tipo: 'Consulta virtual', precio: '$160.000' }].map((c) => (
              <div key={c.tipo} style={{ flex: 1, border: '1px solid #E2D9CE', borderRadius: 8, padding: '14px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#A27B5A', fontWeight: 700, marginBottom: 4 }}>{c.tipo}</div>
                <div style={{ fontSize: 18, color: '#26364D', fontWeight: 700 }}>{c.precio}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#26364D', padding: '14px 36px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{config.web || 'drgio440.com'}</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{instagramAccounts}</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{config.direccion || 'Barranquilla'}</span>
        </div>
      </div>

      {/* ══ PÁGINA 2 ══ */}
      <div style={{ ...pageStyle, pageBreakBefore: 'always' as const }}>
        {/* Header Dr. Gio */}
        <div style={{ background: '#1A2535', padding: '28px 36px', display: 'flex', alignItems: 'center', gap: 28 }}>
          {config.foto_drgio_url
            ? <img src={config.foto_drgio_url} alt="Dr. Gio"
                style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #A27B5A' }} />
            : <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#26364D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#A27B5A', fontSize: 32, fontWeight: 700 }}>G</span>
              </div>
          }
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#A27B5A', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>Cirujano Plástico</div>
            <div style={{ fontSize: 22, color: '#fff', fontWeight: 700, marginBottom: 8 }}>{config.drgio_nombre || 'Dr. Giovanni Fuentes'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 420 }}>{config.drgio_bio}</div>
            {config.drgio_frase && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#A27B5A', fontStyle: 'italic' }}>"{config.drgio_frase}"</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: '#26364D', padding: '18px 36px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { val: config.drgio_cirugias || '+3.000', label: 'Cirugías realizadas' },
            { val: config.drgio_anios || '+10', label: 'Años de experiencia' },
            { val: config.drgio_certificacion || 'CAMPLASTICO', label: 'Certificación' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: '#A27B5A', fontSize: 22, fontWeight: 700 }}>{s.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {config.foto_pacientes_url && (
          <img src={config.foto_pacientes_url} alt="Pacientes"
            style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
        )}

        <div style={{ textAlign: 'center', padding: '12px 36px', fontSize: 13, color: '#64748B', letterSpacing: 2 }}>
          Barranquilla · Bogotá · Medellín
        </div>

        {/* Testimonios */}
        <div style={{ display: 'flex', gap: 16, padding: '20px 36px' }}>
          {testimonios.filter((t) => t.nombre).map((t, i) => (
            <div key={i} style={{ flex: 1, border: '1px solid #E2D9CE', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#26364D', marginBottom: 4 }}>{t.nombre}</div>
              <div style={{ fontSize: 12, color: '#A27B5A', marginBottom: 8 }}>{t.pais}</div>
              {t.link && <div style={{ fontSize: 11, color: '#A27B5A' }}>▶ Ver testimonio</div>}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ background: '#1A2535', padding: '20px 36px' }}>
          <div style={{ color: '#A27B5A', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            ¿Listo para dar el primer paso?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {config.whatsapp && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>📱 +{config.whatsapp}</span>}
            {config.web && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>🌐 {config.web}</span>}
            {config.direccion && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>📍 {config.direccion}</span>}
            {instagramAccounts && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>📸 {instagramAccounts}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
