import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Save, X, Search, FileText, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import type { KnowledgeItem } from '../context/ConfigContext';
import knowledgeBase440 from '../data/knowledgeBase440.json';

const KnowledgeBaseEditor: React.FC = () => {
    const { knowledgeBase, updateCatalog } = useConfig();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'add' | 'import'>('add');
    const [importText, setImportText] = useState('');
    const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [filterCat, setFilterCat] = useState('');

    // Form state
    const [formData, setFormData] = useState<Partial<KnowledgeItem>>({
        title: '',
        content: '',
        category: 'protocolo'
    });

    const handleSave = () => {
        if (!formData.title || !formData.content) return;

        let updatedList: KnowledgeItem[];
        if (editingId) {
            updatedList = knowledgeBase.map(item =>
                item.id === editingId
                    ? { ...item, ...formData, lastUpdated: new Date().toISOString() } as KnowledgeItem
                    : item
            );
        } else {
            const newItem: KnowledgeItem = {
                id: Math.random().toString(36).substr(2, 9),
                title: formData.title!,
                content: formData.content!,
                category: formData.category || 'protocolo',
                lastUpdated: new Date().toISOString()
            };
            updatedList = [...knowledgeBase, newItem];
        }

        updateCatalog('knowledgeBase', updatedList);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta información? La IA dejará de conocer este protocolo.')) {
            const updatedList = knowledgeBase.filter(item => item.id !== id);
            updateCatalog('knowledgeBase', updatedList);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ title: '', content: '', category: 'protocolo' });
    };

    const startEdit = (item: KnowledgeItem) => {
        setEditingId(item.id);
        setFormData({ title: item.title, content: item.content, category: item.category });
        setActiveTab('add');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Import base GHL ──────────────────────────────────────────────
    const handleImport440 = () => {
        if (!window.confirm(`¿Importar ${knowledgeBase440.length} artículos de la Base GHL 440 Clinic? Esto se sumará a los que ya tienes.`)) return;
        const existingIds = new Set(knowledgeBase.map(i => i.id));
        const newItems = (knowledgeBase440 as KnowledgeItem[]).filter(i => !existingIds.has(i.id));
        const merged = [...knowledgeBase, ...newItems];
        updateCatalog('knowledgeBase', merged);
        setImportStatus({ type: 'success', msg: `✅ ${newItems.length} artículos importados correctamente.` });
        setTimeout(() => setImportStatus(null), 5000);
    };

    const handleReplaceWith440 = () => {
        if (!window.confirm(`¿Reemplazar TODO con la Base GHL 440 Clinic (${knowledgeBase440.length} artículos)? Se perderá la base actual.`)) return;
        updateCatalog('knowledgeBase', knowledgeBase440 as KnowledgeItem[]);
        setImportStatus({ type: 'success', msg: `✅ Base reemplazada con ${knowledgeBase440.length} artículos.` });
        setTimeout(() => setImportStatus(null), 5000);
    };

    const handleImportJSON = () => {
        try {
            const parsed = JSON.parse(importText);
            const items: KnowledgeItem[] = Array.isArray(parsed) ? parsed : [parsed];
            const valid = items.filter(i => i.title && i.content);
            if (valid.length === 0) throw new Error('No se encontraron artículos válidos.');
            const withIds = valid.map(i => ({
                ...i,
                id: i.id || Math.random().toString(36).substr(2, 9),
                category: i.category || 'otro',
                lastUpdated: new Date().toISOString()
            }));
            const merged = [...knowledgeBase, ...withIds];
            updateCatalog('knowledgeBase', merged);
            setImportText('');
            setImportStatus({ type: 'success', msg: `✅ ${withIds.length} artículos importados desde JSON.` });
            setTimeout(() => setImportStatus(null), 5000);
        } catch (e: any) {
            setImportStatus({ type: 'error', msg: `❌ Error al parsear JSON: ${e.message}` });
        }
    };

    const handleExportJSON = () => {
        const blob = new Blob([JSON.stringify(knowledgeBase, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `base-conocimiento-440-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleClearAll = () => {
        if (window.confirm('⚠️ ¿Eliminar TODA la base de conocimiento? Esta acción no se puede deshacer.')) {
            updateCatalog('knowledgeBase', []);
        }
    };

    // ── Filters ──────────────────────────────────────────────────────
    const categories = ['', 'cirugía', 'procedimiento', 'protocolo', 'faq', 'otro'];

    const filteredItems = knowledgeBase.filter(item => {
        const matchSearch = !searchTerm ||
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = !filterCat || item.category === filterCat;
        return matchSearch && matchCat;
    });

    const catCount = (cat: string) => knowledgeBase.filter(i => i.category === cat).length;

    return (
        <div className="catalog-manager">

            {/* ── Status banner ── */}
            {importStatus && (
                <div style={{
                    padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1rem',
                    background: importStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${importStatus.type === 'success' ? '#86efac' : '#fca5a5'}`,
                    color: importStatus.type === 'success' ? '#166534' : '#991b1b',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    {importStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {importStatus.msg}
                </div>
            )}

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { key: 'add', label: editingId ? '✏️ Editar artículo' : '➕ Nuevo artículo' },
                    { key: 'import', label: '📥 Importar / Exportar' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        style={{
                            padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.9rem',
                            background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                            boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB: Add / Edit ── */}
            {activeTab === 'add' && (
                <div className="item-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--primary-light)' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                        {editingId ? 'Editar Información' : 'Agregar Nuevo Conocimiento'}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Título / Tema</label>
                            <input
                                className="form-input"
                                placeholder="Ej: Protocolo Postoperatorio Lipoescultura"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select
                                className="form-input"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="cirugía">Cirugía</option>
                                <option value="procedimiento">Procedimiento</option>
                                <option value="protocolo">Protocolo</option>
                                <option value="faq">Precio / FAQ</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contenido Detallado (Base para la IA)</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '200px', resize: 'vertical', lineHeight: '1.6' }}
                            placeholder="Escribe aquí toda la información que la IA debe saber sobre este tema..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {editingId && (
                            <button className="action-btn" onClick={resetForm} style={{ background: '#f3f4f6', color: '#374151' }}>
                                <X size={18} /> Cancelar
                            </button>
                        )}
                        <button className="action-btn" onClick={handleSave} style={{ background: 'var(--primary)', color: 'white' }}>
                            <Save size={18} /> {editingId ? 'Actualizar Conocimiento' : 'Guardar en Base de Datos'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── TAB: Import / Export ── */}
            {activeTab === 'import' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Quick import 440 */}
                    <div className="item-card" style={{ flexDirection: 'column', gap: '1rem', background: 'linear-gradient(135deg, #f0f4ff, #e8f0ff)', border: '1px solid var(--primary-light)' }}>
                        <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🚀 Base de Conocimiento GHL — 440 Clinic
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {knowledgeBase440.length} artículos listos: Cirugías, Procedimientos, Protocolos, Precios y Bienestar.
                            Generados directamente de tus documentos de GHL.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                className="action-btn"
                                onClick={handleImport440}
                                style={{ background: 'var(--primary)', color: 'white' }}
                            >
                                <Upload size={18} /> Importar (sumar a los actuales)
                            </button>
                            <button
                                className="action-btn"
                                onClick={handleReplaceWith440}
                                style={{ background: '#7c3aed', color: 'white' }}
                            >
                                <Upload size={18} /> Reemplazar base completa
                            </button>
                        </div>
                    </div>

                    {/* JSON manual import */}
                    <div className="item-card" style={{ flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} /> Importar JSON personalizado
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Pega un array JSON con campos: <code>title</code>, <code>content</code>, <code>category</code>
                        </p>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '140px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                            placeholder={'[\n  {\n    "title": "Tema",\n    "content": "Contenido detallado...",\n    "category": "cirugía"\n  }\n]'}
                            value={importText}
                            onChange={e => setImportText(e.target.value)}
                        />
                        <button
                            className="action-btn"
                            onClick={handleImportJSON}
                            disabled={!importText.trim()}
                            style={{ background: 'var(--primary)', color: 'white', alignSelf: 'flex-start', opacity: !importText.trim() ? 0.5 : 1 }}
                        >
                            <Upload size={18} /> Importar JSON
                        </button>
                    </div>

                    {/* Export & clear */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            className="action-btn"
                            onClick={handleExportJSON}
                            style={{ background: '#059669', color: 'white' }}
                        >
                            <Download size={18} /> Exportar base actual ({knowledgeBase.length} artículos)
                        </button>
                        {knowledgeBase.length > 0 && (
                            <button
                                className="action-btn"
                                onClick={handleClearAll}
                                style={{ background: '#ef4444', color: 'white' }}
                            >
                                <Trash2 size={18} /> Limpiar toda la base
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Library ── */}
            <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={20} /> Biblioteca de Conocimiento ({filteredItems.length}/{knowledgeBase.length})
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* Category filter pills */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat || 'all'}
                                    onClick={() => setFilterCat(cat)}
                                    style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '20px', cursor: 'pointer',
                                        fontSize: '0.75rem', fontWeight: 600,
                                        background: filterCat === cat ? 'var(--primary)' : 'var(--surface)',
                                        color: filterCat === cat ? 'white' : 'var(--text-muted)',
                                        border: `1px solid ${filterCat === cat ? 'var(--primary)' : 'var(--border-color)'}`,
                                    }}
                                >
                                    {cat ? `${cat} (${catCount(cat)})` : `Todos (${knowledgeBase.length})`}
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: '32px', width: '220px' }}
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                    {filteredItems.map(item => (
                        <div key={item.id} className="item-card" style={{ flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span style={{
                                    fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '20px',
                                    background: item.category === 'cirugía' ? '#fef3c7' :
                                        item.category === 'procedimiento' ? '#e0f2fe' :
                                        item.category === 'faq' ? '#f0fdf4' : 'var(--primary-light)',
                                    color: item.category === 'cirugía' ? '#92400e' :
                                        item.category === 'procedimiento' ? '#0369a1' :
                                        item.category === 'faq' ? '#166534' : 'var(--primary)',
                                    fontWeight: 'bold', textTransform: 'uppercase'
                                }}>
                                    {item.category}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Editar">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Eliminar">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h4 style={{ margin: '0.5rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.title}</h4>
                            <p style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {item.content}
                            </p>
                            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <FileText size={11} /> {new Date(item.lastUpdated).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No se encontró información. Importa la base GHL para comenzar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBaseEditor;
