import type { FrequentDiagnosis, FrequentSurgery } from '../context/ConfigContext';

export const DEFAULT_CUPS: FrequentSurgery[] = [
    { id: 'cups_01', code: '86.83', name: 'Abdominoplastia / Dermolipectomía abdominal' },
    { id: 'cups_02', code: '85.54', name: 'Inserción bilateral de implante mamario' },
    { id: 'cups_03', code: '85.53', name: 'Inserción unilateral de implante mamario' },
    { id: 'cups_04', code: '08.44', name: 'Blefaroplastia superior' },
    { id: 'cups_05', code: '08.45', name: 'Blefaroplastia inferior' },
    { id: 'cups_06', code: '83.65', name: 'Inserción de prótesis de glúteo' },
    { id: 'cups_07', code: '86.67', name: 'Lipotransferencia glútea (BBL)' },
    { id: 'cups_08', code: '86.83', name: 'Liposucción / Lipoescultura' },
    { id: 'cups_09', code: '86.83', name: 'Cruroplastia / Dermolipectomía de muslo' },
    { id: 'cups_10', code: '86.83', name: 'Braquioplastia / Dermolipectomía de brazo' },
    { id: 'cups_11', code: '86.3',  name: 'Revisión de cicatriz local' },
    { id: 'cups_12', code: '86.71', name: 'Injerto cutáneo por cicatriz' },
    { id: 'cups_13', code: '21.87', name: 'Rinoplastia estética / funcional' },
    { id: 'cups_14', code: '86.82', name: 'Ritidectomía (Facelift / Lifting facial)' },
    { id: 'cups_15', code: '85.32', name: 'Mamoplastia de reducción unilateral' },
    { id: 'cups_16', code: '85.33', name: 'Mamoplastia de reducción bilateral' },
    { id: 'cups_17', code: '85.6',  name: 'Mastopexia' },
];

export const DEFAULT_DIAGNOSES: FrequentDiagnosis[] = [
    // Generales / Piel
    { id: 'cie_01', code: 'E65',    name: 'Adiposidad localizada / Lipodistrofia' },
    { id: 'cie_02', code: 'L57.4',  name: 'Estrías atróficas (striae distensae)' },
    { id: 'cie_03', code: 'L90.5',  name: 'Cicatriz y fibrosis cutánea' },
    { id: 'cie_04', code: 'L98.8',  name: 'Dermatitis intertriginosa / trastorno tejido subcutáneo' },
    { id: 'cie_05', code: 'Z41.1',  name: 'Procedimiento estético electivo (sin patología asociada)' },
    { id: 'cie_06', code: 'Z87.39', name: 'Antecedente de pérdida de peso masiva / post-bariátrico' },
    { id: 'cie_07', code: 'Z42.8',  name: 'Seguimiento de cirugía plástica reconstructiva' },
    // Abdomen / Cuerpo
    { id: 'cie_08', code: 'M62.08', name: 'Diástasis de músculos rectos abdominales' },
    { id: 'cie_09', code: 'E66.09', name: 'Obesidad por exceso de calorías / Lipodistrofia severa' },
    { id: 'cie_10', code: 'E88.2',  name: 'Lipomatosis' },
    { id: 'cie_11', code: 'Q82.0',  name: 'Linfedema hereditario / Lipedema crónico' },
    { id: 'cie_12', code: 'R26.8',  name: 'Dificultad de la marcha por exceso de piel' },
    // Mama
    { id: 'cie_13', code: 'N62',    name: 'Hipertrofia de la mama (gigantomastia / macromastia)' },
    { id: 'cie_14', code: 'N64.4',  name: 'Mastoptosis (ptosis mamaria)' },
    { id: 'cie_15', code: 'N64.82', name: 'Hipoplasia mamaria (micromastia)' },
    { id: 'cie_16', code: 'N64.89', name: 'Asimetría mamaria adquirida significativa' },
    { id: 'cie_17', code: 'Q83.0',  name: 'Ausencia congénita de mama y pezón (amastia)' },
    { id: 'cie_18', code: 'Q83.8',  name: 'Otras malformaciones congénitas de mama (mama tuberosa)' },
    { id: 'cie_19', code: 'Z85.3',  name: 'Historia personal de neoplasia maligna de mama' },
    { id: 'cie_20', code: 'T85.4',  name: 'Complicación mecánica de implante mamario' },
    { id: 'cie_21', code: 'M54.5',  name: 'Lumbalgia / dorsalgia por peso mamario' },
    { id: 'cie_22', code: 'L30.4',  name: 'Eritema intertrigo bajo surco mamario' },
    { id: 'cie_23', code: 'M79.3',  name: 'Paniculitis / inflamación tejido blando surco mamario' },
    // Párpados
    { id: 'cie_24', code: 'H02.30', name: 'Blefarocalasia no especificada' },
    { id: 'cie_25', code: 'H02.34', name: 'Blefarocalasia párpado superior derecho' },
    { id: 'cie_26', code: 'H02.35', name: 'Blefarocalasia párpado superior izquierdo' },
    { id: 'cie_27', code: 'H02.4',  name: 'Ptosis del párpado (blefaroptosis)' },
    { id: 'cie_28', code: 'H02.81', name: 'Dermatocalasia / laxitud palpebral' },
    { id: 'cie_29', code: 'H02.0',  name: 'Entropión y triquiasis del párpado' },
    { id: 'cie_30', code: 'H02.1',  name: 'Ectropión del párpado' },
    { id: 'cie_31', code: 'H02.54', name: 'Hernia de grasa palpebral (bolsas de grasa)' },
    // Glúteos / Musculoesquelético
    { id: 'cie_32', code: 'M62.89', name: 'Atrofia / hipotrofia muscular glútea o de brazo' },
    { id: 'cie_33', code: 'Q68.8',  name: 'Deformidades congénitas osteomusculares / asimetría glútea' },
    // Cicatrices
    { id: 'cie_34', code: 'L91.0',  name: 'Cicatriz queloide' },
    { id: 'cie_35', code: 'L90.1',  name: 'Liquen escleroso / cicatriz atrófica' },
    { id: 'cie_36', code: 'M72.2',  name: 'Fibromatosis / contractura cicatrizal con limitación funcional' },
    { id: 'cie_37', code: 'T79.3',  name: 'Infección postraumática de herida' },
    { id: 'cie_38', code: 'T95.0',  name: 'Secuelas de quemaduras con contractura o deformidad' },
    // Nariz
    { id: 'cie_39', code: 'J34.2',  name: 'Desviación del tabique nasal' },
    { id: 'cie_40', code: 'J30.0',  name: 'Rinitis alérgica / vasomotora' },
    { id: 'cie_41', code: 'Q30.0',  name: 'Atresia de coanas' },
    { id: 'cie_42', code: 'Q30.8',  name: 'Otras malformaciones congénitas de la nariz' },
    { id: 'cie_43', code: 'M95.0',  name: 'Deformidad adquirida de nariz (post-traumática)' },
    // Facial / Envejecimiento
    { id: 'cie_44', code: 'L57.8',  name: 'Cambios dérmicos por radiación UV / elastosis solar' },
    { id: 'cie_45', code: 'R23.8',  name: 'Flacidez facial / ptosis de tejidos blandos' },
    { id: 'cie_46', code: 'L90.3',  name: 'Atrofodermia / atrofia cutánea severa' },
];
