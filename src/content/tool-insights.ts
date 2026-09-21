import type { ToolId } from '../seo/tool-registry';

export interface ToolFaqEntry {
  readonly question: string;
  readonly answer: string;
}

export interface ToolInsightContent {
  readonly facts: readonly { readonly title: string; readonly body: string }[];
  readonly commonMistake?: string;
  readonly warning?: string;
  readonly faqs?: readonly ToolFaqEntry[];
}

export const toolInsights: Readonly<Record<ToolId, ToolInsightContent>> = Object.freeze({
  'fitment-studio': {
    facts: [
      { title: 'Geometry first', body: 'Wheel width and offset together determine how far the wheel moves inward and outward.' },
      { title: 'Tire size matters too', body: 'A wheel can move safely on paper while the mounted tire still reaches a suspension or body component.' },
      { title: 'Measure your car', body: 'Real inner and outer clearances are more useful than assuming a universal fitment threshold.' },
    ],
    commonMistake: 'Treating a geometric clearance result as proof that a wheel and tire setup will fit every vehicle in real driving conditions.',
    warning: 'Brake clearance, tire shape, suspension travel, alignment, load, and bodywork are outside a simple static geometry calculation.',
  },
  'tire-size-calculator': {
    facts: [
      { title: 'The middle number is a ratio', body: 'In 225/45R18, the sidewall is 45% of the 225 mm nominal section width — not 45 mm.' },
      { title: 'Two sidewalls count', body: 'Overall diameter includes the rim plus one sidewall above and one below the wheel.' },
      { title: 'Real tires vary', body: 'Nominal size is a standard label. Actual measured dimensions vary by model, rim width, pressure, load, and manufacturer tolerance.' },
    ],
    commonMistake: 'Reading the profile number as millimetres. It is a percentage of the nominal tire width.',
    faqs: [
      { question: 'What do the numbers in a tire size like 225/45R18 mean?', answer: '225 is the nominal section width in millimetres, 45 is the aspect ratio (sidewall height as a percentage of that width), R means radial construction, and 18 is the rim diameter in inches.' },
      { question: 'Can I put a different size tire on my car?', answer: 'Many vehicles can run a slightly different size as long as the overall diameter stays close to the original — usually within about 3% — so the speedometer, ABS, and gearing stay accurate. Always confirm against your vehicle’s manual before buying.' },
      { question: 'Why does my calculated diameter differ from what my tire shop measures?', answer: 'This calculator uses the nominal size printed on the sidewall. Real tires vary slightly by manufacturer, tread wear, and inflation pressure, so a small difference from a physical measurement is normal.' },
    ],
  },
  'tire-size-comparison': {
    facts: [
      { title: 'Width and diameter are different', body: 'A wider tire can still have nearly the same — or even a smaller — overall diameter.' },
      { title: 'Ride-height change is half the diameter change', body: 'Only the radius sits between the hub and the road, so a 10 mm diameter increase raises static ride height by about 5 mm.' },
      { title: 'Speed follows rolling diameter', body: 'If calibration stays unchanged, a larger rolling diameter makes actual speed higher than the indicated speed.' },
    ],
    commonMistake: 'Assuming a wider tire is automatically taller, safer, or better in wet conditions. Width alone cannot answer those questions.',
    warning: 'This is nominal geometry, not a wet/dry grip or fitment verdict. Tread design, compound, pressure, load, wheel width, and vehicle setup also matter.',
    faqs: [
      { question: 'How much difference is considered safe when comparing two tire sizes?', answer: 'A common rule of thumb is keeping the overall diameter difference within about 3%, which limits speedometer, ABS, and gearing effects. This is a geometry guideline, not a legal or manufacturer specification.' },
      { question: 'Does a wider tire always mean better grip?', answer: 'Not necessarily. Width alone does not determine grip — tread compound, tread pattern, pressure, load, and the wheel width it is mounted on all matter at least as much.' },
      { question: 'Will changing tire size affect my fuel economy?', answer: 'A larger or heavier tire can increase rolling resistance and slightly reduce fuel economy, but this calculator only reports geometric differences, not efficiency.' },
    ],
  },
  'wheel-offset-calculator': {
    facts: [
      { title: 'Offset is not the whole story', body: 'Changing wheel width changes both inner and outer position even when ET stays the same.' },
      { title: 'Lower ET usually moves outward', body: 'For the same wheel width, reducing positive offset generally moves the wheel farther toward the fender.' },
      { title: 'Inner clearance can shrink quietly', body: 'A wider wheel may gain outer presence while also moving its inner edge closer to suspension components.' },
    ],
    commonMistake: 'Comparing ET numbers without comparing wheel widths. An 8J ET35 and a 9J ET35 do not sit in the same place.',
    warning: 'Wheel position does not prove brake, tire, suspension, or fender clearance on a specific vehicle.',
    faqs: [
      { question: 'What does wheel offset (ET) actually mean?', answer: 'Offset is the distance in millimetres between the wheel’s mounting surface and its true centreline. A higher positive offset tucks the wheel further inward; a lower or negative offset pushes it further outward.' },
      { question: 'Does a lower offset always cause rubbing?', answer: 'Not by itself — it depends on the wheel width, tire size, suspension travel, and steering angle. This calculator shows the position change only; it cannot confirm real clearance without a measurement.' },
      { question: 'Can I compare two different wheel widths at once?', answer: 'Yes — changing wheel width changes inner and outer position even at the same ET, so this calculator accounts for width and offset together rather than offset alone.' },
    ],
  },
  'speedometer-error-calculator': {
    facts: [
      { title: 'The error comes from rolling diameter', body: 'The calculator compares tire circumferences, not the speedometer electronics themselves.' },
      { title: 'The percentage scales with speed', body: 'A 2% geometry difference is about 2 km/h at 100 km/h and about 1.2 mph at 60 mph.' },
      { title: 'Real rolling radius changes', body: 'Wear, pressure, temperature, load, and tire construction can move the real result away from nominal geometry.' },
    ],
    commonMistake: 'Treating the calculated number as a calibration certificate. It is a geometry estimate based on nominal tire dimensions.',
    faqs: [
      { question: 'Why does my speedometer read wrong after changing tire size?', answer: 'A speedometer is calibrated for one wheel rotational speed. A larger tire covers more distance per rotation, so the car is actually going faster than the number shown; a smaller tire has the opposite effect.' },
      { question: 'Is this the same error my ABS or traction control sees?', answer: 'It is the same underlying rolling-diameter change, but this calculator only estimates the speedometer reading — it does not model how a specific vehicle’s ABS or traction-control software responds.' },
      { question: 'Can I use this to get an exact speedometer correction?', answer: 'Only as an estimate. Real rolling diameter is affected by tire wear, pressure, load, and manufacturer tolerance, so treat this as a starting point rather than a certified calibration value.' },
    ],
  },
  'gear-ratio-calculator': {
    facts: [
      { title: 'Taller tires act like taller gearing', body: 'Increasing tire diameter reduces engine RPM at the same road speed when the drivetrain ratio is unchanged.' },
      { title: 'Shorter tires do the opposite', body: 'A smaller rolling diameter raises engine RPM at the same road speed.' },
      { title: 'This model assumes direct drive', body: 'The road-speed/RPM relationship must include transmission ratio if the selected gear is not 1:1.' },
    ],
    commonMistake: 'Using axle ratio alone while ignoring the selected transmission gear ratio.',
  },
  'fitment-map': {
    facts: [
      { title: 'It is a geometry map', body: 'Each cell represents a wheel width and offset combination relative to the measured baseline.' },
      { title: 'Targets come from you', body: 'Atlas does not invent a universal safe clearance margin.' },
      { title: 'Neutral is not bad', body: 'Without a supplied target, a non-overlap result is shown as checked geometry rather than a green safety verdict.' },
    ],
    commonMistake: 'Reading a green or non-overlap geometry state as an approval for road use.',
    warning: 'Dynamic suspension, steering angle, brake shape, tire deformation, alignment, and body movement are not represented by the static map.',
  },
  'measure-my-car': {
    facts: [
      { title: 'Measure the shortest gap', body: 'The limiting component matters more than a convenient measurement point.' },
      { title: 'Use the current setup as the baseline', body: 'Projected changes are only as useful as the baseline measurements attached to them.' },
      { title: 'Static clearance is only one state', body: 'Steering and suspension movement can reduce clearance while driving.' },
    ],
    commonMistake: 'Measuring only the easiest visible gap instead of the nearest fixed suspension or body component.',
    warning: 'Never work under or around a raised vehicle without appropriate support and safe measuring access.',
  },
  'fuel-cost-calculator': {
    facts: [
      { title: 'Consumption drives the estimate', body: 'A small change in L/100 km or MPG can materially change total cost on a long trip.' },
      { title: 'Use a realistic average', body: 'City traffic, speed, load, weather, and driving style can make a dashboard average more useful than a brochure figure.' },
      { title: 'Price is local', body: 'The calculator uses the fuel price you enter so it works across currencies and markets.' },
    ],
    commonMistake: 'Entering an optimistic manufacturer consumption figure for a trip that will be driven in very different conditions.',
  },
  'road-trip-cost-calculator': {
    facts: [
      { title: 'Return trips double the distance', body: 'Atlas keeps one-way and return-trip distance explicit so the cost is not accidentally undercounted.' },
      { title: 'Extras can dominate', body: 'Tolls, parking, ferries, and other fixed costs can outweigh small fuel-efficiency differences.' },
      { title: 'Per-person cost is a split, not a saving', body: 'Adding passengers changes the share per person, not the vehicle\'s total trip cost.' },
    ],
    commonMistake: 'Comparing two trips using fuel cost alone while ignoring tolls, parking, or a different return distance.',
  },
  'ev-charging-cost-calculator': {
    facts: [
      { title: 'Grid energy is higher than battery energy', body: 'Charging losses mean the wall usually supplies more energy than the battery actually stores.' },
      { title: 'Power is not always constant', body: 'Real charging power can taper as state of charge rises, especially during DC fast charging.' },
      { title: 'Home and public prices can differ sharply', body: 'The same energy amount can have very different costs depending on tariff and charging network.' },
    ],
    commonMistake: 'Dividing battery energy by the charger label and treating the result as an exact real-world charging time.',
    warning: 'Displayed time is an idealized constant-power estimate. Vehicle limits, charger limits, temperature, battery management, and charging curves can make real sessions longer.',
  },
  'mpg-l100km-converter': {
    facts: [
      { title: 'The scales move in opposite directions', body: 'Higher MPG is better, while lower L/100 km is better.' },
      { title: 'US and Imperial gallons differ', body: 'The same MPG number means a different fuel economy depending on which gallon standard is used.' },
      { title: 'The relationship is reciprocal', body: 'MPG and L/100 km do not convert with one fixed multiplier because one measures distance per fuel and the other fuel per distance.' },
    ],
    commonMistake: 'Converting MPG without specifying whether the value uses US gallons or Imperial gallons.',
  },
  'psi-bar-converter': {
    facts: [
      { title: 'Conversion is not a recommendation', body: '32 PSI and about 2.21 bar describe the same pressure; neither tells you what your vehicle should use.' },
      { title: 'Cold pressure matters', body: 'Vehicle placard recommendations are normally intended for tires measured cold.' },
      { title: 'Pressure changes with temperature', body: 'A warm tire can show a higher pressure even when no air was added.' },
    ],
    commonMistake: 'Using the maximum pressure molded on the tire sidewall as the vehicle\'s normal recommended pressure.',
    warning: 'Use the vehicle placard or manufacturer guidance for recommended tire pressure. This tool only converts units.',
  },
  'hp-kw-converter': {
    facts: [
      { title: 'Horsepower standards differ', body: 'Mechanical horsepower and metric horsepower (PS/CV) are not exactly the same unit.' },
      { title: 'kW is an SI power unit', body: 'Kilowatts express the same physical quantity as horsepower using a different unit scale.' },
      { title: 'Conversion does not measure output', body: 'Changing units cannot tell you whether an advertised engine actually produces that power.' },
    ],
    commonMistake: 'Mixing mechanical hp with metric PS/CV as though they were numerically identical.',
  },
  'nm-lb-ft-converter': {
    facts: [
      { title: 'Torque is a turning moment', body: 'N·m and lb-ft describe the same physical quantity using different unit systems.' },
      { title: 'Torque is not power', body: 'Power depends on torque and rotational speed, so equal torque figures do not imply equal horsepower.' },
      { title: 'Unit order matters', body: 'The conventional imperial expression is pound-feet (lb-ft), not foot-pounds for engine torque.' },
    ],
    commonMistake: 'Comparing torque figures without checking the unit or the engine speed at which the torque is produced.',
  },
  'power-to-weight-calculator': {
    facts: [
      { title: 'Mass matters as much as power', body: 'Two cars with the same horsepower can feel very different if one carries substantially more mass.' },
      { title: 'Use comparable weights', body: 'Curb weight, dry weight, and vehicle-plus-driver weight are different baselines.' },
      { title: 'The ratio is not acceleration', body: 'Traction, gearing, aerodynamics, power curve, and drivetrain losses also affect real performance.' },
    ],
    commonMistake: 'Comparing one vehicle using curb weight and another using dry weight or a manufacturer figure based on a different standard.',
  },
  'bolt-pattern-calculator': {
    facts: [
      { title: 'Bolt pattern is written lugs×PCD', body: 'A "5x114.3" pattern means 5 lug holes arranged on a 114.3 mm bolt circle diameter.' },
      { title: 'Measure hole-to-hole, not edge-to-edge', body: 'The distance between two adjacent bolt centers is what the geometry formula needs, not the outer rim edge.' },
      { title: 'Odd lug counts need the diagonal method', body: 'On 5-lug wheels the bolt circle is not a straight measurement across, which is why this calculator uses the trigonometric relationship instead.' },
    ],
    commonMistake: 'Measuring the distance between two lug holes that are directly across from each other on a 5-lug wheel, which is not the bolt circle diameter.',
    warning: 'A calculated PCD is a starting reference only. Always confirm bolt pattern, hub bore, and lug thread against the wheel and vehicle specification before buying.',
    faqs: [
      { question: 'How do I measure bolt pattern on a 5-lug wheel?', answer: 'Measure from the center of one lug hole to the outer edge of the hole that is two positions away (not directly across), then enter that distance here — the calculator converts it to the true bolt circle diameter using the 5-lug geometry.' },
      { question: 'Can I use a wheel with a different bolt pattern than my hub?', answer: 'No, not safely without an adapter, and adapters bring their own risks. The bolt pattern (lug count and PCD) has to match the hub, or the wheel cannot be mounted correctly.' },
      { question: 'Is bolt pattern the same as hub bore?', answer: 'No — bolt pattern describes where the lug holes sit, while hub bore is the center hole diameter that centers the wheel on the hub. Both need to match or be adapted separately.' },
    ],
  },
  'tire-load-speed-rating': {
    facts: [
      { title: 'Load index is a code, not a weight', body: 'The number on the sidewall maps to a fixed load-capacity table — it is not the weight in kilograms or pounds itself.' },
      { title: 'Speed rating is a sustained-speed rating', body: 'The letter describes the maximum speed the tire is rated to sustain, not a speed limit recommendation.' },
      { title: 'Both figures are per tire', body: 'Load index capacity applies to a single tire, not the combined capacity of an axle or the vehicle.' },
    ],
    commonMistake: 'Fitting a tire with a lower load index or speed rating than the vehicle placard specifies to save cost.',
    warning: 'Always match or exceed the load index and speed rating listed on your vehicle\'s tire placard, not just the size.',
  },
  'tire-date-code-decoder': {
    facts: [
      { title: 'The code is the last four digits of the DOT number', body: 'The first two digits are the week of manufacture, the last two are the year — for example 2219 means week 22 of 2019.' },
      { title: 'Three-digit codes predate 2000', body: 'Tires made before 2000 used a three-digit code and are effectively always past any reasonable service life today.' },
      { title: 'Age matters even with good tread', body: 'Rubber compounds harden and crack with age regardless of remaining tread depth or how the tire looks.' },
    ],
    commonMistake: 'Judging tire age only by tread depth or visual condition instead of checking the molded date code.',
    warning: 'Age guidance here reflects common manufacturer and industry practice, not a specific vehicle recommendation. Check your tire manufacturer\'s stated service life.',
  },
  'towing-capacity-calculator': {
    facts: [
      { title: 'GCWR already includes the tow vehicle', body: 'Gross Combined Weight Rating covers the loaded tow vehicle plus the trailer together, so the vehicle\'s own weight has to be subtracted first.' },
      { title: 'Passengers and cargo count against the total', body: 'Everything riding in or on the tow vehicle reduces the trailer weight that remains available.' },
      { title: 'Tongue weight is a fraction of trailer weight', body: 'Most conventional trailers want roughly 10 to 15 percent of trailer weight on the tongue or hitch.' },
    ],
    commonMistake: 'Comparing a trailer\'s weight only to the vehicle\'s advertised maximum towing capacity while ignoring passengers, cargo, and hitch equipment already loaded in the tow vehicle.',
    warning: 'This is a simplified GCWR-based estimate. Always confirm the manufacturer\'s towing capacity, GVWR, axle ratings, and hitch class for your exact vehicle configuration.',
  },
  'quarter-mile-calculator': {
    facts: [
      { title: 'The formula uses weight and power only', body: 'Elapsed time and trap speed are estimated from the power-to-weight ratio, the same two numbers that drive real acceleration.' },
      { title: 'Real results vary with the driver and the track', body: 'Traction, launch technique, gearing, altitude, and temperature all shift the real number away from the estimate.' },
      { title: '0-60 is not a reliable weight-and-power calculation', body: 'Unlike the quarter mile, there is no widely accepted formula that estimates 0-60 time from weight and power alone, so it is shown only as a rough rule of thumb.' },
    ],
    commonMistake: 'Treating the estimated elapsed time as a guaranteed result rather than a power-to-weight-based approximation.',
    warning: 'This is a physics-based estimate, not a performance guarantee. Actual times depend on traction, driver skill, gearing, weather, and track conditions.',
  },
  'compression-ratio-calculator': {
    facts: [
      { title: 'Swept volume comes from bore and stroke', body: 'Cylinder swept volume is calculated from bore and stroke alone; it does not depend on chamber shape.' },
      { title: 'Clearance volume is everything the piston does not fill at top dead center', body: 'Combustion chamber, head gasket, deck clearance, and piston dish or dome volume all add to or subtract from clearance volume.' },
      { title: 'Static ratio is not dynamic compression', body: 'Camshaft timing changes effective cylinder filling, so static compression ratio and dynamic compression ratio are different numbers.' },
    ],
    commonMistake: 'Ignoring head gasket thickness and deck clearance volume, which can shift the calculated ratio by a full point or more.',
    warning: 'This is a geometric calculation from the volumes you enter. Fuel octane requirements and safe compression ratios depend on the specific engine, tuning, and fuel.',
  },
  'vehicle-fitment-finder': {
    facts: [
      { title: 'Reference data, not a manufacturer feed', body: 'These values do not replace your vehicle’s manual — when in doubt, the manufacturer spec for your exact trim always wins.' },
      { title: 'Confidence is shown honestly', body: 'Each entry is marked High, Medium, or Low depending on how well independent sources agreed — a couple of torque specs could not be confirmed at all and are left blank rather than guessed.' },
      { title: 'Trims vary more than model names suggest', body: 'The same model can ship with different wheel or tire packages by trim or model year, so this is a starting reference, not a universal spec for the nameplate.' },
    ],
    commonMistake: 'Assuming one factory spec applies across an entire model line when individual trims carry different wheel or tire packages.',
    warning: 'This list grows over time and does not yet cover every vehicle. Always confirm against your own vehicle’s manual or door-jamb sticker before torquing wheels or ordering parts.',
    faqs: [
      { question: 'Where can I find my vehicle’s actual factory tire size and bolt pattern?', answer: 'The most reliable source is the sticker inside the driver’s door jamb or your owner’s manual — both list the exact specification for your trim as built, which can differ from generic references online.' },
      { question: 'Why isn’t my exact vehicle listed here?', answer: 'This is a curated starting set, not a complete manufacturer database. If your make and model appear but have no documented Atlas entry, or don’t appear at all yet, use the door-jamb sticker with the Tire Size or Bolt Pattern Calculator directly.' },
      { question: 'What does the confidence label mean?', answer: 'High confidence means multiple independent sources agreed. Medium or low confidence means sources disagreed or a value could not be fully confirmed — those entries ask you to cross-check before relying on them.' },
    ],
  },
  'gas-prices-today': {
    facts: [
      { title: 'A published figure, not a live quote', body: 'Each market shows the most recent verified figure from its own official source, with the date it was verified — never an animated ticker pretending a number just moved.' },
      { title: 'Every market has its own cadence', body: 'The US figure is a weekly EIA survey average, Spain comes from the official national Ministerio dataset, and Germany is an Atlas monitored sample of selected city stations rather than a national average.' },
      { title: 'No number until it is real', body: 'Before a market has ever been verified it shows a pending state with no digits at all, and a failed refresh shows the last genuinely fetched value with its date rather than inventing a fresh one.' },
    ],
    commonMistake: 'Treating a market-wide average as the price at one particular station — local taxes, brand and location move the real pump price well away from the average.',
    warning: 'Use these figures as a starting point in the calculators and adjust them to the station you actually use before relying on a cost estimate.',
  },
});

export function insightForTool(id: ToolId): ToolInsightContent {
  return toolInsights[id];
}
