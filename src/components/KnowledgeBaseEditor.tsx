import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Save, X, Search, FileText } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import type { KnowledgeItem } from '../context/ConfigContext';

const KnowledgeBaseEditor: React.FC = () => {
    const { knowledgeBase, updateCatalog } = useConfig();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        setFormData({
            title: item.title,
            content: item.content,
            category: item.category
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredItems = knowledgeBase.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="catalog-manager">
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
                            <option value="faq">Pregunta Frecuente (FAQ)</option>
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

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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

            <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={20} /> Biblioteca de Conocimiento ({knowledgeBase.length})
                    </h3>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="form-input"
                            style={{ paddingLeft: '35px' }}
                            placeholder="Buscar en la base..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                    {filteredItems.map(item => (
                        <div key={item.id} className="item-card" style={{ flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
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
                            <h4 style={{ margin: '0.5rem 0', color: 'var(--text-main)' }}>{item.title}</h4>
                            <p style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-muted)',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {item.content}
                            </p>
                            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <FileText size={12} /> Actualizado: {new Date(item.lastUpdated).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                            <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No se encontró información que coincida con tu búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBaseEditor;
