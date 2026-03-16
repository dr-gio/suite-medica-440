import React from 'react';
import { useConfig } from '../context/ConfigContext';

interface PrintLayoutProps {
    title: string;
    patient: any;
    children: React.ReactNode;
    hideSeal?: boolean;
    hidePatientInfo?: boolean;
    hideFooter?: boolean;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ title, patient, children, hideSeal, hidePatientInfo, hideFooter }) => {
    const { logoUrl, signatureUrl, sealUrl, doctorName, rethus, address, contactPhone, websiteUrl } = useConfig();

    return (
        <div className="printable-document">
            <div className="print-header">
                <div className="clinic-info">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" crossOrigin="anonymous" style={{ maxWidth: '180px', maxHeight: '60px', objectFit: 'contain', marginBottom: '0.2rem' }} />
                    ) : (
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>440 CLINIC</h2>
                    )}
                    <p style={{ fontWeight: 600, color: '#1f2937', fontSize: '9pt', margin: '0.1rem 0' }}>{doctorName || 'Dr. Giovanni Fuentes'}</p>
                    <p style={{ fontSize: '8pt', margin: '0.05rem 0' }}>Cirujano Plástico Estético y Reconstructivo</p>
                    <p style={{ fontSize: '8pt', margin: '0.05rem 0' }}>RETHUS: {rethus || 'CMC2017-222322'}</p>
                    <p style={{ fontSize: '8pt', margin: '0.05rem 0' }}>{address || 'Cra 47 # 79-191, Barranquilla'}</p>
                    <p style={{ fontSize: '8pt', margin: '0.05rem 0' }}>Tel: +57 {contactPhone || '3181800130'} | {websiteUrl || 'www.drgio440.com'}</p>
                </div>
                <div className="doc-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                    <div className="doc-type" style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{title}</div>
                    <div style={{ fontSize: '9pt', color: '#4b5563' }}>{new Date(patient.date).toLocaleDateString()}</div>
                </div>
            </div>

            {!hidePatientInfo && (
                <div className="print-patient-info" style={{ marginBottom: '0.5rem' }}>
                    <div className="info-field">
                        <span className="info-label">Paciente</span>
                        <span className="info-value">{patient.name || '---'}</span>
                    </div>
                    <div className="info-field">
                        <span className="info-label">Identificación</span>
                        <span className="info-value">{patient.id || '---'}</span>
                    </div>
                    <div className="info-field">
                        <span className="info-label">Edad</span>
                        <span className="info-value">{patient.age || '---'}</span>
                    </div>
                    <div className="info-field">
                        <span className="info-label">Fecha</span>
                        <span className="info-value">{new Date(patient.date).toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            <div className="print-body" style={{ minHeight: '100px', marginBottom: '0.75rem' }}>
                {children}
            </div>

            {!hideFooter && (
                <div className="print-footer" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <div className="signature" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {signatureUrl ? (
                            <img src={signatureUrl} alt="Firma" crossOrigin="anonymous" style={{ maxWidth: '160px', maxHeight: '50px', objectFit: 'contain', zIndex: 1, position: 'relative', marginBottom: '-8px' }} />
                        ) : (
                            <div style={{ height: '40px' }} />
                        )}

                        <div className="signature-line" style={{ borderTop: '1px solid #1f2937', width: '220px', paddingTop: '0.3rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                            {sealUrl && !hideSeal && (
                                <img src={sealUrl} alt="Sello" crossOrigin="anonymous" style={{ position: 'absolute', right: '-110px', bottom: '-18px', width: '200px', objectFit: 'contain', opacity: 0.85, zIndex: 0 }} />
                            )}
                            <p style={{ fontWeight: 700, color: '#111827', fontSize: '9pt', margin: 0 }}>{doctorName || 'Dr. Giovanni Fuentes'}</p>
                            <p style={{ fontSize: '8pt', color: '#4b5563', margin: 0 }}>Cirujano Plástico Estético y Reconstructivo</p>
                            <p style={{ fontSize: '8pt', color: '#4b5563', margin: 0 }}>RETHUS: {rethus || 'CMC2017-222322'}</p>
                        </div>
                    </div>
                    <div className="qr-placeholder" style={{ width: '60px', height: '60px', fontSize: '8px' }}>
                        <div style={{ textAlign: 'center' }}>Validez<br />Digital<br />QR</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrintLayout;
