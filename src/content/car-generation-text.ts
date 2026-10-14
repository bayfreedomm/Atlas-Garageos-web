/**
 * Copy for the generation and bolt-pattern-by-year sections of car model pages, in every entity
 * locale. Values (PCD, bore, years) arrive preformatted.
 */
import type { EntityLocale } from '../seo/entity-routes';

export interface PeriodText { readonly pcd: string; readonly years: string; }

export interface CarGenerationText {
  readonly present: string;
  readonly genHeading: (name: string) => string;
  readonly genIntro: string;
  readonly genTitle: (full: string, years: string) => string;
  readonly pcd: string;
  readonly bore: string;
  readonly wheels: string;
  readonly records: (count: number) => string;
  readonly also: (list: string) => string;
  readonly timelineHeading: (name: string) => string;
  readonly cols: { readonly years: string; readonly pcd: string; readonly bore: string; readonly versions: string };
  readonly versionsHeading: (name: string) => string;
  readonly lead: (name: string, current: PeriodText, bore: string | undefined, older: string) => string;
  readonly genFaqQ: (full: string) => string;
  readonly genFaqA: (full: string, years: string, pcd: string, bore: string | undefined, also: string) => string;
  readonly titles: (name: string, labels: string) => readonly string[];
  readonly description: (name: string, list: string) => string;
}

export const carGenerationText: Readonly<Record<EntityLocale, CarGenerationText>> = Object.freeze({
  en: {
    present: 'today',
    genHeading: (n) => `${n} bolt pattern by generation`,
    genIntro: 'Generation years are Atlas editorial; bolt pattern, center bore and wheel sizes come from the wheel records within those years.',
    genTitle: (f, y) => `${f} (${y}) bolt pattern`,
    pcd: 'Bolt pattern', bore: 'Center bore', wheels: 'Factory wheels',
    records: (c) => `${c} ${c === 1 ? 'record' : 'records'}`,
    also: (l) => `Also recorded: ${l}`,
    timelineHeading: (n) => `${n} bolt pattern by year`,
    cols: { years: 'Years', pcd: 'Bolt pattern', bore: 'Center bore', versions: 'Versions' },
    versionsHeading: (n) => `${n} wheel data by version`,
    lead: (n, c, b, o) => `In the wheel records from ${c.years}, the ${n} uses a ${c.pcd} bolt pattern${b ? ` with a ${b} center bore` : ''}.${o ? ` Earlier or other versions: ${o}.` : ''}`,
    genFaqQ: (f) => `What is the ${f} bolt pattern?`,
    genFaqA: (f, y, p, b, a) => `In the wheel records for ${y}, the ${f} uses ${p}${b ? ` with a ${b} center bore` : ''}.${a ? ` Some versions differ: ${a}.` : ''}`,
    titles: (n, l) => [`${n} ${l} Bolt Pattern and Wheel Size`, `${n} ${l} Bolt Pattern`],
    description: (n, l) => `${n} bolt pattern by generation: ${l}. Center bore, factory wheel and tire sizes by version.`,
  },
  de: {
    present: 'heute',
    genHeading: (n) => `${n} Lochkreis nach Generation`,
    genIntro: 'Die Generationsjahre sind redaktionell (Atlas); Lochkreis, Mittenloch und Felgengrößen stammen aus den Felgendaten dieser Jahre.',
    genTitle: (f, y) => `${f} (${y}) Lochkreis`,
    pcd: 'Lochkreis', bore: 'Mittenloch', wheels: 'Werksfelgen',
    records: (c) => `${c} ${c === 1 ? 'Eintrag' : 'Einträge'}`,
    also: (l) => `Außerdem erfasst: ${l}`,
    timelineHeading: (n) => `${n} Lochkreis nach Baujahr`,
    cols: { years: 'Jahre', pcd: 'Lochkreis', bore: 'Mittenloch', versions: 'Versionen' },
    versionsHeading: (n) => `${n} Felgendaten nach Version`,
    lead: (n, c, b, o) => `Laut den Felgendaten von ${c.years} hat der ${n} den Lochkreis ${c.pcd}${b ? ` und ${b} Mittenloch` : ''}.${o ? ` Ältere oder andere Versionen: ${o}.` : ''}`,
    genFaqQ: (f) => `Welchen Lochkreis hat der ${f}?`,
    genFaqA: (f, y, p, b, a) => `Laut den Felgendaten der Jahre ${y} hat der ${f} den Lochkreis ${p}${b ? ` und ${b} Mittenloch` : ''}.${a ? ` Einzelne Versionen weichen ab: ${a}.` : ''}`,
    titles: (n, l) => [`${n} ${l} Lochkreis und Felgengröße`, `${n} ${l} Lochkreis`],
    description: (n, l) => `${n} Lochkreis nach Generation: ${l}. Mittenloch, Werksfelgen und Reifengrößen nach Version.`,
  },
  es: {
    present: 'hoy',
    genHeading: (n) => `Patrón de birlos del ${n} por generación`,
    genIntro: 'Los años de cada generación son editoriales (Atlas); el patrón, el buje central y las llantas salen de los registros de esos años.',
    genTitle: (f, y) => `${f} (${y}): patrón de birlos`,
    pcd: 'Patrón de birlos', bore: 'Buje central', wheels: 'Llantas de serie',
    records: (c) => `${c} ${c === 1 ? 'registro' : 'registros'}`,
    also: (l) => `También registrado: ${l}`,
    timelineHeading: (n) => `Patrón de birlos del ${n} por año`,
    cols: { years: 'Años', pcd: 'Patrón', bore: 'Buje central', versions: 'Versiones' },
    versionsHeading: (n) => `Datos de llanta del ${n} por versión`,
    lead: (n, c, b, o) => `En los registros de llantas de ${c.years}, el ${n} usa un patrón de birlos ${c.pcd}${b ? ` con buje central de ${b}` : ''}.${o ? ` Versiones anteriores u otras: ${o}.` : ''}`,
    genFaqQ: (f) => `¿Qué patrón de birlos tiene el ${f}?`,
    genFaqA: (f, y, p, b, a) => `En los registros de ${y}, el ${f} usa ${p}${b ? ` con buje central de ${b}` : ''}.${a ? ` Algunas versiones difieren: ${a}.` : ''}`,
    titles: (n, l) => [`${n} ${l}: patrón de birlos y medida de llanta`, `${n} ${l}: patrón de birlos`],
    description: (n, l) => `Patrón de birlos del ${n} por generación: ${l}. Buje central, llantas y neumáticos de serie por versión.`,
  },
  fr: {
    present: 'aujourd’hui',
    genHeading: (n) => `Entraxe ${n} par génération`,
    genIntro: 'Les années de génération sont éditoriales (Atlas) ; entraxe, alésage central et jantes proviennent des fiches de ces années.',
    genTitle: (f, y) => `Entraxe ${f} (${y})`,
    pcd: 'Entraxe', bore: 'Alésage central', wheels: 'Jantes d’origine',
    records: (c) => `${c} ${c === 1 ? 'fiche' : 'fiches'}`,
    also: (l) => `Également relevé : ${l}`,
    timelineHeading: (n) => `Entraxe ${n} par année`,
    cols: { years: 'Années', pcd: 'Entraxe', bore: 'Alésage', versions: 'Versions' },
    versionsHeading: (n) => `Données de jantes ${n} par version`,
    lead: (n, c, b, o) => `D’après les fiches de jantes ${c.years}, l’entraxe ${n} est ${c.pcd}${b ? ` avec un alésage central de ${b}` : ''}.${o ? ` Versions plus anciennes ou autres : ${o}.` : ''}`,
    genFaqQ: (f) => `Quel est l’entraxe ${f} ?`,
    genFaqA: (f, y, p, b, a) => `D’après les fiches ${y}, l’entraxe ${f} est ${p}${b ? ` avec un alésage central de ${b}` : ''}.${a ? ` Certaines versions diffèrent : ${a}.` : ''}`,
    titles: (n, l) => [`Entraxe ${n} ${l} et taille de jante`, `Entraxe ${n} ${l}`],
    description: (n, l) => `Entraxe ${n} par génération : ${l}. Alésage central, jantes et pneus d’origine par version.`,
  },
  it: {
    present: 'oggi',
    genHeading: (n) => `Foratura ${n} per generazione`,
    genIntro: 'Gli anni delle generazioni sono redazionali (Atlas); foratura, foro centrale e cerchi provengono dai dati di quegli anni.',
    genTitle: (f, y) => `Foratura ${f} (${y})`,
    pcd: 'Foratura', bore: 'Foro centrale', wheels: 'Cerchi di serie',
    records: (c) => `${c} ${c === 1 ? 'record' : 'record'}`,
    also: (l) => `Rilevato anche: ${l}`,
    timelineHeading: (n) => `Foratura ${n} per anno`,
    cols: { years: 'Anni', pcd: 'Foratura', bore: 'Foro centrale', versions: 'Versioni' },
    versionsHeading: (n) => `Dati cerchi ${n} per versione`,
    lead: (n, c, b, o) => `Secondo i dati dei cerchi ${c.years}, la foratura ${n} è ${c.pcd}${b ? ` con foro centrale da ${b}` : ''}.${o ? ` Versioni precedenti o diverse: ${o}.` : ''}`,
    genFaqQ: (f) => `Qual è la foratura ${f}?`,
    genFaqA: (f, y, p, b, a) => `Secondo i dati ${y}, la foratura ${f} è ${p}${b ? ` con foro centrale da ${b}` : ''}.${a ? ` Alcune versioni differiscono: ${a}.` : ''}`,
    titles: (n, l) => [`Foratura ${n} ${l} e misura cerchi`, `Foratura ${n} ${l}`],
    description: (n, l) => `Foratura ${n} per generazione: ${l}. Foro centrale, cerchi e pneumatici di serie per versione.`,
  },
  'pt-br': {
    present: 'hoje',
    genHeading: (n) => `Furação do ${n} por geração`,
    genIntro: 'Os anos de cada geração são editoriais (Atlas); furação, furo central e rodas vêm dos registros desses anos.',
    genTitle: (f, y) => `Furação do ${f} (${y})`,
    pcd: 'Furação', bore: 'Furo central', wheels: 'Rodas originais',
    records: (c) => `${c} ${c === 1 ? 'registro' : 'registros'}`,
    also: (l) => `Também registrado: ${l}`,
    timelineHeading: (n) => `Furação do ${n} por ano`,
    cols: { years: 'Anos', pcd: 'Furação', bore: 'Furo central', versions: 'Versões' },
    versionsHeading: (n) => `Dados de roda do ${n} por versão`,
    lead: (n, c, b, o) => `Nos registros de rodas de ${c.years}, a furação do ${n} é ${c.pcd}${b ? ` com furo central de ${b}` : ''}.${o ? ` Versões anteriores ou outras: ${o}.` : ''}`,
    genFaqQ: (f) => `Qual é a furação do ${f}?`,
    genFaqA: (f, y, p, b, a) => `Nos registros de ${y}, a furação do ${f} é ${p}${b ? ` com furo central de ${b}` : ''}.${a ? ` Algumas versões diferem: ${a}.` : ''}`,
    titles: (n, l) => [`Furação do ${n} ${l} e medida de roda`, `Furação do ${n} ${l}`],
    description: (n, l) => `Furação do ${n} por geração: ${l}. Furo central, rodas e pneus originais por versão.`,
  },
  pl: {
    present: 'dziś',
    genHeading: (n) => `Rozstaw śrub ${n} według generacji`,
    genIntro: 'Lata generacji są redakcyjne (Atlas); rozstaw śrub, otwór centralny i felgi pochodzą z danych z tych lat.',
    genTitle: (f, y) => `Rozstaw śrub ${f} (${y})`,
    pcd: 'Rozstaw śrub', bore: 'Otwór centralny', wheels: 'Felgi fabryczne',
    records: (c) => `${c} ${c === 1 ? 'wpis' : c < 5 ? 'wpisy' : 'wpisów'}`,
    also: (l) => `Zanotowano też: ${l}`,
    timelineHeading: (n) => `Rozstaw śrub ${n} według roku`,
    cols: { years: 'Lata', pcd: 'Rozstaw', bore: 'Otwór centralny', versions: 'Wersje' },
    versionsHeading: (n) => `Dane felg ${n} według wersji`,
    lead: (n, c, b, o) => `Według danych felg z lat ${c.years} rozstaw śrub ${n} to ${c.pcd}${b ? `, otwór centralny ${b}` : ''}.${o ? ` Starsze lub inne wersje: ${o}.` : ''}`,
    genFaqQ: (f) => `Jaki rozstaw śrub ma ${f}?`,
    genFaqA: (f, y, p, b, a) => `Według danych z lat ${y} ${f} ma rozstaw śrub ${p}${b ? `, otwór centralny ${b}` : ''}.${a ? ` Niektóre wersje się różnią: ${a}.` : ''}`,
    titles: (n, l) => [`Rozstaw śrub ${n} ${l} i rozmiar felg`, `Rozstaw śrub ${n} ${l}`],
    description: (n, l) => `Rozstaw śrub ${n} według generacji: ${l}. Otwór centralny, felgi i opony fabryczne według wersji.`,
  },
  nl: {
    present: 'nu',
    genHeading: (n) => `Steek ${n} per generatie`,
    genIntro: 'De generatiejaren zijn redactioneel (Atlas); steek, middengat en velgmaten komen uit de velggegevens van die jaren.',
    genTitle: (f, y) => `Steek ${f} (${y})`,
    pcd: 'Steek', bore: 'Middengat', wheels: 'Fabrieksvelgen',
    records: (c) => `${c} ${c === 1 ? 'record' : 'records'}`,
    also: (l) => `Ook vastgelegd: ${l}`,
    timelineHeading: (n) => `Steek ${n} per bouwjaar`,
    cols: { years: 'Jaren', pcd: 'Steek', bore: 'Middengat', versions: 'Versies' },
    versionsHeading: (n) => `Velggegevens ${n} per versie`,
    lead: (n, c, b, o) => `Volgens de velggegevens van ${c.years} heeft de ${n} steek ${c.pcd}${b ? ` en een middengat van ${b}` : ''}.${o ? ` Oudere of andere versies: ${o}.` : ''}`,
    genFaqQ: (f) => `Welke steek heeft de ${f}?`,
    genFaqA: (f, y, p, b, a) => `Volgens de gegevens van ${y} heeft de ${f} steek ${p}${b ? ` en een middengat van ${b}` : ''}.${a ? ` Sommige versies wijken af: ${a}.` : ''}`,
    titles: (n, l) => [`Steek ${n} ${l} en velgmaat`, `Steek ${n} ${l}`],
    description: (n, l) => `Steek ${n} per generatie: ${l}. Middengat, fabrieksvelgen en bandenmaten per versie.`,
  },
  tr: {
    present: 'günümüz',
    genHeading: (n) => `Nesillere göre ${n} bijon aralığı`,
    genIntro: 'Nesil yılları Atlas editörlüğündedir; bijon aralığı, göbek çapı ve jant ölçüleri o yıllara ait jant kayıtlarından gelir.',
    genTitle: (f, y) => `${f} (${y}) bijon aralığı`,
    pcd: 'Bijon aralığı', bore: 'Göbek çapı', wheels: 'Fabrika jantları',
    records: (c) => `${c} kayıt`,
    also: (l) => `Bazı versiyonlarda: ${l}`,
    timelineHeading: (n) => `Yıllara göre ${n} bijon aralığı`,
    cols: { years: 'Yıllar', pcd: 'Bijon aralığı', bore: 'Göbek çapı', versions: 'Versiyonlar' },
    versionsHeading: (n) => `Versiyonlara göre ${n} jant verileri`,
    lead: (n, c, b, o) => `${n}, ${c.years} jant kayıtlarında ${c.pcd} bijon aralığı${b ? ` ve ${b} göbek çapı` : ''} kullanıyor.${o ? ` Daha eski veya farklı versiyonlar: ${o}.` : ''}`,
    genFaqQ: (f) => `${f} bijon aralığı nedir?`,
    genFaqA: (f, y, p, b, a) => `${y} jant kayıtlarına göre ${f} bijon aralığı ${p}${b ? `, göbek çapı ${b}` : ''}.${a ? ` Bazı versiyonlar farklı: ${a}.` : ''}`,
    titles: (n, l) => [`${n} ${l} bijon aralığı ve jant ölçüleri`, `${n} ${l} bijon aralığı`],
    description: (n, l) => `Nesillere göre ${n} bijon aralığı: ${l}. Göbek çapı, fabrika jant ve lastik ölçüleri.`,
  },
});
