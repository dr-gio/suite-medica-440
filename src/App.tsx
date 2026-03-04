import { useState } from 'react';
import './App.css';
import { Stethoscope, ActivitySquare, Pill, ClipboardList, Utensils, Printer, Settings as SettingsIcon, TestTube, Plane, CalendarClock, Send, Lock, Share2, Menu, X, Wallet, FolderOpen } from 'lucide-react';
import PinLock, { useAutoLock } from './components/PinLock';
import SharePanel from './components/SharePanel';
import Prescriptions from './components/Prescriptions';
import LabRequests from './components/LabRequests';
import Imaging from './components/Imaging';
import SurgeryRecommendations from './components/SurgeryRecommendations';
import NutritionPhases from './components/NutritionPhases';
import SickLeave from './components/SickLeave';
import TravelCertificate from './components/TravelCertificate';
import Referral from './components/Referral';
import Settings from './components/Settings';
import EconomicProposal from './components/EconomicProposal';
import SalesTools from './components/SalesTools';
import AIChat from './components/AIChat';

import { useConfig } from './context/ConfigContext';

function App() {
  const { logoUrl } = useConfig();
  const { locked, lock } = useAutoLock();
  // Deployment trigger: Verified author drgio@440clinic.com
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [showShare, setShowShare] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared Patient Context
  const [patient, setPatient] = useState({
    name: 'Juan Pérez',
    id: 'CC 1234567890',
    date: new Date().toISOString().split('T')[0],
    age: '35',
  });

  const handlePrint = () => {
    window.print();
  };

  const navItems = [
    { id: 'prescriptions', label: 'Fórmula Médica', icon: <Pill size={20} /> },
    { id: 'labs', label: 'Laboratorios', icon: <TestTube size={20} /> },
    { id: 'imaging', label: 'Imágenes', icon: <ActivitySquare size={20} /> },
    { id: 'surgery', label: 'Rec. Quirúrgicas', icon: <ClipboardList size={20} /> },
    { id: 'nutrition', label: 'Nutrición', icon: <Utensils size={20} /> },
    { id: 'sickleave', label: 'Incapacidades', icon: <CalendarClock size={20} /> },
    { id: 'travel', label: 'Cert. Viaje', icon: <Plane size={20} /> },
    { id: 'referral', label: 'Remisiones', icon: <Send size={20} /> },
    { id: 'proposal', label: 'Presupuesto', icon: <Wallet size={20} /> },
    { id: 'sales-tools', label: 'Herramientas Vtas', icon: <FolderOpen size={20} /> },
    { id: 'settings', label: 'Configuración', icon: <SettingsIcon size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'prescriptions':
        return <Prescriptions patient={patient} />;
      case 'labs':
        return <LabRequests patient={patient} />;
      case 'imaging':
        return <Imaging patient={patient} />;
      case 'surgery':
        return <SurgeryRecommendations patient={patient} />;
      case 'nutrition':
        return <NutritionPhases patient={patient} />;
      case 'sickleave':
        return <SickLeave patient={patient} />;
      case 'travel':
        return <TravelCertificate patient={patient} />;
      case 'referral':
        return <Referral patient={patient} />;
      case 'proposal':
        return <EconomicProposal patient={patient} />;
      case 'sales-tools':
        return <SalesTools />;
      case 'settings':
        return <Settings />;
      default:
        return <Prescriptions patient={patient} />;
    }
  };

  const activeNavLabel = navItems.find((n) => n.id === activeTab)?.label;

  return (
    <div className="app-container">
      {/* PIN Lock Screen */}
      {locked && <PinLock onUnlock={() => { localStorage.setItem('suiteMedicaUnlockedAt', Date.now().toString()); window.location.reload(); }} />}

      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar - hidden when printing */}
      <aside className={`sidebar no-print ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', gap: '1rem' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Suite Médica Logo" style={{ maxWidth: '200px', maxHeight: '60px', objectFit: 'contain' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="brand-icon">
                <Stethoscope size={24} />
              </div>
              <span>Suite Médica 440</span>
            </div>
          )}
        </div>

        <nav className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Lock Button */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <button
            onClick={lock}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              width: '100%', padding: '0.75rem 1rem',
              borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.06)', color: '#ef4444',
              cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
          >
            <Lock size={16} /> Bloquear
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header no-print">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1>{activeNavLabel}</h1>
          </div>
          <div className="header-actions">
            <button className="action-btn" onClick={() => setShowShare(true)} style={{ background: 'linear-gradient(135deg,#25d366,#1da851)', color: 'white', border: 'none' }}>
              <Share2 size={18} />
              <span>Compartir</span>
            </button>
            <button className="action-btn" onClick={handlePrint}>
              <Printer size={18} />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </header>

        {/* Global Patient Information Input Form (Not printed directly, just for entering data) */}
        <div className="content-area">
          <div className="document-container">
            <div className="form-section no-print">
              <h2 className="form-label mb-2">Datos del Paciente</h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={patient.name}
                    onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 0.5 }}>
                  <label className="form-label">Documento</label>
                  <input
                    type="text"
                    className="form-input"
                    value={patient.id}
                    onChange={(e) => setPatient({ ...patient, id: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 0.3 }}>
                  <label className="form-label">Edad</label>
                  <input
                    type="text"
                    className="form-input"
                    value={patient.age}
                    onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 0.5 }}>
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-input"
                    value={patient.date}
                    onChange={(e) => setPatient({ ...patient, date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Current Selected Tool Interactive Config */}
            {renderContent()}
          </div>
        </div>
      </main>
      {showShare && activeTab !== 'settings' && (
        <SharePanel
          patient={patient}
          documentTitle={activeNavLabel || 'Documento Médico'}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* AI Assistant Chat */}
      <AIChat />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;
