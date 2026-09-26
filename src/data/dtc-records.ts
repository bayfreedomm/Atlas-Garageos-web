import { createDtcCatalog, type DtcRecord } from '../domain/dtc';

const standardEvidence = {
  id: 'sae-j2012',
  sourceType: 'official-standard',
  level: 'official',
  publisher: 'SAE International',
  title: 'SAE J2012 — Diagnostic Trouble Code Definitions',
  locator: 'https://saemobilus.sae.org/standards/j2012_199203-diagnostic-trouble-code-definitions',
  scope: 'Code framework and standardized descriptor authority. Atlas wording is an original plain-language synthesis.',
  retrievedAt: '2026-09-26T00:00:00.000Z',
  reusePermission: 'citation-only',
  permissionLocator: null,
  reviewNote: 'Cited as the standards authority; Atlas does not reproduce the Digital Annex or bulk-copy its wording.',
} as const;

const publicContextEvidence = {
  id: 'epa-obd-guidance',
  sourceType: 'government-regulation',
  level: 'official',
  publisher: 'United States Environmental Protection Agency',
  title: 'On-Board Diagnostic regulations and inspection guidance',
  locator: 'https://www.epa.gov/state-and-local-transportation/vehicle-emissions-inspection-and-maintenance-im-information-state',
  scope: 'MIL, readiness, stored-code and inspection context; not a substitute for vehicle-specific service information.',
  retrievedAt: '2026-09-26T00:00:00.000Z',
  reusePermission: 'public-domain',
  permissionLocator: 'https://www.epa.gov/web-policies-and-procedures',
  reviewNote: 'Supports Atlas diagnostic limitations and safe next-step language.',
} as const;

const limitations = [
  'A DTC identifies a monitored condition, not a failed part by itself.',
  'The same code can have different root causes across vehicles, engines and operating conditions.',
  'Freeze-frame data, related codes, service information and physical testing are needed before replacing parts.',
] as const;

const nextActions = [
  'Record every stored, pending and permanent code before clearing anything.',
  'Save freeze-frame values and note whether the warning light is steady or flashing.',
  'Use service information for the exact vehicle before testing wiring or replacing components.',
] as const;

function entry(input: {
  code: string;
  title: string;
  meaning: string;
  symptoms: readonly string[];
  causes: readonly string[];
  checks: readonly string[];
  related?: readonly string[];
}) {
  return {
    code: input.code,
    allocation: 'standardized',
    title: input.title,
    meaning: input.meaning,
    symptoms: input.symptoms,
    possibleCauses: input.causes,
    diagnosticOrder: input.checks,
    limitations,
    nextActions,
    relatedCodes: input.related ?? [],
    urgency: 'unknown',
    confidence: 'reference',
    evidence: [standardEvidence, publicContextEvidence],
    reviewedAt: '2026-09-26T00:00:00.000Z',
    status: 'published',
  } as const;
}

const result = createDtcCatalog([
  entry({ code: 'P0011', title: 'Intake camshaft timing over-advanced — Bank 1', meaning: 'The engine controller saw Bank 1 intake-cam timing farther advanced than commanded or outside the expected response range.', symptoms: ['Check-engine light', 'Rough idle or hard starting', 'Reduced performance or fuel economy'], causes: ['Oil level, condition or viscosity problem', 'Restricted or sticking oil-control valve', 'Camshaft timing actuator or wiring fault', 'Mechanical timing issue'], checks: ['Verify oil level and the vehicle-specified oil grade.', 'Inspect related wiring and connectors.', 'Compare commanded and actual cam timing with a capable scan tool.', 'Follow the manufacturer timing-system test before replacing parts.'], related: ['P0300'] }),
  entry({ code: 'P0101', title: 'Mass-airflow sensor range or performance', meaning: 'Measured airflow did not agree with the airflow the engine controller expected for the current operating conditions.', symptoms: ['Check-engine light', 'Hesitation or uneven acceleration', 'Rich or lean running symptoms'], causes: ['Air leak after the airflow sensor', 'Contaminated or damaged sensor', 'Restricted intake or air filter', 'Wiring, ground or reference-voltage fault'], checks: ['Inspect the intake tract for loose clamps, cracks and restrictions.', 'Review airflow data against engine speed and load.', 'Check power, ground and signal wiring.', 'Use the vehicle procedure before cleaning or replacing the sensor.'], related: ['P0171', 'P0174'] }),
  entry({ code: 'P0128', title: 'Engine coolant temperature below expected range', meaning: 'The engine did not reach or maintain the expected operating temperature within the monitored time and conditions.', symptoms: ['Check-engine light', 'Slow cabin-heat warm-up', 'Lower fuel economy'], causes: ['Thermostat stuck open or opening early', 'Low coolant or cooling-system issue', 'Coolant-temperature sensor or circuit error', 'Very cold operation or unusual drive cycle'], checks: ['Check coolant level only when the engine is safely cold.', 'Compare coolant temperature with ambient temperature before startup.', 'Observe warm-up data and thermostat behavior.', 'Inspect sensor wiring and follow the cooling-system procedure.'] }),
  entry({ code: 'P0171', title: 'Fuel system too lean — Bank 1', meaning: 'Fuel correction reached a lean limit on Bank 1 because the controller detected too much air, too little fuel or misleading sensor data.', symptoms: ['Check-engine light', 'Rough idle or hesitation', 'Possible loss of power'], causes: ['Unmetered intake or vacuum leak', 'Low fuel delivery', 'Dirty or biased airflow sensor', 'Exhaust leak or oxygen-sensor issue'], checks: ['Save short- and long-term fuel trims at idle and raised speed.', 'Inspect intake hoses and vacuum connections.', 'Check fuel pressure or delivery using the vehicle procedure.', 'Evaluate airflow and oxygen-sensor data before replacing sensors.'], related: ['P0101', 'P0174', 'P0300'] }),
  entry({ code: 'P0174', title: 'Fuel system too lean — Bank 2', meaning: 'Fuel correction reached a lean limit on Bank 2 because the controller detected too much air, too little fuel or misleading sensor data.', symptoms: ['Check-engine light', 'Rough idle or hesitation', 'Possible loss of power'], causes: ['Unmetered intake or vacuum leak affecting Bank 2', 'Low fuel delivery', 'Airflow measurement error', 'Exhaust leak or oxygen-sensor issue'], checks: ['Compare Bank 1 and Bank 2 fuel trims.', 'Inspect bank-specific intake and exhaust paths.', 'Check fuel delivery if both banks are lean.', 'Use live sensor data before replacing components.'], related: ['P0101', 'P0171', 'P0300'] }),
  entry({ code: 'P0300', title: 'Random or multiple-cylinder misfire detected', meaning: 'The controller detected combustion irregularity across multiple cylinders or could not isolate it to one cylinder.', symptoms: ['Flashing or steady check-engine light', 'Shaking, hesitation or loss of power', 'Poor fuel economy'], causes: ['Ignition, fuel or air-delivery problem', 'Vacuum leak', 'Mechanical compression or timing issue', 'Contaminated fuel or control-system fault'], checks: ['If the MIL flashes or the engine shakes severely, reduce load and stop safely.', 'Record cylinder counters and freeze-frame data.', 'Inspect basic ignition, intake and fuel conditions.', 'Use cylinder-specific testing rather than replacing parts by code alone.'], related: ['P0011', 'P0171', 'P0174', 'P0301', 'P0420', 'P0430'] }),
  entry({ code: 'P0301', title: 'Cylinder 1 misfire detected', meaning: 'The controller detected repeated combustion irregularity associated with cylinder 1.', symptoms: ['Flashing or steady check-engine light', 'Rough running or hesitation', 'Reduced power'], causes: ['Cylinder 1 ignition fault', 'Injector or fuel-delivery problem', 'Air leak affecting the cylinder', 'Compression, valve or mechanical problem'], checks: ['If the MIL flashes, reduce load and stop safely.', 'Compare cylinder misfire counters and freeze-frame data.', 'Inspect or test ignition and injector operation using approved procedures.', 'Perform mechanical testing if ignition and fuel checks pass.'], related: ['P0300', 'P0171'] }),
  entry({ code: 'P0401', title: 'Exhaust-gas recirculation flow insufficient', meaning: 'The controller commanded EGR operation but measured less recirculated exhaust flow than expected.', symptoms: ['Check-engine light', 'Possible pinging under load', 'Often little noticeable change'], causes: ['Restricted EGR passages', 'Sticking or inoperative EGR valve', 'Vacuum, pressure or position-sensor problem', 'Wiring or control fault'], checks: ['Inspect accessible hoses, connectors and passages.', 'Use scan data to compare commanded and measured EGR response.', 'Check for deposits according to the vehicle procedure.', 'Test the valve and related sensors before replacement.'] }),
  entry({ code: 'P0420', title: 'Catalyst efficiency below threshold — Bank 1', meaning: 'The controller judged Bank 1 catalyst oxygen-storage or conversion behavior below the monitored threshold.', symptoms: ['Check-engine light', 'Often no obvious drivability symptom', 'Possible reduced performance if exhaust flow is restricted'], causes: ['Aging or damaged catalyst', 'Upstream engine misfire or fuel-control problem', 'Exhaust leak', 'Biased oxygen sensor or wiring issue'], checks: ['Resolve active misfire or fuel-trim codes first.', 'Inspect for exhaust leaks and physical damage.', 'Compare upstream and downstream oxygen-sensor behavior.', 'Confirm catalyst operation with the vehicle-specific procedure.'], related: ['P0300', 'P0430'] }),
  entry({ code: 'P0430', title: 'Catalyst efficiency below threshold — Bank 2', meaning: 'The controller judged Bank 2 catalyst oxygen-storage or conversion behavior below the monitored threshold.', symptoms: ['Check-engine light', 'Often no obvious drivability symptom', 'Possible reduced performance if exhaust flow is restricted'], causes: ['Aging or damaged Bank 2 catalyst', 'Misfire or fuel-control problem', 'Exhaust leak', 'Biased oxygen sensor or wiring issue'], checks: ['Resolve active misfire or mixture codes first.', 'Inspect the Bank 2 exhaust path for leaks.', 'Compare relevant oxygen-sensor signals.', 'Confirm catalyst operation with exact service information.'], related: ['P0300', 'P0420'] }),
  entry({ code: 'P0442', title: 'Evaporative-emissions system small leak detected', meaning: 'The sealed fuel-vapor system did not hold the expected pressure or vacuum and the measured leak was in the small-leak range.', symptoms: ['Check-engine light', 'Usually no drivability symptom', 'Occasional fuel-vapor odor'], causes: ['Loose, damaged or incorrect fuel cap', 'Small hose or seal leak', 'Purge or vent valve not sealing', 'Leak-detection sensor or pump issue'], checks: ['Inspect and correctly tighten the fuel cap.', 'Visually inspect EVAP hoses and connectors.', 'Command purge and vent components with suitable equipment.', 'Use an approved low-pressure smoke test when required.'], related: ['P0455', 'P0456'] }),
  entry({ code: 'P0455', title: 'Evaporative-emissions system large leak detected', meaning: 'The fuel-vapor system could not build or retain the expected pressure or vacuum, indicating a large leak or open path.', symptoms: ['Check-engine light', 'Usually little drivability change', 'Possible fuel-vapor odor'], causes: ['Fuel cap missing, loose or damaged', 'Disconnected or split EVAP hose', 'Vent or purge valve stuck open', 'Canister or filler-neck leak'], checks: ['Check the cap and filler area first.', 'Inspect for disconnected or damaged hoses.', 'Verify purge and vent sealing commands.', 'Use an approved smoke test without exceeding system pressure limits.'], related: ['P0442', 'P0456'] }),
  entry({ code: 'P0456', title: 'EVAP very small leak detected', meaning: 'The fuel-vapor system lost a very small amount of pressure or vacuum during its self-test.', symptoms: ['Check-engine light', 'Usually no drivability symptom', 'Occasional faint fuel-vapor odor'], causes: ['Fuel-cap seal issue', 'Pin-hole hose or seal leak', 'Purge or vent valve seepage', 'Leak-detection component error'], checks: ['Inspect the cap seal and filler neck.', 'Check small EVAP hoses and service ports.', 'Evaluate purge and vent sealing.', 'Use an approved smoke or decay test if visual checks pass.'], related: ['P0442', 'P0455'] }),
  entry({ code: 'P0700', title: 'Transmission control system fault request', meaning: 'The transmission controller stored one or more faults and requested the engine controller to illuminate the warning light.', symptoms: ['Check-engine light', 'Possible shift-quality or limp-mode symptoms', 'Symptoms depend on the transmission code stored elsewhere'], causes: ['A separate transmission-control fault', 'Power, ground or communication problem', 'Transmission sensor, solenoid or hydraulic issue', 'Controller or network fault'], checks: ['Scan every vehicle module, not only the engine controller.', 'Record the transmission-specific codes and freeze-frame data.', 'Check battery voltage, power, grounds and connectors.', 'Diagnose the underlying transmission code rather than P0700 alone.'] }),
  entry({ code: 'U0100', title: 'Lost communication with ECM/PCM', meaning: 'Another module stopped receiving expected network messages from the ECM/PCM.', symptoms: ['Warning lights or multiple messages', 'No-start, stalling or reduced-function mode', 'Several communication codes may appear together'], causes: ['Low system voltage or power/ground loss', 'Network wiring or connector fault', 'Module offline or not waking', 'Controller or configuration problem'], checks: ['Test battery voltage and controller powers/grounds first.', 'Perform a complete network scan and note which modules respond.', 'Inspect shared network wiring and connectors using the vehicle diagram.', 'Do not replace a controller before network and power tests are complete.'], related: ['U0121'] }),
  entry({ code: 'U0121', title: 'Lost communication with ABS control module', meaning: 'Another module stopped receiving expected network messages from the anti-lock braking controller.', symptoms: ['ABS, stability or traction warning lights', 'Driver-assistance functions may be unavailable', 'Other communication codes may be stored'], causes: ['ABS module power or ground loss', 'Network wiring or connector fault', 'Low battery voltage', 'ABS controller or configuration issue'], checks: ['Treat braking warnings seriously and confirm normal base-brake operation.', 'Scan all modules and record communication status.', 'Check ABS fuses, powers, grounds and connectors.', 'Follow the network diagram before considering module replacement.'], related: ['U0100'] }),
]);

if (!result.ok) throw new Error(`Invalid production DTC catalog: ${result.issues.map((item) => `${item.field}: ${item.message}`).join('; ')}`);

export const dtcRecords: readonly DtcRecord[] = result.value.records;
export const dtcByCode = result.value.byCode;
