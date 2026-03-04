import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getAsset, saveAssetsBatch } from '../lib/db';

// Interfaces for our catalogs
export interface Medication { id: string; name: string; dosage: string; frequency: string; duration: string; indications: string; }
export interface Lab { id: string; name: string; indications: string; }
export interface ImagingStudy { id: string; name: string; reason: string; format: string; }
export interface SurgeryTemplate { id: string; name: string; preText: string; postText: string; }
export interface NutritionPhase { id: string; name: string; desc: string; }
export interface KnowledgeItem { id: string; title: string; content: string; category: string; lastUpdated: string; }
export interface ConsentTemplate { id: string; name: string; content: string; }

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
    consentTemplates: ConsentTemplate[];
    knowledgeBase: KnowledgeItem[];
    proposalIntro?: string;
    proposalPolicies?: string;
    updateCatalog: <T extends 'medications' | 'labs' | 'imaging' | 'surgeries' | 'nutrition' | 'knowledgeBase' | 'logoUrl' | 'signatureUrl' | 'sealUrl' | 'gmailClientId' | 'doctorName' | 'rethus' | 'address' | 'contactPhone' | 'websiteUrl' | 'proposalIntro' | 'proposalPolicies' | 'consentTemplates'>(catalog: T, items: any) => void;
    updateImagesBatch: (updates: { logo?: string; signature?: string; seal?: string }) => void;
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

const defaultConsents: ConsentTemplate[] = [
    {
        id: '1', name: 'Lipoescultura / Liposucción',
        content: 'Por medio del presente documento, yo declaro que he sido informado de manera clara y detallada sobre el procedimiento de Lipoescultura. Entiendo que el objetivo es la remodelación del contorno corporal mediante la extracción de depósitos grasos localizados. Se me ha explicado la técnica a utilizar, el tipo de anestesia y el tiempo estimado de recuperación.\n\nRIESGOS Y COMPLICACIONES:\nLos riesgos discutidos incluyen, pero no se limitan a: irregularidades en el contorno, asimetrías, cambios en la sensibilidad cutánea, hematomas, seromas, infección, tromboembolismo pulmonar y riesgos asociados a la anestesia.'
    },
    {
        id: '2', name: 'Mamoplastia de Aumento',
        content: 'Entiendo que el procedimiento consiste en la colocación de implantes mamarios para mejorar el volumen y la forma de los senos. He discutido con el Dr. Gio el tipo de implante, el tamaño, la ubicación (detrás o delante del músculo) y el tipo de incisión a realizar.\n\nRIESGOS Y COMPLICACIONES:\nEntiendo los riesgos específicos como: contractura capsular, rotura del implante, interferencia con la lactancia o mamografía, asimetría, cicatrización hipertrófica y necesidad de cirugías futuras de revisión.'
    }
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
    const [consentTemplates, setConsentTemplates] = useState<ConsentTemplate[]>(defaultConsents);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
    const [proposalIntro, setProposalIntro] = useState<string | undefined>('Estimada(o) {{paciente}}, es un placer para nosotros en 440 Clinic by Dr. Gio presentarte este presupuesto, diseñado exclusivamente para ti. Agradecemos la confianza que depositas en nuestro equipo para acompañarte en este importante camino hacia la perfecta armonía que deseas.');
    const [proposalPolicies, setProposalPolicies] = useState<string | undefined>('• El descuento por pronto pago se hace efectivo al realizar el abono inicial del 30% sobre el valor total de la cirugía. Este abono debe realizarse dentro de los 15 días posteriores a la fecha de emisión de esta cotización.\n• Dicho abono del 30% garantiza la reserva de su cupo y fecha quirúrgica, y a su vez congela el precio de los procedimientos cotizados por un período de seis (6) meses.');
    const [loaded, setLoaded] = useState(false);

    const loadConfig = async () => {
        let localLogo, localSig, localSeal;

        // 1. ALWAYS load images from IndexedDB first (our robust source of truth)
        try {
            const [dbLogo, dbSig, dbSeal] = await Promise.all([
                getAsset('logoUrl'),
                getAsset('signatureUrl'),
                getAsset('sealUrl')
            ]);

            if (dbLogo) { setLogoUrl(dbLogo); localLogo = dbLogo; }
            if (dbSig) { setSignatureUrl(dbSig); localSig = dbSig; }
            if (dbSeal) { setSealUrl(dbSeal); localSeal = dbSeal; }
        } catch (e) {
            console.error('Failed to load images from IndexedDB', e);
            // Fallback to legacy localStorage if available
            const storedImages = localStorage.getItem('suiteMedicaImages');
            if (storedImages) {
                try {
                    const parsedImages = JSON.parse(storedImages);
                    if (parsedImages.logoUrl) { setLogoUrl(parsedImages.logoUrl); localLogo = parsedImages.logoUrl; }
                    if (parsedImages.signatureUrl) { setSignatureUrl(parsedImages.signatureUrl); localSig = parsedImages.signatureUrl; }
                    if (parsedImages.sealUrl) { setSealUrl(parsedImages.sealUrl); localSeal = parsedImages.sealUrl; }
                } catch (e) { }
            }
        }

        try {
            const { data, error } = await supabase
                .from('suite_config')
                .select('*')
                .eq('id', 'main')
                .single();
            if (!error && data) {
                // Only use Supabase values if NOT present in LocalStorage (local variables avoid closure bugs)
                if (data.logo_url && !localLogo) setLogoUrl(data.logo_url);
                if (data.signature_url && !localSig) setSignatureUrl(data.signature_url);
                if (data.seal_url && !localSeal) setSealUrl(data.seal_url);

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
                if (data.consent_templates?.length) {
                    setConsentTemplates(data.consent_templates.map((t: any) => ({
                        id: t.id || Math.random().toString(),
                        name: t.name || '',
                        content: t.content + (t.risks ? `\n\nRIESGOS Y COMPLICACIONES:\n${t.risks}` : '')
                    })));
                }
                if (data.knowledge_base?.length) setKnowledgeBase(data.knowledge_base.map((k: any) => ({
                    id: k.id,
                    title: k.title,
                    content: k.content,
                    category: k.category,
                    lastUpdated: k.lastUpdated || k.updated_at || new Date().toISOString()
                })));
                if (data.proposal_intro) setProposalIntro(data.proposal_intro);
                if (data.proposal_policies) setProposalPolicies(data.proposal_policies);
                setLoaded(true);
                return;
            }
        } catch (_) { }

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
                if (parsed.consentTemplates) {
                    setConsentTemplates(parsed.consentTemplates.map((t: any) => ({
                        id: t.id || Math.random().toString(),
                        name: t.name || '',
                        content: t.content + (t.risks ? `\n\nRIESGOS Y COMPLICACIONES:\n${t.risks}` : '')
                    })));
                }
                if (parsed.proposalIntro) setProposalIntro(parsed.proposalIntro);
                if (parsed.proposalPolicies) setProposalPolicies(parsed.proposalPolicies);
            } catch (e) { console.error('Failed to load configs', e); }
        }
        setLoaded(true);
    };

    useEffect(() => {
        loadConfig();
    }, []);

    // Save images to IndexedDB (base64 too large for Supabase columns)
    const saveImagesToLocal = async (updates: { logoUrl?: string | undefined; signatureUrl?: string | undefined; sealUrl?: string | undefined }) => {
        try {
            const dbUpdates: Record<string, string | undefined> = {};
            if (updates.logoUrl !== undefined) dbUpdates.logoUrl = updates.logoUrl;
            if (updates.signatureUrl !== undefined) dbUpdates.signatureUrl = updates.signatureUrl;
            if (updates.sealUrl !== undefined) dbUpdates.sealUrl = updates.sealUrl;

            await saveAssetsBatch(dbUpdates);
        } catch (e) { console.error('Failed to save images to IndexedDB', e); }
    };

    const saveToSupabase = async (updates: Partial<{
        gmail_client_id: string | undefined;
        doctor_name: string | undefined; rethus: string | undefined;
        address: string | undefined; contact_phone: string | undefined;
        website_url: string | undefined;
        medications: Medication[]; labs: Lab[]; imaging: ImagingStudy[];
        surgeries: SurgeryTemplate[]; nutrition: NutritionPhase[];
        consent_templates: ConsentTemplate[];
        knowledge_base: KnowledgeItem[];
        proposal_intro: string | undefined; proposal_policies: string | undefined;
    }>) => {
        await supabase.from('suite_config').upsert({
            id: 'main',
            gmail_client_id: gmailClientId,
            doctor_name: doctorName, rethus, address, contact_phone: contactPhone,
            website_url: websiteUrl,
            medications, labs, imaging, surgeries, nutrition,
            consent_templates: consentTemplates,
            knowledge_base: knowledgeBase,
            proposal_intro: proposalIntro, proposal_policies: proposalPolicies,
            ...updates,
            updated_at: new Date().toISOString(),
        });
    };

    const updateCatalog = (catalog: string, items: any) => {
        if (catalog === 'logoUrl') { setLogoUrl(items); saveImagesToLocal({ logoUrl: items }); }
        else if (catalog === 'signatureUrl') { setSignatureUrl(items); saveImagesToLocal({ signatureUrl: items }); }
        else if (catalog === 'sealUrl') { setSealUrl(items); saveImagesToLocal({ sealUrl: items }); }
        else if (catalog === 'gmailClientId') { setGmailClientId(items); saveToSupabase({ gmail_client_id: items }); }
        else if (catalog === 'doctorName') { setDoctorName(items); saveToSupabase({ doctor_name: items }); }
        else if (catalog === 'rethus') { setRethus(items); saveToSupabase({ rethus: items }); }
        else if (catalog === 'address') { setAddress(items); saveToSupabase({ address: items }); }
        else if (catalog === 'contactPhone') { setContactPhone(items); saveToSupabase({ contact_phone: items }); }
        else if (catalog === 'websiteUrl') { setWebsiteUrl(items); saveToSupabase({ website_url: items }); }
        else if (catalog === 'medications') { setMedications(items); saveToSupabase({ medications: items }); }
        else if (catalog === 'labs') { setLabs(items); saveToSupabase({ labs: items }); }
        else if (catalog === 'imaging') { setImaging(items); saveToSupabase({ imaging: items }); }
        else if (catalog === 'surgeries') { setSurgeries(items); saveToSupabase({ surgeries: items }); }
        else if (catalog === 'nutrition') { setNutrition(items); saveToSupabase({ nutrition: items }); }
        else if (catalog === 'consentTemplates') { setConsentTemplates(items); saveToSupabase({ consent_templates: items }); }
        else if (catalog === 'knowledgeBase') {
            setKnowledgeBase(items);
            // Sync with knowledge_base table in Supabase is handled separately or via another mechanism for vectors
            // But for persistence of the raw objects:
            saveToSupabase({ knowledge_base: items });
        }
        else if (catalog === 'proposalIntro') { setProposalIntro(items); saveToSupabase({ proposal_intro: items }); }
        else if (catalog === 'proposalPolicies') { setProposalPolicies(items); saveToSupabase({ proposal_policies: items }); }
    };

    // Bulk update for settings page optimization
    const updateImagesBatch = (updates: { logo?: string; signature?: string; seal?: string }) => {
        const lsUpdates: any = {};
        if (updates.logo !== undefined) { setLogoUrl(updates.logo); lsUpdates.logoUrl = updates.logo; }
        if (updates.signature !== undefined) { setSignatureUrl(updates.signature); lsUpdates.signatureUrl = updates.signature; }
        if (updates.seal !== undefined) { setSealUrl(updates.seal); lsUpdates.sealUrl = updates.seal; }
        saveImagesToLocal(lsUpdates);
    };

    if (!loaded) return null;

    return (
        <ConfigContext.Provider value={{
            logoUrl, signatureUrl, sealUrl, gmailClientId,
            doctorName, rethus, address, contactPhone, websiteUrl,
            medications, labs, imaging, surgeries, nutrition, consentTemplates, knowledgeBase,
            proposalIntro, proposalPolicies, updateCatalog, updateImagesBatch
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
