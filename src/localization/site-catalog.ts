import type { ToolId } from '../seo/tool-registry';
import { deToolCatalog, type ToolCatalogEntry } from './catalogs/de.tool-catalog';
import { esToolCatalog } from './catalogs/es.tool-catalog';

export type ContentLocale = 'de' | 'es';
export const CONTENT_LOCALES: readonly ContentLocale[] = ['de', 'es'];

export interface UiStrings {
  readonly skipToContent: string;
  readonly navHome: string;
  readonly navTools: string;
  readonly navFitment: string;
  readonly navGarage: string;
  readonly breadcrumbHome: string;
  readonly breadcrumbTools: string;
  readonly allToolsBack: string;
  readonly seeWhatNumbersLabel: string;
  readonly howItWorks: string;
  readonly keepInMind: string;
  readonly relatedTools: string;
  readonly advancedWheelTireTool: string;
  readonly quickUnderstanding: string;
  readonly whatMattersHere: string;
  readonly commonMistakeLabel: string;
  readonly importantWarningLabel: string;
  readonly faqHeading: string;
  readonly footerTagline: string;
  readonly footerToolbox: string;
  readonly footerFitment: string;
  readonly footerMethodology: string;
  readonly footerPrivacy: string;
  readonly footerFuelPrices: string;
  readonly footerContact: string;
  readonly footerCopy: string;
  readonly langLabel: string;
  readonly langSwitchAria: string;
  readonly goStraightTo: string;
  readonly navHomeHelper: string;
  readonly allToolsTitle: string;
  readonly allToolsHelper: string;
  readonly fitmentHelper: string;
  readonly garageHelper: string;
  readonly toolsByJob: string;
  readonly displayLabel: string;
}

export const uiStrings: Readonly<Record<ContentLocale, UiStrings>> = Object.freeze({
  de: {
    skipToContent: 'Zum Hauptinhalt springen',
    navHome: 'Start',
    navTools: 'Werkzeuge',
    navFitment: 'Felgen- & Reifenvergleich',
    navGarage: 'Meine Garage',
    breadcrumbHome: 'Start',
    breadcrumbTools: 'Werkzeuge',
    allToolsBack: '← Alle Werkzeuge',
    seeWhatNumbersLabel: 'WAS DIE ZAHLEN BEDEUTEN',
    howItWorks: 'So funktioniert es',
    keepInMind: 'Zu beachten',
    relatedTools: 'Verwandte Werkzeuge',
    advancedWheelTireTool: 'Erweitertes Felgen- & Reifen-Werkzeug',
    quickUnderstanding: 'Schnellüberblick',
    whatMattersHere: 'Worauf es hier ankommt',
    commonMistakeLabel: 'Häufiger Fehler',
    importantWarningLabel: 'Wichtiger Hinweis',
    faqHeading: 'Häufig gestellte Fragen',
    footerTagline: 'Schnelle, ehrliche Kfz-Rechner. Kein Konto, kein Schnickschnack.',
    footerToolbox: 'Werkzeugkasten',
    footerFitment: 'Felgen- & Reifenvergleich',
    footerMethodology: 'Genauigkeit & Methodik',
    footerPrivacy: 'Datenschutz',
    footerFuelPrices: 'Kraftstoffpreise heute',
    footerContact: 'Kontakt',
    footerCopy: '© {year} Atlas GarageOS. Alle Berechnungen sind Schätzungen — prüfen Sie sicherheitsrelevante Werte immer im Handbuch Ihres Fahrzeugs.',
    langLabel: 'Sprache',
    langSwitchAria: 'Sprache wechseln',
    goStraightTo: 'DIREKT ZU',
    navHomeHelper: 'Wählen Sie eine Aufgabe und erhalten Sie eine Antwort',
    allToolsTitle: 'Alle Kfz-Werkzeuge',
    allToolsHelper: 'Alle Rechner und Umrechner durchsuchen',
    fitmentHelper: 'Zwei Setups visuell vergleichen',
    garageHelper: 'Ihre Fahrzeuge und gespeicherten Setups',
    toolsByJob: 'WERKZEUGE NACH AUFGABE',
    displayLabel: 'ANZEIGE',
  },
  es: {
    skipToContent: 'Saltar al contenido principal',
    navHome: 'Inicio',
    navTools: 'Herramientas',
    navFitment: 'Comparador de Llantas y Neumáticos',
    navGarage: 'Mi Garaje',
    breadcrumbHome: 'Inicio',
    breadcrumbTools: 'Herramientas',
    allToolsBack: '← Todas las herramientas',
    seeWhatNumbersLabel: 'QUÉ SIGNIFICAN LOS NÚMEROS',
    howItWorks: 'Cómo funciona',
    keepInMind: 'Tenga en cuenta',
    relatedTools: 'Herramientas relacionadas',
    advancedWheelTireTool: 'Herramienta avanzada de llantas y neumáticos',
    quickUnderstanding: 'Comprensión rápida',
    whatMattersHere: 'Lo que importa aquí',
    commonMistakeLabel: 'Error común',
    importantWarningLabel: 'Advertencia importante',
    faqHeading: 'Preguntas frecuentes',
    footerTagline: 'Calculadoras de coche rápidas y honestas. Sin cuenta, sin complicaciones.',
    footerToolbox: 'Caja de herramientas',
    footerFitment: 'Comparador de Llantas y Neumáticos',
    footerMethodology: 'Precisión y metodología',
    footerPrivacy: 'Política de privacidad',
    footerFuelPrices: 'Precio de la gasolina hoy',
    footerContact: 'Contacto',
    footerCopy: '© {year} Atlas GarageOS. Todos los cálculos son estimaciones — verifique cualquier dato crítico de seguridad con el manual de su vehículo.',
    langLabel: 'Idioma',
    langSwitchAria: 'Cambiar idioma',
    goStraightTo: 'IR DIRECTAMENTE A',
    navHomeHelper: 'Elija una tarea y obtenga una respuesta',
    allToolsTitle: 'Todas las herramientas para automóviles',
    allToolsHelper: 'Explore todas las calculadoras y conversores',
    fitmentHelper: 'Compare dos configuraciones visualmente',
    garageHelper: 'Sus vehículos y configuraciones guardadas',
    toolsByJob: 'HERRAMIENTAS POR TAREA',
    displayLabel: 'PANTALLA',
  },
});

export interface PlatformPageCopy {
  readonly title: string;
  readonly description: string;
}

export interface PlatformCatalog {
  readonly home: PlatformPageCopy & {
    readonly kicker: string;
    readonly h1: string;
    readonly lead: string;
    readonly ctaExplore: string;
    readonly ctaCompare: string;
    readonly capTires: string;
    readonly capFuel: string;
    readonly capEv: string;
    readonly capPerformance: string;
    readonly findToolLabel: string;
    readonly findToolQuestion: string;
    readonly searchPlaceholder: string;
    readonly searchButton: string;
    readonly popularLabel: string;
    readonly popularHeading: string;
    readonly seeAll: string;
    readonly fitmentBadge: string;
    readonly fitmentTitle: string;
    readonly fitmentCopy: string;
    readonly fuelBadge: string;
    readonly fuelTitle: string;
    readonly fuelCopy: string;
    readonly categories: readonly { readonly name: string; readonly copy: string }[];
  };
  readonly toolsHub: PlatformPageCopy & { readonly h1: string; readonly lead: string; readonly fitmentRowTitle: string; readonly fitmentRowCopy: string };
  readonly methodology: PlatformPageCopy & { readonly eyebrow: string; readonly h1: string; readonly lead: string; readonly sections: readonly { readonly heading: string; readonly body: string }[]; readonly sourcesEyebrow: string; readonly sourcesHeading: string; readonly sourcesLead: string };
  readonly privacy: PlatformPageCopy & { readonly h1: string; readonly updated: string; readonly sections: readonly { readonly heading: string; readonly body: string }[] };
  readonly contact: PlatformPageCopy & {
    readonly h1: string;
    readonly lead: string;
    readonly formTitle: string;
    readonly nameLabel: string;
    readonly namePlaceholder: string;
    readonly emailLabel: string;
    readonly emailPlaceholder: string;
    readonly subjectLabel: string;
    readonly subjectOptions: readonly { readonly value: string; readonly label: string }[];
    readonly messageLabel: string;
    readonly messagePlaceholder: string;
    readonly submitLabel: string;
    readonly openingNote: string;
    readonly directLabel: string;
    readonly copyLabel: string;
    readonly copiedLabel: string;
  };
}

export const platformCatalog: Readonly<Record<ContentLocale, PlatformCatalog>> = Object.freeze({
  de: {
    home: {
      title: 'Kostenlose Kfz-Rechner & Auto-Werkzeuge',
      description: 'Schnelle, präzise Kfz-Rechner für Reifen, Kraftstoff, Reisen, Luftdruck, Leistung, Drehmoment und Passform.',
      kicker: 'WERKSTATT-WERKZEUGE FÜR ECHTE FAHRER',
      h1: 'Smartere Werkzeuge für jede Fahrt.',
      lead: 'Berechnen Sie Reifenpassform, Einpresstiefe, Kraftstoffkosten, Reisen und E-Auto-Laden mit klaren Antworten für den echten Fahrzeugalltag.',
      ctaExplore: 'Werkzeuge entdecken',
      ctaCompare: 'Passform vergleichen',
      capTires: 'Reifen & Felgen',
      capFuel: 'Kraftstoff & Reisen',
      capEv: 'E-Auto-Werkzeuge',
      capPerformance: 'Performance',
      findToolLabel: 'WERKZEUG FINDEN',
      findToolQuestion: 'Was möchten Sie berechnen?',
      searchPlaceholder: 'Reifengröße, Kraftstoffkosten, Einpresstiefe...',
      searchButton: 'Suchen',
      popularLabel: 'BELIEBTE WERKZEUGE',
      popularHeading: 'Starten Sie mit einer Aufgabe',
      seeAll: 'Alle anzeigen',
      fitmentBadge: 'ERWEITERTES VISUELLES WERKZEUG',
      fitmentTitle: 'Felgen- & Reifenvergleich',
      fitmentCopy: 'Sehen Sie, wie ein neues Setup Durchmesser, Innenposition und Außenstand verändert, bevor Sie kaufen.',
      fuelBadge: 'BEOBACHTETE STICHPROBE',
      fuelTitle: 'Kraftstoffpreise heute',
      fuelCopy: 'Von Atlas beobachtete Stichprobe für Super E5, E10 und Diesel aus ausgewählten Städten — kein Bundesdurchschnitt — mit Preisverlauf.',
      categories: [
        { name: 'Kraftstoff & Reisen', copy: 'Kraftstoffkosten, Reisen und E-Auto-Laden' },
        { name: 'Reifen & Felgen', copy: 'Reifengrößen, Einpresstiefe und Geometrie' },
        { name: 'Umrechner', copy: 'Druck, Verbrauch, Leistung und Drehmoment' },
        { name: 'Performance', copy: 'Leistungsgewicht und Übersetzung' },
      ],
    },
    toolsHub: { title: 'Kfz-Werkzeuge', description: 'Entdecken Sie schnelle Kfz-Werkzeuge für Kraftstoffkosten, Reisen, Reifen, Felgen, Luftdruck, Leistung, Drehmoment und Passform.', h1: 'Kfz-Werkzeuge', lead: 'Wählen Sie eine Aufgabe und erhalten Sie eine klare Antwort.', fitmentRowTitle: 'Felgen- & Reifenvergleich', fitmentRowCopy: 'Erweiterter Setup-Vergleich und Geometrie' },
    methodology: {
      title: 'Genauigkeit & Methodik',
      description: 'Wie die Kfz-Rechner von Atlas GarageOS funktionieren, welche Formeln und Annahmen sie verwenden und wo berechnete Ergebnisse enden.',
      eyebrow: 'Transparenz zuerst',
      h1: 'Genauigkeit & Methodik',
      lead: 'Atlas trennt exakte Einheitenumrechnung, nominale Geometrie, benutzerdefinierte Schätzungen und reale Unsicherheit, statt jedes Ergebnis zu einem falschen Urteil zu machen.',
      sections: [
        { heading: 'Was in Ihrem Browser läuft', body: 'Rechnereingaben werden auf dem Gerät verarbeitet. Kernberechnungen sind deterministische Funktionen: dieselben gültigen Eingaben ergeben dasselbe Ergebnis, ohne Atlas-Konto oder Anwendungsserver.' },
        { heading: 'Reifengeometrie', body: 'Metrische Reifenmaße nutzen nominale Flankengeometrie: Flankenhöhe = Querschnittsbreite × Querschnittsverhältnis; Gesamtdurchmesser = Felgendurchmesser in Millimetern + zwei Flanken; Umfang = π × Durchmesser. Real montierte Reifen variieren je nach Produkt, Felgenbreite, Luftdruck, Last, Verschleiß und Fertigungstoleranz.' },
        { heading: 'Felgenbreite & Einpresstiefe', body: 'Radpositions-Werkzeuge vergleichen die Änderung der halben Breite und der Einpresstiefe, um Innenkanten- und Außen-Poke-Bewegung zu berechnen. Sie beschreiben nur statische Radgeometrie — keine Bremsenform, Reifenausbeulung, Federweg, Lenkeinschlag, Achsvermessung oder Karosseriefreigang.' },
        { heading: 'Kraftstoff- & Reiseschätzungen', body: 'Kraftstoff-Werkzeuge nutzen die von Ihnen eingegebene Distanz, Effizienz, Preis, Fahrtrichtung, Personenzahl und Extras. Sie sagen keinen Verkehr, kein Wetter, keinen Fahrstil, keine Preisänderungen und keinen zukünftigen Verbrauch eines bestimmten Fahrzeugs voraus.' },
        { heading: 'Einheitenumrechnungen', body: 'Druck-, Leistungs-, Drehmoment-, Distanz- und Verbrauchsumrechnungen verwenden explizite Einheitenstandards. MPG-Berechnungen halten US- und Imperial-Gallonen getrennt, da es unterschiedliche Volumina sind.' },
        { heading: 'E-Auto-Laden', body: 'Energie- und Kostenberechnungen enthalten den von Ihnen eingegebenen Effizienzwert. Die Ladezeit ist eine idealisierte Schätzung mit konstanter Leistung; das reale Laden kann durch Fahrzeug, Ladegerät, Akkutemperatur, Ladestand und Ladekurve begrenzt sein.' },
        { heading: 'Passform-Status', body: 'Atlas behandelt einen nicht-negativen statischen Freigang nicht als Beweis für Fahrzeugkompatibilität. Ohne Benutzerziel sollte die Geometrie neutral bleiben statt zu einem grünen Sicherheitsurteil zu werden.' },
        { heading: 'So nutzen Sie Atlas', body: 'Nutzen Sie die Rechner, um Richtung, Größenordnung und Zusammenhänge zu verstehen, bevor Sie entscheiden. Für alles Sicherheitsrelevante, Rechtliche, Lastbezogene oder Fahrzeugspezifische prüfen Sie das Fahrzeughandbuch, die Herstellerdokumentation und eine Fachkraft.' },
      ],
      sourcesEyebrow: 'Referenzstandards',
      sourcesHeading: 'Nützliche externe Referenzen',
      sourcesLead: 'Atlas hält seine Formeln transparent und nutzt, wo praktikabel, primäre oder normorientierte Referenzen.',
    },
    privacy: {
      title: 'Datenschutz',
      description: 'Wie Atlas GarageOS mit Rechnereingaben und lokal gespeicherten Fahrzeugdaten umgeht.',
      h1: 'Datenschutzerklärung',
      updated: 'Zuletzt aktualisiert: September 2026.',
      sections: [
        { heading: 'Rechnereingaben', body: 'Für die Nutzung der Rechner ist kein Konto, kein Login und keine E-Mail-Adresse erforderlich. Die von Ihnen eingegebenen Werte werden in Ihrem Browser verarbeitet, um ein Ergebnis zu erzeugen, und nicht an einen Atlas-GarageOS-Anwendungsserver übermittelt.' },
        { heading: 'Gespeicherte Daten (Meine Garage)', body: 'Fahrzeuge, Messungen und Setups, die in „Meine Garage" gespeichert werden, liegen im lokalen Speicher Ihres Browsers auf diesem Gerät. Das Löschen von Browserdaten kann sie entfernen.' },
        { heading: 'Hosting und grundlegende Anfragedaten', body: 'Die Website wird über Cloudflare bereitgestellt. Wie andere Hosting-Anbieter kann Cloudflare Standard-Anfrageinformationen wie IP-Adresse, angeforderte URL, Browserinformationen und Sicherheitssignale verarbeiten, um die Website bereitzustellen und zu schützen.' },
        { heading: 'Cookies und Werbung', body: 'Atlas GarageOS verwendet derzeit keine Werbe-Cookies und verkauft keine personenbezogenen Daten. Dieser Hinweis wird aktualisiert, bevor Werbung oder zusätzliche Tracking-Technologie eingeführt wird.' },
        { heading: 'Allgemeine Zielgruppe', body: 'Atlas GarageOS ist ein Kfz-Werkzeug für ein allgemeines Publikum und richtet sich nicht an Kinder unter 13 Jahren.' },
      ],
    },
    contact: {
      title: 'Kontakt',
      description: 'Erreichen Sie das Atlas-GarageOS-Team — allgemeine Fragen, Datenkorrekturen, technische Probleme oder Kooperationen.',
      h1: 'Kontaktieren Sie Atlas GarageOS',
      lead: 'Haben Sie eine Frage, einen fehlerhaften Daten- oder Passform-Eintrag gefunden oder möchten geschäftlich sprechen? Schreiben Sie uns — wir melden uns.',
      formTitle: 'Nachricht senden',
      nameLabel: 'Vollständiger Name',
      namePlaceholder: 'Max Mustermann',
      emailLabel: 'Ihre E-Mail-Adresse',
      emailPlaceholder: 'sie@beispiel.de',
      subjectLabel: 'Betreff',
      subjectOptions: [
        { value: 'general', label: 'Allgemeine Frage' },
        { value: 'correction', label: 'Fehlerhaften Daten- oder Passform-Eintrag melden' },
        { value: 'bug', label: 'Technisches Problem / Fehlerbericht' },
        { value: 'partnership', label: 'Geschäft & Kooperationen' },
        { value: 'press', label: 'Presse' },
        { value: 'other', label: 'Sonstiges' },
      ],
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Beschreiben Sie Ihr Anliegen...',
      submitLabel: 'Nachricht senden',
      openingNote: 'Dadurch öffnet sich Ihr E-Mail-Programm mit der fertigen Nachricht.',
      directLabel: 'Oder schreiben Sie uns direkt:',
      copyLabel: 'Kopieren',
      copiedLabel: 'Kopiert',
    },
  },
  es: {
    home: {
      title: 'Calculadoras de Coche y Herramientas Automotrices',
      description: 'Calculadoras de coche rápidas y precisas para neumáticos, combustible, viajes, presión, potencia, par motor y ajuste.',
      kicker: 'HERRAMIENTAS DE TALLER PARA CONDUCTORES REALES',
      h1: 'Herramientas más inteligentes para cada trayecto.',
      lead: 'Calcule el ajuste de neumáticos, el offset de llanta, el coste de combustible, los viajes por carretera y la carga de VE con respuestas claras pensadas para el uso real del vehículo.',
      ctaExplore: 'Explorar herramientas',
      ctaCompare: 'Comparar ajuste',
      capTires: 'Neumáticos y llantas',
      capFuel: 'Combustible y viajes',
      capEv: 'Herramientas VE',
      capPerformance: 'Rendimiento',
      findToolLabel: 'BUSCAR UNA HERRAMIENTA',
      findToolQuestion: '¿Qué quiere calcular?',
      searchPlaceholder: 'Tamaño de neumático, coste de combustible, offset...',
      searchButton: 'Buscar',
      popularLabel: 'HERRAMIENTAS POPULARES',
      popularHeading: 'Empiece por una tarea',
      seeAll: 'Ver todas',
      fitmentBadge: 'HERRAMIENTA VISUAL AVANZADA',
      fitmentTitle: 'Comparador de Llantas y Neumáticos',
      fitmentCopy: 'Vea cómo una nueva configuración cambia el diámetro, la posición interior y la sobresalida exterior antes de comprar.',
      fuelBadge: 'MEDIA NACIONAL OFICIAL',
      fuelTitle: 'Precio de la gasolina hoy',
      fuelCopy: 'Precio medio actual de la gasolina 95 y el diésel, actualizado automáticamente a partir de fuentes oficiales, con histórico de precios.',
      categories: [
        { name: 'Combustible y Viajes', copy: 'Coste de combustible, viajes y carga de VE' },
        { name: 'Neumáticos y Llantas', copy: 'Tamaños de neumático, offset y geometría' },
        { name: 'Conversores', copy: 'Presión, consumo, potencia y par' },
        { name: 'Rendimiento', copy: 'Relación peso-potencia y transmisión' },
      ],
    },
    toolsHub: { title: 'Herramientas para Automóviles', description: 'Explore herramientas rápidas para coches: coste de combustible, viajes, neumáticos, llantas, presión, potencia, par y ajuste.', h1: 'Herramientas para automóviles', lead: 'Elija una tarea y obtenga una respuesta clara.', fitmentRowTitle: 'Comparador de Llantas y Neumáticos', fitmentRowCopy: 'Comparación avanzada de configuraciones y geometría' },
    methodology: {
      title: 'Precisión y Metodología',
      description: 'Cómo funcionan las calculadoras de Atlas GarageOS, qué fórmulas y suposiciones usan, y dónde terminan los resultados calculados.',
      eyebrow: 'La transparencia primero',
      h1: 'Precisión y metodología',
      lead: 'Atlas separa la conversión exacta de unidades, la geometría nominal, las estimaciones introducidas por el usuario y la incertidumbre del mundo real, en lugar de convertir cada resultado en un veredicto falso.',
      sections: [
        { heading: 'Qué se ejecuta en su navegador', body: 'Las entradas de la calculadora se procesan en el dispositivo. Los cálculos principales son funciones deterministas: las mismas entradas válidas producen el mismo resultado, sin cuenta de Atlas ni servidor de aplicación.' },
        { heading: 'Geometría del neumático', body: 'Las dimensiones métricas del neumático usan geometría nominal del flanco: altura de flanco = ancho de sección × relación de aspecto; diámetro total = diámetro de llanta en milímetros + dos flancos; circunferencia = π × diámetro. Los neumáticos montados reales varían según el producto, el ancho de llanta, la presión, la carga, el desgaste y la tolerancia de fabricación.' },
        { heading: 'Ancho de llanta y offset', body: 'Las herramientas de posición de rueda comparan el cambio de medio ancho y el cambio de offset para calcular el movimiento del borde interior y la sobresalida exterior. Solo describen geometría estática de la rueda — no la forma de los frenos, el abombamiento del neumático, el recorrido de la suspensión, el ángulo de dirección, la alineación ni la holgura de carrocería.' },
        { heading: 'Estimaciones de combustible y viaje', body: 'Las herramientas de combustible usan la distancia, la eficiencia, el precio, la dirección del viaje, el número de pasajeros y los extras que usted introduce. No predicen el tráfico, el clima, el estilo de conducción, los cambios de precio del combustible ni el consumo futuro de un vehículo concreto.' },
        { heading: 'Conversiones de unidades', body: 'Las conversiones de presión, potencia, par, distancia y consumo usan estándares de unidad explícitos. Los cálculos de MPG mantienen separados los galones estadounidense e imperial porque son volúmenes distintos.' },
        { heading: 'Carga de VE', body: 'Los cálculos de energía y coste incluyen el valor de eficiencia que usted introduce. El tiempo de carga es una estimación idealizada a potencia constante; la carga real puede estar limitada por el vehículo, el cargador, la temperatura de la batería, el estado de carga y la curva de carga.' },
        { heading: 'Estado de ajuste', body: 'Atlas no trata una holgura estática no negativa como prueba de compatibilidad del vehículo. Sin un objetivo del usuario, la geometría debe permanecer neutral en lugar de convertirse en un veredicto verde de seguridad vial.' },
        { heading: 'Cómo usar Atlas', body: 'Use las calculadoras para entender dirección, magnitud y relaciones antes de decidir. Para cualquier cosa crítica de seguridad, legal, relacionada con la carga o específica del vehículo, verifique con el manual del vehículo, la documentación del fabricante del componente y un profesional cualificado.' },
      ],
      sourcesEyebrow: 'Estándares de referencia',
      sourcesHeading: 'Referencias externas útiles',
      sourcesLead: 'Atlas mantiene sus fórmulas explícitas y usa referencias primarias o basadas en estándares cuando es posible.',
    },
    privacy: {
      title: 'Política de Privacidad',
      description: 'Cómo maneja Atlas GarageOS las entradas de la calculadora y los datos de vehículos guardados localmente.',
      h1: 'Política de privacidad',
      updated: 'Última actualización: septiembre de 2026.',
      sections: [
        { heading: 'Entradas de la calculadora', body: 'No se requiere cuenta, inicio de sesión ni dirección de correo electrónico para usar las calculadoras. Los valores que introduce se procesan en su navegador para generar un resultado y no se envían a ningún servidor de aplicación de Atlas GarageOS.' },
        { heading: 'Datos guardados (Mi Garaje)', body: 'Los vehículos, medidas y configuraciones guardados en Mi Garaje se almacenan en el almacenamiento local de su navegador en ese dispositivo. Borrar los datos del navegador puede eliminarlos.' },
        { heading: 'Alojamiento y datos básicos de solicitud', body: 'El sitio se sirve a través de Cloudflare. Como otros proveedores de alojamiento, Cloudflare puede procesar información estándar de solicitud, como la dirección IP, la URL solicitada, información del navegador y señales de seguridad, para entregar y proteger el sitio.' },
        { heading: 'Cookies y publicidad', body: 'Atlas GarageOS actualmente no usa cookies publicitarias ni vende datos personales. Este aviso se actualizará antes de introducir publicidad o tecnología de seguimiento adicional.' },
        { heading: 'Público general', body: 'Atlas GarageOS es una utilidad de automoción para público general y no está dirigida a menores de 13 años.' },
      ],
    },
    contact: {
      title: 'Contacto',
      description: 'Contacta con el equipo de Atlas GarageOS — preguntas generales, correcciones de datos, problemas técnicos o colaboraciones.',
      h1: 'Contacta con Atlas GarageOS',
      lead: '¿Tienes una pregunta, encontraste un dato o ajuste incorrecto, o quieres hablar de negocios? Escríbenos y te responderemos.',
      formTitle: 'Envíanos un mensaje',
      nameLabel: 'Nombre completo',
      namePlaceholder: 'Juan Pérez',
      emailLabel: 'Tu correo electrónico',
      emailPlaceholder: 'tu@ejemplo.com',
      subjectLabel: 'Asunto',
      subjectOptions: [
        { value: 'general', label: 'Pregunta general' },
        { value: 'correction', label: 'Reportar un dato o ajuste incorrecto' },
        { value: 'bug', label: 'Problema técnico / error' },
        { value: 'partnership', label: 'Negocios y colaboraciones' },
        { value: 'press', label: 'Prensa' },
        { value: 'other', label: 'Otro' },
      ],
      messageLabel: 'Mensaje',
      messagePlaceholder: 'Cuéntanos qué sucede...',
      submitLabel: 'Enviar mensaje',
      openingNote: 'Esto abrirá tu aplicación de correo con el mensaje listo para enviar.',
      directLabel: 'O escríbenos directamente:',
      copyLabel: 'Copiar',
      copiedLabel: 'Copiado',
    },
  },
});

export function localizedToolCatalog(locale: ContentLocale): Readonly<Record<ToolId, ToolCatalogEntry>> {
  return locale === 'de' ? deToolCatalog : esToolCatalog;
}

export function localizedTool(id: ToolId, locale: ContentLocale): ToolCatalogEntry {
  return localizedToolCatalog(locale)[id];
}

export type { ToolCatalogEntry };
