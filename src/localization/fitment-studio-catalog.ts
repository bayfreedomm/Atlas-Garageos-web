import type { UiLocale } from '../ui/page-locale';
import { frFitmentStudioText } from './fitment-studio/fr';
import { itFitmentStudioText } from './fitment-studio/it';
import { ptBrFitmentStudioText } from './fitment-studio/pt-br';
import { plFitmentStudioText } from './fitment-studio/pl';
import { nlFitmentStudioText } from './fitment-studio/nl';
import { trFitmentStudioText } from './fitment-studio/tr';

/**
 * Dedicated locale catalog for the Fitment Studio flagship page (`/fitment-studio/`,
 * `/de/fitment-studio/`, `/es/fitment-studio/`) and its controller (`src/ui/fitment-page.ts`).
 *
 * This page is JS-driven rather than mostly static markup (like the pages that use
 * `site-catalog.ts`'s `UiStrings`/`PlatformCatalog`), so it follows the flatter per-feature
 * catalog pattern used by `visualization-3d.ts`: one object per locale, consumed directly by
 * the page's own controller instead of a generic `translate(locale, key)` helper.
 *
 * This replaces the old, English-only `localization/catalog.ts` for this page — that module
 * had no other consumers, so its handful of strings (`appName`, `garageEmpty`, `sharedTitle`,
 * `sharedNotice`, …) live here now, alongside every other user-visible string from the page
 * markup and its controller.
 */

export interface FitmentStudioText {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly appName: string;
  readonly geometryDisclaimer: string;

  readonly skipLink: string;
  readonly brandSubtitle: string;
  readonly homeAriaLabel: string;
  readonly primaryNavAria: string;
  readonly navHome: string;
  readonly navTools: string;
  readonly navCompare: string;
  readonly breadcrumbAria: string;
  readonly breadcrumbAllTools: string;

  readonly heroEyebrow: string;
  readonly heroTitle: string;
  readonly heroCopy: string;
  readonly ctaCompare: string;
  readonly ctaFindWhatFits: string;
  readonly capabilitiesAria: string;
  readonly capTireSizeLabel: string;
  readonly capTireSizeDetail: string;
  readonly capWheelPositionLabel: string;
  readonly capWheelPositionDetail: string;
  readonly capSpeedLabel: string;
  readonly capSpeedDetail: string;

  readonly journeyImportTitle: string;
  readonly journeyImportTireCopy: string;
  readonly journeyImportWheelCopy: string;

  readonly sharedTitle: string;
  readonly sharedNotice: string;
  readonly sharedNameLabel: string;
  readonly sharedSaveButton: string;
  readonly sharedInvalidMessage: string;

  readonly compareEyebrow: string;
  readonly compareTitle: string;
  readonly compareIntro: string;
  readonly setupCardCurrentLabel: string;
  readonly setupCardCurrentTag: string;
  readonly setupCardNewLabel: string;
  readonly setupCardNewTag: string;
  readonly groupTireTitle: string;
  readonly groupWheelTitle: string;
  readonly fieldWidth: string;
  readonly fieldProfile: string;
  readonly fieldRim: string;
  readonly fieldDiameter: string;
  readonly fieldWidthJ: string;
  readonly fieldOffsetEt: string;
  readonly setupNameLabel: string;
  readonly saveCurrentButton: string;
  readonly saveNewButton: string;
  readonly compareSubmitButton: string;
  readonly shareToolbarAria: string;
  readonly shareButtonLabel: string;
  readonly visualComparisonTitle: string;

  readonly decisionEyebrow: string;
  readonly decisionTitle: string;
  readonly decisionTireLabel: string;
  readonly decisionTireDefault: string;
  readonly decisionTireInvalid: string;
  readonly decisionTireNote: string;
  readonly decisionWheelLabel: string;
  readonly decisionWheelDefault: string;
  readonly decisionWheelInvalid: string;
  readonly decisionWheelNote: string;
  readonly decisionMeasureLabel: string;
  readonly decisionMeasureDefault: string;
  readonly decisionMeasureNote: string;
  readonly decisionLimit: string;
  readonly decisionNavAria: string;
  readonly decisionLinkPcd: string;
  readonly decisionLinkTireRating: string;
  readonly decisionLinkMeasure: string;

  readonly measureEyebrow: string;
  readonly measureTitle: string;
  readonly measureIntro: string;
  readonly stepNavAria: string;
  readonly stepGoCurrent: string;
  readonly stepGoInner: string;
  readonly stepGoOuter: string;
  readonly stepGoTargets: string;
  readonly stepGoReview: string;
  readonly stepUserMeasured: string;
  readonly stepOf: (current: number, total: number) => string;
  readonly step1Eyebrow: string;
  readonly step1Title: string;
  readonly step1Copy: string;
  readonly step1Link: string;
  readonly step2Eyebrow: string;
  readonly step2Title: string;
  readonly step2DiagramAria: string;
  readonly fixedComponentLabel: string;
  readonly innerClearanceSvgLabel: string;
  readonly step2Copy: string;
  readonly measuredInnerLabel: string;
  readonly requiredPlaceholder: string;
  readonly step3Eyebrow: string;
  readonly step3Title: string;
  readonly step3DiagramAria: string;
  readonly fenderLabel: string;
  readonly outerClearanceSvgLabel: string;
  readonly step3Copy: string;
  readonly measuredOuterLabel: string;
  readonly step4Eyebrow: string;
  readonly step4Title: string;
  readonly step4Copy: string;
  readonly desiredInnerLabel: string;
  readonly desiredOuterLabel: string;
  readonly noTargetPlaceholder: string;
  readonly step5Eyebrow: string;
  readonly step5Title: string;
  readonly saveClearanceButton: string;
  readonly backButton: string;
  readonly continueButton: string;

  readonly whatFitsEyebrow: string;
  readonly whatFitsTitle: string;
  readonly whatFitsIntro: string;
  readonly whatFitsDisclaimer: string;
  readonly goalSelectLabel: string;
  readonly goalOptionClosest: string;
  readonly goalOptionOuter: string;
  readonly goalOptionInner: string;
  readonly goalOptionBalanced: string;
  readonly goalOptionTarget: string;
  readonly wheelRangeLegend: string;
  readonly widthMinLabel: string;
  readonly widthMaxLabel: string;
  readonly widthStepLabel: string;
  readonly offsetMinLabel: string;
  readonly offsetMaxLabel: string;
  readonly offsetStepLabel: string;
  readonly tireRangeLegend: string;
  readonly targetRimLabel: string;
  readonly tireWidthMinLabel: string;
  readonly tireWidthMaxLabel: string;
  readonly tireWidthStepLabel: string;
  readonly aspectMinLabel: string;
  readonly aspectMaxLabel: string;
  readonly aspectStepLabel: string;
  readonly maxDiameterChangeLabel: string;
  readonly noConstraintPlaceholder: string;
  readonly resultsLabel: string;
  readonly findMatchesButton: string;
  readonly noMatchesTitle: string;
  readonly noMatchesCopy: string;

  readonly fitmentMapTitle: string;
  readonly fitmentMapDisclaimer: string;
  readonly mapEyebrow: string;
  readonly mapIntro: string;
  readonly generateMapButton: string;
  readonly mapLegendAria: string;
  readonly mapCellMetrics: (inner: string, outer: string, projectedInner: string, projectedOuter: string) => string;
  readonly decisionTireValue: (current: string, proposed: string) => string;
  readonly decisionWheelValue: (inner: string, outer: string) => string;
  readonly legendChecked: string;
  readonly legendCheckedDetail: string;
  readonly legendGreen: string;
  readonly legendGreenDetail: string;
  readonly legendYellow: string;
  readonly legendYellowDetail: string;
  readonly legendRed: string;
  readonly legendRedDetail: string;
  readonly mapWidthOffsetHeader: string;

  readonly garageTitle: string;
  readonly garageEyebrow: string;
  readonly garageSectionTitle: string;
  readonly garageIntro: string;
  readonly currentVehicleLabel: string;
  readonly noSavedVehicleOption: string;
  readonly vehicleNicknameLabel: string;
  readonly vehicleNicknameDefaultValue: string;
  readonly garageEmpty: string;
  readonly garageEmptyCopy: string;
  readonly noVehicleSelected: string;
  readonly garageReady: string;
  readonly currentSetupSummary: (spec: string) => string;
  readonly saveOrMeasurePrompt: string;
  readonly measuredBadge: string;
  readonly notMeasuredBadge: string;
  readonly savedSetupCount: (count: number) => string;
  readonly metricTire: string;
  readonly metricWheel: string;
  readonly metricMeasurements: string;
  readonly metricSavedSetups: string;
  readonly recorded: string;
  readonly notRecorded: string;
  readonly loadAsCurrentButton: string;
  readonly loadAsNewButton: string;
  readonly shareButton: string;
  readonly deleteButton: string;
  readonly deleteConfirm: (name: string) => string;

  readonly relatedEyebrow: string;
  readonly relatedTitle: string;
  readonly relatedIntro: string;
  readonly relatedTireComparisonTitle: string;
  readonly relatedTireComparisonDetail: string;
  readonly relatedWheelOffsetTitle: string;
  readonly relatedWheelOffsetDetail: string;
  readonly relatedSaveTitle: string;
  readonly relatedSaveDetail: string;

  // Controller (fitment-page.ts) status / dynamic strings not tied to a fixed markup label.
  readonly candidateLoaded: string;
  readonly combinedCandidateLoaded: string;
  readonly setupSavedToBrowser: string;
  readonly sharedSetupSaved: string;
  readonly clearanceProfileSaved: string;
  readonly combinedCandidateSaved: string;
  readonly recoveredEmptyGarage: string;
  readonly closestGeometricMatches: string;
  readonly noGreenAlternatives: string;
  readonly loadIntoComparison: string;
  readonly nearestAlternativeSummary: (widthOffset: string, state: string, inner: string, outer: string, gridSteps: string, widthSteps: string, offsetSteps: string) => string;
  readonly widthOffsetColumnHeader: string;
  readonly calculatedInnerOverlap: (mm: string) => string;
  readonly calculatedOuterOverlap: (mm: string) => string;
  readonly innerBelowTarget: (mm: string) => string;
  readonly outerBelowTarget: (mm: string) => string;
  readonly meetsTargetsReason: string;
  readonly noTargetsReason: string;
  readonly preflightSummary: (wheelCount: number, tireCount: number, combinations: number, ceiling: number) => string;
  readonly preflightIncomplete: string;
  readonly searchDidNotStart: string;
  readonly whatFitsSummary: (preflightCount: number, eligibleWheel: number, eligibleTire: number, rejectedOverlap: number, showing: number) => string;
  readonly compareResultButton: string;
  readonly saveToGarageButton: string;
  readonly seeGeometryDetailsButton: string;
  readonly shareResultButton: string;
  readonly resultMetricInnerClearance: string;
  readonly resultMetricOuterClearance: string;
  readonly resultMetricDiameterChange: string;
  readonly resultMetricSpeedometer: string;
  readonly provenanceCalculated: string;
  readonly provenanceUserMeasured: string;
  readonly criterionOuterPresence: string;
  readonly criterionInnerClearance: string;
  readonly criterionMinimumClearance: string;
  readonly criterionOuterTargetDistance: string;
  readonly criterionGeometryChange: string;
  readonly criterionTireDiameterDifference: string;
  readonly criterionRanksFirst: (label: string, value: string, unit: string, preferred: string) => string;
  readonly combinedWheelSummary: (innerChange: string, outerPoke: string) => string;
  readonly combinedTireSummary: (diameter: string, diffMm: string, diffPercent: string, sidewall: string, circumference: string, speed: string) => string;
  readonly combinedClearanceSummary: (inner: string, outer: string) => string;
  readonly rankedLexicographically: (criteria: string) => string;
  readonly noOptionalTargets: string;
  readonly userTargetChecks: (checks: string) => string;
  readonly targetMet: string;
  readonly targetMissed: string;
  readonly geometryOnlyDisclaimer: string;
  readonly explorerCandidateNamePrefix: string;
  readonly measurementEnteredSummary: (inner: string, outer: string) => string;
  readonly measurementNotEntered: string;
  readonly rowCurrentSidewall: string;
  readonly rowNewSidewall: string;
  readonly rowCurrentDiameter: string;
  readonly rowNewDiameter: string;
  readonly rowDiameterDifference: string;
  readonly rowRideHeightDifference: string;
  readonly rowSpeedSameRpm: string;
  readonly rowInnerPositionChange: string;
  readonly rowOuterPokeChange: string;
  readonly rowCurrentCircumference: string;
  readonly rowNewCircumference: string;
  readonly rowCurrentRevolutions: string;
  readonly rowNewRevolutions: string;
  readonly visualCurrentLabel: (mm: string) => string;
  readonly visualNewLabel: (mm: string) => string;
  readonly visualInnerLabel: (mm: string) => string;
  readonly visualOuterLabel: (mm: string) => string;
  readonly measurementReviewIncomplete: string;
  readonly desiredNotSupplied: string;
  readonly measurementReviewSummary: (inner: string, outer: string, desiredInner: string, desiredOuter: string) => string;
  readonly shareDialogTitle: string;
  readonly shareDialogText: string;
  readonly fixSetupBeforeSharing: string;
  readonly setupSharedNativeMessage: string;
  readonly linkCopiedMessage: string;
  readonly copyUnavailableMessage: (url: string) => string;
}

export const fitmentStudioText: Readonly<Record<UiLocale, FitmentStudioText>> = Object.freeze({
  en: {
    metaTitle: 'Wheel & Tire Fitment Compare',
    metaDescription: 'Compare current and proposed wheel and tire setups, visualize geometry changes, and optionally add measured clearances.',
    appName: 'Fitment Studio',
    geometryDisclaimer: 'Geometry comparison only. Results are not a safety, clearance, or compatibility verdict.',

    skipLink: 'Skip to wheel and tire comparison',
    brandSubtitle: 'Wheel & Tire Compare',
    homeAriaLabel: 'Atlas GarageOS home',
    primaryNavAria: 'Primary navigation',
    navHome: 'Home',
    navTools: 'Tools',
    navCompare: 'Wheel & Tire Compare',
    breadcrumbAria: 'Breadcrumb',
    breadcrumbAllTools: '← All tools',

    heroEyebrow: 'Wheel & tire fitment compare',
    heroTitle: 'See what changes before you change wheels.',
    heroCopy: 'Enter your current setup and the setup you are considering. Atlas shows tire-size change, wheel position, and static geometry without pretending that geometry alone proves road fitment.',
    ctaCompare: 'Compare two setups',
    ctaFindWhatFits: 'Find what fits my range',
    capabilitiesAria: 'Comparison includes',
    capTireSizeLabel: 'Tire size',
    capTireSizeDetail: 'Diameter & circumference',
    capWheelPositionLabel: 'Wheel position',
    capWheelPositionDetail: 'Inner & outer movement',
    capSpeedLabel: 'Speed effect',
    capSpeedDetail: 'Calculated from diameter',

    journeyImportTitle: 'Setup carried into this workspace',
    journeyImportTireCopy: 'Both tire sizes were carried over. Wheel widths and ET values are still example defaults: replace them with your actual wheels before interpreting the comparison.',
    journeyImportWheelCopy: 'Wheel dimensions were carried over. Tire sizes still use the values shown in the form: confirm them before interpreting the comparison.',

    sharedTitle: 'Shared setup opened',
    sharedNotice: 'This setup has not been saved to My Garage.',
    sharedNameLabel: 'Saved setup name',
    sharedSaveButton: 'Save shared setup',
    sharedInvalidMessage: 'The shared setup is invalid and was not loaded or saved.',

    compareEyebrow: 'Setup comparison',
    compareTitle: 'Current vs new',
    compareIntro: 'Enter the tire line and wheel specification exactly as marked.',
    setupCardCurrentLabel: 'Current setup',
    setupCardCurrentTag: 'Baseline',
    setupCardNewLabel: 'New setup',
    setupCardNewTag: 'Candidate',
    groupTireTitle: 'Tire',
    groupWheelTitle: 'Wheel',
    fieldWidth: 'Width',
    fieldProfile: 'Profile',
    fieldRim: 'Rim R',
    fieldDiameter: 'Diameter',
    fieldWidthJ: 'Width J',
    fieldOffsetEt: 'Offset ET',
    setupNameLabel: 'Setup name',
    saveCurrentButton: 'Save current',
    saveNewButton: 'Save new',
    compareSubmitButton: 'Compare setups',
    shareToolbarAria: 'Share this comparison',
    shareButtonLabel: 'Share this setup',
    visualComparisonTitle: 'Current and new geometry',

    decisionEyebrow: 'Decision record',
    decisionTitle: 'What this comparison knows — and does not',
    decisionTireLabel: 'Calculated · tire',
    decisionTireDefault: 'Enter both tire sizes',
    decisionTireInvalid: 'Enter valid tire and wheel values to compare',
    decisionTireNote: 'Nominal geometry and theoretical speed effect, not tire approval.',
    decisionWheelLabel: 'Calculated · wheel',
    decisionWheelDefault: 'Enter both wheel specifications',
    decisionWheelInvalid: 'No valid wheel-position result yet',
    decisionWheelNote: 'Static inner and outer movement, not real vehicle clearance.',
    decisionMeasureLabel: 'User measurement',
    decisionMeasureDefault: 'Inner and outer gaps not entered',
    decisionMeasureNote: 'Use the guided measurement steps below; entered values are not independently verified.',
    decisionLimit: 'Still to verify for your vehicle: bolt pattern and center bore, load/speed rating, brakes, suspension travel, body clearance and manufacturer/local requirements. Atlas does not turn these calculations into a road-use approval.',
    decisionNavAria: 'Continue the fitment decision',
    decisionLinkPcd: 'Check PCD and center bore →',
    decisionLinkTireRating: 'Check tire rating →',
    decisionLinkMeasure: 'Measure real gaps →',

    measureEyebrow: 'Measure my car',
    measureTitle: 'Use your vehicle’s real gaps',
    measureIntro: 'Static geometry starts with measurements you control.',
    stepNavAria: 'Measurement steps',
    stepGoCurrent: 'Current',
    stepGoInner: 'Inner',
    stepGoOuter: 'Outer',
    stepGoTargets: 'Targets',
    stepGoReview: 'Review',
    stepUserMeasured: 'USER MEASURED',
    stepOf: (current, total) => `Step ${current} of ${total}`,
    step1Eyebrow: 'Step 1',
    step1Title: 'Confirm the current setup',
    step1Copy: 'The Current Setup above is the baseline for every projection. Correct it before taking measurements.',
    step1Link: 'Review current setup',
    step2Eyebrow: 'Step 2',
    step2Title: 'Measure inner clearance',
    step2DiagramAria: 'Diagram showing the inner wheel edge measured to the nearest fixed suspension component',
    fixedComponentLabel: 'FIXED COMPONENT',
    innerClearanceSvgLabel: 'Inner clearance',
    step2Copy: 'Measure the shortest static gap from the inner wheel or tire area to the nearest fixed suspension or body component.',
    measuredInnerLabel: 'Inner clearance · mm',
    requiredPlaceholder: 'Required',
    step3Eyebrow: 'Step 3',
    step3Title: 'Measure outer clearance',
    step3DiagramAria: 'Diagram showing the outer wheel edge measured to the fender boundary',
    fenderLabel: 'FENDER',
    outerClearanceSvgLabel: 'Outer clearance',
    step3Copy: 'Measure the shortest static gap from the outer wheel or tire area to the fender boundary you are evaluating.',
    measuredOuterLabel: 'Outer clearance · mm',
    step4Eyebrow: 'Step 4',
    step4Title: 'Add optional targets',
    step4Copy: 'Leave either field empty if you do not have a target. Atlas will not invent a minimum margin.',
    desiredInnerLabel: 'Desired inner · mm',
    desiredOuterLabel: 'Desired outer · mm',
    noTargetPlaceholder: 'No target',
    step5Eyebrow: 'Step 5',
    step5Title: 'Review measurements',
    saveClearanceButton: 'Save to selected vehicle',
    backButton: 'Back',
    continueButton: 'Continue',

    whatFitsEyebrow: 'Find what fits',
    whatFitsTitle: 'Set your intent, then your range',
    whatFitsIntro: 'Results combine wheel geometry with tire calculations. GREEN never means road-safe.',
    whatFitsDisclaimer: 'Search and ranking reflect wheel geometry preferences, not road safety or verified vehicle compatibility.',
    goalSelectLabel: 'What are you trying to do?',
    goalOptionClosest: 'Stay closest to current geometry',
    goalOptionOuter: 'Increase outer presence',
    goalOptionInner: 'Prioritize inner clearance',
    goalOptionBalanced: 'Balance inner and outer clearance',
    goalOptionTarget: 'Reach my outer-clearance target',
    wheelRangeLegend: 'Wheel range',
    widthMinLabel: 'Width min · J',
    widthMaxLabel: 'Width max · J',
    widthStepLabel: 'Width step',
    offsetMinLabel: 'Offset min · ET',
    offsetMaxLabel: 'Offset max · ET',
    offsetStepLabel: 'Offset step',
    tireRangeLegend: 'Tire range',
    targetRimLabel: 'Target rim · in',
    tireWidthMinLabel: 'Tire width min',
    tireWidthMaxLabel: 'Tire width max',
    tireWidthStepLabel: 'Tire width step',
    aspectMinLabel: 'Aspect min',
    aspectMaxLabel: 'Aspect max',
    aspectStepLabel: 'Aspect step',
    maxDiameterChangeLabel: 'Max diameter change · %',
    noConstraintPlaceholder: 'No constraint',
    resultsLabel: 'Results',
    findMatchesButton: 'Find geometric matches',
    noMatchesTitle: 'No geometric matches in this range',
    noMatchesCopy: 'Review your explicit constraints or narrow a different part of the search range.',

    fitmentMapTitle: 'Wheel Geometry Map',
    fitmentMapDisclaimer: 'Colors describe projected wheel clearance from your measurements. They are not road-safety verdicts.',
    mapEyebrow: 'Advanced geometry',
    mapIntro: 'Explore wheel width and offset. Select any cell for its calculated detail.',
    generateMapButton: 'Generate map',
    mapLegendAria: 'Map status legend',
    mapCellMetrics: (inner, outer, projectedInner, projectedOuter) => `Inner change: ${inner} mm · Outer poke change: ${outer} mm · Projected inner: ${projectedInner} mm · Projected outer: ${projectedOuter} mm`,
    decisionTireValue: (current, proposed) => `${current} → ${proposed} mm diameter`,
    decisionWheelValue: (inner, outer) => `Inner ${inner} mm · outer ${outer} mm`,
    legendChecked: 'CHECKED',
    legendCheckedDetail: 'no calculated wheel overlap; no margin target supplied',
    legendGreen: 'GREEN',
    legendGreenDetail: 'meets your supplied geometric targets',
    legendYellow: 'YELLOW',
    legendYellowDetail: 'below a supplied target',
    legendRed: 'RED',
    legendRedDetail: 'calculated wheel overlap',
    mapWidthOffsetHeader: 'Width / Offset',

    garageTitle: 'My Garage',
    garageEyebrow: 'Save for later',
    garageSectionTitle: 'Saved vehicle & setups',
    garageIntro: 'Optional: keep measurements and setups in this browser so you can reuse them later.',
    currentVehicleLabel: 'Current vehicle',
    noSavedVehicleOption: 'No saved vehicle',
    vehicleNicknameLabel: 'New vehicle nickname',
    vehicleNicknameDefaultValue: 'My Vehicle',
    garageEmpty: 'No saved setups yet.',
    garageEmptyCopy: 'A setup appears here only after you choose Save.',
    noVehicleSelected: 'No vehicle selected',
    garageReady: 'Your garage is ready',
    currentSetupSummary: (spec) => `Current setup · ${spec}`,
    saveOrMeasurePrompt: 'Save a setup or complete Measure My Car to create a vehicle record.',
    measuredBadge: '✓ Measured',
    notMeasuredBadge: 'Not measured',
    savedSetupCount: (count) => `${count} saved setup${count === 1 ? '' : 's'}`,
    metricTire: 'Tire',
    metricWheel: 'Wheel',
    metricMeasurements: 'Measurements',
    metricSavedSetups: 'Saved setups',
    recorded: 'Recorded',
    notRecorded: 'Not recorded',
    loadAsCurrentButton: 'Load as current',
    loadAsNewButton: 'Load as new',
    shareButton: 'Share',
    deleteButton: 'Delete',
    deleteConfirm: (name) => `Delete “${name}”?`,

    relatedEyebrow: 'Related tools',
    relatedTitle: 'Continue with one focused calculation',
    relatedIntro: 'Use the same transparent geometry engines through a task-specific entry point.',
    relatedTireComparisonTitle: 'Tire Size Comparison',
    relatedTireComparisonDetail: 'Compare diameter, sidewall, circumference, and speedometer changes.',
    relatedWheelOffsetTitle: 'Wheel Offset Calculator',
    relatedWheelOffsetDetail: 'See inner-position and outer-poke changes before using measured clearance.',
    relatedSaveTitle: 'Save this setup',
    relatedSaveDetail: 'Keep this vehicle and setup in this browser for later.',

    candidateLoaded: 'Candidate loaded into comparison. It has not been saved.',
    combinedCandidateLoaded: 'Combined candidate loaded into comparison. It has not been saved.',
    setupSavedToBrowser: 'Setup saved to this browser.',
    sharedSetupSaved: 'Shared new setup saved to this browser.',
    clearanceProfileSaved: 'User-measured clearance profile saved to this vehicle.',
    combinedCandidateSaved: 'Selected combined candidate saved explicitly to the selected vehicle.',
    recoveredEmptyGarage: 'Invalid garage data was ignored and a safe empty garage was opened.',
    closestGeometricMatches: 'Closest geometric matches',
    noGreenAlternatives: 'No green alternatives exist in the current map range.',
    loadIntoComparison: 'Load into comparison',
    nearestAlternativeSummary: (widthOffset, state, inner, outer, gridSteps, widthSteps, offsetSteps) => `${widthOffset} — ${state} · inner ${inner} mm · outer ${outer} mm · ${gridSteps} grid steps (${widthSteps} width + ${offsetSteps} offset)`,
    widthOffsetColumnHeader: 'Width / Offset',
    calculatedInnerOverlap: (mm) => `Calculated inner overlap: ${mm} mm.`,
    calculatedOuterOverlap: (mm) => `Calculated outer overlap: ${mm} mm.`,
    innerBelowTarget: (mm) => `Inner clearance is ${mm} mm below your target.`,
    outerBelowTarget: (mm) => `Outer clearance is ${mm} mm below your target.`,
    meetsTargetsReason: 'Both projected clearances meet your supplied targets. This is not a road-safety verdict.',
    noTargetsReason: 'No desired margins were supplied; only non-negative geometric clearance was checked.',
    preflightSummary: (wheelCount, tireCount, combinations, ceiling) => `Preflight: ${wheelCount} wheel × ${tireCount} tire = ${combinations} combinations (technical ceiling ${ceiling}).`,
    preflightIncomplete: 'Complete valid measurements and ranges to calculate the search size.',
    searchDidNotStart: 'Search did not start.',
    whatFitsSummary: (preflightCount, eligibleWheel, eligibleTire, rejectedOverlap, showing) => `Preflight ${preflightCount} · eligible wheel ${eligibleWheel} · eligible tire ${eligibleTire} · overlap wheels rejected ${rejectedOverlap} · showing ${showing}`,
    compareResultButton: 'Compare',
    saveToGarageButton: 'Save to Garage',
    seeGeometryDetailsButton: 'See geometry details',
    shareResultButton: 'Share',
    resultMetricInnerClearance: 'Inner clearance',
    resultMetricOuterClearance: 'Outer clearance',
    resultMetricDiameterChange: 'Diameter change',
    resultMetricSpeedometer: 'Speedometer',
    provenanceCalculated: 'CALCULATED',
    provenanceUserMeasured: 'USER MEASURED',
    criterionOuterPresence: 'outer presence',
    criterionInnerClearance: 'projected inner clearance',
    criterionMinimumClearance: 'minimum projected clearance',
    criterionOuterTargetDistance: 'distance from outer target',
    criterionGeometryChange: 'absolute wheel-position change',
    criterionTireDiameterDifference: 'absolute tire diameter difference',
    criterionRanksFirst: (label, value, unit, preferred) => `${label} ${value} ${unit} (${preferred} ranks first)`,
    combinedWheelSummary: (innerChange, outerPoke) => `CALCULATED wheel · inner change ${innerChange} mm · outer poke ${outerPoke} mm`,
    combinedTireSummary: (diameter, diffMm, diffPercent, sidewall, circumference, speed) => `CALCULATED tire · diameter ${diameter} mm · difference ${diffMm} mm / ${diffPercent}% · sidewall ${sidewall} mm · circumference ${circumference} mm · speed ${speed}%`,
    combinedClearanceSummary: (inner, outer) => `USER MEASURED → CALCULATED clearance · inner ${inner} mm · outer ${outer} mm`,
    rankedLexicographically: (criteria) => `Ranked lexicographically: ${criteria}.`,
    noOptionalTargets: 'No optional USER TARGET constraints were supplied.',
    userTargetChecks: (checks) => `USER TARGET checks: ${checks}`,
    targetMet: 'met',
    targetMissed: 'missed',
    geometryOnlyDisclaimer: 'Geometry-only result. GREEN does not mean road-safe or verified compatible.',
    explorerCandidateNamePrefix: 'Explorer',
    measurementEnteredSummary: (inner, outer) => `Entered: inner ${inner} mm · outer ${outer} mm`,
    measurementNotEntered: 'Inner and outer gaps not entered',
    rowCurrentSidewall: 'Current sidewall',
    rowNewSidewall: 'New sidewall',
    rowCurrentDiameter: 'Current diameter',
    rowNewDiameter: 'New diameter',
    rowDiameterDifference: 'Diameter difference',
    rowRideHeightDifference: 'Ride-height difference',
    rowSpeedSameRpm: 'Speed at same wheel RPM',
    rowInnerPositionChange: 'Inner-position change',
    rowOuterPokeChange: 'Outer-poke change',
    rowCurrentCircumference: 'Current circumference',
    rowNewCircumference: 'New circumference',
    rowCurrentRevolutions: 'Current revolutions',
    rowNewRevolutions: 'New revolutions',
    visualCurrentLabel: (mm) => `Current · ${mm} mm`,
    visualNewLabel: (mm) => `New · ${mm} mm`,
    visualInnerLabel: (mm) => `Inner · ${mm} mm`,
    visualOuterLabel: (mm) => `Outer · ${mm} mm`,
    measurementReviewIncomplete: 'Both inner and outer measurements are required. Without them, projected clearance and combined search cannot run.',
    desiredNotSupplied: 'not supplied',
    measurementReviewSummary: (inner, outer, desiredInner, desiredOuter) => `USER MEASURED · inner ${inner} mm · outer ${outer} mm. USER TARGET · inner ${desiredInner} · outer ${desiredOuter}. No target means no invented margin.`,
    shareDialogTitle: 'Atlas GarageOS — wheel & tire setup',
    shareDialogText: 'A wheel and tire fitment comparison from Atlas GarageOS.',
    fixSetupBeforeSharing: 'Fix the highlighted setup issues before sharing.',
    setupSharedNativeMessage: 'Setup shared. Opening the link will not save anything automatically.',
    linkCopiedMessage: 'Link copied. Opening it will not save anything automatically.',
    copyUnavailableMessage: (url) => `Copy was unavailable. Share this link: ${url}`,
  },

  de: {
    metaTitle: 'Felgen- & Reifenvergleich',
    metaDescription: 'Vergleichen Sie aktuelle und geplante Felgen- und Reifensetups, visualisieren Sie Geometrieänderungen und ergänzen Sie optional gemessene Freigänge.',
    appName: 'Fitment Studio',
    geometryDisclaimer: 'Nur Geometrievergleich. Die Ergebnisse sind kein Sicherheits-, Freigang- oder Kompatibilitätsurteil.',

    skipLink: 'Zum Felgen- und Reifenvergleich springen',
    brandSubtitle: 'Felgen- & Reifenvergleich',
    homeAriaLabel: 'Atlas GarageOS Startseite',
    primaryNavAria: 'Hauptnavigation',
    navHome: 'Start',
    navTools: 'Werkzeuge',
    navCompare: 'Felgen- & Reifenvergleich',
    breadcrumbAria: 'Brotkrumen-Navigation',
    breadcrumbAllTools: '← Alle Werkzeuge',

    heroEyebrow: 'Felgen- & Reifen-Fitment-Vergleich',
    heroTitle: 'Sehen Sie, was sich ändert, bevor Sie die Felgen wechseln.',
    heroCopy: 'Geben Sie Ihr aktuelles Setup und das geplante Setup ein. Atlas zeigt die Reifengrößenänderung, die Radposition und die statische Geometrie — ohne zu behaupten, dass Geometrie allein die Straßentauglichkeit belegt.',
    ctaCompare: 'Zwei Setups vergleichen',
    ctaFindWhatFits: 'Passenden Bereich finden',
    capabilitiesAria: 'Der Vergleich umfasst',
    capTireSizeLabel: 'Reifengröße',
    capTireSizeDetail: 'Durchmesser & Abrollumfang',
    capWheelPositionLabel: 'Radposition',
    capWheelPositionDetail: 'Bewegung nach innen & außen',
    capSpeedLabel: 'Tachoeffekt',
    capSpeedDetail: 'Berechnet aus dem Durchmesser',

    journeyImportTitle: 'Setup in diesen Arbeitsbereich übernommen',
    journeyImportTireCopy: 'Beide Reifengrößen wurden übernommen. Felgenbreiten und ET-Werte sind weiterhin Beispielwerte: Ersetzen Sie sie durch Ihre tatsächlichen Felgen, bevor Sie den Vergleich interpretieren.',
    journeyImportWheelCopy: 'Die Felgenmaße wurden übernommen. Die Reifengrößen verwenden weiterhin die im Formular gezeigten Werte: Bestätigen Sie sie, bevor Sie den Vergleich interpretieren.',

    sharedTitle: 'Geteiltes Setup geöffnet',
    sharedNotice: 'Dieses Setup wurde noch nicht in Meine Garage gespeichert.',
    sharedNameLabel: 'Name des gespeicherten Setups',
    sharedSaveButton: 'Geteiltes Setup speichern',
    sharedInvalidMessage: 'Das geteilte Setup ist ungültig und wurde weder geladen noch gespeichert.',

    compareEyebrow: 'Setup-Vergleich',
    compareTitle: 'Aktuell vs. neu',
    compareIntro: 'Geben Sie die Reifenbezeichnung und die Felgenspezifikation genau wie aufgedruckt ein.',
    setupCardCurrentLabel: 'Aktuelles Setup',
    setupCardCurrentTag: 'Basislinie',
    setupCardNewLabel: 'Neues Setup',
    setupCardNewTag: 'Kandidat',
    groupTireTitle: 'Reifen',
    groupWheelTitle: 'Felge',
    fieldWidth: 'Breite',
    fieldProfile: 'Profil',
    fieldRim: 'Zoll R',
    fieldDiameter: 'Durchmesser',
    fieldWidthJ: 'Breite J',
    fieldOffsetEt: 'Einpresstiefe ET',
    setupNameLabel: 'Setup-Name',
    saveCurrentButton: 'Aktuelles speichern',
    saveNewButton: 'Neues speichern',
    compareSubmitButton: 'Setups vergleichen',
    shareToolbarAria: 'Diesen Vergleich teilen',
    shareButtonLabel: 'Dieses Setup teilen',
    visualComparisonTitle: 'Aktuelle und neue Geometrie',

    decisionEyebrow: 'Entscheidungsprotokoll',
    decisionTitle: 'Was dieser Vergleich weiß — und was nicht',
    decisionTireLabel: 'Berechnet · Reifen',
    decisionTireDefault: 'Geben Sie beide Reifengrößen ein',
    decisionTireInvalid: 'Geben Sie gültige Reifen- und Felgenwerte zum Vergleichen ein',
    decisionTireNote: 'Nominale Geometrie und theoretischer Tachoeffekt, keine Reifenfreigabe.',
    decisionWheelLabel: 'Berechnet · Felge',
    decisionWheelDefault: 'Geben Sie beide Felgenspezifikationen ein',
    decisionWheelInvalid: 'Noch kein gültiges Ergebnis zur Radposition',
    decisionWheelNote: 'Statische Bewegung nach innen und außen, kein realer Fahrzeugfreigang.',
    decisionMeasureLabel: 'Nutzermessung',
    decisionMeasureDefault: 'Innerer und äußerer Freigang noch nicht eingegeben',
    decisionMeasureNote: 'Nutzen Sie die geführten Messschritte unten; eingegebene Werte werden nicht unabhängig geprüft.',
    decisionLimit: 'Für Ihr Fahrzeug noch zu prüfen: Lochkreis und Zentrierbohrung, Trag-/Geschwindigkeitsindex, Bremsen, Federwegreserve, Karosseriefreigang sowie Hersteller- und lokale Vorgaben. Atlas macht aus diesen Berechnungen keine Straßenzulassung.',
    decisionNavAria: 'Mit der Fitment-Entscheidung fortfahren',
    decisionLinkPcd: 'Lochkreis und Zentrierbohrung prüfen →',
    decisionLinkTireRating: 'Reifenindex prüfen →',
    decisionLinkMeasure: 'Echte Abstände messen →',

    measureEyebrow: 'Mein Auto vermessen',
    measureTitle: 'Nutzen Sie die echten Abstände Ihres Fahrzeugs',
    measureIntro: 'Statische Geometrie beginnt mit Messungen, die Sie selbst kontrollieren.',
    stepNavAria: 'Messschritte',
    stepGoCurrent: 'Aktuell',
    stepGoInner: 'Innen',
    stepGoOuter: 'Außen',
    stepGoTargets: 'Zielwerte',
    stepGoReview: 'Übersicht',
    stepUserMeasured: 'NUTZER GEMESSEN',
    stepOf: (current, total) => `Schritt ${current} von ${total}`,
    step1Eyebrow: 'Schritt 1',
    step1Title: 'Aktuelles Setup bestätigen',
    step1Copy: 'Das oben gezeigte aktuelle Setup ist die Basislinie für jede Projektion. Korrigieren Sie es, bevor Sie messen.',
    step1Link: 'Aktuelles Setup prüfen',
    step2Eyebrow: 'Schritt 2',
    step2Title: 'Inneren Freigang messen',
    step2DiagramAria: 'Diagramm, das die innere Radkante bis zum nächstgelegenen festen Fahrwerksteil zeigt',
    fixedComponentLabel: 'FESTES BAUTEIL',
    innerClearanceSvgLabel: 'Innerer Freigang',
    step2Copy: 'Messen Sie den kürzesten statischen Abstand vom inneren Felgen- oder Reifenbereich zum nächstgelegenen festen Fahrwerks- oder Karosserieteil.',
    measuredInnerLabel: 'Innerer Freigang · mm',
    requiredPlaceholder: 'Erforderlich',
    step3Eyebrow: 'Schritt 3',
    step3Title: 'Äußeren Freigang messen',
    step3DiagramAria: 'Diagramm, das die äußere Radkante bis zur Kotflügelkante zeigt',
    fenderLabel: 'KOTFLÜGEL',
    outerClearanceSvgLabel: 'Äußerer Freigang',
    step3Copy: 'Messen Sie den kürzesten statischen Abstand vom äußeren Felgen- oder Reifenbereich zur bewerteten Kotflügelkante.',
    measuredOuterLabel: 'Äußerer Freigang · mm',
    step4Eyebrow: 'Schritt 4',
    step4Title: 'Optionale Zielwerte hinzufügen',
    step4Copy: 'Lassen Sie ein Feld leer, wenn Sie keinen Zielwert haben. Atlas erfindet keine Mindestmarge.',
    desiredInnerLabel: 'Gewünschter innerer Freigang · mm',
    desiredOuterLabel: 'Gewünschter äußerer Freigang · mm',
    noTargetPlaceholder: 'Kein Zielwert',
    step5Eyebrow: 'Schritt 5',
    step5Title: 'Messwerte prüfen',
    saveClearanceButton: 'Am ausgewählten Fahrzeug speichern',
    backButton: 'Zurück',
    continueButton: 'Weiter',

    whatFitsEyebrow: 'Passendes finden',
    whatFitsTitle: 'Ziel festlegen, dann Bereich wählen',
    whatFitsIntro: 'Ergebnisse kombinieren Felgengeometrie mit Reifenberechnungen. GRÜN bedeutet nie straßensicher.',
    whatFitsDisclaimer: 'Suche und Rangfolge spiegeln Präferenzen zur Felgengeometrie wider, nicht Straßensicherheit oder geprüfte Fahrzeugkompatibilität.',
    goalSelectLabel: 'Was möchten Sie erreichen?',
    goalOptionClosest: 'Möglichst nah an der aktuellen Geometrie bleiben',
    goalOptionOuter: 'Äußere Präsenz erhöhen',
    goalOptionInner: 'Inneren Freigang priorisieren',
    goalOptionBalanced: 'Inneren und äußeren Freigang ausgleichen',
    goalOptionTarget: 'Meinen äußeren Freigang-Zielwert erreichen',
    wheelRangeLegend: 'Felgenbereich',
    widthMinLabel: 'Breite min · J',
    widthMaxLabel: 'Breite max · J',
    widthStepLabel: 'Breitenschritt',
    offsetMinLabel: 'ET min',
    offsetMaxLabel: 'ET max',
    offsetStepLabel: 'ET-Schritt',
    tireRangeLegend: 'Reifenbereich',
    targetRimLabel: 'Ziel-Felgengröße · Zoll',
    tireWidthMinLabel: 'Reifenbreite min',
    tireWidthMaxLabel: 'Reifenbreite max',
    tireWidthStepLabel: 'Reifenbreitenschritt',
    aspectMinLabel: 'Profil min',
    aspectMaxLabel: 'Profil max',
    aspectStepLabel: 'Profilschritt',
    maxDiameterChangeLabel: 'Max. Durchmesseränderung · %',
    noConstraintPlaceholder: 'Keine Einschränkung',
    resultsLabel: 'Ergebnisse',
    findMatchesButton: 'Geometrische Treffer finden',
    noMatchesTitle: 'Keine geometrischen Treffer in diesem Bereich',
    noMatchesCopy: 'Überprüfen Sie Ihre expliziten Einschränkungen oder verengen Sie einen anderen Teil des Suchbereichs.',

    fitmentMapTitle: 'Felgen-Geometriekarte',
    fitmentMapDisclaimer: 'Die Farben beschreiben den aus Ihren Messungen projizierten Felgenfreigang. Sie sind kein Straßensicherheitsurteil.',
    mapEyebrow: 'Erweiterte Geometrie',
    mapIntro: 'Erkunden Sie Felgenbreite und Einpresstiefe. Wählen Sie eine Zelle für ihr berechnetes Detail.',
    generateMapButton: 'Karte erstellen',
    mapLegendAria: 'Legende der Kartenstatus',
    mapCellMetrics: (inner, outer, projectedInner, projectedOuter) => `Innere Änderung: ${inner} mm · Änderung Außenüberstand: ${outer} mm · Projiziert innen: ${projectedInner} mm · Projiziert außen: ${projectedOuter} mm`,
    decisionTireValue: (current, proposed) => `${current} → ${proposed} mm Durchmesser`,
    decisionWheelValue: (inner, outer) => `Innen ${inner} mm · außen ${outer} mm`,
    legendChecked: 'GEPRÜFT',
    legendCheckedDetail: 'keine berechnete Radüberschneidung; kein Margen-Zielwert angegeben',
    legendGreen: 'GRÜN',
    legendGreenDetail: 'erfüllt Ihre vorgegebenen geometrischen Zielwerte',
    legendYellow: 'GELB',
    legendYellowDetail: 'unter einem vorgegebenen Zielwert',
    legendRed: 'ROT',
    legendRedDetail: 'berechnete Radüberschneidung',
    mapWidthOffsetHeader: 'Breite / ET',

    garageTitle: 'Meine Garage',
    garageEyebrow: 'Für später speichern',
    garageSectionTitle: 'Gespeichertes Fahrzeug & Setups',
    garageIntro: 'Optional: Messwerte und Setups in diesem Browser speichern, um sie später wiederzuverwenden.',
    currentVehicleLabel: 'Aktuelles Fahrzeug',
    noSavedVehicleOption: 'Kein gespeichertes Fahrzeug',
    vehicleNicknameLabel: 'Name des neuen Fahrzeugs',
    vehicleNicknameDefaultValue: 'Mein Fahrzeug',
    garageEmpty: 'Noch keine gespeicherten Setups.',
    garageEmptyCopy: 'Ein Setup erscheint hier erst, nachdem Sie auf Speichern getippt haben.',
    noVehicleSelected: 'Kein Fahrzeug ausgewählt',
    garageReady: 'Ihre Garage ist bereit',
    currentSetupSummary: (spec) => `Aktuelles Setup · ${spec}`,
    saveOrMeasurePrompt: 'Speichern Sie ein Setup oder führen Sie „Mein Auto vermessen“ aus, um einen Fahrzeugeintrag anzulegen.',
    measuredBadge: '✓ Gemessen',
    notMeasuredBadge: 'Nicht gemessen',
    savedSetupCount: (count) => `${count} gespeicherte${count === 1 ? 's' : ''} Setup${count === 1 ? '' : 's'}`,
    metricTire: 'Reifen',
    metricWheel: 'Felge',
    metricMeasurements: 'Messwerte',
    metricSavedSetups: 'Gespeicherte Setups',
    recorded: 'Erfasst',
    notRecorded: 'Nicht erfasst',
    loadAsCurrentButton: 'Als aktuell laden',
    loadAsNewButton: 'Als neu laden',
    shareButton: 'Teilen',
    deleteButton: 'Löschen',
    deleteConfirm: (name) => `„${name}“ löschen?`,

    relatedEyebrow: 'Verwandte Werkzeuge',
    relatedTitle: 'Mit einer fokussierten Berechnung fortfahren',
    relatedIntro: 'Nutzen Sie dieselben transparenten Geometrie-Engines über einen aufgabenspezifischen Einstieg.',
    relatedTireComparisonTitle: 'Reifengrößenvergleich',
    relatedTireComparisonDetail: 'Vergleichen Sie Änderungen bei Durchmesser, Seitenwand, Abrollumfang und Tacho.',
    relatedWheelOffsetTitle: 'Felgen-ET-Rechner',
    relatedWheelOffsetDetail: 'Sehen Sie Änderungen der Innen- und Außenposition, bevor Sie gemessenen Freigang nutzen.',
    relatedSaveTitle: 'Dieses Setup speichern',
    relatedSaveDetail: 'Speichern Sie dieses Fahrzeug und Setup in diesem Browser für später.',

    candidateLoaded: 'Kandidat in den Vergleich geladen. Er wurde nicht gespeichert.',
    combinedCandidateLoaded: 'Kombinierter Kandidat in den Vergleich geladen. Er wurde nicht gespeichert.',
    setupSavedToBrowser: 'Setup in diesem Browser gespeichert.',
    sharedSetupSaved: 'Geteiltes neues Setup in diesem Browser gespeichert.',
    clearanceProfileSaved: 'Nutzergemessenes Freigangprofil für dieses Fahrzeug gespeichert.',
    combinedCandidateSaved: 'Ausgewählter kombinierter Kandidat wurde explizit am ausgewählten Fahrzeug gespeichert.',
    recoveredEmptyGarage: 'Ungültige Garagendaten wurden verworfen; eine sichere, leere Garage wurde geöffnet.',
    closestGeometricMatches: 'Nächstgelegene geometrische Treffer',
    noGreenAlternatives: 'Im aktuellen Kartenbereich gibt es keine grünen Alternativen.',
    loadIntoComparison: 'In den Vergleich laden',
    nearestAlternativeSummary: (widthOffset, state, inner, outer, gridSteps, widthSteps, offsetSteps) => `${widthOffset} — ${state} · innen ${inner} mm · außen ${outer} mm · ${gridSteps} Rasterschritte (${widthSteps} Breite + ${offsetSteps} ET)`,
    widthOffsetColumnHeader: 'Breite / ET',
    calculatedInnerOverlap: (mm) => `Berechnete innere Überschneidung: ${mm} mm.`,
    calculatedOuterOverlap: (mm) => `Berechnete äußere Überschneidung: ${mm} mm.`,
    innerBelowTarget: (mm) => `Der innere Freigang liegt ${mm} mm unter Ihrem Zielwert.`,
    outerBelowTarget: (mm) => `Der äußere Freigang liegt ${mm} mm unter Ihrem Zielwert.`,
    meetsTargetsReason: 'Beide projizierten Freigänge erfüllen Ihre vorgegebenen Zielwerte. Dies ist kein Straßensicherheitsurteil.',
    noTargetsReason: 'Es wurden keine gewünschten Margen angegeben; geprüft wurde nur ein nicht-negativer geometrischer Freigang.',
    preflightSummary: (wheelCount, tireCount, combinations, ceiling) => `Vorprüfung: ${wheelCount} Felge(n) × ${tireCount} Reifen = ${combinations} Kombinationen (technische Obergrenze ${ceiling}).`,
    preflightIncomplete: 'Vervollständigen Sie gültige Messwerte und Bereiche, um die Suchgröße zu berechnen.',
    searchDidNotStart: 'Die Suche wurde nicht gestartet.',
    whatFitsSummary: (preflightCount, eligibleWheel, eligibleTire, rejectedOverlap, showing) => `Vorprüfung ${preflightCount} · geeignete Felgen ${eligibleWheel} · geeignete Reifen ${eligibleTire} · Felgen mit Überschneidung abgelehnt ${rejectedOverlap} · angezeigt ${showing}`,
    compareResultButton: 'Vergleichen',
    saveToGarageButton: 'In der Garage speichern',
    seeGeometryDetailsButton: 'Geometriedetails ansehen',
    shareResultButton: 'Teilen',
    resultMetricInnerClearance: 'Innerer Freigang',
    resultMetricOuterClearance: 'Äußerer Freigang',
    resultMetricDiameterChange: 'Durchmesseränderung',
    resultMetricSpeedometer: 'Tacho',
    provenanceCalculated: 'BERECHNET',
    provenanceUserMeasured: 'NUTZER GEMESSEN',
    criterionOuterPresence: 'äußere Präsenz',
    criterionInnerClearance: 'projizierter innerer Freigang',
    criterionMinimumClearance: 'minimaler projizierter Freigang',
    criterionOuterTargetDistance: 'Abstand zum äußeren Zielwert',
    criterionGeometryChange: 'absolute Radpositionsänderung',
    criterionTireDiameterDifference: 'absolute Reifendurchmesserdifferenz',
    criterionRanksFirst: (label, value, unit, preferred) => `${label} ${value} ${unit} (${preferred} steht an erster Stelle)`,
    combinedWheelSummary: (innerChange, outerPoke) => `BERECHNETE Felge · Innenänderung ${innerChange} mm · Außen-Poke ${outerPoke} mm`,
    combinedTireSummary: (diameter, diffMm, diffPercent, sidewall, circumference, speed) => `BERECHNETER Reifen · Durchmesser ${diameter} mm · Differenz ${diffMm} mm / ${diffPercent}% · Seitenwand ${sidewall} mm · Abrollumfang ${circumference} mm · Tacho ${speed}%`,
    combinedClearanceSummary: (inner, outer) => `NUTZER GEMESSEN → BERECHNETER Freigang · innen ${inner} mm · außen ${outer} mm`,
    rankedLexicographically: (criteria) => `Lexikografisch sortiert: ${criteria}.`,
    noOptionalTargets: 'Es wurden keine optionalen NUTZER-ZIELWERT-Vorgaben angegeben.',
    userTargetChecks: (checks) => `NUTZER-ZIELWERT-Prüfung: ${checks}`,
    targetMet: 'erreicht',
    targetMissed: 'verfehlt',
    geometryOnlyDisclaimer: 'Nur ein Geometrie-Ergebnis. GRÜN bedeutet nicht straßensicher oder geprüft kompatibel.',
    explorerCandidateNamePrefix: 'Explorer',
    measurementEnteredSummary: (inner, outer) => `Eingegeben: innen ${inner} mm · außen ${outer} mm`,
    measurementNotEntered: 'Innerer und äußerer Freigang noch nicht eingegeben',
    rowCurrentSidewall: 'Aktuelle Seitenwand',
    rowNewSidewall: 'Neue Seitenwand',
    rowCurrentDiameter: 'Aktueller Durchmesser',
    rowNewDiameter: 'Neuer Durchmesser',
    rowDiameterDifference: 'Durchmesserdifferenz',
    rowRideHeightDifference: 'Bodenfreiheitsänderung',
    rowSpeedSameRpm: 'Geschwindigkeit bei gleicher Raddrehzahl',
    rowInnerPositionChange: 'Innenpositionsänderung',
    rowOuterPokeChange: 'Außen-Poke-Änderung',
    rowCurrentCircumference: 'Aktueller Abrollumfang',
    rowNewCircumference: 'Neuer Abrollumfang',
    rowCurrentRevolutions: 'Aktuelle Umdrehungen',
    rowNewRevolutions: 'Neue Umdrehungen',
    visualCurrentLabel: (mm) => `Aktuell · ${mm} mm`,
    visualNewLabel: (mm) => `Neu · ${mm} mm`,
    visualInnerLabel: (mm) => `Innen · ${mm} mm`,
    visualOuterLabel: (mm) => `Außen · ${mm} mm`,
    measurementReviewIncomplete: 'Sowohl der innere als auch der äußere Messwert sind erforderlich. Ohne sie können projizierter Freigang und kombinierte Suche nicht ausgeführt werden.',
    desiredNotSupplied: 'nicht angegeben',
    measurementReviewSummary: (inner, outer, desiredInner, desiredOuter) => `NUTZER GEMESSEN · innen ${inner} mm · außen ${outer} mm. NUTZER-ZIELWERT · innen ${desiredInner} · außen ${desiredOuter}. Kein Zielwert bedeutet keine erfundene Marge.`,
    shareDialogTitle: 'Atlas GarageOS — Felgen- und Reifensetup',
    shareDialogText: 'Ein Felgen- und Reifen-Fitment-Vergleich von Atlas GarageOS.',
    fixSetupBeforeSharing: 'Beheben Sie die markierten Setup-Probleme, bevor Sie teilen.',
    setupSharedNativeMessage: 'Setup geteilt. Das Öffnen des Links speichert nichts automatisch.',
    linkCopiedMessage: 'Link kopiert. Das Öffnen speichert nichts automatisch.',
    copyUnavailableMessage: (url) => `Kopieren war nicht möglich. Teilen Sie diesen Link: ${url}`,
  },

  es: {
    metaTitle: 'Comparador de Llantas y Neumáticos',
    metaDescription: 'Compare configuraciones actuales y propuestas de llantas y neumáticos, visualice los cambios de geometría y añada opcionalmente holguras medidas.',
    appName: 'Fitment Studio',
    geometryDisclaimer: 'Solo comparación de geometría. Los resultados no son un veredicto de seguridad, holgura o compatibilidad.',

    skipLink: 'Saltar al comparador de llantas y neumáticos',
    brandSubtitle: 'Comparador de Llantas y Neumáticos',
    homeAriaLabel: 'Inicio de Atlas GarageOS',
    primaryNavAria: 'Navegación principal',
    navHome: 'Inicio',
    navTools: 'Herramientas',
    navCompare: 'Comparador de Llantas y Neumáticos',
    breadcrumbAria: 'Ruta de navegación',
    breadcrumbAllTools: '← Todas las herramientas',

    heroEyebrow: 'Comparador de ajuste de llantas y neumáticos',
    heroTitle: 'Vea qué cambia antes de cambiar de llantas.',
    heroCopy: 'Introduzca su configuración actual y la que está considerando. Atlas muestra el cambio de tamaño de neumático, la posición de la llanta y la geometría estática, sin pretender que la geometría por sí sola demuestre el ajuste real al vehículo.',
    ctaCompare: 'Comparar dos configuraciones',
    ctaFindWhatFits: 'Encontrar qué encaja en mi rango',
    capabilitiesAria: 'La comparación incluye',
    capTireSizeLabel: 'Tamaño del neumático',
    capTireSizeDetail: 'Diámetro y circunferencia',
    capWheelPositionLabel: 'Posición de la llanta',
    capWheelPositionDetail: 'Movimiento interior y exterior',
    capSpeedLabel: 'Efecto en la velocidad',
    capSpeedDetail: 'Calculado a partir del diámetro',

    journeyImportTitle: 'Configuración trasladada a este espacio de trabajo',
    journeyImportTireCopy: 'Se trasladaron ambos tamaños de neumático. Los anchos de llanta y los valores de ET siguen siendo valores de ejemplo: reemplácelos por los de sus llantas reales antes de interpretar la comparación.',
    journeyImportWheelCopy: 'Se trasladaron las dimensiones de la llanta. Los tamaños de neumático siguen usando los valores mostrados en el formulario: confírmelos antes de interpretar la comparación.',

    sharedTitle: 'Configuración compartida abierta',
    sharedNotice: 'Esta configuración aún no se ha guardado en Mi Garaje.',
    sharedNameLabel: 'Nombre de la configuración guardada',
    sharedSaveButton: 'Guardar configuración compartida',
    sharedInvalidMessage: 'La configuración compartida no es válida y no se cargó ni se guardó.',

    compareEyebrow: 'Comparación de configuraciones',
    compareTitle: 'Actual vs. nueva',
    compareIntro: 'Introduzca la referencia del neumático y la especificación de la llanta exactamente como aparecen marcadas.',
    setupCardCurrentLabel: 'Configuración actual',
    setupCardCurrentTag: 'Línea base',
    setupCardNewLabel: 'Nueva configuración',
    setupCardNewTag: 'Candidata',
    groupTireTitle: 'Neumático',
    groupWheelTitle: 'Llanta',
    fieldWidth: 'Ancho',
    fieldProfile: 'Perfil',
    fieldRim: 'Rin R',
    fieldDiameter: 'Diámetro',
    fieldWidthJ: 'Ancho J',
    fieldOffsetEt: 'Offset ET',
    setupNameLabel: 'Nombre de la configuración',
    saveCurrentButton: 'Guardar actual',
    saveNewButton: 'Guardar nueva',
    compareSubmitButton: 'Comparar configuraciones',
    shareToolbarAria: 'Compartir esta comparación',
    shareButtonLabel: 'Compartir esta configuración',
    visualComparisonTitle: 'Geometría actual y nueva',

    decisionEyebrow: 'Registro de decisión',
    decisionTitle: 'Qué sabe esta comparación — y qué no',
    decisionTireLabel: 'Calculado · neumático',
    decisionTireDefault: 'Introduzca ambos tamaños de neumático',
    decisionTireInvalid: 'Introduzca valores válidos de neumático y llanta para comparar',
    decisionTireNote: 'Geometría nominal y efecto teórico en la velocidad, no una homologación del neumático.',
    decisionWheelLabel: 'Calculado · llanta',
    decisionWheelDefault: 'Introduzca ambas especificaciones de llanta',
    decisionWheelInvalid: 'Aún no hay un resultado válido de posición de la llanta',
    decisionWheelNote: 'Movimiento estático interior y exterior, no la holgura real del vehículo.',
    decisionMeasureLabel: 'Medición del usuario',
    decisionMeasureDefault: 'Holguras interior y exterior aún no introducidas',
    decisionMeasureNote: 'Use los pasos de medición guiados a continuación; los valores introducidos no se verifican de forma independiente.',
    decisionLimit: 'Aún por verificar en su vehículo: patrón de birlos y diámetro de buje, índice de carga/velocidad, frenos, recorrido de suspensión, holgura de carrocería y requisitos del fabricante o locales. Atlas no convierte estos cálculos en una aprobación para circular.',
    decisionNavAria: 'Continuar con la decisión de ajuste',
    decisionLinkPcd: 'Verificar PCD y diámetro de buje →',
    decisionLinkTireRating: 'Verificar el índice del neumático →',
    decisionLinkMeasure: 'Medir holguras reales →',

    measureEyebrow: 'Medir mi coche',
    measureTitle: 'Use las holguras reales de su vehículo',
    measureIntro: 'La geometría estática comienza con mediciones que usted controla.',
    stepNavAria: 'Pasos de medición',
    stepGoCurrent: 'Actual',
    stepGoInner: 'Interior',
    stepGoOuter: 'Exterior',
    stepGoTargets: 'Objetivos',
    stepGoReview: 'Revisión',
    stepUserMeasured: 'MEDIDO POR EL USUARIO',
    stepOf: (current, total) => `Paso ${current} de ${total}`,
    step1Eyebrow: 'Paso 1',
    step1Title: 'Confirmar la configuración actual',
    step1Copy: 'La configuración actual de arriba es la línea base de toda proyección. Corríjala antes de tomar medidas.',
    step1Link: 'Revisar configuración actual',
    step2Eyebrow: 'Paso 2',
    step2Title: 'Medir la holgura interior',
    step2DiagramAria: 'Diagrama que muestra el borde interior de la llanta medido hasta el componente de suspensión fijo más cercano',
    fixedComponentLabel: 'COMPONENTE FIJO',
    innerClearanceSvgLabel: 'Holgura interior',
    step2Copy: 'Mida la holgura estática más corta desde el área interior de la llanta o el neumático hasta el componente de suspensión o carrocería fijo más cercano.',
    measuredInnerLabel: 'Holgura interior · mm',
    requiredPlaceholder: 'Obligatorio',
    step3Eyebrow: 'Paso 3',
    step3Title: 'Medir la holgura exterior',
    step3DiagramAria: 'Diagrama que muestra el borde exterior de la llanta medido hasta el límite del guardabarros',
    fenderLabel: 'GUARDABARROS',
    outerClearanceSvgLabel: 'Holgura exterior',
    step3Copy: 'Mida la holgura estática más corta desde el área exterior de la llanta o el neumático hasta el límite del guardabarros que está evaluando.',
    measuredOuterLabel: 'Holgura exterior · mm',
    step4Eyebrow: 'Paso 4',
    step4Title: 'Añadir objetivos opcionales',
    step4Copy: 'Deje cualquiera de los campos vacío si no tiene un objetivo. Atlas no inventará un margen mínimo.',
    desiredInnerLabel: 'Holgura interior deseada · mm',
    desiredOuterLabel: 'Holgura exterior deseada · mm',
    noTargetPlaceholder: 'Sin objetivo',
    step5Eyebrow: 'Paso 5',
    step5Title: 'Revisar mediciones',
    saveClearanceButton: 'Guardar en el vehículo seleccionado',
    backButton: 'Atrás',
    continueButton: 'Continuar',

    whatFitsEyebrow: 'Encontrar qué encaja',
    whatFitsTitle: 'Defina su objetivo y luego su rango',
    whatFitsIntro: 'Los resultados combinan la geometría de la llanta con los cálculos del neumático. VERDE nunca significa seguro para circular.',
    whatFitsDisclaimer: 'La búsqueda y la clasificación reflejan preferencias de geometría de la llanta, no seguridad vial ni compatibilidad verificada del vehículo.',
    goalSelectLabel: '¿Qué está tratando de lograr?',
    goalOptionClosest: 'Mantenerse lo más cerca posible de la geometría actual',
    goalOptionOuter: 'Aumentar la presencia exterior',
    goalOptionInner: 'Priorizar la holgura interior',
    goalOptionBalanced: 'Equilibrar la holgura interior y exterior',
    goalOptionTarget: 'Alcanzar mi objetivo de holgura exterior',
    wheelRangeLegend: 'Rango de la llanta',
    widthMinLabel: 'Ancho mín · J',
    widthMaxLabel: 'Ancho máx · J',
    widthStepLabel: 'Paso de ancho',
    offsetMinLabel: 'ET mín',
    offsetMaxLabel: 'ET máx',
    offsetStepLabel: 'Paso de ET',
    tireRangeLegend: 'Rango del neumático',
    targetRimLabel: 'Rin objetivo · pulg',
    tireWidthMinLabel: 'Ancho mín del neumático',
    tireWidthMaxLabel: 'Ancho máx del neumático',
    tireWidthStepLabel: 'Paso de ancho del neumático',
    aspectMinLabel: 'Perfil mín',
    aspectMaxLabel: 'Perfil máx',
    aspectStepLabel: 'Paso de perfil',
    maxDiameterChangeLabel: 'Cambio máx. de diámetro · %',
    noConstraintPlaceholder: 'Sin restricción',
    resultsLabel: 'Resultados',
    findMatchesButton: 'Buscar coincidencias geométricas',
    noMatchesTitle: 'Sin coincidencias geométricas en este rango',
    noMatchesCopy: 'Revise sus restricciones explícitas o reduzca otra parte del rango de búsqueda.',

    fitmentMapTitle: 'Mapa de Geometría de la Llanta',
    fitmentMapDisclaimer: 'Los colores describen la holgura de la llanta proyectada a partir de sus medidas. No son un veredicto de seguridad vial.',
    mapEyebrow: 'Geometría avanzada',
    mapIntro: 'Explore el ancho y el offset de la llanta. Seleccione cualquier celda para ver su detalle calculado.',
    generateMapButton: 'Generar mapa',
    mapLegendAria: 'Leyenda de estados del mapa',
    mapCellMetrics: (inner, outer, projectedInner, projectedOuter) => `Cambio interior: ${inner} mm · Cambio de salida exterior: ${outer} mm · Interior proyectado: ${projectedInner} mm · Exterior proyectado: ${projectedOuter} mm`,
    decisionTireValue: (current, proposed) => `${current} → ${proposed} mm de diámetro`,
    decisionWheelValue: (inner, outer) => `Interior ${inner} mm · exterior ${outer} mm`,
    legendChecked: 'VERIFICADO',
    legendCheckedDetail: 'sin solapamiento calculado de la llanta; sin objetivo de margen indicado',
    legendGreen: 'VERDE',
    legendGreenDetail: 'cumple sus objetivos geométricos indicados',
    legendYellow: 'AMARILLO',
    legendYellowDetail: 'por debajo de un objetivo indicado',
    legendRed: 'ROJO',
    legendRedDetail: 'solapamiento de la llanta calculado',
    mapWidthOffsetHeader: 'Ancho / Offset',

    garageTitle: 'Mi Garaje',
    garageEyebrow: 'Guardar para más tarde',
    garageSectionTitle: 'Vehículo y configuraciones guardadas',
    garageIntro: 'Opcional: guarde mediciones y configuraciones en este navegador para reutilizarlas más adelante.',
    currentVehicleLabel: 'Vehículo actual',
    noSavedVehicleOption: 'Sin vehículo guardado',
    vehicleNicknameLabel: 'Apodo del nuevo vehículo',
    vehicleNicknameDefaultValue: 'Mi vehículo',
    garageEmpty: 'Aún no hay configuraciones guardadas.',
    garageEmptyCopy: 'Una configuración aparece aquí solo después de que elija Guardar.',
    noVehicleSelected: 'Ningún vehículo seleccionado',
    garageReady: 'Su garaje está listo',
    currentSetupSummary: (spec) => `Configuración actual · ${spec}`,
    saveOrMeasurePrompt: 'Guarde una configuración o complete Medir mi coche para crear un registro de vehículo.',
    measuredBadge: '✓ Medido',
    notMeasuredBadge: 'No medido',
    savedSetupCount: (count) => `${count} configuración${count === 1 ? '' : 'es'} guardada${count === 1 ? '' : 's'}`,
    metricTire: 'Neumático',
    metricWheel: 'Llanta',
    metricMeasurements: 'Mediciones',
    metricSavedSetups: 'Configuraciones guardadas',
    recorded: 'Registrado',
    notRecorded: 'No registrado',
    loadAsCurrentButton: 'Cargar como actual',
    loadAsNewButton: 'Cargar como nueva',
    shareButton: 'Compartir',
    deleteButton: 'Eliminar',
    deleteConfirm: (name) => `¿Eliminar “${name}”?`,

    relatedEyebrow: 'Herramientas relacionadas',
    relatedTitle: 'Continúe con un cálculo específico',
    relatedIntro: 'Use los mismos motores de geometría transparentes a través de un punto de entrada específico para cada tarea.',
    relatedTireComparisonTitle: 'Comparador de Tamaño de Neumáticos',
    relatedTireComparisonDetail: 'Compare los cambios de diámetro, flanco, circunferencia y velocímetro.',
    relatedWheelOffsetTitle: 'Calculadora de Offset de Llantas',
    relatedWheelOffsetDetail: 'Vea los cambios de posición interior y exterior antes de usar la holgura medida.',
    relatedSaveTitle: 'Guardar esta configuración',
    relatedSaveDetail: 'Guarde este vehículo y esta configuración en este navegador para más tarde.',

    candidateLoaded: 'Candidata cargada en la comparación. No se ha guardado.',
    combinedCandidateLoaded: 'Candidata combinada cargada en la comparación. No se ha guardado.',
    setupSavedToBrowser: 'Configuración guardada en este navegador.',
    sharedSetupSaved: 'Nueva configuración compartida guardada en este navegador.',
    clearanceProfileSaved: 'Perfil de holgura medido por el usuario guardado para este vehículo.',
    combinedCandidateSaved: 'La candidata combinada seleccionada se guardó explícitamente en el vehículo seleccionado.',
    recoveredEmptyGarage: 'Se ignoraron datos de garaje no válidos y se abrió un garaje vacío seguro.',
    closestGeometricMatches: 'Coincidencias geométricas más cercanas',
    noGreenAlternatives: 'No existen alternativas en verde dentro del rango actual del mapa.',
    loadIntoComparison: 'Cargar en la comparación',
    nearestAlternativeSummary: (widthOffset, state, inner, outer, gridSteps, widthSteps, offsetSteps) => `${widthOffset} — ${state} · interior ${inner} mm · exterior ${outer} mm · ${gridSteps} pasos de cuadrícula (${widthSteps} ancho + ${offsetSteps} offset)`,
    widthOffsetColumnHeader: 'Ancho / Offset',
    calculatedInnerOverlap: (mm) => `Solapamiento interior calculado: ${mm} mm.`,
    calculatedOuterOverlap: (mm) => `Solapamiento exterior calculado: ${mm} mm.`,
    innerBelowTarget: (mm) => `La holgura interior está ${mm} mm por debajo de su objetivo.`,
    outerBelowTarget: (mm) => `La holgura exterior está ${mm} mm por debajo de su objetivo.`,
    meetsTargetsReason: 'Ambas holguras proyectadas cumplen los objetivos indicados. Esto no es un veredicto de seguridad vial.',
    noTargetsReason: 'No se indicaron márgenes deseados; solo se comprobó una holgura geométrica no negativa.',
    preflightSummary: (wheelCount, tireCount, combinations, ceiling) => `Prechequeo: ${wheelCount} llanta(s) × ${tireCount} neumático(s) = ${combinations} combinaciones (límite técnico ${ceiling}).`,
    preflightIncomplete: 'Complete mediciones y rangos válidos para calcular el tamaño de la búsqueda.',
    searchDidNotStart: 'La búsqueda no se inició.',
    whatFitsSummary: (preflightCount, eligibleWheel, eligibleTire, rejectedOverlap, showing) => `Prechequeo ${preflightCount} · llantas elegibles ${eligibleWheel} · neumáticos elegibles ${eligibleTire} · llantas con solapamiento rechazadas ${rejectedOverlap} · mostrando ${showing}`,
    compareResultButton: 'Comparar',
    saveToGarageButton: 'Guardar en el Garaje',
    seeGeometryDetailsButton: 'Ver detalles de geometría',
    shareResultButton: 'Compartir',
    resultMetricInnerClearance: 'Holgura interior',
    resultMetricOuterClearance: 'Holgura exterior',
    resultMetricDiameterChange: 'Cambio de diámetro',
    resultMetricSpeedometer: 'Velocímetro',
    provenanceCalculated: 'CALCULADO',
    provenanceUserMeasured: 'MEDIDO POR EL USUARIO',
    criterionOuterPresence: 'presencia exterior',
    criterionInnerClearance: 'holgura interior proyectada',
    criterionMinimumClearance: 'holgura mínima proyectada',
    criterionOuterTargetDistance: 'distancia al objetivo exterior',
    criterionGeometryChange: 'cambio absoluto de posición de la llanta',
    criterionTireDiameterDifference: 'diferencia absoluta de diámetro del neumático',
    criterionRanksFirst: (label, value, unit, preferred) => `${label} ${value} ${unit} (${preferred} tiene prioridad)`,
    combinedWheelSummary: (innerChange, outerPoke) => `Llanta CALCULADA · cambio interior ${innerChange} mm · avance exterior ${outerPoke} mm`,
    combinedTireSummary: (diameter, diffMm, diffPercent, sidewall, circumference, speed) => `Neumático CALCULADO · diámetro ${diameter} mm · diferencia ${diffMm} mm / ${diffPercent}% · flanco ${sidewall} mm · circunferencia ${circumference} mm · velocidad ${speed}%`,
    combinedClearanceSummary: (inner, outer) => `MEDIDO POR EL USUARIO → holgura CALCULADA · interior ${inner} mm · exterior ${outer} mm`,
    rankedLexicographically: (criteria) => `Clasificado lexicográficamente: ${criteria}.`,
    noOptionalTargets: 'No se indicaron restricciones opcionales de OBJETIVO DEL USUARIO.',
    userTargetChecks: (checks) => `Comprobaciones de OBJETIVO DEL USUARIO: ${checks}`,
    targetMet: 'cumplido',
    targetMissed: 'no alcanzado',
    geometryOnlyDisclaimer: 'Resultado solo de geometría. VERDE no significa seguro para circular ni compatibilidad verificada.',
    explorerCandidateNamePrefix: 'Explorador',
    measurementEnteredSummary: (inner, outer) => `Introducido: interior ${inner} mm · exterior ${outer} mm`,
    measurementNotEntered: 'Holguras interior y exterior aún no introducidas',
    rowCurrentSidewall: 'Flanco actual',
    rowNewSidewall: 'Flanco nuevo',
    rowCurrentDiameter: 'Diámetro actual',
    rowNewDiameter: 'Diámetro nuevo',
    rowDiameterDifference: 'Diferencia de diámetro',
    rowRideHeightDifference: 'Diferencia de altura al suelo',
    rowSpeedSameRpm: 'Velocidad a las mismas RPM de la llanta',
    rowInnerPositionChange: 'Cambio de posición interior',
    rowOuterPokeChange: 'Cambio de avance exterior',
    rowCurrentCircumference: 'Circunferencia actual',
    rowNewCircumference: 'Circunferencia nueva',
    rowCurrentRevolutions: 'Revoluciones actuales',
    rowNewRevolutions: 'Revoluciones nuevas',
    visualCurrentLabel: (mm) => `Actual · ${mm} mm`,
    visualNewLabel: (mm) => `Nuevo · ${mm} mm`,
    visualInnerLabel: (mm) => `Interior · ${mm} mm`,
    visualOuterLabel: (mm) => `Exterior · ${mm} mm`,
    measurementReviewIncomplete: 'Se requieren las mediciones interior y exterior. Sin ellas, no se puede calcular la holgura proyectada ni ejecutar la búsqueda combinada.',
    desiredNotSupplied: 'no indicado',
    measurementReviewSummary: (inner, outer, desiredInner, desiredOuter) => `MEDIDO POR EL USUARIO · interior ${inner} mm · exterior ${outer} mm. OBJETIVO DEL USUARIO · interior ${desiredInner} · exterior ${desiredOuter}. Sin objetivo significa sin margen inventado.`,
    shareDialogTitle: 'Atlas GarageOS — configuración de llantas y neumáticos',
    shareDialogText: 'Una comparación de ajuste de llantas y neumáticos de Atlas GarageOS.',
    fixSetupBeforeSharing: 'Corrija los problemas de configuración resaltados antes de compartir.',
    setupSharedNativeMessage: 'Configuración compartida. Abrir el enlace no guardará nada automáticamente.',
    linkCopiedMessage: 'Enlace copiado. Abrirlo no guardará nada automáticamente.',
    copyUnavailableMessage: (url) => `No se pudo copiar. Comparta este enlace: ${url}`,
  },
  fr: frFitmentStudioText,
  it: itFitmentStudioText,
  'pt-br': ptBrFitmentStudioText,
  pl: plFitmentStudioText,
  nl: nlFitmentStudioText,
  tr: trFitmentStudioText,
});
