import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Interfaces for our catalogs
export interface Medication { id: string; name: string; dosage: string; frequency: string; duration: string; indications: string; }
export interface Lab { id: string; name: string; indications: string; }
export interface ImagingStudy { id: string; name: string; reason: string; format: string; }
export interface SurgeryTemplate { id: string; name: string; preText: string; postText: string; }
export interface NutritionPhase { id: string; name: string; desc: string; }

interface ConfigContextData {
    logoUrl?: string;
    signatureUrl?: string;
    sealUrl?: string;
    gmailClientId?: string;
    doctorName?: string;
    rethus?: string;
    address?: string;
    contactPhone?: string;
    websiteUrl?: string;
    medications: Medication[];
    labs: Lab[];
    imaging: ImagingStudy[];
    surgeries: SurgeryTemplate[];
    nutrition: NutritionPhase[];
    updateCatalog: <T extends 'medications' | 'labs' | 'imaging' | 'surgeries' | 'nutrition' | 'logoUrl' | 'signatureUrl' | 'sealUrl' | 'gmailClientId' | 'doctorName' | 'rethus' | 'address' | 'contactPhone' | 'websiteUrl'>(catalog: T, items: any) => void;
}

const defaultMedications: Medication[] = [
    { id: '1', name: 'Amoxicilina', dosage: '500mg', frequency: 'Cada 8 horas', duration: 'Por 7 días', indications: 'Tomar con comidas' },
    { id: '2', name: 'Ibuprofeno', dosage: '400mg', frequency: 'Cada 8 horas', duration: 'Por 3 días', indications: 'Tomar si presenta dolor' },
    { id: '3', name: 'Acetaminofén', dosage: '500mg', frequency: 'Cada 6 horas', duration: 'Por 5 días', indications: 'Manejo de dolor leve a moderado' },
];

const defaultLabs: Lab[] = [
    { id: '1', name: 'Hemograma Completo', indications: 'Ayuno de 8 horas' },
    { id: '2', name: 'Glicemia Basal', indications: 'Ayuno estricto' },
    { id: '3', name: 'Perfil Lipídico', indications: 'Ayuno de 12 horas' },
];

const defaultImaging: ImagingStudy[] = [
    { id: '1', name: 'Ecografía Abdominal Total', reason: 'Control', format: 'Digital o Impreso' },
    { id: '2', name: 'Radiografía de Tórax PA y Lateral', reason: 'Pre-quirúrgico', format: 'Placas Impresas' },
];

const defaultSurgeries: SurgeryTemplate[] = [
    {
        id: '1', name: 'Lipoescultura',
        preText: '1. Ayuno estricto de 8 horas (incluyendo agua).\n2. Suspender aspirina u omega 3 quince días antes.\n3. Venir acompañado por un adulto responsable.\n4. Traer exámenes y faja el día del procedimiento.',
        postText: '1. Reposo relativo por 48 horas.\n2. Usar la faja de compresión día y noche.\n3. Asistir a masajes postoperatorios al segundo día.\n4. Dieta blanda los primeros dos días.\n5. Evitar exposición solar.',
    },
    {
        id: '2', name: 'Rinoplastia',
        preText: '1. Ayuno de 8 horas.\n2. No usar maquillaje el día de la cirugía.\n3. Lavado del rostro la noche anterior con jabón antibacterial.\n4. Ropa cómoda abotonada al frente.',
        postText: '1. Dormir semi-sentado (cabeza elevada) con dos almohadas.\n2. No sonarse la nariz, limpiar suavemente si es necesario.\n3. Aplicar hielo local envuelto en tela las primeras 48h.\n4. Dieta líquida a blanda.',
    }
];

const defaultNutrition: NutritionPhase[] = [
    { id: '1', name: 'Fase 1: Dieta Líquida Clara (Días 1 a 3)', desc: 'Bebidas no carbonatadas, caldos claros, té sin cafeína, gelatina sin azúcar, agua. Tomar en sorbos pequeños y constantes para mantener la hidratación.' },
    { id: '2', name: 'Fase 2: Dieta Líquida Completa y Suplementos (Días 4 a 14)', desc: 'Lácteos descremados sin lactosa, sopas cremosas coladas (sin grumos), batidos o suplementos proteicos. Mantener la comida líquida para evitar esfuerzo gástrico.' },
    { id: '3', name: 'Fase 3: Dieta en Puré / Pastosa (Semanas 3 y 4)', desc: 'Alimentos licuados o aplastados. Puré de papas, zanahorias, pollo muy cocido y desmenuzado, pescados blancos, huevos revueltos suaves.' }
];

const ConfigContext = createContext<ConfigContextData | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
    const [signatureUrl, setSignatureUrl] = useState<string | undefined>(undefined);
    const [sealUrl, setSealUrl] = useState<string | undefined>(undefined);
    const [gmailClientId, setGmailClientId] = useState<string | undefined>(undefined);
    const [doctorName, setDoctorName] = useState<string | undefined>('Dr. Giovanni Fuentes');
    const [rethus, setRethus] = useState<string | undefined>('CMC2017-222322');
    const [address, setAddress] = useState<string | undefined>('Cra 47 # 79-191, Barranquilla');
    const [contactPhone, setContactPhone] = useState<string | undefined>('3181800130');
    const [websiteUrl, setWebsiteUrl] = useState<string | undefined>('www.drgiovannifuentes.com');
    const [medications, setMedications] = useState<Medication[]>(defaultMedications);
    const [labs, setLabs] = useState<Lab[]>(defaultLabs);
    const [imaging, setImaging] = useState<ImagingStudy[]>(defaultImaging);
    const [surgeries, setSurgeries] = useState<SurgeryTemplate[]>(defaultSurgeries);
    const [nutrition, setNutrition] = useState<NutritionPhase[]>(defaultNutrition);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        // Try Supabase first
        try {
            const { data, error } = await supabase
                .from('suite_config')
                .select('*')
                .eq('id', 'main')
                .single();
            if (!error && data) {
                if (data.logo_url) setLogoUrl(data.logo_url);
                if (data.signature_url) setSignatureUrl(data.signature_url);
                if (data.seal_url) setSealUrl(data.seal_url);
                if (data.gmail_client_id) setGmailClientId(data.gmail_client_id);
                if (data.doctor_name) setDoctorName(data.doctor_name);
                if (data.rethus) setRethus(data.rethus);
                if (data.address) setAddress(data.address);
                if (data.contact_phone) setContactPhone(data.contact_phone);
                if (data.website_url) setWebsiteUrl(data.website_url);
                if (data.medications?.length) setMedications(data.medications);
                if (data.labs?.length) setLabs(data.labs);
                if (data.imaging?.length) setImaging(data.imaging);
                if (data.surgeries?.length) setSurgeries(data.surgeries);
                if (data.nutrition?.length) setNutrition(data.nutrition);
                setLoaded(true);
                return;
            }
        } catch (_) { /* fall through to localStorage */ }

        // Fallback: localStorage
        const stored = localStorage.getItem('suiteMedicaConfig');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
                if (parsed.signatureUrl) setSignatureUrl(parsed.signatureUrl);
                if (parsed.sealUrl) setSealUrl(parsed.sealUrl);
                if (parsed.gmailClientId) setGmailClientId(parsed.gmailClientId);
                if (parsed.doctorName) setDoctorName(parsed.doctorName);
                if (parsed.rethus) setRethus(parsed.rethus);
                if (parsed.address) setAddress(parsed.address);
                if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
                if (parsed.websiteUrl) setWebsiteUrl(parsed.websiteUrl);
                if (parsed.medications) setMedications(parsed.medications);
                if (parsed.labs) setLabs(parsed.labs);
                if (parsed.imaging) setImaging(parsed.imaging);
                if (parsed.surgeries) setSurgeries(parsed.surgeries);
                if (parsed.nutrition) setNutrition(parsed.nutrition);
            } catch (e) { console.error('Failed to load configs', e); }
        }
        setLoaded(true);
    };

    const saveToSupabase = async (updates: Partial<{
        logo_url: string | undefined; signature_url: string | undefined;
        seal_url: string | undefined; gmail_client_id: string | undefined;
        doctor_name: string | undefined; rethus: string | undefined;
        address: string | undefined; contact_phone: string | undefined;
        website_url: string | undefined;
        medications: Medication[]; labs: Lab[]; imaging: ImagingStudy[];
        surgeries: SurgeryTemplate[]; nutrition: NutritionPhase[];
    }>) => {
        await supabase.from('suite_config').upsert({
            id: 'main',
            logo_url: logoUrl, signature_url: signatureUrl, seal_url: sealUrl,
            gmail_client_id: gmailClientId,
            doctor_name: doctorName, rethus, address, contact_phone: contactPhone,
            website_url: websiteUrl,
            medications, labs, imaging, surgeries, nutrition,
            ...updates,
            updated_at: new Date().toISOString(),
        });
    };

    const updateCatalog = (catalog: string, items: any) => {
        if (catalog === 'logoUrl') { setLogoUrl(items); saveToSupabase({ logo_url: items }); }
        if (catalog === 'signatureUrl') { setSignatureUrl(items); saveToSupabase({ signature_url: items }); }
        if (catalog === 'sealUrl') { setSealUrl(items); saveToSupabase({ seal_url: items }); }
        if (catalog === 'gmailClientId') { setGmailClientId(items); saveToSupabase({ gmail_client_id: items }); }
        if (catalog === 'doctorName') { setDoctorName(items); saveToSupabase({ doctor_name: items }); }
        if (catalog === 'rethus') { setRethus(items); saveToSupabase({ rethus: items }); }
        if (catalog === 'address') { setAddress(items); saveToSupabase({ address: items }); }
        if (catalog === 'contactPhone') { setContactPhone(items); saveToSupabase({ contact_phone: items }); }
        if (catalog === 'websiteUrl') { setWebsiteUrl(items); saveToSupabase({ website_url: items }); }
        if (catalog === 'medications') { setMedications(items); saveToSupabase({ medications: items }); }
        if (catalog === 'labs') { setLabs(items); saveToSupabase({ labs: items }); }
        if (catalog === 'imaging') { setImaging(items); saveToSupabase({ imaging: items }); }
        if (catalog === 'surgeries') { setSurgeries(items); saveToSupabase({ surgeries: items }); }
        if (catalog === 'nutrition') { setNutrition(items); saveToSupabase({ nutrition: items }); }
    };

    if (!loaded) return null;

    return (
        <ConfigContext.Provider value={{
            logoUrl, signatureUrl, sealUrl, gmailClientId,
            doctorName, rethus, address, contactPhone, websiteUrl,
            medications, labs, imaging, surgeries, nutrition, updateCatalog
        }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) throw new Error('useConfig must be used within ConfigProvider');
    return context;
};
