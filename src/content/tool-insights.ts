import type { ToolId } from '../seo/tool-registry';

export interface ToolInsightContent {
  readonly facts: readonly { readonly title: string; readonly body: string }[];
  readonly commonMistake?: string;
  readonly warning?: string;
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
  },
  'tire-size-comparison': {
    facts: [
      { title: 'Width and diameter are different', body: 'A wider tire can still have nearly the same — or even a smaller — overall diameter.' },
      { title: 'Ride-height change is half the diameter change', body: 'Only the radius sits between the hub and the road, so a 10 mm diameter increase raises static ride height by about 5 mm.' },
      { title: 'Speed follows rolling diameter', body: 'If calibration stays unchanged, a larger rolling diameter makes actual speed higher than the indicated speed.' },
    ],
    commonMistake: 'Assuming a wider tire is automatically taller, safer, or better in wet conditions. Width alone cannot answer those questions.',
    warning: 'This is nominal geometry, not a wet/dry grip or fitment verdict. Tread design, compound, pressure, load, wheel width, and vehicle setup also matter.',
  },
  'wheel-offset-calculator': {
    facts: [
      { title: 'Offset is not the whole story', body: 'Changing wheel width changes both inner and outer position even when ET stays the same.' },
      { title: 'Lower ET usually moves outward', body: 'For the same wheel width, reducing positive offset generally moves the wheel farther toward the fender.' },
      { title: 'Inner clearance can shrink quietly', body: 'A wider wheel may gain outer presence while also moving its inner edge closer to suspension components.' },
    ],
    commonMistake: 'Comparing ET numbers without comparing wheel widths. An 8J ET35 and a 9J ET35 do not sit in the same place.',
    warning: 'Wheel position does not prove brake, tire, suspension, or fender clearance on a specific vehicle.',
  },
  'speedometer-error-calculator': {
    facts: [
      { title: 'The error comes from rolling diameter', body: 'The calculator compares tire circumferences, not the speedometer electronics themselves.' },
      { title: 'The percentage scales with speed', body: 'A 2% geometry difference is about 2 km/h at 100 km/h and about 1.2 mph at 60 mph.' },
      { title: 'Real rolling radius changes', body: 'Wear, pressure, temperature, load, and tire construction can move the real result away from nominal geometry.' },
    ],
    commonMistake: 'Treating the calculated number as a calibration certificate. It is a geometry estimate based on nominal tire dimensions.',
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
});

export function insightForTool(id: ToolId): ToolInsightContent {
  return toolInsights[id];
}
