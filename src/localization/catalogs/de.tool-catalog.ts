import type { ToolId } from '../../seo/tool-registry';

export interface ExplanationSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface ToolCatalogFaqEntry {
  readonly question: string;
  readonly answer: string;
}

export interface ToolCatalogEntry {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly eyebrow: string;
  readonly intro: string;
  readonly limitation: string;
  readonly studioCta?: string;
  readonly explanation: readonly ExplanationSection[];
  readonly facts: readonly { readonly title: string; readonly body: string }[];
  readonly commonMistake?: string;
  readonly warning?: string;
  readonly faqs?: readonly ToolCatalogFaqEntry[];
}

export const deToolCatalog: Readonly<Record<ToolId, ToolCatalogEntry>> = Object.freeze({
  'fitment-studio': {
    title: 'Felgen- & Reifenvergleich',
    description: 'Vergleichen Sie aktuelle und geplante Felgen- und Reifenkombinationen, visualisieren Sie Geometrieänderungen und ergänzen Sie optional gemessene Freigänge.',
    category: 'Reifen & Felgen',
    eyebrow: 'Erweiterter Passform-Vergleich',
    intro: 'Vergleichen Sie zwei Rad-/Reifen-Setups visuell und mit gemessenen Freigängen.',
    limitation: 'Reiner Geometrievergleich. Das Ergebnis ist kein Sicherheits-, Freigang- oder Kompatibilitätsurteil.',
    explanation: [
      { heading: 'Wie der Vergleich funktioniert', paragraphs: ['Atlas vergleicht Felgenbreite, Einpresstiefe (ET) und Reifengröße zwischen zwei Setups und berechnet daraus die Verschiebung der Innen- und Außenkante gegenüber dem aktuellen Setup.'] },
    ],
    facts: [
      { title: 'Geometrie zuerst', body: 'Felgenbreite und Einpresstiefe bestimmen gemeinsam, wie weit sich die Felge nach innen und außen verschiebt.' },
      { title: 'Reifengröße zählt mit', body: 'Eine Felge kann rechnerisch passen, während der montierte Reifen trotzdem ein Fahrwerksteil oder die Karosserie berührt.' },
      { title: 'Messen Sie Ihr Fahrzeug', body: 'Reale Innen- und Außenfreigänge sind aussagekräftiger als ein pauschaler Sicherheitsabstand.' },
    ],
    commonMistake: 'Ein geometrisches Freigang-Ergebnis als Beweis dafür zu nehmen, dass ein Rad-/Reifen-Setup bei jedem Fahrzeug im realen Fahrbetrieb passt.',
    warning: 'Bremsenfreigang, Reifenform, Federwegverhalten, Achsgeometrie, Beladung und Karosserieteile fließen nicht in eine einfache statische Geometrieberechnung ein.',
  },
  'tire-size-calculator': {
    title: 'Reifengrößen-Rechner',
    description: 'Berechnen Sie Flankenhöhe, Durchmesser, Umfang und Umdrehungen aus einer metrischen Reifengröße.',
    category: 'Reifen & Felgen',
    eyebrow: 'Reifen & Felgen',
    intro: 'Geben Sie die drei Zahlen von einer metrischen Reifenflanke ein, um die physischen Maße und die Abrollstrecke zu berechnen.',
    limitation: 'Dies sind nominale geometrische Berechnungen. Reale Maße variieren je nach Reifenmodell, Felgenbreite, Luftdruck, Last und Herstellertoleranz.',
    studioCta: 'Felgen- & Reifenvergleich öffnen',
    explanation: [
      { heading: 'Wie die Geometrie berechnet wird', paragraphs: [
        'Die Flankenhöhe ergibt sich aus der Breite multipliziert mit dem Querschnittsverhältnis in Prozent. Zwei Flankenhöhen plus der von Zoll in Millimeter umgerechnete Felgendurchmesser ergeben den Gesamtdurchmesser.',
        'Durchmesser und Umfang beschreiben die Abrollgeometrie. Die Umdrehungszahl zeigt die theoretische Anzahl der Raddrehungen pro Kilometer oder Meile.',
      ] },
      { heading: 'Warum die Größe auf der Flanke wirklich wichtig ist', paragraphs: [
        'Der Gesamtdurchmesser eines Reifens bestimmt, wie weit Ihr Auto pro Raddrehung zurücklegt. Montieren Sie einen spürbar größeren oder kleineren Reifen, zeigt der Tacho plötzlich eine falsche Geschwindigkeit an — den genauen Unterschied zeigt der Tachoabweichungs-Rechner. Dieselbe Durchmesseränderung verschiebt auch Ihre effektive Übersetzung, was der Übersetzungsrechner direkt darstellt.',
      ] },
    ],
    facts: [
      { title: 'Die mittlere Zahl ist ein Verhältnis', body: 'Bei 225/45R18 ist die Flankenhöhe 45 % der 225-mm-Nennbreite — nicht 45 mm.' },
      { title: 'Zwei Flanken zählen', body: 'Der Gesamtdurchmesser umfasst die Felge plus eine Flanke oberhalb und eine unterhalb der Felge.' },
      { title: 'Reale Reifen weichen ab', body: 'Die Nenngröße ist eine Normangabe. Die tatsächlich gemessenen Maße variieren je nach Modell, Felgenbreite, Luftdruck, Last und Fertigungstoleranz.' },
    ],
    commonMistake: 'Die Querschnittszahl als Millimeterangabe zu lesen. Sie ist ein Prozentsatz der Reifennennbreite.',
    faqs: [
      { question: 'Was bedeuten die Zahlen bei einer Reifengröße wie 225/45R18?', answer: '225 ist die Nennbreite in Millimetern, 45 ist das Querschnittsverhältnis (Flankenhöhe als Prozentsatz dieser Breite), R steht für Radialbauweise, und 18 ist der Felgendurchmesser in Zoll.' },
      { question: 'Kann ich eine andere Reifengröße montieren?', answer: 'Viele Fahrzeuge vertragen eine leicht abweichende Größe, solange der Gesamtdurchmesser nah am Original bleibt — meist innerhalb von etwa 3 % —, damit Tacho, ABS und Übersetzung genau bleiben. Prüfen Sie dies immer im Fahrzeughandbuch, bevor Sie kaufen.' },
      { question: 'Warum weicht mein berechneter Durchmesser von der Messung im Reifenfachbetrieb ab?', answer: 'Dieser Rechner nutzt die auf der Flanke aufgedruckte Nenngröße. Reale Reifen variieren leicht je nach Hersteller, Profilverschleiß und Luftdruck, daher ist eine kleine Abweichung von einer physischen Messung normal.' },
    ],
  },
  'tire-size-comparison': {
    title: 'Reifengrößen-Vergleich',
    description: 'Vergleichen Sie zwei Reifengrößen mit transparenter Darstellung von Durchmesser, Flankenhöhe, Umfang und Tachoabweichung.',
    category: 'Reifen & Felgen',
    eyebrow: 'Reifen & Felgen',
    intro: 'Vergleichen Sie eine ursprüngliche und eine neue metrische Reifengröße ohne versteckte Passform-Schwellenwerte.',
    limitation: 'Dieser Vergleich beschreibt nur die nominale Reifengeometrie. Er prüft keinen Felgenfreigang, keine Fahrzeugkompatibilität, Tragfähigkeit oder Straßenzulassung.',
    studioCta: 'Rad- & Reifengeometrie vergleichen',
    explanation: [
      { heading: 'Was sich zwischen den Größen ändert', paragraphs: [
        'Positive Differenzen bei Durchmesser und Umfang bedeuten, dass der neue Reifen größer ist. Die Änderung der Bodenfreiheit entspricht der Hälfte der Durchmesseränderung. Der Tacho-Prozentsatz zeigt die theoretische Änderung bei gleicher Raddrehzahl.',
        'Kein Prozentwert wird automatisch als Kompatibilitäts- oder Sicherheitsgrenze behandelt.',
      ] },
    ],
    facts: [
      { title: 'Breite und Durchmesser sind unterschiedlich', body: 'Ein breiterer Reifen kann trotzdem einen fast gleichen — oder sogar kleineren — Gesamtdurchmesser haben.' },
      { title: 'Die Höhenänderung ist die Hälfte der Durchmesseränderung', body: 'Nur der Radius liegt zwischen Nabe und Fahrbahn, daher erhöht ein 10-mm-Durchmesserzuwachs die statische Bodenfreiheit um etwa 5 mm.' },
      { title: 'Die Geschwindigkeit folgt dem Abrolldurchmesser', body: 'Bleibt die Kalibrierung unverändert, führt ein größerer Abrolldurchmesser dazu, dass die tatsächliche Geschwindigkeit höher ist als die angezeigte.' },
    ],
    commonMistake: 'Anzunehmen, ein breiterer Reifen sei automatisch höher, sicherer oder bei Nässe besser. Die Breite allein beantwortet das nicht.',
    warning: 'Dies ist nominale Geometrie, kein Nass-/Trockengriff- oder Passform-Urteil. Profildesign, Mischung, Luftdruck, Last, Felgenbreite und Fahrzeugabstimmung spielen ebenfalls eine Rolle.',
    faqs: [
      { question: 'Welcher Unterschied gilt beim Vergleich zweier Reifengrößen als unbedenklich?', answer: 'Eine gängige Faustregel ist, den Gesamtdurchmesser-Unterschied innerhalb von etwa 3 % zu halten, was die Auswirkung auf Tacho, ABS und Übersetzung begrenzt. Dies ist eine geometrische Orientierung, keine gesetzliche oder Herstellervorgabe.' },
      { question: 'Bedeutet ein breiterer Reifen automatisch mehr Grip?', answer: 'Nicht zwangsläufig. Die Breite allein bestimmt nicht den Grip — Profilmischung, Profildesign, Luftdruck, Last und die Felgenbreite, auf der der Reifen montiert ist, spielen mindestens ebenso eine Rolle.' },
      { question: 'Beeinflusst eine andere Reifengröße den Kraftstoffverbrauch?', answer: 'Ein größerer oder schwererer Reifen kann den Rollwiderstand erhöhen und den Verbrauch leicht steigern, aber dieser Rechner gibt nur geometrische Unterschiede aus, keine Effizienzwerte.' },
    ],
  },
  'wheel-offset-calculator': {
    title: 'Einpresstiefen-Rechner (ET)',
    description: 'Vergleichen Sie Felgenbreite und Einpresstiefe, um Änderungen an Innen- und Außenposition zu berechnen.',
    category: 'Reifen & Felgen',
    eyebrow: 'Passform-Geometrie',
    intro: 'Vergleichen Sie Felgenbreite und Einpresstiefe, um zu sehen, wie sich Innenkante und Außenfläche gegenüber der Ursprungsfelge verschieben.',
    limitation: 'Positionsänderungen sind geometrisch. Der tatsächliche Freigang hängt von Fahrzeug, Reifenform, Fahrwerk, Bremsen, Karosserie, Achsgeometrie und Einsatzbedingungen ab.',
    studioCta: 'Realen Freigang messen',
    explanation: [
      { heading: 'Zwei Richtungen, ein transparenter Vergleich', paragraphs: [
        'Eine positive Innenpositions-Änderung bedeutet, dass sich die neue Innenkante der Felge weiter nach innen verschiebt. Eine positive Außenpositions-Änderung (Poke) bedeutet, dass sich die Außenkante weiter nach außen verschiebt.',
        'Nutzen Sie „Mein Auto vermessen", bevor Sie eine der beiden Zahlen als verfügbaren Freigang interpretieren.',
      ] },
    ],
    facts: [
      { title: 'ET ist nicht alles', body: 'Eine Änderung der Felgenbreite verändert sowohl Innen- als auch Außenposition, auch wenn die ET gleich bleibt.' },
      { title: 'Niedrigere ET bewegt meist nach außen', body: 'Bei gleicher Felgenbreite verschiebt eine Verringerung der positiven Einpresstiefe die Felge meist weiter Richtung Kotflügel.' },
      { title: 'Der Innenfreigang kann unbemerkt kleiner werden', body: 'Eine breitere Felge kann optisch mehr Präsenz gewinnen, während sich ihre Innenkante gleichzeitig Fahrwerksteilen nähert.' },
    ],
    commonMistake: 'ET-Werte zu vergleichen, ohne die Felgenbreiten zu vergleichen. Eine 8J ET35 und eine 9J ET35 sitzen nicht an derselben Stelle.',
    warning: 'Die Radposition allein beweist keinen Brems-, Reifen-, Fahrwerks- oder Kotflügelfreigang an einem bestimmten Fahrzeug.',
    faqs: [
      { question: 'Was bedeutet die Einpresstiefe (ET) genau?', answer: 'ET ist der Abstand in Millimetern zwischen der Anlagefläche der Felge und ihrer wahren Mittellinie. Eine höhere positive ET zieht die Felge weiter nach innen; eine niedrigere oder negative ET drückt sie weiter nach außen.' },
      { question: 'Führt eine niedrigere ET immer zu Reiben?', answer: 'Nicht von allein — es hängt von Felgenbreite, Reifengröße, Federweg und Lenkeinschlag ab. Dieser Rechner zeigt nur die Positionsänderung; er kann den realen Freigang ohne Messung nicht bestätigen.' },
      { question: 'Kann ich zwei unterschiedliche Felgenbreiten gleichzeitig vergleichen?', answer: 'Ja — eine Änderung der Felgenbreite verändert Innen- und Außenposition auch bei gleicher ET, daher berücksichtigt dieser Rechner Breite und Einpresstiefe gemeinsam statt nur die ET allein.' },
    ],
  },
  'speedometer-error-calculator': {
    title: 'Tachoabweichungs-Rechner',
    description: 'Vergleichen Sie den ursprünglichen und den neuen Reifendurchmesser, um die tatsächliche Geschwindigkeit bei einer gewählten angezeigten Geschwindigkeit zu schätzen.',
    category: 'Reifen & Felgen',
    eyebrow: 'Reifen-Abrollgeometrie',
    intro: 'Schätzen Sie die tatsächliche Geschwindigkeit nach einer Reifendurchmesseränderung bei jeder angezeigten Geschwindigkeit, in km/h oder mph.',
    limitation: 'Dies ist ein theoretisches Reifengeometrie-Ergebnis. Fahrzeugkalibrierung, Reifenverschleiß, Luftdruck, Last und reale Reifenmaße können die beobachtete Geschwindigkeit verändern.',
    studioCta: 'Felgen- & Reifenvergleich öffnen',
    explanation: [
      { heading: 'Warum sich die Anzeige ändert', paragraphs: [
        'Ein größerer Reifen legt pro Raddrehung eine weitere Strecke zurück, daher ist die tatsächliche Geschwindigkeit höher als die angezeigte, wenn die Kalibrierung unverändert bleibt. Ein kleinerer Reifen bewirkt das Gegenteil.',
        'Die gewählte Geschwindigkeitseinheit ändert nur die Darstellung; die Reifenberechnung erfolgt weiterhin in kanonischer metrischer Geometrie.',
      ] },
    ],
    facts: [
      { title: 'Die Abweichung kommt vom Abrolldurchmesser', body: 'Der Rechner vergleicht Reifenumfänge, nicht die Tacho-Elektronik selbst.' },
      { title: 'Der Prozentsatz skaliert mit der Geschwindigkeit', body: 'Ein 2%iger Geometrieunterschied entspricht etwa 2 km/h bei 100 km/h.' },
      { title: 'Der reale Abrollradius ändert sich', body: 'Verschleiß, Luftdruck, Temperatur, Last und Reifenaufbau können das reale Ergebnis von der Nenngeometrie abweichen lassen.' },
    ],
    commonMistake: 'Den berechneten Wert als Kalibrierungszertifikat zu behandeln. Es ist eine Geometrieschätzung auf Basis der Nennreifenmaße.',
    faqs: [
      { question: 'Warum zeigt mein Tacho nach einer Reifengrößenänderung falsch an?', answer: 'Der Tacho ist auf eine bestimmte Raddrehzahl kalibriert. Ein größerer Reifen legt pro Umdrehung eine weitere Strecke zurück, daher fährt das Auto tatsächlich schneller als angezeigt; ein kleinerer Reifen bewirkt das Gegenteil.' },
      { question: 'Ist das derselbe Fehler, den ABS oder Traktionskontrolle sehen?', answer: 'Es ist dieselbe zugrunde liegende Abrolldurchmesser-Änderung, aber dieser Rechner schätzt nur die Tachoanzeige — er bildet nicht ab, wie die ABS- oder Traktionskontroll-Software eines bestimmten Fahrzeugs reagiert.' },
      { question: 'Kann ich damit eine exakte Tachokorrektur ermitteln?', answer: 'Nur als Schätzung. Der reale Abrolldurchmesser wird durch Reifenverschleiß, Luftdruck, Last und Fertigungstoleranz beeinflusst — betrachten Sie dies als Ausgangspunkt, nicht als zertifizierten Kalibrierungswert.' },
    ],
  },
  'gear-ratio-calculator': {
    title: 'Übersetzungsrechner',
    description: 'Vergleichen Sie die effektive Achsübersetzung nach einer Reifendurchmesseränderung und erkunden Sie eine transparente Drehzahl-Matrix.',
    category: 'Performance',
    eyebrow: 'Antriebsstrang-Geometrie',
    intro: 'Sehen Sie, wie eine Reifendurchmesseränderung die effektive Achsübersetzung verändert, und scannen Sie die Drehzahl über gängige Reifen-/Übersetzungskombinationen.',
    limitation: 'Die Drehzahl verwendet eine direkte 1,00:1-Getriebeübersetzung ohne Wandlerschlupf. Dies ist ein transparenter Vergleich, keine Übersetzungsempfehlung.',
    explanation: [
      { heading: 'Zwei Antworten statt einer vagen Zahl', paragraphs: [
        'Die effektive Übersetzung beschreibt, wie sich die verbaute Achsübersetzung nach dem Reifenwechsel verhält. Ein höherer Reifen senkt diese effektive Zahl.',
        'Die passende Achsübersetzung schätzt das numerische Verhältnis, das die ursprüngliche Reifen-Achs-Beziehung wiederherstellt. Getriebeübersetzung und reale Motordrehzahl können weiterhin abweichen.',
      ] },
    ],
    facts: [
      { title: 'Höhere Reifen wirken wie eine längere Übersetzung', body: 'Ein größerer Reifendurchmesser senkt die Motordrehzahl bei gleicher Fahrgeschwindigkeit, wenn die Antriebsübersetzung unverändert bleibt.' },
      { title: 'Kleinere Reifen bewirken das Gegenteil', body: 'Ein kleinerer Abrolldurchmesser erhöht die Motordrehzahl bei gleicher Fahrgeschwindigkeit.' },
      { title: 'Dieses Modell geht von direktem Antrieb aus', body: 'Das Verhältnis von Fahrgeschwindigkeit zu Drehzahl muss die Getriebeübersetzung einbeziehen, wenn der gewählte Gang nicht 1:1 ist.' },
    ],
    commonMistake: 'Nur die Achsübersetzung zu verwenden und dabei die gewählte Getriebeübersetzung zu ignorieren.',
  },
  'fitment-map': {
    title: 'Passform-Karte',
    description: 'Verstehen Sie die Maße, Zustände und Bedienelemente zur Erkundung von Felgenbreiten- und Einpresstiefen-Kombinationen.',
    category: 'Reifen & Felgen',
    eyebrow: 'Erweiterte Passform-Geometrie',
    intro: 'Erkunden Sie ein begrenztes Raster aus Felgenbreiten und Einpresstiefen anhand der Messungen Ihres eigenen Fahrzeugs.',
    limitation: 'Kartenzustände beschreiben berechnete statische Geometrie aus gelieferten Messungen. GRÜN ist kein Straßensicherheits-, Kompatibilitäts-, Schleif- oder Rechtsurteil.',
    studioCta: 'Interaktive Passform-Karte öffnen',
    explanation: [
      { heading: 'Wie die Karte Geometrie einstuft', paragraphs: [
        'GRÜN bedeutet, die berechneten Freigänge sind nicht negativ und alle von Ihnen angegebenen Zielwerte werden erreicht. GELB bedeutet keine berechnete Überschneidung, aber mindestens ein angegebenes Ziel wird verfehlt. ROT bedeutet, ein berechneter Innen- oder Außenfreigang ist negativ.',
        'Jede ausgewählte Zelle zeigt die berechnete Innenverschiebung, den Außen-Poke, verbleibende Abstände und eine reine Geometrie-Erklärung.',
      ] },
    ],
    facts: [
      { title: 'Es ist eine Geometrie-Karte', body: 'Jede Zelle steht für eine Kombination aus Felgenbreite und Einpresstiefe relativ zur gemessenen Basislinie.' },
      { title: 'Zielwerte kommen von Ihnen', body: 'Atlas erfindet keinen universellen sicheren Freigang.' },
      { title: 'Neutral ist nicht schlecht', body: 'Ohne gelieferten Zielwert wird ein Ergebnis ohne Überschneidung als geprüfte Geometrie angezeigt, nicht als grünes Sicherheitsurteil.' },
    ],
    commonMistake: 'Einen grünen oder überschneidungsfreien Geometriezustand als Freigabe für den Straßeneinsatz zu lesen.',
    warning: 'Dynamisches Federverhalten, Lenkeinschlag, Bremsenform, Reifenverformung, Achsgeometrie und Karosseriebewegung werden von der statischen Karte nicht abgebildet.',
  },
  'measure-my-car': {
    title: 'Mein Auto vermessen',
    description: 'Erfassen und dokumentieren Sie reale Innen- und Außenfreigänge für transparente Passform-Projektionen.',
    category: 'Reifen & Felgen',
    eyebrow: 'Selbst gemessener Freigang',
    intro: 'Erfassen Sie die zwei physischen Abstände, die Atlas benötigt, um zu berechnen, wie sich eine andere Radposition auf den statischen Freigang auswirkt.',
    limitation: 'Messungen stellen einen beobachteten statischen Zustand dar. Federweg, Lenkeinschlag, Achsvermessung, Reifenform, Beladung und Karosserieabweichungen bleiben außerhalb dieser Berechnung.',
    studioCta: 'Geführte Messung starten',
    explanation: [
      { heading: 'Warum die Basislinie wichtig ist', paragraphs: [
        'Freigangmessungen werden zusammen mit dem exakten aktuellen Setup gespeichert, mit dem sie erfasst wurden. Neue Radpositionen werden von dieser Basislinie aus projiziert, nicht als universelle Fahrzeugspezifikation behandelt.',
        'Atlas kennzeichnet diese Werte als SELBST GEMESSEN und hält berechnete Projektionen sichtbar getrennt.',
      ] },
    ],
    facts: [
      { title: 'Messen Sie den kürzesten Abstand', body: 'Das begrenzende Bauteil ist wichtiger als ein bequemer Messpunkt.' },
      { title: 'Nutzen Sie das aktuelle Setup als Basislinie', body: 'Projizierte Änderungen sind nur so nützlich wie die zugehörigen Basismessungen.' },
      { title: 'Statischer Freigang ist nur ein Zustand', body: 'Lenk- und Federbewegung können den Freigang während der Fahrt verringern.' },
    ],
    commonMistake: 'Nur den am leichtesten sichtbaren Spalt zu messen statt des nächstgelegenen festen Fahrwerks- oder Karosserieteils.',
    warning: 'Arbeiten Sie niemals unter oder um ein angehobenes Fahrzeug ohne geeignete Abstützung und sicheren Messzugang.',
  },
  'fuel-cost-calculator': {
    title: 'Kraftstoffkosten-Rechner',
    description: 'Schätzen Sie den Kraftstoffbedarf, die Gesamtkosten und die Kosten pro Strecke in metrischen oder US-Einheiten.',
    category: 'Kraftstoff & Reisen',
    eyebrow: 'Kraftstoff & Reisen',
    intro: 'Schätzen Sie den Kraftstoffverbrauch und die Gesamtkosten aus Distanz, Verbrauch und lokalem Kraftstoffpreis.',
    limitation: 'Dies ist eine Schätzung. Fahrstil, Verkehr, Wetter, Beladung und tatsächlicher Fahrzeugverbrauch können das Ergebnis verändern.',
    explanation: [
      { heading: 'Eine Berechnung, zwei Einheitensysteme', paragraphs: [
        'Der metrische Modus verwendet Kilometer, Liter pro 100 Kilometer und Preis pro Liter. Der US-Modus verwendet Meilen, US-MPG und Preis pro US-Gallone.',
        'Die Währung ist nur eine Beschriftung. Atlas ruft keine Wechselkurse ab und ändert den eingegebenen Preis nicht.',
        'Der voreingestellte Kraftstoffpreis ist ein deutschlandweiter Tagesdurchschnitt aus einer öffentlichen Quelle, kein garantierter Preis an einer bestimmten Tankstelle. Ersetzen Sie ihn jederzeit durch den Preis, den Sie tatsächlich zahlen.',
      ] },
    ],
    facts: [
      { title: 'Der Verbrauch treibt die Schätzung an', body: 'Eine kleine Änderung bei L/100 km oder MPG kann die Gesamtkosten einer langen Fahrt spürbar verändern.' },
      { title: 'Nutzen Sie einen realistischen Durchschnitt', body: 'Stadtverkehr, Geschwindigkeit, Beladung, Wetter und Fahrstil machen einen Bordcomputer-Durchschnitt oft aussagekräftiger als ein Prospektwert.' },
      { title: 'Der Preis ist lokal', body: 'Der Rechner verwendet den von Ihnen eingegebenen Kraftstoffpreis und funktioniert daher über Währungen und Märkte hinweg.' },
    ],
    commonMistake: 'Einen optimistischen Herstellerverbrauchswert für eine Fahrt einzugeben, die unter ganz anderen Bedingungen stattfindet.',
  },
  'road-trip-cost-calculator': {
    title: 'Reisekosten-Rechner',
    description: 'Schätzen Sie einfache oder Hin- und Rückfahrtkosten, optionale Extras und die Kosten pro Person.',
    category: 'Kraftstoff & Reisen',
    eyebrow: 'Kraftstoff & Reisen',
    intro: 'Schätzen Sie die vollständigen Reisekosten aus Kraftstoff und optionalen Ausgaben, dann sehen Sie den Anteil pro Reisendem.',
    limitation: 'Reisekosten sind Schätzungen auf Basis Ihrer Eingaben. Der tatsächliche Verbrauch kann je nach Verkehr, Wetter, Beladung, Geschwindigkeit und Fahrstil variieren.',
    explanation: [
      { heading: 'Was diese Schätzung bedeutet', paragraphs: [
        'Das Distanzfeld ist eine einfache Strecke. Eine Hin- und Rückfahrt verdoppelt diese, bevor der Kraftstoff berechnet wird; die eingegebenen Extras werden einmal zur gesamten Reise addiert. Die Summe wird anschließend durch die Personenzahl geteilt, falls geteilt wird.',
        'Der metrische Modus verwendet km, L/100 km und Preis pro Liter; der US-Modus verwendet Meilen, US-MPG und Preis pro US-Gallone. Die Währung ist eine Beschriftung, keine Wechselkursumrechnung. Die Kosten pro Strecke enthalten die Extras.',
        'Der voreingestellte Kraftstoffpreis ist ein deutschlandweiter Tagesdurchschnitt aus einer öffentlichen Quelle, kein garantierter Preis an einer bestimmten Tankstelle. Ersetzen Sie ihn jederzeit durch den Preis, den Sie tatsächlich zahlen.',
      ] },
    ],
    facts: [
      { title: 'Hin- und Rückfahrten verdoppeln die Distanz', body: 'Atlas hält einfache Strecke und Hin-/Rückfahrt-Distanz getrennt sichtbar, damit die Kosten nicht versehentlich zu niedrig ausfallen.' },
      { title: 'Extras können dominieren', body: 'Mautgebühren, Parken, Fähren und andere Fixkosten können kleine Verbrauchsunterschiede deutlich übertreffen.' },
      { title: 'Kosten pro Person sind eine Aufteilung, keine Ersparnis', body: 'Zusätzliche Mitfahrer ändern den Anteil pro Person, nicht die Gesamtkosten der Fahrzeugfahrt.' },
    ],
    commonMistake: 'Zwei Fahrten nur anhand der Kraftstoffkosten zu vergleichen und dabei Maut, Parken oder eine andere Rückfahrtdistanz zu ignorieren.',
  },
  'ev-charging-cost-calculator': {
    title: 'E-Auto-Ladekosten-Rechner',
    description: 'Schätzen Sie Energie, Kosten und Zeit zum Laden eines Elektrofahrzeugs aus Akkugröße und Strompreis.',
    category: 'Kraftstoff & Reisen',
    eyebrow: 'Kraftstoff & Reisen',
    intro: 'Sehen Sie Energie, Kosten und Zeit zum Laden Ihres E-Autos — aus Ihrer eigenen Akkugröße und Ihrem Strompreis.',
    limitation: 'Diese Schätzung berücksichtigt die von Ihnen eingegebene Effizienz. Akkutemperatur, Ladekurven-Abflachung und die reale Ladekurve des Fahrzeugs können das Ergebnis weiterhin verändern.',
    explanation: [
      { heading: 'Warum die Zahl eine Schätzung ist, kein Versprechen', paragraphs: [
        'Die Ladeeffizienz berücksichtigt Energieverluste zwischen Steckdose und Akku. Eine Einstellung von 90 % bedeutet, dass 10 % der Netzenergie den Akku nicht erreichen.',
        'Die Zeitschätzung geht davon aus, dass die eingegebene Ladeleistung konstant bleibt. Das reale Laden kann langsamer sein, da Fahrzeug, Akkutemperatur, Ladestand und Ladekurve die Leistung begrenzen können.',
      ] },
    ],
    facts: [
      { title: 'Netzenergie ist höher als Akkuenergie', body: 'Ladeverluste bedeuten, dass die Steckdose meist mehr Energie liefert, als der Akku tatsächlich speichert.' },
      { title: 'Die Leistung ist nicht immer konstant', body: 'Die reale Ladeleistung kann mit steigendem Ladestand abnehmen, besonders beim DC-Schnellladen.' },
      { title: 'Heim- und öffentliche Preise können stark abweichen', body: 'Dieselbe Energiemenge kann je nach Tarif und Ladenetzwerk sehr unterschiedliche Kosten verursachen.' },
    ],
    commonMistake: 'Die Akkuenergie durch die Leistungsangabe des Ladegeräts zu teilen und das Ergebnis als exakte reale Ladezeit zu behandeln.',
    warning: 'Die angezeigte Zeit ist eine idealisierte Schätzung mit konstanter Leistung. Fahrzeuggrenzen, Ladegerätgrenzen, Temperatur, Batteriemanagement und Ladekurven können reale Ladevorgänge verlängern.',
  },
  'mpg-l100km-converter': {
    title: 'MPG-zu-L/100km-Umrechner',
    description: 'Rechnen Sie US-MPG, Imperial-MPG und L/100km um, mit klar unterschiedenen Gallonenstandards.',
    category: 'Umrechner',
    eyebrow: 'Umrechner',
    intro: 'Rechnen Sie US-MPG, Imperial-MPG und Liter pro 100 Kilometer um, ohne die beiden Gallonenstandards zu vermischen.',
    limitation: 'US- und Imperial-Gallonen haben unterschiedliche Volumina. Dieser Umrechner hält sie klar getrennt und behandelt die beiden MPG-Werte nie als austauschbar.',
    explanation: [
      { heading: 'Was die Umrechnung bedeutet', paragraphs: [
        'Eine Imperial-Gallone ist größer als eine US-Gallone. Derselbe L/100km-Verbrauch ergibt daher einen höheren Imperial-MPG-Wert.',
        'Niedrigeres L/100km bedeutet weniger verbrauchten Kraftstoff, höheres MPG bedeutet mehr Strecke pro Gallone. Dies ist eine Einheitenumrechnung, keine Aussage über reale Effizienz.',
      ] },
    ],
    facts: [
      { title: 'Die Skalen laufen in entgegengesetzte Richtungen', body: 'Höheres MPG ist besser, niedrigeres L/100 km ist besser.' },
      { title: 'US- und Imperial-Gallonen unterscheiden sich', body: 'Dieselbe MPG-Zahl bedeutet je nach verwendetem Gallonenstandard einen anderen Kraftstoffverbrauch.' },
      { title: 'Die Beziehung ist reziprok', body: 'MPG und L/100 km lassen sich nicht mit einem festen Faktor umrechnen, da eines Strecke pro Kraftstoff und das andere Kraftstoff pro Strecke misst.' },
    ],
    commonMistake: 'MPG umzurechnen, ohne anzugeben, ob der Wert US-Gallonen oder Imperial-Gallonen verwendet.',
  },
  'psi-bar-converter': {
    title: 'PSI-zu-Bar-Umrechner',
    description: 'Rechnen Sie Druck sofort zwischen PSI, Bar und Kilopascal um, ohne einen empfohlenen Reifendruck zu erfinden.',
    category: 'Umrechner',
    eyebrow: 'Umrechner',
    intro: 'Rechnen Sie Druck sofort zwischen PSI, Bar und Kilopascal um.',
    limitation: 'Dieses Tool rechnet nur Druckeinheiten um. Es empfiehlt keinen fahrzeugspezifischen Reifendruck — nutzen Sie die vom Fahrzeughersteller angegebene Spezifikation.',
    studioCta: 'Felgen- & Reifenvergleich öffnen',
    explanation: [
      { heading: 'Drei gängige Druckeinheiten', paragraphs: ['PSI steht für Pfund pro Quadratzoll. Bar und Kilopascal sind metrische Druckeinheiten, wobei genau 100 kPa einem Bar entsprechen.'] },
      { heading: 'Die Zahl, die Sie wirklich brauchen, steht nicht auf dem Reifen', paragraphs: ['Der auf der Reifenflanke aufgedruckte Druck ist die maximale Sicherheitsangabe des Reifens, nicht der empfohlene Druck Ihres Autos. Die richtige Zahl für Ihr Fahrzeug steht auf einem Aufkleber im Türrahmen der Fahrertür (oder im Handbuch) — dieser Umrechner überträgt diese Zahl nur zwischen Einheiten, sobald Sie sie haben. Wenn Sie zusätzlich eine andere Reifengröße vergleichen, zeigt der Reifengrößen-Rechner, wie sich die physischen Maße ändern.'] },
    ],
    facts: [
      { title: 'Umrechnung ist keine Empfehlung', body: '32 PSI und etwa 2,21 Bar beschreiben denselben Druck; keiner der beiden Werte sagt Ihnen, was Ihr Fahrzeug benötigt.' },
      { title: 'Der Kaltdruck zählt', body: 'Herstellerangaben auf dem Typschild beziehen sich normalerweise auf kalt gemessene Reifen.' },
      { title: 'Der Druck ändert sich mit der Temperatur', body: 'Ein warmer Reifen kann einen höheren Druck anzeigen, auch wenn keine Luft nachgefüllt wurde.' },
    ],
    commonMistake: 'Den auf der Reifenflanke aufgeprägten Maximaldruck als normalen empfohlenen Fahrzeugdruck zu verwenden.',
    warning: 'Verwenden Sie das Typschild des Fahrzeugs oder die Herstellerangabe für den empfohlenen Reifendruck. Dieses Tool rechnet nur Einheiten um.',
  },
  'hp-kw-converter': {
    title: 'PS-zu-kW-Umrechner',
    description: 'Rechnen Sie mechanische Pferdestärken und Kilowatt um, mit einem eindeutigen Leistungsstandard.',
    category: 'Umrechner',
    eyebrow: 'Umrechner',
    intro: 'Rechnen Sie mechanische Pferdestärken (hp) und Kilowatt sofort um, mit einem klar benannten Leistungsstandard.',
    limitation: 'Diese Seite verwendet mechanische Pferdestärken (hp). Die metrische PS-Angabe ist eine andere Einheit und wird nicht stillschweigend als hp behandelt.',
    explanation: [
      { heading: 'Mechanische hp, nicht PS', paragraphs: ['Eine mechanische Pferdestärke entspricht 745,6998715822702 Watt. Diese Unterscheidung hält Herstellerangaben und Berechnungen eindeutig.'] },
    ],
    facts: [
      { title: 'Leistungsstandards unterscheiden sich', body: 'Mechanische Pferdestärke und metrische Pferdestärke (PS) sind nicht exakt dieselbe Einheit.' },
      { title: 'kW ist eine SI-Leistungseinheit', body: 'Kilowatt drückt dieselbe physikalische Größe wie Pferdestärke in einer anderen Einheitenskala aus.' },
      { title: 'Umrechnung misst keine Leistung', body: 'Der Einheitenwechsel sagt nichts darüber aus, ob ein beworbener Motor diese Leistung tatsächlich erbringt.' },
    ],
    commonMistake: 'Mechanische hp und metrische PS so zu vermischen, als wären sie zahlenmäßig identisch.',
  },
  'nm-lb-ft-converter': {
    title: 'Nm-zu-lb-ft-Umrechner',
    description: 'Rechnen Sie Drehmoment sofort zwischen Newtonmetern und Pfund-Fuß um.',
    category: 'Umrechner',
    eyebrow: 'Umrechner',
    intro: 'Rechnen Sie Drehmoment sofort zwischen Newtonmetern (Nm) und Pfund-Fuß (lb-ft) um.',
    limitation: 'Dies ist eine Einheitenumrechnung, keine Motorleistungsschätzung. Es wird kein Drehmoment aus Leistung, Drehzahl oder Fahrzeugdaten abgeleitet.',
    explanation: [
      { heading: 'Zwei Ausdrucksformen für Drehmoment', paragraphs: ['Newtonmeter und Pfund-Fuß messen dieselbe physikalische Größe. Atlas rechnet über das exakte Pfund-Fuß-Verhältnis um, ohne das zugrunde liegende Ergebnis zu runden.'] },
    ],
    facts: [
      { title: 'Drehmoment ist ein Drehmoment', body: 'Nm und lb-ft beschreiben dieselbe physikalische Größe in unterschiedlichen Einheitensystemen.' },
      { title: 'Drehmoment ist keine Leistung', body: 'Leistung hängt von Drehmoment und Drehzahl ab, daher bedeuten gleiche Drehmomentwerte nicht gleiche Pferdestärken.' },
      { title: 'Die Einheitenreihenfolge zählt', body: 'Der übliche imperiale Ausdruck ist Pfund-Fuß (lb-ft), nicht Fuß-Pfund, für Motordrehmoment.' },
    ],
    commonMistake: 'Drehmomentwerte zu vergleichen, ohne die Einheit oder die Drehzahl zu prüfen, bei der das Drehmoment erzeugt wird.',
  },
  'power-to-weight-calculator': {
    title: 'Leistungsgewicht-Rechner',
    description: 'Vergleichen Sie Leistung und Fahrzeuggewicht als PS/Tonne, kW/Tonne und Watt/Kilogramm.',
    category: 'Performance',
    eyebrow: 'Performance',
    intro: 'Normieren Sie Fahrzeugleistung und -gewicht zu vergleichbaren Werten in PS/Tonne, kW/Tonne und W/kg.',
    limitation: 'Das Leistungsgewicht ist ein physikalisches Verhältnis, keine Leistungsbewertung. Die Beschleunigung hängt auch von Traktion, Übersetzung, Aerodynamik, Antriebsstrangverlusten und Bedingungen ab.',
    explanation: [
      { heading: 'Ein Verhältnis, dreifach normiert', paragraphs: ['Die Leistung wird auf Watt normiert, das Gewicht auf Kilogramm. Das Ergebnis wird anschließend als mechanische PS pro metrischer Tonne, Kilowatt pro Tonne und Watt pro Kilogramm ausgedrückt.'] },
    ],
    facts: [
      { title: 'Masse zählt genauso viel wie Leistung', body: 'Zwei Autos mit derselben PS-Zahl können sich sehr unterschiedlich anfühlen, wenn eines deutlich mehr Masse trägt.' },
      { title: 'Vergleichbare Gewichte verwenden', body: 'Leergewicht, Trockengewicht und Fahrzeug-plus-Fahrer-Gewicht sind unterschiedliche Bezugsgrößen.' },
      { title: 'Das Verhältnis ist keine Beschleunigung', body: 'Traktion, Übersetzung, Aerodynamik, Leistungskurve und Antriebsstrangverluste beeinflussen ebenfalls die reale Leistung.' },
    ],
    commonMistake: 'Ein Fahrzeug mit Leergewicht und ein anderes mit Trockengewicht oder einem Herstellerwert nach anderem Standard zu vergleichen.',
  },
  'bolt-pattern-calculator': {
    title: 'Lochkreis-Rechner (PCD)',
    description: 'Berechnen Sie den Lochkreisdurchmesser (PCD) einer Felge aus dem gemessenen Abstand zwischen zwei benachbarten Radbolzen.',
    category: 'Reifen & Felgen',
    eyebrow: 'Reifen & Felgen',
    intro: 'Berechnen Sie den Lochkreisdurchmesser (PCD) aus dem gemessenen Abstand zwischen zwei benachbarten Radbolzenlöchern.',
    limitation: 'Dies rechnet eine Messung in einen Lochkreisdurchmesser um. Es prüft keine Nabenbohrung, kein Bolzengewinde und keine Fahrzeugpassform.',
    studioCta: 'Passform im Felgen- & Reifenvergleich bestätigen',
    explanation: [
      { heading: 'Warum Sie nicht einfach gerade durchmessen können', paragraphs: [
        'Bei einer geraden Lochanzahl entspricht der Lochkreisdurchmesser dem Abstand zwischen zwei direkt gegenüberliegenden Löchern. Bei ungerader Lochanzahl — 5 Löcher sind der häufigste Fall — liegt kein Lochpaar direkt gegenüber, daher muss der Durchmesser stattdessen aus dem Winkel zwischen benachbarten Löchern berechnet werden.',
        'Die hier verwendete Formel ist die Standard-Lochkreis-Beziehung: PCD = Abstand ÷ sin(180° ÷ Lochanzahl), gemessen als gerade Strecke zwischen den Mittelpunkten zweier benachbarter Bolzenlöcher.',
      ] },
      { heading: 'Gängige Lochkreise zur Orientierung', paragraphs: ['4x100, 4x114,3, 5x100, 5x108, 5x112, 5x114,3, 5x120, 6x139,7 und 8x165,1 gehören zu den häufigsten Lochkreisen bei gängigen Pkw, SUVs und leichten Nutzfahrzeugen — bestätigen Sie aber immer den exakten Lochkreis Ihres konkreten Fahrzeugs, statt von der Fahrzeugklasse auszugehen.'] },
    ],
    facts: [
      { title: 'Der Lochkreis wird als Lochzahl×PCD geschrieben', body: 'Ein „5x114,3"-Lochkreis bedeutet 5 Radbolzenlöcher auf einem Lochkreisdurchmesser von 114,3 mm.' },
      { title: 'Loch-zu-Loch messen, nicht Rand-zu-Rand', body: 'Der Abstand zwischen zwei benachbarten Bolzenmittelpunkten ist das, was die Geometrieformel benötigt, nicht die äußere Felgenkante.' },
      { title: 'Ungerade Lochzahlen brauchen die Diagonalmethode', body: 'Bei 5-Loch-Felgen ist der Lochkreis keine gerade Messung über die Felge, weshalb dieser Rechner stattdessen die trigonometrische Beziehung nutzt.' },
    ],
    commonMistake: 'Den Abstand zwischen zwei Löchern zu messen, die sich bei einer 5-Loch-Felge direkt gegenüberliegen — das ist nicht der Lochkreisdurchmesser.',
    warning: 'Ein berechneter PCD ist nur ein Ausgangswert. Bestätigen Sie Lochkreis, Nabenbohrung und Bolzengewinde immer anhand der Felgen- und Fahrzeugspezifikation vor dem Kauf.',
    faqs: [
      { question: 'Wie messe ich den Lochkreis an einer 5-Loch-Felge?', answer: 'Messen Sie vom Mittelpunkt eines Bolzenlochs bis zum äußeren Rand des Lochs, das zwei Positionen entfernt liegt (nicht direkt gegenüber), und geben Sie diesen Abstand hier ein — der Rechner rechnet ihn über die 5-Loch-Geometrie in den echten Lochkreisdurchmesser um.' },
      { question: 'Kann ich eine Felge mit anderem Lochkreis als meine Nabe montieren?', answer: 'Nicht sicher ohne Adapter, und Adapter bringen eigene Risiken mit sich. Der Lochkreis (Lochzahl und PCD) muss zur Nabe passen, sonst lässt sich die Felge nicht korrekt montieren.' },
      { question: 'Ist der Lochkreis dasselbe wie die Nabenbohrung?', answer: 'Nein — der Lochkreis beschreibt, wo die Bolzenlöcher sitzen, während die Nabenbohrung der Mittelloch-Durchmesser ist, der die Felge auf der Nabe zentriert. Beide müssen passen oder separat adaptiert werden.' },
    ],
  },
  'tire-load-speed-rating': {
    title: 'Reifen-Tragfähigkeits- & Geschwindigkeitsindex',
    description: 'Ermitteln Sie die Tragfähigkeit und Höchstgeschwindigkeit hinter einem Reifen-Tragfähigkeitsindex und einem Geschwindigkeitsindex-Buchstaben.',
    category: 'Reifen & Felgen',
    eyebrow: 'Reifen & Felgen',
    intro: 'Ermitteln Sie die Tragfähigkeit und Höchstgeschwindigkeit hinter einem Reifen-Tragfähigkeitsindex und einem Geschwindigkeitsindex-Buchstaben.',
    limitation: 'Dies ist eine Standard-Nachschlagetabelle, keine fahrzeugspezifische Empfehlung. Erreichen oder übertreffen Sie immer die Werte auf dem Typschild Ihres Fahrzeugs.',
    explanation: [
      { heading: 'Wie man eine Reifengröße wie 225/45R18 91V liest', paragraphs: ['Die „91" ist der Tragfähigkeitsindex — ein Code für eine feste Tragfähigkeitstabelle, kein direktes Gewicht. Das „V" ist das Geschwindigkeitssymbol, das die Höchstgeschwindigkeit beschreibt, die der Reifen über einen längeren Zeitraum unter Last aushält, keine Geschwindigkeit, die Sie fahren sollten.'] },
      { heading: 'Warum die Übereinstimmung mit dem Typschild wichtig ist', paragraphs: ['Das Typschild im Türrahmen Ihres Fahrzeugs listet den Mindest-Tragfähigkeitsindex und Geschwindigkeitsindex, auf den es ausgelegt wurde. Ein Reifen mit niedrigerem Tragfähigkeitsindex verringert Ihre Sicherheitsmarge bei voller Last; ein niedrigerer Geschwindigkeitsindex kann das Fahrverhalten beeinträchtigen, auch wenn Sie diese Höchstgeschwindigkeit nie erreichen.'] },
    ],
    facts: [
      { title: 'Der Tragfähigkeitsindex ist ein Code, kein Gewicht', body: 'Die Zahl auf der Flanke verweist auf eine feste Tragfähigkeitstabelle — sie ist nicht das Gewicht in Kilogramm oder Pfund selbst.' },
      { title: 'Der Geschwindigkeitsindex ist ein Dauergeschwindigkeitswert', body: 'Der Buchstabe beschreibt die Höchstgeschwindigkeit, die der Reifen dauerhaft aushält, keine Geschwindigkeitsempfehlung.' },
      { title: 'Beide Werte gelten pro Reifen', body: 'Die Tragfähigkeit gilt für einen einzelnen Reifen, nicht für die Gesamttragfähigkeit einer Achse oder des Fahrzeugs.' },
    ],
    commonMistake: 'Einen Reifen mit niedrigerem Tragfähigkeits- oder Geschwindigkeitsindex als auf dem Typschild angegeben zu montieren, um Kosten zu sparen.',
    warning: 'Erreichen oder übertreffen Sie immer den auf dem Typschild Ihres Fahrzeugs angegebenen Tragfähigkeits- und Geschwindigkeitsindex, nicht nur die Größe.',
  },
  'tire-date-code-decoder': {
    title: 'Reifen-Herstellungsdatum-Decoder',
    description: 'Entschlüsseln Sie den DOT-Wochen-und-Jahr-Code auf einer Reifenflanke, um Herstellungsdatum und Alter zu ermitteln.',
    category: 'Reifen & Felgen',
    eyebrow: 'Reifen & Felgen',
    intro: 'Entschlüsseln Sie den DOT-Wochen-und-Jahr-Code auf einer Reifenflanke, um das Herstellungsdatum und Alter zu ermitteln.',
    limitation: 'Die Altersangabe spiegelt allgemein zitierte Hersteller- und Branchenpraxis wider, keine Empfehlung für ein bestimmtes Fahrzeug oder einen bestimmten Reifenhersteller.',
    explanation: [
      { heading: 'Wo Sie den Code finden', paragraphs: [
        'Suchen Sie auf der Reifenflanke nach „DOT", gefolgt von einer Buchstaben-Zahlen-Folge — manchmal nur auf einer Seite des Reifens. Die letzte Gruppe, entweder 3 oder 4 Ziffern, ist der Datumscode. Ein 4-stelliger Code wie 2219 bedeutet Woche 22 des Jahres 2019: Die ersten beiden Ziffern sind die Kalenderwoche, die letzten beiden das Jahr.',
        'Vor 2000 hergestellte Reifen verwendeten stattdessen einen 3-stelligen Code, den dieser Decoder nicht abdeckt — ein Reifen mit nur 3-stelligem Datumscode ist ohnehin alt genug, dass sein Alter kaum noch fraglich ist.',
      ] },
      { heading: 'Warum das Reifenalter auch bei gutem Profil zählt', paragraphs: ['Gummimischungen härten und können mit der Zeit Risse entwickeln, unabhängig von der verbleibenden Profiltiefe. Viele Hersteller empfehlen eine Prüfung nach etwa 6 Jahren und ziehen einen Austausch nach etwa 10 Jahren ab Herstellungsdatum in Betracht — prüfen Sie aber stets die Herstellerangabe Ihres konkreten Reifens.'] },
    ],
    facts: [
      { title: 'Der Code sind die letzten vier Ziffern der DOT-Nummer', body: 'Die ersten beiden Ziffern sind die Herstellungswoche, die letzten beiden das Jahr — zum Beispiel bedeutet 2219 Woche 22 des Jahres 2019.' },
      { title: 'Dreistellige Codes stammen aus der Zeit vor 2000', body: 'Vor 2000 hergestellte Reifen nutzten einen dreistelligen Code und haben heute praktisch immer jede sinnvolle Nutzungsdauer überschritten.' },
      { title: 'Das Alter zählt auch bei gutem Profil', body: 'Gummimischungen härten und reißen mit der Zeit, unabhängig von der verbleibenden Profiltiefe oder dem optischen Zustand.' },
    ],
    commonMistake: 'Das Reifenalter nur anhand der Profiltiefe oder des optischen Zustands zu beurteilen, statt den eingeprägten Datumscode zu prüfen.',
    warning: 'Die Altersangabe hier spiegelt übliche Hersteller- und Branchenpraxis wider, keine Empfehlung für ein bestimmtes Fahrzeug. Prüfen Sie die angegebene Nutzungsdauer Ihres Reifenherstellers.',
  },
  'towing-capacity-calculator': {
    title: 'Anhängelast-Rechner',
    description: 'Schätzen Sie die maximale Anhängerlast und Stützlast aus Ihrem zulässigen Gesamtzuggewicht, Leergewicht und Zuladung.',
    category: 'Kraftstoff & Reisen',
    eyebrow: 'Kraftstoff & Reisen',
    intro: 'Schätzen Sie die maximale Anhängerlast und Stützlast aus zulässigem Gesamtzuggewicht, Leergewicht und Zuladung.',
    limitation: 'Dies ist eine vereinfachte Schätzung auf Basis des zulässigen Gesamtzuggewichts. Sie prüft keine Achslasten, Anhängekupplungsklasse, Bremsanforderungen oder herstellerspezifischen Zuggrenzen.',
    explanation: [
      { heading: 'Woher diese Zahlen kommen', paragraphs: [
        'Das zulässige Gesamtzuggewicht (GCWR) wird vom Hersteller festgelegt und umfasst das voll beladene Zugfahrzeug plus Anhänger zusammen. Das Leergewicht ist das Fahrzeug ohne Beladung, daher addiert dieser Rechner Ihre Passagiere und Ladung zum Leergewicht und zieht diese Summe anschließend vom GCWR ab, um die verbleibende Anhängerlast zu schätzen.',
        'Die Stützlast — die Abwärtskraft, die der Anhänger auf die Kupplung ausübt — beträgt üblicherweise 10 bis 15 % der Anhängerlast bei einer normalen Anhängekupplung. Zu wenig Stützlast kann zu Anhängerschlingern führen; zu viel kann die Hinterachse oder Kupplung überlasten.',
      ] },
      { heading: 'Was hier nicht geprüft wird', paragraphs: ['Die reale Anhängelast hängt auch vom konkreten Motor, der Achsübersetzung, dem Bremssystem und dem Kühlpaket des Zugfahrzeugs ab — zwei Ausstattungslinien desselben Modells können unterschiedliche Werte haben. Bestätigen Sie immer die vom Hersteller angegebene Anhängelast und das zulässige Gesamtgewicht für Ihre genaue Fahrzeugkonfiguration, bevor Sie einen Anhänger ankuppeln.'] },
    ],
    facts: [
      { title: 'Das GCWR umfasst bereits das Zugfahrzeug', body: 'Das zulässige Gesamtzuggewicht deckt das beladene Zugfahrzeug plus Anhänger zusammen ab, daher muss zuerst das Fahrzeuggewicht abgezogen werden.' },
      { title: 'Passagiere und Ladung zählen gegen die Gesamtsumme', body: 'Alles, was im oder auf dem Zugfahrzeug mitfährt, verringert die verbleibende zulässige Anhängerlast.' },
      { title: 'Die Stützlast ist ein Bruchteil der Anhängerlast', body: 'Die meisten herkömmlichen Anhänger benötigen etwa 10 bis 15 Prozent der Anhängerlast auf der Kupplung.' },
    ],
    commonMistake: 'Das Gewicht eines Anhängers nur mit der beworbenen maximalen Anhängelast des Fahrzeugs zu vergleichen und dabei Passagiere, Ladung und bereits verbaute Kupplungsausrüstung zu ignorieren.',
    warning: 'Dies ist eine vereinfachte Schätzung auf Basis des GCWR. Bestätigen Sie immer die Herstellerangaben zu Anhängelast, zulässigem Gesamtgewicht, Achslasten und Kupplungsklasse für Ihre genaue Fahrzeugkonfiguration.',
  },
  'quarter-mile-calculator': {
    title: 'Viertelmeilen-Rechner',
    description: 'Schätzen Sie die Viertelmeilen-Endzeit und Endgeschwindigkeit aus Fahrzeuggewicht und Leistung.',
    category: 'Performance',
    eyebrow: 'Performance',
    intro: 'Schätzen Sie die Viertelmeilen-Endzeit und Endgeschwindigkeit aus Fahrzeuggewicht und Leistung.',
    limitation: 'Dies ist eine physikalische Schätzung auf Basis von Leistungsgewicht, keine Leistungsgarantie. Traktion, Fahrkönnen, Übersetzung, Höhenlage und Streckenbedingungen verändern das reale Ergebnis.',
    explanation: [
      { heading: 'Woher die Formel stammt', paragraphs: ['Endzeit und Endgeschwindigkeit werden aus der weit verbreiteten Leistungsgewicht-Beziehung geschätzt: ET (Sekunden) = 5,825 × (Gewicht in lb ÷ hp)^(1/3), und Endgeschwindigkeit (mph) = 234 × (hp ÷ Gewicht in lb)^(1/3). Sie benötigt nur Gewicht und Leistung, weshalb sie auch nur eine Schätzung ist — sie geht von idealer Traktion und einem sauberen Start aus.'] },
      { heading: 'Warum es keine korrekte 0–100-km/h-Berechnung gibt', paragraphs: ['Anders als bei der Viertelmeile gibt es keine allgemein anerkannte Formel, die die Zeit von 0 auf 100 km/h allein aus Gewicht und Leistung schätzt — reale Beschleunigungszeiten hängen stark von Übersetzung, Startdrehzahl und der Kraftentfaltung bei niedriger Geschwindigkeit ab, nicht nur vom maximalen Leistungsgewicht. Der im Ergebnis gezeigte Wert ist ein sehr grober Näherungsbruchteil der geschätzten Viertelmeilenzeit und dient nur als Referenz.'] },
    ],
    facts: [
      { title: 'Die Formel nutzt nur Gewicht und Leistung', body: 'Endzeit und Endgeschwindigkeit werden aus dem Leistungsgewichtsverhältnis geschätzt — denselben zwei Zahlen, die auch die reale Beschleunigung bestimmen.' },
      { title: 'Reale Ergebnisse variieren mit Fahrer und Strecke', body: 'Traktion, Starttechnik, Übersetzung, Höhenlage und Temperatur verschieben das reale Ergebnis von der Schätzung.' },
      { title: '0–100 km/h ist keine verlässliche Gewicht-Leistungs-Berechnung', body: 'Anders als bei der Viertelmeile gibt es keine allgemein anerkannte Formel, die die 0–100-km/h-Zeit allein aus Gewicht und Leistung schätzt, daher wird sie nur als grober Richtwert angezeigt.' },
    ],
    commonMistake: 'Die geschätzte Endzeit als garantiertes Ergebnis statt als Näherung auf Leistungsgewicht-Basis zu behandeln.',
    warning: 'Dies ist eine physikalische Schätzung, keine Leistungsgarantie. Reale Zeiten hängen von Traktion, Fahrkönnen, Übersetzung, Wetter und Streckenbedingungen ab.',
  },
  'compression-ratio-calculator': {
    title: 'Verdichtungsverhältnis-Rechner',
    description: 'Berechnen Sie das Motor-Verdichtungsverhältnis aus Bohrung, Hub, Brennraumvolumen und weiterem Ausgleichsvolumen.',
    category: 'Performance',
    eyebrow: 'Performance',
    intro: 'Berechnen Sie das Verdichtungsverhältnis aus Bohrung, Hub, Brennraumvolumen und weiterem Ausgleichsvolumen.',
    limitation: 'Dies ist eine geometrische Berechnung aus den von Ihnen eingegebenen Volumina, keine Kraftstoff- oder Tuning-Empfehlung. Sichere Verdichtung für Ihren Motor hängt von Kraftstoff-Oktanzahl, Zündzeitpunkt und weiteren Abstimmungsfaktoren ab.',
    explanation: [
      { heading: 'Was jede Zahl bedeutet', paragraphs: [
        'Das Hubvolumen ist der Raum, den ein Zylinder vom unteren zum oberen Totpunkt verdrängt, berechnet allein aus Bohrung und Hub. Das Verdichtungsvolumen ist alles, was am oberen Totpunkt übrig bleibt: Brennraumvolumen plus Zylinderkopfdichtungsvolumen, Quetschkantenspiel und Kolbenmulde (positiv) oder Kolbenboden-Überhöhung (negativ) — hier zusammen als „weiteres Volumen" eingegeben.',
        'Verdichtungsverhältnis = (Hubvolumen + Verdichtungsvolumen) ÷ Verdichtungsvolumen. Wenn Sie nur das Brennraumvolumen kennen, lassen Sie „weiteres Volumen" bei 0; für ein präziseres Ergebnis addieren Sie das komprimierte Volumen Ihrer Zylinderkopfdichtung und ein etwaiges Quetschkantenspiel und subtrahieren das Kolbenboden-Volumen bzw. addieren das Muldenvolumen.',
      ] },
      { heading: 'Statische vs. dynamische Verdichtung', paragraphs: ['Dies ist das statische Verdichtungsverhältnis — eine feste geometrische Zahl. Die Nockenwellensteuerzeit, insbesondere der Schließzeitpunkt des Einlassventils, verändert, wie viel von diesem Hubvolumen der Zylinder vor Verdichtungsbeginn tatsächlich füllt — das beschreibt das dynamische Verdichtungsverhältnis. Zwei Motoren mit demselben statischen Verhältnis können sich je nach Nockenwellensteuerzeit sehr unterschiedlich verhalten.'] },
    ],
    facts: [
      { title: 'Das Hubvolumen ergibt sich aus Bohrung und Hub', body: 'Das Zylinderhubvolumen wird allein aus Bohrung und Hub berechnet; die Brennraumform spielt dabei keine Rolle.' },
      { title: 'Das Verdichtungsvolumen ist alles, was der Kolben am oberen Totpunkt nicht füllt', body: 'Brennraum, Zylinderkopfdichtung, Quetschkantenspiel und Kolbenmulde oder -boden addieren oder subtrahieren sich alle zum Verdichtungsvolumen.' },
      { title: 'Das statische Verhältnis ist keine dynamische Verdichtung', body: 'Die Nockenwellensteuerzeit verändert die effektive Zylinderfüllung, daher sind statisches und dynamisches Verdichtungsverhältnis unterschiedliche Zahlen.' },
    ],
    commonMistake: 'Die Dicke der Zylinderkopfdichtung und das Quetschkantenspiel zu ignorieren, was das berechnete Verhältnis um einen vollen Punkt oder mehr verschieben kann.',
    warning: 'Dies ist eine geometrische Berechnung aus den von Ihnen eingegebenen Volumina. Kraftstoff-Oktananforderungen und sichere Verdichtungsverhältnisse hängen vom konkreten Motor, der Abstimmung und dem Kraftstoff ab.',
  },
  'vehicle-fitment-finder': {
    title: 'Fahrzeug finden',
    description: 'Werksseitige Reifengröße, Lochkreis und Anzugsdrehmoment nach Marke und Modell nachschlagen, mit Quellenangabe und Verlässlichkeitseinstufung.',
    category: 'Reifen & Felgen',
    eyebrow: 'Reifen & Felgen',
    intro: 'Wählen Sie Marke und Modell, um werksseitige Reifengröße, Lochkreis und Anzugsdrehmoment als Referenz zu sehen — und direkt in den passenden Rechner zu springen.',
    limitation: 'Dies ist eine kuratierte Referenzsammlung, keine Live-Herstellerdatenbank. Ausstattungslinien und Modelljahre variieren, prüfen Sie daher immer das Handbuch oder den Aufkleber an der Fahrertür Ihres Fahrzeugs, bevor Sie Teile kaufen.',
    studioCta: 'Passung in Felgen- & Reifenvergleich bestätigen',
    explanation: [
      { heading: 'Woher diese Daten stammen', paragraphs: [
        'Jeder Eintrag wurde manuell aus öffentlichen Referenzquellen recherchiert und, wo möglich, gegen mindestens zwei Quellen geprüft. Jedes Fahrzeug zeigt eine Verlässlichkeitseinstufung und seine Quellen, damit Sie selbst beurteilen können, wie belastbar die Zahl ist.',
        'Einige Drehmomentwerte konnten nicht zweifelsfrei bestätigt werden oder unterschieden sich zwischen Quellen — diese sind entsprechend gekennzeichnet, statt geraten zu werden.',
      ] },
    ],
    facts: [
      { title: 'Referenz, keine Herstellerfreigabe', body: 'Diese Werte ersetzen nicht das Fahrzeughandbuch — bei Abweichungen gilt immer die Herstellerangabe für Ihre genaue Ausstattung.' },
      { title: 'Verlässlichkeit wird offen angezeigt', body: 'Jeder Eintrag zeigt „Hoch", „Mittel" oder „Gering" — je nachdem, wie gut die Quellen übereinstimmten.' },
    ],
    commonMistake: 'Eine Werksangabe für die gesamte Modellreihe zu übernehmen, obwohl einzelne Ausstattungslinien abweichende Rad- oder Reifenpakete haben.',
    warning: 'Diese Liste wächst mit der Zeit und deckt noch nicht jedes Fahrzeug ab. Prüfen Sie die Angaben immer gegen Ihr eigenes Handbuch, bevor Sie Räder anziehen oder Teile bestellen.',
    faqs: [
      { question: 'Wo finde ich die tatsächliche werksseitige Reifengröße und den Lochkreis meines Fahrzeugs?', answer: 'Die zuverlässigste Quelle ist der Aufkleber im Türrahmen der Fahrertür oder Ihr Fahrzeughandbuch — beide zeigen die genaue Spezifikation Ihrer Ausstattung ab Werk, die von generischen Online-Referenzen abweichen kann.' },
      { question: 'Warum ist mein genaues Fahrzeug hier nicht gelistet?', answer: 'Dies ist eine kuratierte Startauswahl, keine vollständige Herstellerdatenbank. Wenn Marke und Modell erscheinen, aber keine geprüfte Angabe zeigen, oder noch gar nicht erscheinen, nutzen Sie den Aufkleber an der Fahrertür direkt mit dem Reifengrößen- oder Lochkreis-Rechner.' },
      { question: 'Was bedeutet die Verlässlichkeitseinstufung?', answer: 'Hohe Verlässlichkeit bedeutet, dass mehrere unabhängige Quellen übereinstimmten. Mittlere oder geringe Verlässlichkeit bedeutet, dass Quellen widersprachen oder ein Wert nicht vollständig bestätigt werden konnte — solche Einträge sollten Sie vor Gebrauch gegenprüfen.' },
    ],
  },
  'gas-prices-today': {
    title: 'Kraftstoffpreise heute',
    description: 'Aktuelle Kraftstoffpreise mit Preisverlauf, Marktkennzahlen und direktem Übergang in die Sprit- und Fahrtkostenrechner.',
    category: 'Kraftstoff & Reisen',
    eyebrow: 'Kraftstoffmarkt',
    intro: 'Aktuelle Kraftstoffpreise mit Verlauf, Kennzahlen und direktem Weg in die Rechner.',
    limitation: 'Für Deutschland handelt es sich um eine von Atlas beobachtete Stichprobe ausgewählter Stadt-Tankstellen, nicht um einen amtlichen Bundesdurchschnitt — und in keinem Fall um den Preis einer bestimmten Tankstelle.',
    explanation: [
      { heading: 'Woher die Zahlen kommen', paragraphs: [
        'Jeder Markt hat seine eigene Quelle und seinen eigenen Rhythmus: die USA den wöchentlichen EIA-Survey, Spanien den offiziellen landesweiten Datensatz des Ministeriums, Deutschland eine von Atlas beobachtete Stichprobe ausgewählter Stadt-Tankstellen.',
        'Solange ein Markt noch nie verifiziert wurde, zeigen wir gar keine Ziffern. Schlägt eine Aktualisierung fehl, sehen Sie den letzten echten Wert samt Datum statt einer erfundenen Zahl.',
      ] },
    ],
    facts: [
      { title: 'Veröffentlichter Wert, kein Live-Kurs', body: 'Angezeigt wird der zuletzt bestätigte Wert mit Datum — kein animierter Ticker, der Bewegung vortäuscht.' },
      { title: 'Deutschland ist eine Stichprobe', body: 'Die deutschen Werte stammen aus ausgewählten Städten und sind ausdrücklich kein amtlicher Bundesdurchschnitt.' },
      { title: 'Erst rechnen, dann anpassen', body: 'Übernehmen Sie den Wert als Ausgangspunkt in den Rechnern und passen Sie ihn an Ihre Tankstelle an.' },
    ],
    commonMistake: 'Einen Marktdurchschnitt als Preis einer konkreten Tankstelle zu lesen.',
    warning: 'Steuern, Marke und Lage verschieben den echten Zapfsäulenpreis spürbar gegenüber jedem Durchschnitt.',
  },
});
