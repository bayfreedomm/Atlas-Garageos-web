/**
 * Curated OEM wheel/tire fitment reference data for common vehicles.
 *
 * This is a starter dataset (30 vehicles: 15 common in the US market, 15 common
 * in the German/Spanish market), hand-researched and cross-checked against
 * public fitment references (wheel-size.com, manufacturer service manuals where
 * available, and specialist bolt-pattern sites). It is NOT a licensed OEM data
 * feed and is not exhaustive — trims and model years vary. `confidence` and
 * `sources` are kept per-entry so the UI can be honest about how solid each
 * number is, and so this can be corrected/expanded over time.
 *
 * Always cross-check against the vehicle's own manual before torquing wheels —
 * this is a starting reference, not a substitute for the OEM spec of the
 * specific trim in hand.
 */

export type FitmentConfidence = 'high' | 'medium' | 'low';

export interface VehicleFitment {
  readonly id: string;
  readonly make: string;
  readonly model: string;
  /** e.g. "2020–2024 (XII / E210)" */
  readonly generation: string;
  readonly market: 'us' | 'eu';
  /** e.g. "205/55R16" */
  readonly tireSize: string;
  /** e.g. "5x114.3" */
  readonly boltPattern: string;
  /**
   * Lug count, restating the first half of `boltPattern`. It is cross-checked against the
   * notation at catalog build time (see buildBoltPatternCatalog) so the two can never drift.
   *
   * There is deliberately NO stored hole-to-hole spacing field here. Adjacent-hole spacing is
   * a function of the bolt pattern (PCD × sin(π / lugs)) and is derived on demand via
   * adjacentHoleSpacingMm() / boltPatternSpacingMm() in ./bolt-pattern-geometry, so it can
   * never be hand-typed as a duplicate of the PCD and can never disagree with `boltPattern`.
   */
  readonly lugCount: number;
  readonly centerBoreMm?: number;
  /** e.g. "17x7.5" */
  readonly wheelSize: string;
  readonly torqueNm?: number;
  readonly torqueLbFt?: number;
  readonly fastenerType: 'lug-nut' | 'wheel-bolt';
  readonly confidence: FitmentConfidence;
  readonly sources: readonly string[];
  readonly notes?: string;
}

export const vehicleFitmentData: readonly VehicleFitment[] = Object.freeze([
  { id: 'toyota-corolla', make: 'Toyota', model: 'Corolla', generation: '2020–2024 (XII / E210, LE)', market: 'us', tireSize: '205/55R16', boltPattern: '5x100', lugCount: 5, centerBoreMm: 54.1, wheelSize: '16x6.5', torqueNm: 108, torqueLbFt: 80, fastenerType: 'lug-nut', confidence: 'high', sources: ['car-bolts.com', 'boltpatternhq.com', 'wheel-sizes.com'] },
  { id: 'toyota-camry', make: 'Toyota', model: 'Camry', generation: '2018–2024 (XV70, LE)', market: 'us', tireSize: '215/55R17', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 60.1, wheelSize: '17x7.5', torqueNm: 108, torqueLbFt: 80, fastenerType: 'lug-nut', confidence: 'medium', sources: ['wheel-sizes.com', 'whatsizebolt.com'], notes: 'Torque confirmed via search snippets, not a direct page fetch.' },
  { id: 'toyota-rav4', make: 'Toyota', model: 'RAV4', generation: '2019–2024 (XA50, LE AWD)', market: 'us', tireSize: '225/65R17', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 60.1, wheelSize: '17x7', torqueNm: 103, torqueLbFt: 76, fastenerType: 'lug-nut', confidence: 'medium', sources: ['rav4resource.com', 'wheel-size.com', 'toyotires.com'] },
  { id: 'honda-civic', make: 'Honda', model: 'Civic', generation: '2022–2024 (11th gen, LX sedan)', market: 'us', tireSize: '215/55R16', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 64.1, wheelSize: '16x6.5', torqueNm: 108, torqueLbFt: 80, fastenerType: 'lug-nut', confidence: 'high', sources: ['boltpatternhq.com', 'tiresize.com'] },
  { id: 'honda-crv', make: 'Honda', model: 'CR-V', generation: '2023–2024 (6th gen, LX)', market: 'us', tireSize: '235/65R17', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 64.1, wheelSize: '17x7.5', fastenerType: 'lug-nut', confidence: 'medium', sources: ['westwoodhonda.com', 'tiresize.com', 'wheel-size.com'], notes: 'Torque spec could not be confirmed specifically for the CR-V; not reported to avoid guessing.' },
  { id: 'honda-accord', make: 'Honda', model: 'Accord', generation: '2023–2024 (11th gen, LX)', market: 'us', tireSize: '225/50R17', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 64.1, wheelSize: '17x7.5', torqueNm: 108, torqueLbFt: 80, fastenerType: 'lug-nut', confidence: 'high', sources: ['boltpatternhq.com', 'tiresize.com', 'driveaccord.net'] },
  { id: 'ford-f150', make: 'Ford', model: 'F-150', generation: '2021–2024 (14th gen, SuperCrew XLT)', market: 'us', tireSize: '275/65R18', boltPattern: '6x135', lugCount: 6, centerBoreMm: 87.1, wheelSize: '18x8', torqueNm: 203, torqueLbFt: 150, fastenerType: 'lug-nut', confidence: 'medium', sources: ['sdwheel.com', 'jimburkeford.com', 'wheel-size.com'], notes: 'F-150 wheel/tire packages vary a lot by trim; this is the XLT reference, base XL trims commonly run 265/70R17.' },
  { id: 'ford-escape', make: 'Ford', model: 'Escape', generation: '2020–2024 (4th gen, SE)', market: 'us', tireSize: '225/65R17', boltPattern: '5x108', lugCount: 5, centerBoreMm: 63.4, wheelSize: '17x7', torqueNm: 135, torqueLbFt: 100, fastenerType: 'lug-nut', confidence: 'medium', sources: ['wheel-size.com', 'oemrimshop.com'] },
  { id: 'chevrolet-silverado', make: 'Chevrolet', model: 'Silverado 1500', generation: '2019–2024 (T1XX, Crew Cab LT)', market: 'us', tireSize: '265/65R18', boltPattern: '6x139.7', lugCount: 6, centerBoreMm: 78.1, wheelSize: '18x8.5', torqueNm: 190, torqueLbFt: 140, fastenerType: 'lug-nut', confidence: 'medium', sources: ['gm-trucks.com', 'wheel-size.com'], notes: 'Silverado wheel packages range 17"–22" by trim; tire size shown is a common LT reference, not a single universal spec.' },
  { id: 'chevrolet-equinox', make: 'Chevrolet', model: 'Equinox', generation: '2018–2023 (3rd gen, LT)', market: 'us', tireSize: '225/65R17', boltPattern: '5x115', lugCount: 5, centerBoreMm: 70.3, wheelSize: '17x7', torqueNm: 140, torqueLbFt: 100, fastenerType: 'lug-nut', confidence: 'medium', sources: ['boltpatternhq.com', '21cylinders.com', 'wheel-sizes.com'] },
  { id: 'nissan-rogue', make: 'Nissan', model: 'Rogue', generation: '2021–2023 (T33, S)', market: 'us', tireSize: '235/65R17', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 66.1, wheelSize: '17x7', torqueNm: 113, torqueLbFt: 83, fastenerType: 'lug-nut', confidence: 'medium', sources: ['nissanrogueinfo.com', 'autocentersnissan.com'] },
  { id: 'nissan-altima', make: 'Nissan', model: 'Altima', generation: '2019–2023 (L34, S/SV)', market: 'us', tireSize: '215/60R16', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 66.1, wheelSize: '16x7', torqueNm: 113, torqueLbFt: 83, fastenerType: 'lug-nut', confidence: 'high', sources: ['21cylinders.com', 'boltpatternhq.com', 'tiresize.com'] },
  { id: 'jeep-grand-cherokee', make: 'Jeep', model: 'Grand Cherokee', generation: '2022–2024 (WL, Laredo)', market: 'us', tireSize: '265/60R18', boltPattern: '5x127', lugCount: 5, centerBoreMm: 71.5, wheelSize: '18x8', torqueNm: 176, torqueLbFt: 130, fastenerType: 'lug-nut', confidence: 'high', sources: ['manual.dot.report (owner manual)', 'kowperformance.com'], notes: 'OEM tire options range from 245/70R17 to 265/50R20 by trim; 265/60R18 shown as a common mid-trim size.' },
  { id: 'tesla-model-3', make: 'Tesla', model: 'Model 3', generation: '2017–2023 (Standard Aero Wheel)', market: 'us', tireSize: '235/45R18', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 64.1, wheelSize: '18x8.5', torqueNm: 175, torqueLbFt: 129, fastenerType: 'lug-nut', confidence: 'high', sources: ['Tesla service manual'] },
  { id: 'tesla-model-y', make: 'Tesla', model: 'Model Y', generation: '2020–2024 (Gemini 19")', market: 'us', tireSize: '255/45R19', boltPattern: '5x114.3', lugCount: 5, centerBoreMm: 64.1, wheelSize: '19x9.5', torqueNm: 175, torqueLbFt: 129, fastenerType: 'lug-nut', confidence: 'high', sources: ['Tesla service manual'] },

  { id: 'vw-golf', make: 'Volkswagen', model: 'Golf (Mk8)', generation: '2019–2024 (CD1)', market: 'eu', tireSize: '205/55R16', boltPattern: '5x112', lugCount: 5, centerBoreMm: 57.1, wheelSize: '7Jx16 ET48', torqueNm: 120, torqueLbFt: 89, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['wheel-size.com', 'vwhilfe.com'], notes: 'One source cites 140 Nm; 120 Nm used here per the VW manual excerpt, but treat as needing confirmation for your exact trim.' },
  { id: 'vw-tiguan', make: 'Volkswagen', model: 'Tiguan', generation: '2020–2024 (II, facelift)', market: 'eu', tireSize: '195/55R16', boltPattern: '5x112', lugCount: 5, centerBoreMm: 57.1, wheelSize: '6.5Jx16 ET45', torqueNm: 120, torqueLbFt: 89, fastenerType: 'wheel-bolt', confidence: 'high', sources: ['tireswheels.org', 'avtoreference.com'] },
  { id: 'vw-passat', make: 'Volkswagen', model: 'Passat', generation: '2019–2024 (B8 facelift)', market: 'eu', tireSize: '195/60R15', boltPattern: '5x112', lugCount: 5, centerBoreMm: 57.1, wheelSize: '5.5Jx15 ET41', torqueNm: 125, torqueLbFt: 92, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['tireswheels.org', 'avtoreference.com'] },
  { id: 'bmw-3-series', make: 'BMW', model: '3 Series (G20)', generation: '2019–2022', market: 'eu', tireSize: '205/60R16', boltPattern: '5x112', lugCount: 5, centerBoreMm: 66.6, wheelSize: '6.5Jx16 ET22', torqueNm: 140, torqueLbFt: 103, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['wheel-size.com', 'f10-forum.de (BMW manual citation)'], notes: 'Some secondary sources cite 135 Nm; 140 Nm used per the manual-cited figure.' },
  { id: 'bmw-x3', make: 'BMW', model: 'X3 (G01)', generation: '2017–2021', market: 'eu', tireSize: '245/50R19', boltPattern: '5x112', lugCount: 5, centerBoreMm: 66.6, wheelSize: '7.5Jx19 ET32', torqueNm: 142, torqueLbFt: 105, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['wheel-size.com', 'bimmerboom.com'], notes: 'Base trims commonly ride on smaller 18" wheels; 19" shown here is one of several OEM options.' },
  { id: 'mercedes-c-class', make: 'Mercedes-Benz', model: 'C-Class (W206)', generation: '2021–2024 (sedan)', market: 'eu', tireSize: '205/55R17', boltPattern: '5x112', lugCount: 5, centerBoreMm: 66.6, wheelSize: '6.5Jx17 ET34.5', torqueNm: 130, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['wheel-size.com', 'pneufrank.ch'], notes: 'Torque figure sourced from a table covering the prior W205 generation; not independently confirmed for W206.' },
  { id: 'mercedes-glc', make: 'Mercedes-Benz', model: 'GLC (X253)', generation: '2019–2022 (facelift)', market: 'eu', tireSize: '215/55R17', boltPattern: '5x112', lugCount: 5, centerBoreMm: 66.6, wheelSize: '8Jx17 ET46', torqueNm: 130, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['avtoreference.com', 'pneufrank.ch'] },
  { id: 'audi-a4', make: 'Audi', model: 'A4 (B9)', generation: '2019–2025 (facelift)', market: 'eu', tireSize: '205/60R16', boltPattern: '5x112', lugCount: 5, centerBoreMm: 66.5, wheelSize: '7Jx16 ET35', torqueNm: 120, torqueLbFt: 89, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['tireswheels.org', 'avtoreference.com'] },
  { id: 'audi-a3', make: 'Audi', model: 'A3 (8Y)', generation: '2020–2024', market: 'eu', tireSize: '205/55R16', boltPattern: '5x112', lugCount: 5, centerBoreMm: 57.1, wheelSize: '7Jx16 ET40', torqueNm: 120, fastenerType: 'wheel-bolt', confidence: 'low', sources: ['selected.pl', 'avtoreference.com'], notes: 'Torque not independently confirmed for the A3 8Y — extrapolated from the same MQB-platform spec used on Golf/A4. Verify before use.' },
  { id: 'audi-q5', make: 'Audi', model: 'Q5 (FY)', generation: '2017–2020', market: 'eu', tireSize: '235/65R17', boltPattern: '5x112', lugCount: 5, centerBoreMm: 66.5, wheelSize: '8Jx17 ET39', torqueNm: 140, torqueLbFt: 103, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['avtoreference.com', 'tireswheels.org'], notes: 'Torque figure sourced from the prior Q5 8R generation, not FY-specific.' },
  { id: 'renault-clio', make: 'Renault', model: 'Clio (V)', generation: '2019–2023 (BJA)', market: 'eu', tireSize: '175/65R14', boltPattern: '4x100', lugCount: 4, centerBoreMm: 60.1, wheelSize: '5.5Jx14 ET40', torqueNm: 110, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['wheel-size.com', 'avtoreference.com', 'la-cle-dynamometrique.fr'], notes: 'Higher trims / E-Tech hybrid variants with 17" wheels may spec up to 130 Nm.' },
  { id: 'peugeot-208', make: 'Peugeot', model: '208 (P21)', generation: '2019–2024', market: 'eu', tireSize: '185/65R15', boltPattern: '4x108', lugCount: 4, centerBoreMm: 65.1, wheelSize: '6Jx15 ET32', torqueNm: 110, fastenerType: 'wheel-bolt', confidence: 'medium', sources: ['wheel-size.com', 'avtoreference.com', 'la-cle-dynamometrique.fr'] },
  { id: 'seat-leon', make: 'SEAT', model: 'Leon (Mk4)', generation: '2020–2024', market: 'eu', tireSize: '195/65R15', boltPattern: '5x112', lugCount: 5, centerBoreMm: 57.1, wheelSize: '6Jx15 ET43', torqueNm: 120, fastenerType: 'wheel-bolt', confidence: 'low', sources: ['wheel-size.com', 'avtoreference.com', 'pneufrank.ch'], notes: 'Torque extrapolated from the previous Leon generation on the same bolt pattern, not Mk4-specific.' },
  { id: 'skoda-octavia', make: 'Skoda', model: 'Octavia (Mk4)', generation: '2020–2024', market: 'eu', tireSize: '205/55R16', boltPattern: '5x112', lugCount: 5, centerBoreMm: 57.1, wheelSize: '6Jx16 ET48', fastenerType: 'wheel-bolt', confidence: 'low', sources: ['wheel-size.com', 'avtoreference.com'], notes: 'Torque spec could not be verified for this generation; not reported to avoid guessing.' },
  { id: 'opel-corsa', make: 'Opel', model: 'Corsa (F)', generation: '2019–2023', market: 'eu', tireSize: '185/65R15', boltPattern: '4x108', lugCount: 4, centerBoreMm: 65.1, wheelSize: '6Jx15 ET32', torqueNm: 130, fastenerType: 'wheel-bolt', confidence: 'low', sources: ['wheel-size.com', 'avtoreference.com', 'carwiki.de'], notes: 'Torque figure was inconsistent across sources (110–130 Nm) — treat as approximate.' },
]);

export function vehicleMakes(): readonly string[] {
  return Object.freeze([...new Set(vehicleFitmentData.map((vehicle) => vehicle.make))].sort((a, b) => a.localeCompare(b)));
}

export function vehiclesByMake(make: string): readonly VehicleFitment[] {
  return vehicleFitmentData.filter((vehicle) => vehicle.make === make);
}

export function vehicleById(id: string): VehicleFitment | undefined {
  return vehicleFitmentData.find((vehicle) => vehicle.id === id);
}
