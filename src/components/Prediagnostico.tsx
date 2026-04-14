import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface Asesora {
  id: string;
  nombre: string;
  foto_url: string | null;
  activa: boolean;
}

interface ClinicConfig {
  [key: string]: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    html2pdf: any;
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Prediagnostico() {
  const [asesoras, setAsesoras] = useState<Asesora[]>([]);
  const [config, setConfig] = useState<ClinicConfig>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    asesora_id: '',
    prospecto_nombre: '',
    prospecto_telefono: '',
    prospecto_correo: '',
    procedimiento: '',
    precio_desde: '',
    precio_hasta: '',
    observaciones: '',
  });

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('asesoras').select('*').eq('activa', true).order('nombre'),
      supabase.from('configuracion_clinic').select('clave, valor'),
    ]).then(([{ data: a }, { data: c }]) => {
      setAsesoras(a || []);
      const map: ClinicConfig = {};
      (c || []).forEach((r) => { map[r.clave] = r.valor || ''; });
      setConfig(map);
      setLoading(false);
    });
  }, []);

  const selectedAsesora = asesoras.find((a) => a.id === form.asesora_id) || null;

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  async function handleGenerarPDF() {
    if (!form.prospecto_nombre.trim() || !form.prospecto_telefono.trim() || !form.procedimiento.trim()) {
      showMsg('Completa nombre, teléfono y procedimiento.', false);
      return;
    }

    setGenerating(true);

    // Guardar en Supabase primero
    const { data: record, error: dbErr } = await supabase
      .from('prediagnosticos')
      .insert({
        asesora_id: form.asesora_id || null,
        prospecto_nombre: form.prospecto_nombre.trim(),
        prospecto_telefono: form.prospecto_telefono.trim(),
        prospecto_correo: form.prospecto_correo.trim() || null,
        procedimiento: form.procedimiento.trim(),
        precio_desde: form.precio_desde ? parseFloat(form.precio_desde) : null,
        precio_hasta: form.precio_hasta ? parseFloat(form.precio_hasta) : null,
        observaciones: form.observaciones.trim() || null,
        estado: 'generado',
      })
      .select()
      .single();

    if (dbErr || !record) {
      showMsg('Error guardando el registro.', false);
      setGenerating(false);
      return;
    }

    // Generar PDF
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = pdfRef.current!;
      element.style.display = 'block';

      const pdfBlob: Blob = await new Promise((resolve) => {
        html2pdf()
          .set({
            margin: 0,
            filename: `prediagnostico_${record.id}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          })
          .from(element)
          .outputPdf('blob')
          .then(resolve);
      });

      element.style.display = 'none';

      // Subir a Storage
      const fileName = `prediagnosticos/${record.id}.pdf`;
      const { error: storErr } = await supabase.storage
        .from('assets-440')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });

      let pdfUrl = '';
      if (!storErr) {
        const { data: urlData } = supabase.storage.from('assets-440').getPublicUrl(fileName);
        pdfUrl = urlData.publicUrl;
        await supabase.from('prediagnosticos').update({ pdf_url: pdfUrl }).eq('id', record.id);
      }

      // Descargar localmente también
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Prediagnostico_${form.prospecto_nombre.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      showMsg('✅ PDF generado y guardado correctamente.', true);
    } catch (e) {
      console.error(e);
      showMsg('Error generando el PDF.', false);
    }

    setGenerating(false);
  }

  const precioDesde = form.precio_desde ? parseFloat(form.precio_desde) : null;
  const precioHasta = form.precio_hasta ? parseFloat(form.precio_hasta) : null;

  if (loading) return <div className="form-section" style={{ color: 'var(--text-secondary)' }}>Cargando...</div>;

  return (
    <div>
      {/* ── Formulario ── */}
      <div className="form-section">
        <h2 className="form-label mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Nuevo Prediagnóstico Comercial
        </h2>

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

        {/* Asesora */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Asesora</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            {asesoras.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, asesora_id: a.id }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                  border: `2px solid ${form.asesora_id === a.id ? '#A27B5A' : 'var(--border-color)'}`,
                  background: form.asesora_id === a.id ? 'rgba(162,123,90,0.12)' : 'transparent',
                  color: 'var(--text-primary)', fontSize: 14,
                }}
              >
                {a.foto_url && (
                  <img src={a.foto_url} alt={a.nombre}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                )}
                {a.nombre}
              </button>
            ))}
            {asesoras.length === 0 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                No hay asesoras activas. Agrégalas en Config. Clínica.
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Nombre del prospecto *</label>
            <input className="form-input" value={form.prospecto_nombre}
              onChange={(e) => setForm((f) => ({ ...f, prospecto_nombre: e.target.value }))} />
          </div>
          <div className="form-group" style={{ flex: 0.6 }}>
            <label className="form-label">Teléfono *</label>
            <input className="form-input" value={form.prospecto_telefono}
              onChange={(e) => setForm((f) => ({ ...f, prospecto_telefono: e.target.value }))} />
          </div>
          <div className="form-group" style={{ flex: 0.8 }}>
            <label className="form-label">Correo</label>
            <input type="email" className="form-input" value={form.prospecto_correo}
              onChange={(e) => setForm((f) => ({ ...f, prospecto_correo: e.target.value }))} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Procedimiento indicado *</label>
          <input className="form-input" placeholder="Ej: Lipoescultura de alta definición + abdominoplastia"
            value={form.procedimiento}
            onChange={(e) => setForm((f) => ({ ...f, procedimiento: e.target.value }))} />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Precio desde (COP)</label>
            <input type="number" className="form-input" placeholder="0"
              value={form.precio_desde}
              onChange={(e) => setForm((f) => ({ ...f, precio_desde: e.target.value }))} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Precio hasta (COP)</label>
            <input type="number" className="form-input" placeholder="0"
              value={form.precio_hasta}
              onChange={(e) => setForm((f) => ({ ...f, precio_hasta: e.target.value }))} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Observaciones</label>
          <textarea className="form-input" rows={3} value={form.observaciones}
            onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
            style={{ resize: 'vertical' }} />
        </div>

        <button
          onClick={handleGenerarPDF}
          disabled={generating}
          style={{
            background: '#A27B5A', color: '#fff', border: 'none',
            padding: '0.75rem 2rem', borderRadius: 8, fontWeight: 700,
            fontSize: 15, cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? 'Generando PDF…' : '📄 Generar PDF'}
        </button>
      </div>

      {/* ── PDF Template (oculto) ── */}
      <div ref={pdfRef} style={{ display: 'none' }}>
        <PDFTemplate form={form} asesora={selectedAsesora} config={config}
          precioDesde={precioDesde} precioHasta={precioHasta} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   PDF Template — 2 páginas
──────────────────────────────────────────────────────── */
function PDFTemplate({
  form, asesora, config, precioDesde, precioHasta,
}: {
  form: { prospecto_nombre: string; procedimiento: string; observaciones: string };
  asesora: Asesora | null;
  config: ClinicConfig;
  precioDesde: number | null;
  precioHasta: number | null;
}) {
  const styles: Record<string, React.CSSProperties> = {
    page: {
      width: '210mm', minHeight: '297mm', background: '#fff',
      fontFamily: 'Georgia, serif', pageBreakAfter: 'always',
    },
    header: {
      background: '#26364D', padding: '28px 36px',
      display: 'flex', alignItems: 'center',
    },
    logoImg: { maxHeight: 52, maxWidth: 160, objectFit: 'contain' as const },
    logoText: { color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: 1 },
    asesoraStrip: {
      background: '#F5F0E8', padding: '14px 36px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    body: { padding: '28px 36px' },
    procedimientoLabel: { fontSize: 11, color: '#A27B5A', letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 8 },
    procedimientoText: { fontSize: 26, color: '#26364D', fontWeight: 700, lineHeight: 1.25, marginBottom: 24 },
    pricebox: {
      background: '#26364D', color: '#fff', borderRadius: 8,
      padding: '18px 24px', marginBottom: 24, textAlign: 'center' as const,
    },
    priceLabel: { fontSize: 11, letterSpacing: 2, color: '#A27B5A', textTransform: 'uppercase' as const, marginBottom: 6 },
    priceValue: { fontSize: 22, fontWeight: 700 },
    obsBox: { borderLeft: '4px solid #A27B5A', paddingLeft: 16, marginBottom: 24 },
    obsLabel: { fontSize: 11, color: '#A27B5A', letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 6 },
    obsText: { fontSize: 13, color: '#334155', lineHeight: 1.7 },
    disclaimer: {
      background: '#F8F6F2', borderRadius: 6, padding: '12px 16px',
      fontSize: 11, color: '#64748B', lineHeight: 1.6, marginBottom: 20,
    },
    consultaRow: { display: 'flex', gap: 16, marginBottom: 24 },
    consultaBox: {
      flex: 1, border: '1px solid #E2D9CE', borderRadius: 8,
      padding: '14px 18px', textAlign: 'center' as const,
    },
    consultaTipo: { fontSize: 12, color: '#A27B5A', fontWeight: 700, marginBottom: 4 },
    consultaPrecio: { fontSize: 18, color: '#26364D', fontWeight: 700 },
    footer: {
      background: '#26364D', padding: '14px 36px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    footerText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    // Página 2
    page2Header: {
      background: '#1A2535', padding: '28px 36px',
      display: 'flex', alignItems: 'center', gap: 28,
    },
    drPhoto: { width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' as const, border: '3px solid #A27B5A' },
    statsStrip: {
      background: '#26364D', padding: '18px 36px',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    },
    statItem: { textAlign: 'center' as const },
    statValue: { color: '#A27B5A', fontSize: 22, fontWeight: 700 },
    statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: 1 },
    pacientesImg: { width: '100%', height: 220, objectFit: 'cover' as const, display: 'block' },
    ciudades: { textAlign: 'center' as const, padding: '12px 36px', fontSize: 13, color: '#64748B', letterSpacing: 2 },
    testimonioGrid: { display: 'flex', gap: 16, padding: '20px 36px' },
    testimonioCard: { flex: 1, border: '1px solid #E2D9CE', borderRadius: 8, padding: '16px', textAlign: 'center' as const },
    testimonioNombre: { fontSize: 15, fontWeight: 700, color: '#26364D', marginBottom: 4 },
    testPais: { fontSize: 12, color: '#A27B5A', marginBottom: 8 },
    testLink: { fontSize: 11, color: '#A27B5A' },
    footer2: { background: '#1A2535', padding: '20px 36px' },
    ctaTitle: { color: '#A27B5A', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 12 },
    ctaRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 16 },
    ctaItem: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  };

  const instagramAccounts = [config.instagram_1, config.instagram_2, config.instagram_3]
    .filter(Boolean).map((i) => `@${i}`).join(' · ');

  const testimonios = [
    { nombre: config.testimonio_1_nombre, pais: config.testimonio_1_pais, link: config.testimonio_1_link },
    { nombre: config.testimonio_2_nombre, pais: config.testimonio_2_pais, link: config.testimonio_2_link },
    { nombre: config.testimonio_3_nombre, pais: config.testimonio_3_pais, link: config.testimonio_3_link },
  ];

  return (
    <div>
      {/* ══ PÁGINA 1 ══ */}
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          {config.logo_url
            ? <img src={config.logo_url} alt="Logo" style={styles.logoImg} />
            : <span style={styles.logoText}>440 Clinic</span>
          }
        </div>

        {/* Asesora strip */}
        <div style={styles.asesoraStrip}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {asesora?.foto_url && (
              <img src={asesora.foto_url} alt={asesora.nombre}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #A27B5A' }} />
            )}
            <div>
              <div style={{ fontSize: 10, color: '#A27B5A', letterSpacing: 2, textTransform: 'uppercase' }}>Asesora</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#26364D' }}>{asesora?.nombre || '—'}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#A27B5A', letterSpacing: 2, textTransform: 'uppercase' }}>Prospecto</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#26364D' }}>{form.prospecto_nombre}</div>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <div style={styles.procedimientoLabel}>Procedimiento indicado</div>
          <div style={styles.procedimientoText}>{form.procedimiento}</div>

          {/* Precio */}
          {(precioDesde || precioHasta) && (
            <div style={styles.pricebox}>
              <div style={styles.priceLabel}>Inversión estimada</div>
              <div style={styles.priceValue}>
                {precioDesde ? `Desde ${fmt(precioDesde)}` : ''}
                {precioDesde && precioHasta ? ' — ' : ''}
                {precioHasta ? `Hasta ${fmt(precioHasta)} COP` : ' COP'}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {form.observaciones && (
            <div style={styles.obsBox}>
              <div style={styles.obsLabel}>Observaciones</div>
              <div style={styles.obsText}>{form.observaciones}</div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={styles.disclaimer}>
            <strong>Valor orientativo.</strong> El precio definitivo se establece en consulta médica con el {config.drgio_nombre || 'Dr. Giovanni Fuentes'}, Cirujano Plástico Certificado CAMPLASTICO. Este documento no constituye contrato ni compromiso de precio.
          </div>

          {/* Consultas */}
          <div style={styles.consultaRow}>
            <div style={styles.consultaBox}>
              <div style={styles.consultaTipo}>Consulta presencial</div>
              <div style={styles.consultaPrecio}>$250.000</div>
            </div>
            <div style={styles.consultaBox}>
              <div style={styles.consultaTipo}>Consulta virtual</div>
              <div style={styles.consultaPrecio}>$160.000</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>{config.web || 'drgio440.com'}</span>
          <span style={styles.footerText}>{instagramAccounts}</span>
          <span style={styles.footerText}>{config.direccion || 'Barranquilla'}</span>
        </div>
      </div>

      {/* ══ PÁGINA 2 ══ */}
      <div style={{ ...styles.page, pageBreakBefore: 'always' as const }}>
        {/* Header Dr. Gio */}
        <div style={styles.page2Header}>
          {config.foto_drgio_url
            ? <img src={config.foto_drgio_url} alt="Dr. Gio" style={styles.drPhoto} />
            : <div style={{ ...styles.drPhoto, background: '#26364D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#A27B5A', fontSize: 28, fontWeight: 700 }}>G</span>
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
        <div style={styles.statsStrip}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{config.drgio_cirugias || '+3.000'}</div>
            <div style={styles.statLabel}>Cirugías realizadas</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', height: 40 }} />
          <div style={styles.statItem}>
            <div style={styles.statValue}>{config.drgio_anios || '+10'}</div>
            <div style={styles.statLabel}>Años de experiencia</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', height: 40 }} />
          <div style={styles.statItem}>
            <div style={styles.statValue}>{config.drgio_certificacion || 'CAMPLASTICO'}</div>
            <div style={styles.statLabel}>Certificación</div>
          </div>
        </div>

        {/* Foto con pacientes */}
        {config.foto_pacientes_url && (
          <img src={config.foto_pacientes_url} alt="Pacientes" style={styles.pacientesImg} />
        )}

        {/* Ciudades */}
        <div style={styles.ciudades}>Barranquilla · Bogotá · Medellín</div>

        {/* Testimonios */}
        <div style={styles.testimonioGrid}>
          {testimonios.filter((t) => t.nombre).map((t, i) => (
            <div key={i} style={styles.testimonioCard}>
              <div style={styles.testimonioNombre}>{t.nombre}</div>
              <div style={styles.testPais}>{t.pais}</div>
              {t.link && <div style={styles.testLink}>▶ Ver testimonio</div>}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={styles.footer2}>
          <div style={styles.ctaTitle}>¿Listo para dar el primer paso?</div>
          <div style={styles.ctaRow}>
            {config.whatsapp && <span style={styles.ctaItem}>📱 +{config.whatsapp}</span>}
            {config.web && <span style={styles.ctaItem}>🌐 {config.web}</span>}
            {config.direccion && <span style={styles.ctaItem}>📍 {config.direccion}</span>}
            {instagramAccounts && <span style={styles.ctaItem}>📸 {instagramAccounts}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
