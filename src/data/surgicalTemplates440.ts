import type { SurgicalDescTemplate } from '../context/ConfigContext';

export const DEFAULT_SURGICAL_TEMPLATES: SurgicalDescTemplate[] = [
    {
        id: "tpl_01",
        name: "Abdominoplastia",
        technicalDescription: `Paciente en decúbito supino con caderas ligeramente flexionadas. Asepsia y antisepsia de región abdominal. Marcación preoperatoria previa en bipedestación.

Se realizó incisión suprapúbica siguiendo la marcación previa en forma de [elipse / arco low cut / fleur de lis], desde espina ilíaca anterosuperior derecha a izquierda, a [5-7] cm del borde superior del pubis, hasta el plano de la fascia de los músculos rectos.

Se levantó colgajo dermograso en plano suprafascial ascendiendo hasta el reborde costal, liberando ligamentos de Camper y Colles con electrocauterio bipolar. Se identificaron y preservaron los vasos perforantes paraumbilicales bilaterales.

Se realizó [plicatura / rafia] de la línea alba y músculos rectos del abdomen desde xifoides hasta pubis con [Prolene 0 / PDS 0] en puntos de [Smead-Jones / puntos simples], corrigiendo diástasis de [___] cm.

Se realizó [neoumbilicoplastia / transposición umbilical] a través de incisión en [U invertida / estrella] en la nueva posición calculada, suturando ombligo a fascia con Vicryl 3-0 y a piel con [Nylon 4-0 / Monocryl intradérmico].

Se resecó colgajo dermograso excedente. Peso del espécimen: [___] g. [Enviado a patología / No enviado a patología].

Hemostasia con electrocauterio bipolar. Irrigación con solución salina 0.9%. Se dejaron [2] drenajes aspirativos Blake exteriorizados a través de contraincisiones en flancos.

Cierre por planos: tejido celular subcutáneo con Vicryl 2-0, subdérmico con Monocryl 3-0 puntos enterrados, dérmico con Monocryl 4-0 intradérmico continuo. Apósito y faja compresiva abdominal.`,
    },
    {
        id: "tpl_02",
        name: "Liposucción / Lipoescultura",
        technicalDescription: `Paciente en [decúbito supino / decúbito prono] según las zonas a tratar. Asepsia y antisepsia amplia. Marcación preoperatoria previa en bipedestación delimitando zonas de mayor acúmulo y zonas de seguridad.

Infiltración tumescente: [1000 mL SSN 0.9% + Lidocaína 500 mg + Epinefrina 1 mg + Bicarbonato 10 mL]. Se infiltraron [___] mL en [abdomen / flancos / muslos / brazos / zona donante], con cánula de infiltración de [3-4] mm. Tiempo de espera de [15-20] minutos para efecto vasoconstrictor máximo.

Se realizaron mini-incisiones de [3-5] mm en [surco umbilical / suprapúbico / flancos / triángulo lumbar]. Se utilizó cánula de [3 / 3.5 / 4] mm conectada a [equipo de liposucción por jeringa / máquina de vacío / VASER / PAL].

Liposucción en plano [profundo y superficial] con movimientos en abanico. Volumen total aspirado: [___] mL de grasa pura distribuidos en: abdomen [___] mL, flancos [___] mL, [zona adicional] [___] mL.

Verificación del resultado por palpación digital y pellizco intraoperatorio. Simetría comprobada. Hemostasia pasiva por compresión.

[LIPOTRANSFERENCIA — si aplica:] La grasa aspirada fue procesada por [decantación × 3 min / centrifugación 3000 rpm × 3 min]. Se obtuvieron [___] mL de grasa purificada. Se inyectaron [___] mL en [glúteo derecho / izquierdo / zona receptora] en plano [subcutáneo profundo / intramuscular superficial] con microcánulas de [2-3] mm en microtrazos retrógrados de menos de 2 mL por pase.

Cierre de incisiones con [Nylon 4-0 / Monocryl 4-0 / cierre diferido 48h]. Faja compresiva.`,
    },
    {
        id: "tpl_03",
        name: "Mamoplastia de aumento",
        technicalDescription: `Paciente en decúbito supino con brazos en abducción a 90°. Asepsia y antisepsia. Marcación preoperatoria previa en bipedestación: surco inframamario, meridiano mamario y límites del bolsillo.

Infiltración de [surco inframamario / areola / axila] con solución de Klein (lidocaína 0.5% + epinefrina 1:200.000). Incisión de [4-5] cm en [surco inframamario / periareolar inferior / axilar] bilateral.

Disección con electrocauterio hasta plano [subfascial / subglandular / submuscular / dual plane]. Se desarrolló el bolsillo [submuscular bajo el pectoral mayor / subglandular], con disección roma y cortante, respetando el surco inframamario y el polo inferior. Hemostasia con electrocauterio bipolar.

Se insertaron implantes [anatómicos / redondos] marca [Allergan / Mentor / Motiva / Sientra], referencia [___], volumen [___] cc lado derecho y [___] cc lado izquierdo, perfil [alto / moderado alto / moderado], superficie [lisa / texturizada / nanotexturizada]. Implantes lavados con triple irrigación antibiótica (Bacitracina + Gentamicina + Anfotericina) previo a su inserción.

Se verificó simetría, posición y ausencia de pliegues con la paciente en posición sentada.

Cierre de cápsula con Vicryl 2-0, tejido celular con Vicryl 3-0, cierre dérmico con Monocryl 4-0 intradérmico. Sostén quirúrgico compresivo.`,
    },
    {
        id: "tpl_04",
        name: "Mamoplastia de reducción / Mastopexia",
        technicalDescription: `Paciente en decúbito supino con brazos en abducción. Asepsia y antisepsia. Marcación preoperatoria previa en bipedestación: nuevo polo del complejo areola-pezón (CAP) a [___] cm de la horquilla esternal, patrón [Lejour / Wise / vertical / periareolar Benelli]. Diámetro de areola planificado: [38-42] mm.

Incisión periareolar y según patrón de reducción seleccionado. Desepitelización de la areola a [___] mm de diámetro.

Resección de [colgajo inferior / colgajo medial / tejido glandular inferior y lateral] con pedículo [superior / superomedial / inferior / bipediculado]. Peso resecado: [___] g lado derecho y [___] g lado izquierdo. [Espécimen enviado a patología bilateral / No enviado].

Transposición del CAP a nueva posición a [___] cm de la horquilla. Vitalidad del CAP verificada. Modelado glandular con Vicryl 2-0 puntos de colchonero.

Cierre: periareolar con Monocryl 3-0 jareta e intradérmico, vertical con Monocryl 4-0 intradérmico, horizontal en surco con Monocryl 4-0 intradérmico.

Se dejaron [2] drenajes aspirativos (uno por mama) exteriorizados en región lateral. Sostén quirúrgico compresivo.`,
    },
    {
        id: "tpl_05",
        name: "Blefaroplastia superior",
        technicalDescription: `Paciente en decúbito supino con cabeza elevada a 15-30°. Instilación de colirio anestésico bilateral. Marcación preoperatoria con el paciente despierto en sedestación. Asepsia periorbitaria. Anestesia [local + sedación / general].

Infiltración subcutánea de párpados superiores con lidocaína 2% + epinefrina 1:100.000, [2] mL por párpado. Incisión siguiendo el pliegue palpebral superior marcado, resecando [___] mm de exceso de piel.

Disección hasta músculo orbicular. Resección de franja de músculo orbicular de [___] mm de ancho para exposición del septo orbitario. [Apertura del septo / No se abrió el septo]. Extirpación de [bolsa de grasa central (amarilla) / bolsa medial (blanquecina)] con presión suave sobre el globo. Hemostasia con bipolar fino.

Cierre con [Nylon 6-0 puntos simples / Prolene 6-0 continuo]. Longitud de incisión: [___] cm por lado.`,
    },
    {
        id: "tpl_06",
        name: "Blefaroplastia inferior",
        technicalDescription: `Paciente en decúbito supino con cabeza elevada. Asepsia periorbitaria. Anestesia [local + sedación / general].

Infiltración de párpados inferiores con lidocaína 2% + epinefrina 1:100.000. Incisión [subciliar a 2 mm del borde libre / transcunjuntival]. Disección en plano preorbicular hasta reborde orbitario inferior. Apertura del septo orbitario. Se identificaron los tres compartimentos de grasa: medial, central y lateral.

Se realizó [resección de bolsas de grasa / reposicionamiento de grasa orbitaria (fat repositioning) sobre reborde orbitario inferior] para corrección del surco nasoyugal.

[Cantopexia lateral / No realizada].

Cierre con [Nylon 6-0 / Vicryl 6-0 / Sin sutura en abordaje transcunjuntival]. Apósito con compresas frías.`,
    },
    {
        id: "tpl_07",
        name: "Blefaroplastia superior e inferior",
        technicalDescription: `Paciente en decúbito supino con cabeza elevada a 15-30°. Instilación de colirio anestésico bilateral. Marcación preoperatoria con el paciente despierto en sedestación. Asepsia periorbitaria. Anestesia [local + sedación / general].

PÁRPADOS SUPERIORES: Infiltración subcutánea con lidocaína 2% + epinefrina 1:100.000, 2 mL por párpado. Incisión siguiendo el pliegue palpebral superior marcado, resecando [___] mm de exceso de piel. Resección de franja de músculo orbicular de [___] mm. [Apertura del septo / No se abrió el septo]. Extirpación de [bolsa de grasa central / bolsa medial]. Hemostasia con bipolar. Cierre con Nylon 6-0 puntos simples.

PÁRPADOS INFERIORES: Incisión [subciliar / transcunjuntival]. Disección hasta reborde orbitario. Apertura del septo. Se identificaron los tres compartimentos grasos: medial, central y lateral. [Resección de bolsas / Reposicionamiento graso sobre reborde orbitario]. [Cantopexia lateral / No realizada]. Cierre con [Nylon 6-0 / Sin sutura si transcunjuntival].

Apósito con compresas frías bilateral.`,
    },
    {
        id: "tpl_08",
        name: "Cruroplastia",
        technicalDescription: `Paciente en decúbito supino con muslos en abducción y rodillas flexionadas. Asepsia y antisepsia perineal y de extremidades inferiores. Marcación preoperatoria previa en bipedestación delimitando el exceso de piel en cara interna de muslos.

Incisión en [pliegue inguinal / surco genitofemoral] siguiendo la marcación previa, extendiéndose [verticalmente hacia la cara interna del muslo / solo en sentido horizontal], de [___] cm de longitud por lado.

Disección del colgajo dermograso en plano suprafascial sobre la [fascia lata / fascia de Scarpa], con preservación de linfáticos de la región inguinal. Resección del excedente de piel y tejido adiposo. Peso del espécimen: [___] g por lado.

Fijación del colgajo a la [fascia de Colles / ligamento de Lockwood] con puntos de anclaje de [Vicryl 0 / Prolene 0] para evitar recidiva.

Cierre por planos: tejido celular subcutáneo con Vicryl 2-0, subdérmico con Monocryl 3-0, dérmico con Monocryl 4-0 intradérmico continuo.

Se dejaron [2] drenajes aspirativos Blake exteriorizados en región interna de muslos. Vendaje compresivo con faja de muslos.`,
    },
    {
        id: "tpl_09",
        name: "Braquioplastia",
        technicalDescription: `Paciente en decúbito supino con brazos en abducción a 90° sobre apoyabrazos. Asepsia y antisepsia de extremidades superiores. Marcación preoperatoria previa con brazos en abducción, delimitando el eje de resección en cara interna del brazo siguiendo el surco bicipital medial.

Incisión elíptica en cara interna del brazo desde el pliegue axilar anterior hasta el epicóndilo medial. Longitud de la incisión: [___] cm por lado. Anchura del elipse de resección: [___] cm por lado.

Disección del colgajo dermograso en plano suprafascial sobre la fascia braquial. Identificación y preservación del nervio cutáneo medial del brazo y del antebrazo. Hemostasia con electrocauterio bipolar.

Resección del colgajo excedente. Peso del espécimen: [___] g por lado.

Fijación del nuevo colgajo a la fascia braquial con puntos de anclaje de Vicryl 0 para evitar desplazamiento inferior.

Cierre por planos: tejido celular subcutáneo con Vicryl 2-0, subdérmico con Monocryl 3-0, dérmico con Monocryl 4-0 intradérmico continuo.

Se dejaron [2] drenajes aspirativos (uno por brazo) exteriorizados en región distal. Manga compresiva desde muñeca hasta axila.`,
    },
    {
        id: "tpl_10",
        name: "Gluteoplastia con implantes",
        technicalDescription: `Paciente en decúbito prono. Asepsia y antisepsia de región glútea, perineal y lumbar. Marcación preoperatoria previa en bipedestación delimitando polo superior e inferior del glúteo, pliegue glúteo y proyección deseada.

Incisión interglútea de [5-7] cm en el surco interglúteo a [___] cm del pliegue anal. Disección con electrocauterio hasta fascia del músculo glúteo mayor.

Se creó bolsillo [intramuscular dentro del glúteo mayor / subfascial] con disectores romos entre los tercios [superior y medio] del músculo. Dimensiones del bolsillo: [___] cm × [___] cm.

Se insertaron implantes de silicona sólida marca [Polytech / Sientra / GC Aesthetics], referencia [___], volumen [___] cc, forma [redonda / anatómica / oval]. Implantes lavados con solución antibiótica triple previo a su inserción.

Verificación de posición, simetría y ausencia de pliegues.

Cierre de fascia muscular con [Vicryl 0 / PDS 0] puntos de colchonero. Tejido celular con Vicryl 2-0. Dérmico con [Monocryl 3-0 / Nylon 3-0]. Apósito y faja compresiva.`,
    },
    {
        id: "tpl_11",
        name: "Revisión de cicatriz",
        technicalDescription: `Paciente en [posición según región anatómica]. Asepsia y antisepsia. Marcación preoperatoria de los bordes de resección y diseño de la técnica de irregularización.

Se realizó [escisión fusiforme / Z-plastia / W-plastia / técnica de seriación] de la cicatriz con márgenes de [1-2] mm de tejido sano hasta el plano de [tejido celular subcutáneo / fascia superficial].

[Para Z-plastia: se diseñaron colgajos de [___]° logrando elongación del eje de contractura del [___]%. Para W-plastia: se diseñaron triángulos alternantes de [___] mm de lado para irregularizar la cicatriz y disminuir la tensión lineal.]

[En cicatrices con contractura: disección y liberación de bridas en tejido subcutáneo. Injerto de piel [total / parcial 0.012 pulgadas] tomado de zona donante: [muslo / retroauricular / abdomen]. Fijación del injerto con Vicryl 5-0 / apósito tie-over.]

Hemostasia con bipolar. Cierre subdérmico con Monocryl 3-0, dérmico con [Monocryl 4-0 intradérmico / Nylon 5-0 puntos simples].

[Infiltración intralesional de Triamcinolona [20-40] mg/mL en los bordes de cierre como profilaxis de queloide.]

Espécimen: [enviado a patología / no enviado]. Apósito no adherente.`,
    },
    {
        id: "tpl_12",
        name: "Queloidectomía",
        technicalDescription: `Paciente en [posición según región anatómica]. Asepsia y antisepsia. Marcación de los bordes del queloide incluyendo [1-2] mm de margen lateral.

Infiltración intralesional de [Triamcinolona 40 mg/mL] en la base y bordes del queloide, [1-2] mL. Se esperó [5] minutos para blanqueamiento del tejido.

Escisión del queloide en su totalidad hasta plano de [tejido celular subcutáneo / fascia]. Dimensiones del espécimen: [___] cm × [___] cm. Enviado a patología.

Hemostasia cuidadosa con bipolar de baja intensidad. Cierre en mínima tensión: subdérmico con Monocryl 3-0 puntos enterrados, dérmico con Monocryl 4-0 intradérmico.

Infiltración de Triamcinolona [20-40] mg/mL en los bordes de la sutura al finalizar el cierre como profilaxis de recidiva. Apósito compresivo.`,
    },
    {
        id: "tpl_13",
        name: "Rinoplastia",
        technicalDescription: `Paciente en decúbito supino con cuello en ligera extensión. Vasoconstricción de mucosa nasal con [Oximetazolina / Cocaína tópica 4%]. Infiltración de lidocaína 2% + epinefrina 1:100.000 en columela, dorso, punta y tabique. Asepsia perinasofacial. Anestesia general con intubación orotraqueal.

Incisión en columela en [V invertida / escalón / transcolumelar]. Incisiones marginales bilaterales. Disección en plano subpericóndrico sobre cartílagos laterales inferiores (LLC) y superiores (ULC). Degloving completo de la pirámide nasal.

TABIQUE: Abordaje por [hemitransficción / Killian]. Resección de [___] mm de cartílago septal en zona de desviación. Corrección de espolones óseos con [gubia / raspa]. Reposicionamiento en línea media fijado con [PDS 4-0 en puntos en U].

DORSO: Resección de [___] mm de joroba [osteo-cartilaginosa] con [bisturí / escoplo / raspa de Skoog]. Osteotomías [laterales / mediales / intermedias] con cincel de [2-3] mm para cierre del techo abierto.

PUNTA: [Sutura de cúpula / sutura intercrural / técnica de Tardy / injerto de escudo]. Injertos cartilaginosos de [tabique / concha / costilla] tipo [columelar strut / spreader grafts / alar batten grafts].

Cierre de columela con Nylon 6-0. Incisiones marginales con Chromic 5-0. Splint interno septal con láminas de silicona fijadas con Prolene 3-0. Splint externo nasal [yeso / plástico termomoldeable].`,
    },
    {
        id: "tpl_14",
        name: "Ritidoplastia / Facelift",
        technicalDescription: `Paciente en decúbito supino con cabeza en posición neutra. Infiltración tumescente perauricular y submentoniana con lidocaína 0.5% + epinefrina 1:400.000. Asepsia facial y cervical. Anestesia [general / sedación profunda + local].

Incisión preauricular en [pliegue tragal / pretragal], continuando retroauricular hacia cuero cabelludo [temporal / parietal]. Incisión submentoniana de [3-4] cm en pliegue submentoniano para [lipectomía / liposucción submentoniana / platismaplastia].

Disección del colgajo cutáneo en plano subcutáneo [2-4] cm por delante de la incisión, preservando ramas del nervio facial. Identificación del SMAS.

SMAS: se realizó [plicatura sin resección / SMASectomía parcial con resección de franja de 1-2 cm / imbrication / deep plane]. Reposicionamiento con [Prolene 2-0 / PDS 2-0] en vector [supero-posterior / vertical].

PLATISMA: sutura de bordes mediales en línea media cervical con [Nylon 3-0 / Prolene 3-0] en [corsé / puntos simples]. Liposucción submentoniana: [___] mL aspirados.

Redrapeado del colgajo cutáneo sin tensión excesiva. Resección de excedente de piel. Cierre: retroauricular con Vicryl 3-0 + Monocryl 4-0, preauricular con Monocryl 5-0 intradérmico. [Sin drenajes / Dren Penrose / Blake 7mm]. Vendaje cefálico compresivo.`,
    },
    {
        id: "tpl_15",
        name: "Implante de glúteos + liposucción (combinado)",
        technicalDescription: `Paciente en decúbito supino para el tiempo de liposucción, luego se reposiciona en decúbito prono para el implante. Asepsia y antisepsia amplia. Marcación preoperatoria previa en bipedestación.

TIEMPO 1 — LIPOSUCCIÓN (decúbito supino): Infiltración tumescente de [1000 mL SSN 0.9% + Lidocaína 500 mg + Epinefrina 1 mg + Bicarbonato 10 mL] en zonas donantes: [abdomen / flancos / muslos]. Tiempo de espera de [15-20] minutos. Liposucción con cánula de [3.5] mm. Volumen aspirado: [___] mL grasa pura.

TIEMPO 2 — GLUTEOPLASTIA CON IMPLANTE (decúbito prono): Incisión interglútea de [5-7] cm en el surco interglúteo a [___] cm del pliegue anal. Disección hasta fascia del glúteo mayor. Creación de bolsillo [intramuscular / subfascial] con disectores romos. Se insertaron implantes de silicona sólida marca [___], referencia [___], volumen [___] cc, forma [redonda / anatómica]. Lavado con solución antibiótica triple.

Verificación de posición, simetría y ausencia de pliegues.

Cierre de fascia con [Vicryl 0 / PDS 0] en puntos de colchonero. Tejido celular con Vicryl 2-0. Dérmico con [Monocryl 3-0 / Nylon 3-0]. Faja compresiva y faja de muslos.`,
    },
    {
        id: "tpl_16",
        name: "Abdominoplastia + liposucción (combinado)",
        technicalDescription: `Paciente en decúbito supino con caderas ligeramente flexionadas. Asepsia y antisepsia amplia. Marcación preoperatoria previa en bipedestación.

TIEMPO 1 — LIPOSUCCIÓN DE FLANCOS Y ZONAS COMPLEMENTARIAS: Infiltración tumescente de [1000 mL SSN + Lidocaína 500 mg + Epinefrina 1 mg] en [flancos / dorso / muslos externos]. Liposucción con cánula de [3.5] mm. Volumen aspirado: [___] mL.

TIEMPO 2 — ABDOMINOPLASTIA: Incisión suprapúbica en [elipse / arco low cut] de espina ilíaca a espina ilíaca, a [5-7] cm del pubis. Disección en plano suprafascial hasta reborde costal con preservación de perforantes paraumbilicales. [Plicatura / Rafia] de línea alba desde xifoides hasta pubis con [Prolene 0 / PDS 0] corrigiendo diástasis de [___] cm. Neoumbilicoplastia. Resección de colgajo excedente. Peso: [___] g.

Se dejaron [2] drenajes aspirativos Blake en flancos. Cierre por planos: celular con Vicryl 2-0, subdérmico con Monocryl 3-0, intradérmico con Monocryl 4-0. Faja compresiva abdominal.`,
    },
    {
        id: "tpl_17",
        name: "Mastopexia con implantes",
        technicalDescription: `Paciente en decúbito supino con brazos en abducción. Asepsia y antisepsia. Marcación preoperatoria previa en bipedestación: nuevo polo del CAP a [___] cm de la horquilla esternal, patrón [periareolar / vertical / Wise], diámetro de areola [38-42] mm.

Incisión periareolar y según patrón seleccionado. Desepitelización de areola a [___] mm de diámetro.

Resección de [colgajo inferior] con pedículo [superomedial / superior]. Creación del bolsillo [submuscular / subglandular] bilateral para inserción de implantes.

Se insertaron implantes [redondos / anatómicos] marca [___], referencia [___], volumen [___] cc por lado, perfil [alto / moderado], superficie [lisa / texturizada]. Lavado con triple irrigación antibiótica.

Transposición del CAP a nueva posición. Vitalidad del CAP verificada. Modelado glandular con Vicryl 2-0.

Cierre periareolar con Monocryl 3-0, vertical con Monocryl 4-0 intradérmico, surco con Monocryl 4-0 intradérmico. Sostén quirúrgico compresivo.`,
    },
];
