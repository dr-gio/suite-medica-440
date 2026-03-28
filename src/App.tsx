import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Stethoscope, ActivitySquare, Pill, ClipboardList, Utensils, Printer, Settings as SettingsIcon, TestTube, Plane, CalendarClock, Send, Lock, Share2, Menu, X, Wallet, FolderOpen, FileText, Image as ImageIcon, MapPin } from 'lucide-react';
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
import InformedConsent from './components/InformedConsent';
import SurgeryResults from './components/SurgeryResults';
import SurgicalDescription from './components/SurgicalDescription';
import MedicalTourism from './components/MedicalTourism';

import { useConfig } from './context/ConfigContext';

import ConsentSigningPage from './components/ConsentSigningPage';

function Dashboard() {
  const { logoUrl } = useConfig();
  const { locked, lock } = useAutoLock();
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [showShare, setShowShare] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDrGio = localStorage.getItem('isDrGio') === 'true';

  const [patient, setPatient] = useState({
    name: 'Juan Pérez',
    id: 'CC 1234567890',
    email: 'paciente@ejemplo.com',
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
    { id: 'nutrition', label: 'Plan Nutrición', icon: <Utensils size={20} /> },
    { id: 'consent', label: 'Consentimientos', icon: <FileText size={20} /> },
    { id: 'sickleave', label: 'Incapacidad', icon: <CalendarClock size={20} />, restricted: true },
    { id: 'travel', label: 'Cert. Viaje', icon: <Plane size={20} /> },
    { id: 'referral', label: 'Remisiones', icon: <Send size={20} />, restricted: true },
    { id: 'surgical-description', label: 'Descrip. Quir.', icon: <ActivitySquare size={20} />, restricted: true },
    { id: 'proposal', label: 'Presupuesto', icon: <Wallet size={20} /> },
    { id: 'medical-tourism', label: 'Turismo Médico', icon: <MapPin size={20} /> },
    { id: 'surgery-results', label: '📸 Resultados', icon: <ImageIcon size={20} /> },
    { id: 'sales-tools', label: 'Herramientas Vtas', icon: <FolderOpen size={20} /> },
    { id: 'settings', label: 'Configuración', icon: <SettingsIcon size={20} /> },
  ].filter(item => !item.restricted || isDrGio);

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
      case 'consent':
        return <InformedConsent patient={patient} />;
      case 'sickleave':
        return isDrGio ? <SickLeave patient={patient} /> : <Navigate to="/" replace />;
      case 'travel':
        return <TravelCertificate patient={patient} />;
      case 'referral':
        return isDrGio ? <Referral patient={patient} /> : <Navigate to="/" replace />;
      case 'surgical-description':
        return isDrGio ? <SurgicalDescription patient={patient} /> : <Navigate to="/" replace />;
      case 'proposal':
        return <EconomicProposal patient={patient} />;
      case 'medical-tourism':
        return <MedicalTourism patient={patient} />;
      case 'surgery-results':
        return <SurgeryResults />;
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
      {locked && <PinLock onUnlock={() => { localStorage.setItem('suiteMedicaUnlockedAt', Date.now().toString()); window.location.reload(); }} />}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`sidebar no-print ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', gap: '1rem' }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" style={{ maxWidth: '200px', maxHeight: '60px', objectFit: 'contain' }} /> : <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><div className="brand-icon"><Stethoscope size={24} /></div><span>Suite Médica 440</span></div>}
        </div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <button onClick={lock} className="lock-btn">
            <Lock size={16} /> Bloquear
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header no-print">
          <div style={{ display: 'flex', alignItems: 'center' }}><button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X size={24} /> : <Menu size={24} />}</button><h1>{activeNavLabel}</h1></div>
          <div className="header-actions">
            <button className="action-btn share-btn" onClick={() => setShowShare(true)}><Share2 size={18} /><span>Compartir</span></button>
            <button className="action-btn" onClick={handlePrint}><Printer size={18} /><span>Imprimir / PDF</span></button>
          </div>
        </header>
        <div className="content-area">
          <div className="document-container">
            <div className="form-section no-print">
              <h2 className="form-label mb-2">Datos del Paciente</h2>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Nombre Completo</label><input className="form-input" value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} /></div>
                <div className="form-group" style={{ flex: 0.5 }}><label className="form-label">Documento / ID</label><input className="form-input" placeholder="Requerido" value={patient.id} onChange={(e) => setPatient({ ...patient, id: e.target.value })} /></div>
                <div className="form-group" style={{ flex: 0.8 }}><label className="form-label">Email</label><input type="email" className="form-input" placeholder="Requerido para envío" value={patient.email} onChange={(e) => setPatient({ ...patient, email: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 0.3 }}><label className="form-label">Edad</label><input className="form-input" value={patient.age} onChange={(e) => setPatient({ ...patient, age: e.target.value })} /></div>
                <div className="form-group" style={{ flex: 0.5 }}><label className="form-label">Fecha</label><input type="date" className="form-input" value={patient.date} onChange={(e) => setPatient({ ...patient, date: e.target.value })} /></div>
              </div>
            </div>
            {renderContent()}
          </div>
        </div>
      </main>
      {showShare && activeTab !== 'settings' && <SharePanel patient={patient} documentTitle={activeNavLabel || 'Documento Médico'} onClose={() => setShowShare(false)} />}
      <AIChat />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/sign/consent/:token" element={<ConsentSigningPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
