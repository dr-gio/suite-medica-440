import type { SurgeryTemplate } from '../context/ConfigContext';

export const DEFAULT_RECOMMENDATIONS: Omit<SurgeryTemplate, 'id'>[] = [
    {
        name: "Abdominoplastia",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior a la cirugia:
Bano completo con jabon antibacterial en toda la zona a operar.

Manana de la cirugia:
Repetir el bano con jabon antibacterial.

NO aplicar despues del bano:
Cremas, aceites, desodorante, perfume ni maquillaje.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, ibuprofeno, naproxeno, diclofenaco, Omega 3, vitamina E.
SUSPENDER 4 semanas antes: cigarrillo completamente.
SUSPENDER 1 semana antes: alcohol.
EXAMENES: hemograma, coagulacion, glicemia, electrolitos. Ecografia abdominal si hay hernias o cirugia previa.
DIA DE LA CIRUGIA: ayuno 8 horas. Traer faja abdominal del talle actual. Ropa comoda que abra por el frente. Venir acompanado.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
FAJA: retirarla para el bano y volver a ponerla inmediatamente al salir.
NUNCA: tina, jacuzzi ni piscina hasta el mes 1.

=== CUIDADOS POSTOPERATORIOS ===
FAJA: 24 horas al dia durante 4-6 semanas. Solo retirar para el bano.
POSICION: dormir semi-fetal con almohada bajo las rodillas. Caminar ligeramente inclinado las primeras 2 semanas.
DRENAJES: vaciar 2 veces al dia y anotar volumen. El cirujano los retira cuando debito sea menor de 30 mL en 24 horas.
ACTIVIDAD: caminata suave desde dia 1. Trabajo de oficina: semana 2. Ejercicio: semana 6.
CICATRIZ: gel de silicona desde semana 4. Protector solar FPS 50+ durante 1 ano.
ANTICOAGULACION: enoxaparina segun indicacion medica.

=== SEÑALES DE ALARMA ===
Fiebre mayor de 38.5 grados.
Sangrado abundante por la herida o drenajes.
Herida que se abre.
Dolor muy intenso que no cede con el analgesico.
Pierna hinchada, roja y dolorosa (posible trombosis).
Dificultad para respirar.`,
    },
    {
        name: "Mamoplastia de Aumento (Implantes)",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior a la cirugia:
Bano completo con jabon antibacterial en toda la zona a operar.

Manana de la cirugia:
Repetir el bano con jabon antibacterial.

NO aplicar despues del bano:
Cremas, aceites, desodorante, perfume ni maquillaje.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, todos los AINE, Omega 3, vitamina E.
SUSPENDER 4 semanas antes: cigarrillo completamente.
EXAMENES: hemograma, coagulacion. Mamografia bilateral si tiene 40 anos o mas. Ecografia mamaria si hay antecedente de nodulos.
COMPRAR ANTES: sosten postquirurgico sin varilla.
DIA DE LA CIRUGIA: ayuno 8 horas. Traer el sosten. Ropa que abra por el frente. Venir acompanada.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
SOSTEN: retirar para el bano y volver a ponerlo inmediatamente.
Evitar chorro directo sobre las incisiones.
NUNCA: piscina, jacuzzi ni tina hasta el mes 1.

=== CUIDADOS POSTOPERATORIOS ===
SOSTEN: sin varilla 24 horas al dia durante 6 semanas.
POSICION: boca arriba con cabecera a 30 grados las primeras 3 semanas. NO de lado ni boca abajo.
BRAZOS: no levantar mas de 2 kg ni esfuerzo con brazos durante 4 semanas.
MASAJES: iniciar cuando el cirujano indique (generalmente semana 2-3).
SERIAL DEL IMPLANTE: guardar la tarjeta en lugar seguro.
ACTIVIDAD: ejercicio suave semana 4. Pesas: semana 6.

=== SEÑALES DE ALARMA ===
Fiebre mayor de 38.5 grados.
Un pecho mucho mas grande, duro o caliente que el otro (hematoma).
Herida abierta con secrecion.
Dolor intenso que no mejora.
Dificultad respiratoria.`,
    },
    {
        name: "Blefaroplastia",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior y manana de la cirugia:
Lavar la cara con jabon suave.
NO maquillaje, sombra, rimmel ni base desde 24 horas antes.
Retirar lentes de contacto desde la noche anterior.
Llevar los anteojos el dia de la cirugia.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina y todos los AINE.
COMPRAR ANTES: lagrimas artificiales sin conservantes. Compresas frias.
EXAMENES: valoracion oftalmologica si hay ptosis funcional.
DIA DE LA CIRUGIA: sin maquillaje, sin lentes de contacto. Llevar anteojos. Ropa comoda.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
OJOS: no frotar ni mojar directamente los parpados hasta dia 5.
Desde dia 5 lavar suavemente la cara.
NUNCA: piscina ni mar durante 4 semanas.

=== CUIDADOS POSTOPERATORIOS ===
FRIO: compresas frias suaves sobre los ojos 10 min cada 2 horas durante las primeras 48 horas.
CABECERA: elevada 30-45 grados incluso al dormir.
LAGRIMAS ARTIFICIALES: cada 4-6 horas durante 2 semanas.
GAFAS OSCURAS: usar al salir durante 2 semanas.
LENTES: no usar hasta autorizacion del cirujano (2-3 semanas).
PANTALLAS: reducir uso los primeros 2 dias.
ACTIVIDAD: no deporte 3 semanas. No piscina 4 semanas.

=== SEÑALES DE ALARMA ===
Vision borrosa que no mejora.
Ojo que no cierra correctamente despues del dia 2.
Dolor ocular intenso.
EMERGENCIA: vision doble o perdida de vision — ir a urgencias inmediatamente.`,
    },
    {
        name: "Liposucción / Lipoescultura",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior a la cirugia:
Bano completo con jabon antibacterial en toda la zona a operar.

Manana de la cirugia:
Repetir el bano con jabon antibacterial.

NO aplicar despues del bano:
Cremas, aceites, desodorante, perfume ni maquillaje.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, todos los AINE, Omega 3, vitamina E.
SUSPENDER 4 semanas antes: cigarrillo completamente.
COMPRAR ANTES: faja compresiva del talle actual. BBL: faja especial que deje gluteos descubiertos + almohadilla tipo rosca.
PESO: mantener estable los 3 meses previos.
DIA DE LA CIRUGIA: ayuno 8 horas. Ropa muy suelta. Venir acompanado.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
FAJA: retirar para el bano y volver a ponerla al salir.
Dias 1-3: el liquido tumescente amarillento que sale es normal.
BBL: evitar chorro directo sobre los gluteos hasta dia 5.
NUNCA: piscina ni jacuzzi hasta el mes 1.

=== CUIDADOS POSTOPERATORIOS ===
FAJA: 24 horas al dia durante 6 semanas.
BBL — MUY IMPORTANTE: NO sentarse directamente sobre los gluteos durante 6 semanas. Usar almohadilla tipo rosca. Dormir boca abajo o de lado. El 30% de la grasa puede reabsorberse — es normal.
ACTIVIDAD: caminata suave desde dia 1. Ejercicio intenso: semana 6. Deportes de gluteos: minimo 3 meses.
DRENAJE LINFATICO: desde semana 2 con terapeuta certificado.
ANTICOAGULACION: enoxaparina segun indicacion medica.

=== SEÑALES DE ALARMA ===
Fiebre mayor de 38.5 grados.
Zona tratada muy dura, caliente y roja (seroma o infeccion).
Pierna hinchada y dolorosa de un solo lado (posible trombosis).
Dificultad para respirar.
Herida con pus.`,
    },
    {
        name: "Cruroplastia",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior a la cirugia:
Bano completo con jabon antibacterial en toda la zona a operar.

Manana de la cirugia:
Repetir el bano con jabon antibacterial.

NO aplicar despues del bano:
Cremas, aceites, desodorante, perfume ni maquillaje.
Depilacion o rasura de zona inguinal 24 horas antes (NO el mismo dia de la cirugia).

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, AINE, Omega 3, vitamina E.
SUSPENDER 4 semanas antes: cigarrillo completamente.
COMPRAR ANTES: faja de muslos o medias de compresion 20-30 mmHg.
PESO: estable al menos 3 meses antes.
DIA DE LA CIRUGIA: ayuno 8 horas. Pantalon muy holgado o falda amplia. Venir acompanado.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
PLIEGUE INGUINAL: secar muy bien despues de cada bano — la humedad favorece la apertura.
FAJA: retirar para el bano y reponer inmediatamente.
NUNCA: piscina ni tina hasta el mes 1.

=== CUIDADOS POSTOPERATORIOS ===
COMPRESION: faja de muslos 24 horas al dia durante 4-6 semanas.
POSICION: no cruzar las piernas durante 4 semanas.
ELEVACION: elevar las piernas sobre almohadas al reposar.
PLIEGUE INGUINAL: secar perfectamente despues de cada bano — zona critica.
CAMINATA: iniciar desde dia 1 para prevenir trombosis.
CICATRIZ: gel de silicona desde semana 4. Protector solar FPS 50+ durante 1 ano.

=== SEÑALES DE ALARMA ===
Fiebre mayor de 38.5 grados.
Sutura que se abre en el pliegue inguinal.
Pierna muy hinchada, roja y dolorosa (posible trombosis).
Hematoma grande que crece rapidamente.
Dificultad para respirar.`,
    },
    {
        name: "Braquioplastia",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior a la cirugia:
Bano completo con jabon antibacterial en toda la zona a operar.

Manana de la cirugia:
Repetir el bano con jabon antibacterial.

NO aplicar despues del bano:
Cremas, aceites, desodorante, perfume ni maquillaje.
NO desodorante ni cremas en la zona axilar el dia de la cirugia.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, AINE, Omega 3, vitamina E.
SUSPENDER 4 semanas antes: cigarrillo completamente.
COMPRAR ANTES: manga compresiva de brazo — preguntar talla al cirujano.
PESO: estable al menos 3 meses antes.
DIA DE LA CIRUGIA: ayuno 8 horas. Camiseta sin mangas o manga muy holgada. Venir acompanado.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
PLIEGUE AXILAR: secar muy bien despues de cada bano.
MANGA: retirar para el bano y reponer al salir.
NO desodorante hasta autorizacion del cirujano.
NUNCA: piscina hasta el mes 1.

=== CUIDADOS POSTOPERATORIOS ===
MANGA COMPRESIVA: 24 horas al dia durante 4 semanas.
BRAZOS: no levantar objetos pesados ni movimientos amplios durante 3 semanas.
PLIEGUE AXILAR: secar perfectamente despues de cada bano.
ELEVACION: elevar los brazos sobre almohadas al reposar.
ACTIVIDAD: movimiento suave de manos desde dia 1. Ejercicio de brazos: semana 6.
CICATRIZ: gel de silicona desde semana 4. Protector solar FPS 50+ durante 1 ano.

=== SEÑALES DE ALARMA ===
Fiebre mayor de 38.5 grados.
Sutura que se abre en el pliegue axilar.
Brazo muy hinchado, rojo y caliente.
Hematoma grande que crece rapidamente.
Hormigueo o perdida de fuerza en las manos.`,
    },
    {
        name: "Implantes de Glúteos",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior a la cirugia:
Bano completo con jabon antibacterial en toda la zona a operar.

Manana de la cirugia:
Repetir el bano con jabon antibacterial.

NO aplicar despues del bano:
Cremas, aceites, desodorante, perfume ni maquillaje.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, AINE, Omega 3, vitamina E.
SUSPENDER 4 semanas antes: cigarrillo completamente.
EXAMENES: hemograma, coagulacion.
DIA DE LA CIRUGIA: ayuno 8 horas. Pantalon muy holgado. Venir acompanado.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
SURCO INTERGLUTEO: secar muy bien despues del bano.
POSICION EN LA DUCHA: de pie o inclinado — no sentarse en el piso.
NUNCA: piscina ni tina hasta el mes 1.

=== CUIDADOS POSTOPERATORIOS ===
POSICION CRITICA: NO sentarse directamente sobre los gluteos durante 6 semanas. Dormir boca abajo o de lado. Usar almohadilla tipo rosca para apoyar en los muslos.
ACTIVIDAD: caminata suave desde dia 1. No ejercicio de gluteos durante 3 meses.
SERIAL DEL IMPLANTE: guardar la tarjeta en lugar seguro.
ANTICOAGULACION: enoxaparina segun indicacion medica.

=== SEÑALES DE ALARMA ===
Fiebre mayor de 38.5 grados.
Dolor muy intenso en la zona operada.
Herida abierta con secrecion en el surco intergluteo.
Dificultad para respirar o dolor en el pecho (emergencia — ir a urgencias).`,
    },
    {
        name: "Rinoplastia",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior y manana de la cirugia:
Lavar bien la cara con jabon suave.
NO cremas, maquillaje ni productos en la cara.
Nariz limpia sin residuos.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, AINE, Omega 3, vitamina E.
SUSPENDER 4 semanas antes: cigarrillo completamente.
COMPRAR ANTES: suero fisiologico en spray nasal.
EXAMENES: valoracion ORL si hay obstruccion respiratoria.
DIA DE LA CIRUGIA: ayuno 8 horas. Ropa comoda. Sin gafas sobre la nariz. Venir acompanado.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
FERULA: protegerla con la mano al ducharse — no mojarla hasta que el cirujano la retire (dia 7-10).
NARIZ: limpiar interior solo con suero fisiologico en spray. NUNCA hisopos.
NUNCA: piscina ni buceo durante 6 semanas.

=== CUIDADOS POSTOPERATORIOS ===
FERULA: no mojar, no golpear, no intentar acomodar. El cirujano la retira en el control (dia 7-10).
NARIZ: NO sonarse durante 4 semanas. Si estornuda, boca abierta.
GAFAS: no usar sobre el dorso nasal durante 6 semanas.
POSICION: cabecera elevada 30-45 grados las primeras 3 semanas.
DIETA: blanda los primeros 5 dias.
EDEMA DE PUNTA: puede durar hasta 12 meses — normal. Resultado final se evalua al ano.

=== SEÑALES DE ALARMA ===
Sangrado abundante por la nariz que no cede.
EMERGENCIA: vision doble o perdida de vision — ir a urgencias inmediatamente.
Fiebre mayor de 38.5 grados.
Dificultad respiratoria severa.`,
    },
    {
        name: "Ritidoplastia (Facelift)",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior y manana de la cirugia:
Lavar bien cabello y cara con jabon suave.
NO maquillaje, tinte ni productos en el cabello.
NO desodorante ni perfume.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, AINE, Omega 3, vitamina E.
SUSPENDER 4 semanas antes: cigarrillo. Botox, fillers y laser: 30 dias antes.
COMPRAR ANTES: almohadilla en U. Shampoo suave sin sulfatos.
DIA DE LA CIRUGIA: ayuno 8 horas. Ropa que abra por el frente — no se ponga por la cabeza. Venir acompanado.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
CABELLO: no lavar hasta autorizacion del cirujano (generalmente dia 3-5).
Lavar con shampoo suave sin frotar incisiones preauriculares.
Secar en frio con secador, movimiento suave.
NUNCA: tina ni jacuzzi durante el primer mes.

=== CUIDADOS POSTOPERATORIOS ===
VENDA: cefálica compresiva las primeras 24-48 horas.
POSICION: cabecera a 30 grados. No de lado. No girar el cuello bruscamente.
DIETA: blanda o liquida los primeros 5 dias.
DRENAJE LINFATICO FACIAL: desde semana 2 con terapeuta certificado.
CABELLO: no tinte ni permanente durante 4 semanas.
CICATRIZ: maquillaje corrector sobre incisiones preauriculares desde semana 3.

=== SEÑALES DE ALARMA ===
Hematoma grande y firme que crece rapidamente en cara o cuello.
Debilidad o caida de un lado de la cara (nervio facial).
Vision borrosa o perdida de vision.
Dificultad para respirar o tragar.
Fiebre mayor de 38.5 grados.`,
    },
    {
        name: "Reducción Mamaria / Mastopexia",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Noche anterior a la cirugia:
Bano completo con jabon antibacterial en toda la zona a operar.

Manana de la cirugia:
Repetir el bano con jabon antibacterial.

NO aplicar despues del bano:
Cremas, aceites, desodorante, perfume ni maquillaje.
NO desodorante ni cremas en el pecho el dia de la cirugia.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, AINE, Omega 3, vitamina E.
EXAMENES OBLIGATORIOS: mamografia bilateral. Ecografia si hay antecedente de nodulos.
COMPRAR ANTES: sosten postquirurgico sin varilla.
DIA DE LA CIRUGIA: ayuno 8 horas. Traer el sosten. Ropa que abra por el frente. Venir acompanada.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar la herida. Secar dando golpecitos con toalla limpia.

SIEMPRE: agua tibia, nunca caliente. Jabon neutro o suave.
SOSTEN: retirar para el bano y reponer inmediatamente.
SURCO INFRAMAMARIO: secar perfectamente despues del bano — zona mas propensa a irritarse.
CICATRIZ EN T o VERTICAL: secar con golpecitos, nunca frote.
NUNCA: piscina ni tina hasta el mes 1.

=== CUIDADOS POSTOPERATORIOS ===
SOSTEN: sin varilla 24 horas al dia durante 6 semanas.
SURCO INFRAMAMARIO: secar perfectamente despues de cada bano — zona mas propensa a irritarse.
SENSIBILIDAD DEL PEZON: puede estar alterada hasta 12 meses — es normal.
PATOLOGIA: recoger el resultado en 2-3 semanas y llevarlo al control.
CICATRIZ: gel de silicona desde semana 4. Protector solar FPS 50+.
MAMOGRAFIA DE CONTROL: a los 6 meses postoperatorio.

=== SEÑALES DE ALARMA ===
Cambio de color del pezon (azulado o sin sensacion creciente).
Un pecho mucho mas grande, duro o caliente que el otro.
Fiebre mayor de 38.5 grados.
Herida con pus o mal olor.
Dificultad respiratoria.`,
    },
    {
        name: "Revisión de Cicatriz / Queloidectomía",
        preText: `=== BAÑO PREQUIRÚRGICO ===
Dia del procedimiento:
Bano normal con jabon suave.
Zona de cicatriz limpia y sin cremas.
Puede ser en consultorio con anestesia local.

=== RECOMENDACIONES PRE-OP ===
UNAS — OBLIGATORIO PARA TODAS LAS CIRUGIAS:
- NO acrilicos, gel, sculpey ni extension de unas.
- NO esmalte de ningun color (ni transparente).
- Unas cortas y completamente limpias.
- Razon: el oximetro de pulso mide el oxigeno a traves de la una. Si esta pintada o tiene acrilico, el aparato no lee bien y el anestesiologo no puede monitorizar correctamente durante la cirugia.

SUSPENDER 10 dias antes: aspirina, AINE.
NO cremas ni tratamientos sobre la cicatriz desde 30 dias antes.
NO exposicion solar sobre la cicatriz 30 dias antes.
Vitamina E topica: suspender 2 semanas antes.`,
        postText: `=== BAÑO POSTQUIRÚRGICO ===
DIA 1 - 3: bano con esponja. No mojar la herida.

DIA 3 - 5: ya puede mojar la herida con agua tibia. Dejar caer el agua suavemente.

DIA 5 - 7: ducha normal suave. No restregar. Secar con golpecitos.

DESDE SEMANA 3-4 (herida cerrada): bano normal. Aplicar gel de silicona despues del bano cuando la herida este seca.

NO piscina ni exposicion solar directa hasta autorizacion del cirujano.

=== CUIDADOS POSTOPERATORIOS ===
PROTOCOLO DE CICATRIZ (fundamental):
- Gel de silicona 2 veces al dia desde semana 3-4.
- Masaje circular 2 minutos 3 veces al dia desde semana 3-4.
- Protector solar FPS 50+ durante 12 meses.

INFILTRACIONES DE TRIAMCINOLONA (si aplica): cada 4-6 semanas por 3-6 sesiones. Tomar acetaminofen 1 hora antes.

=== SEÑALES DE ALARMA ===
Fiebre mayor de 38.5 grados.
Herida que se abre con secrecion o mal olor.
Enrojecimiento y calor que aumentan progresivamente.
Recidiva rapida y agresiva del queloide.`,
    }
];