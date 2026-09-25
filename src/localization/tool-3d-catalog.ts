export const additional3DToolIds = [
  'fitment-map', 'measure-my-car', 'fuel-cost-calculator', 'road-trip-cost-calculator',
  'mpg-l100km-converter', 'psi-bar-converter', 'hp-kw-converter', 'nm-lb-ft-converter',
  'power-to-weight-calculator', 'tire-load-speed-rating', 'tire-date-code-decoder',
  'towing-capacity-calculator', 'quarter-mile-calculator', 'vehicle-fitment-finder',
] as const;

export type Additional3DToolId = typeof additional3DToolIds[number];
export type Tool3DLocale = 'en' | 'de' | 'es';

const copy = {
  en: {
    badge: 'LIVE 3D EXPLAINER', hint: 'Drag to rotate · zoom with the controls', reset: 'Reset view',
    fallback: '3D is unavailable here. The calculator result and existing diagrams still work.',
    caution: 'An explanatory model, not a vehicle-specific safety or fitment verdict.',
    'fitment-map': ['Wheel-width × ET workspace', 'Inspect the two axes that drive the map; exact cells remain in Fitment Studio.'],
    'measure-my-car': ['The two real gaps to measure', 'Inner and outer reference planes stay fixed around the wheel.'],
    'fuel-cost-calculator': ['Fuel used across your journey', 'Distance, economy and price shape the fuel-volume and cost display.'],
    'road-trip-cost-calculator': ['Journey, fuel and extras', 'A one-way or return route with separate fuel and extra-cost volumes.'],
    'mpg-l100km-converter': ['Distance per fuel volume', 'One fuel-use relationship, viewed through distinct gallon standards.'],
    'psi-bar-converter': ['One pressure · three units', 'PSI, bar and kPa update together for the same physical pressure. No target pressure is inferred.'],
    'hp-kw-converter': ['Mechanical power · one output', 'A rotor and output scale respond to power; hp and kW are labels for one quantity.'],
    'nm-lb-ft-converter': ['Torque about an axle', 'A lever and circular motion show the same moment in Nm or lb-ft.'],
    'power-to-weight-calculator': ['Power versus mass', 'Engine output and vehicle mass remain visibly distinct; the ratio is calculated below.'],
    'tire-load-speed-rating': ['Tire load and speed code', 'The selected standard code sits on a tire; this is not a vehicle load approval.'],
    'tire-date-code-decoder': ['Find the DOT date on the sidewall', 'The selected WWYY code is shown on the sidewall position.'],
    'towing-capacity-calculator': ['Loaded vehicle and trailer', 'The vehicle load is deducted from GCWR before the trailer estimate.'],
    'quarter-mile-calculator': ['The measured quarter-mile course', 'Power and weight feed the estimate; the track is not an acceleration simulation.'],
    'vehicle-fitment-finder': ['Vehicle reference geometry', 'A tire and bolt plate represent sourced records, not a claim that a specific trim fits.'],
  },
  de: {
    badge: 'INTERAKTIVES 3D-MODELL', hint: 'Ziehen zum Drehen · mit Tasten zoomen', reset: 'Ansicht zurücksetzen',
    fallback: '3D ist hier nicht verfügbar. Rechnerergebnis und vorhandene Diagramme bleiben nutzbar.',
    caution: 'Erklärendes Modell, keine fahrzeugspezifische Sicherheits- oder Passfreigabe.',
    'fitment-map': ['Felgenbreite × ET', 'Die zwei Achsen der Karte; genaue Zellen bleiben im Fitment Studio.'],
    'measure-my-car': ['Zwei reale Abstände messen', 'Innere und äußere Bezugsebene bleiben um das Rad fest.'],
    'fuel-cost-calculator': ['Kraftstoff für die Fahrt', 'Strecke, Verbrauch und Preis bestimmen Volumen und Kostenanzeige.'],
    'road-trip-cost-calculator': ['Fahrt, Kraftstoff und Extras', 'Einfacher oder Rückweg mit getrennten Kraftstoff- und Zusatzkosten.'],
    'mpg-l100km-converter': ['Strecke je Kraftstoffmenge', 'Ein Verbrauch mit getrennten US- und britischen Gallonenstandards.'],
    'psi-bar-converter': ['Ein Druck · drei Einheiten', 'PSI, bar und kPa werden gemeinsam für denselben Druck aktualisiert. Kein Sollwert wird abgeleitet.'],
    'hp-kw-converter': ['Mechanische Leistung · ein Wert', 'Rotor und Skala reagieren auf Leistung; hp und kW bezeichnen dieselbe Größe.'],
    'nm-lb-ft-converter': ['Drehmoment an einer Achse', 'Hebel und Kreisbewegung zeigen denselben Wert in Nm oder lb-ft.'],
    'power-to-weight-calculator': ['Leistung und Masse', 'Motorleistung und Fahrzeugmasse bleiben getrennt; das Verhältnis steht unten.'],
    'tire-load-speed-rating': ['Traglast- und Geschwindigkeitscode', 'Der gewählte Normcode sitzt am Reifen; keine Fahrzeugfreigabe.'],
    'tire-date-code-decoder': ['DOT-Datum an der Flanke', 'Der eingegebene WWJJ-Code steht an der Reifenflanke.'],
    'towing-capacity-calculator': ['Beladenes Fahrzeug und Anhänger', 'Die Fahrzeuglast wird vor der Anhängerschätzung vom GCWR abgezogen.'],
    'quarter-mile-calculator': ['Viertelmeilen-Strecke', 'Leistung und Gewicht bestimmen die Schätzung; keine Beschleunigungssimulation.'],
    'vehicle-fitment-finder': ['Fahrzeug-Referenzgeometrie', 'Reifen und Lochkreis stehen für belegte Daten, nicht für eine Passfreigabe.'],
  },
  es: {
    badge: 'EXPLICACIÓN 3D EN VIVO', hint: 'Arrastra para girar · usa los botones para ampliar', reset: 'Restablecer vista',
    fallback: 'El 3D no está disponible. El resultado y los diagramas siguen funcionando.',
    caution: 'Modelo explicativo, no una aprobación de seguridad o compatibilidad del vehículo.',
    'fitment-map': ['Anchura de llanta × ET', 'Los dos ejes del mapa; las celdas exactas están en Fitment Studio.'],
    'measure-my-car': ['Dos holguras reales que medir', 'Los planos interior y exterior permanecen fijos alrededor de la rueda.'],
    'fuel-cost-calculator': ['Combustible para el trayecto', 'Distancia, consumo y precio forman el volumen y el coste mostrados.'],
    'road-trip-cost-calculator': ['Trayecto, combustible y extras', 'Ruta de ida o vuelta con combustible y gastos adicionales separados.'],
    'mpg-l100km-converter': ['Distancia por volumen de combustible', 'Un consumo con los estándares de galón estadounidense e imperial separados.'],
    'psi-bar-converter': ['Una presión · tres unidades', 'PSI, bar y kPa se actualizan juntos para la misma presión. No se deduce una presión recomendada.'],
    'hp-kw-converter': ['Potencia mecánica · un valor', 'El rotor y la escala responden a la potencia; hp y kW expresan la misma magnitud.'],
    'nm-lb-ft-converter': ['Par sobre un eje', 'La palanca y el giro muestran el mismo momento en Nm o lb-ft.'],
    'power-to-weight-calculator': ['Potencia frente a masa', 'La potencia y la masa permanecen separadas; la relación se calcula abajo.'],
    'tire-load-speed-rating': ['Código de carga y velocidad', 'El código normalizado se sitúa en el neumático; no aprueba el vehículo.'],
    'tire-date-code-decoder': ['Fecha DOT en el flanco', 'El código de semana y año elegido se señala en el flanco del neumático.'],
    'towing-capacity-calculator': ['Vehículo cargado y remolque', 'La carga del vehículo se resta del GCWR antes de estimar el remolque.'],
    'quarter-mile-calculator': ['Pista de cuarto de milla', 'Potencia y peso alimentan la estimación; no simula la aceleración.'],
    'vehicle-fitment-finder': ['Geometría de referencia', 'Neumático y círculo de pernos representan datos documentados, no una garantía de ajuste.'],
  },
} as const;

export function tool3DText(locale: Tool3DLocale, id: Additional3DToolId) {
  const t = copy[locale];
  return { badge: t.badge, hint: t.hint, reset: t.reset, fallback: t.fallback, caution: t.caution, title: t[id][0], intro: t[id][1] };
}
