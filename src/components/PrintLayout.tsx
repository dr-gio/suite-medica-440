import React from 'react';
import { useConfig } from '../context/ConfigContext';

interface PrintLayoutProps {
    title: string;
    patient: any;
    children: React.ReactNode;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ title, patient, children }) => {
    const { logoUrl, signatureUrl, sealUrl, doctorName, rethus, address, contactPhone, websiteUrl } = useConfig();

    return (
        <div className="printable-document print-only">
            <div className="print-header">
                <div className="clinic-info">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" style={{ maxWidth: '250px', maxHeight: '100px', objectFit: 'contain', marginBottom: '0.5rem' }} />
                    ) : (
                        <h2>440 CLINIC</h2>
                    )}
                    <p style={{ fontWeight: 600, color: '#1f2937' }}>{doctorName || 'Dr. Giovanni Fuentes'}</p>
                    <p>Cirujano Plástico Estético y Reconstructivo</p>
                    <p>RETHUS: {rethus || 'CMC2017-222322'}</p>
                    <p>{address || 'Cra 47 # 79-191, Barranquilla'}</p>
                    <p>Tel: +57 {contactPhone || '318 180 0130'}</p>
                    <p>{websiteUrl || 'www.drgiovannifuentes.com'}</p>
                </div>
                <div className="doc-info">
                    <div className="doc-type">{title}</div>
                    <div>{new Date(patient.date).toLocaleDateString()}</div>
                </div>
            </div>

            <div className="print-patient-info">
                <div className="info-field">
                    <span className="info-label">Paciente</span>
                    <span className="info-value">{patient.name || '---'}</span>
                </div>
                <div className="info-field">
                    <span className="info-label">Identificación</span>
                    <span className="info-value">{patient.id || '---'}</span>
                </div>
                <div className="info-field" style={{ gridColumn: 'span 2' }}>
                    <span className="info-label">Edad</span>
                    <span className="info-value">{patient.age || '---'}</span>
                </div>
            </div>

            <div className="print-body">
                {children}
            </div>

            <div className="print-footer">
                <div className="signature" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {signatureUrl ? (
                        <img src={signatureUrl} alt="Firma" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', zIndex: 1, position: 'relative' }} />
                    ) : (
                        <div style={{ height: '80px' }} />
                    )}

                    <div className="signature-line" style={{ borderTop: '1px solid #1f2937', width: '250px', paddingTop: '0.5rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        {sealUrl && (
                            <img src={sealUrl} alt="Sello" style={{ position: 'absolute', right: '-80px', bottom: '0px', width: '120px', objectFit: 'contain', opacity: 0.85, zIndex: 0 }} />
                        )}
                        <p style={{ fontWeight: 600, color: '#1f2937', position: 'relative', zIndex: 3 }}>{doctorName || 'Dr. Giovanni Fuentes'}</p>
                        <p style={{ fontSize: '10pt', color: '#666', position: 'relative', zIndex: 3 }}>Cirujano Plástico Estético y Reconstructivo</p>
                        <p style={{ fontSize: '10pt', color: '#666', position: 'relative', zIndex: 3 }}>RETHUS: {rethus || 'CMC2017-222322'}</p>
                    </div>
                </div>
                <div className="qr-placeholder">
                    <div>Validez Legal<br />QR</div>
                </div>
            </div>
        </div>
    );
};

export default PrintLayout;
