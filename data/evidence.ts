export interface EvidenceItem {
  id: string;
  title: string;
  category: EvidenceCategory;
  summary: string;
  description: string;
  keyObservations: string[];
  expectedVsObserved: { label: string; expected: string; observed: string }[];
  howToVerify: string;
  verificationDifficulty: 'Easy' | 'Moderate' | 'Advanced';
  sources: string[];
  relatedExperimentIds: string[];
  tags: string[];
}

export type EvidenceCategory =
  | 'Horizon & Visibility'
  | 'Water & Level'
  | 'Celestial Observations'
  | 'Motion & Physics'
  | 'Navigation & Mapping'
  | 'Photography & Optics';

export const categoryMeta: Record<EvidenceCategory, { color: string; bgColor: string; borderColor: string; icon: string }> = {
  'Horizon & Visibility': { color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-300', icon: 'eye' },
  'Water & Level': { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300', icon: 'droplets' },
  'Celestial Observations': { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-300', icon: 'sun' },
  'Motion & Physics': { color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-300', icon: 'atom' },
  'Navigation & Mapping': { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300', icon: 'compass' },
  'Photography & Optics': { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-300', icon: 'camera' },
};

export const evidenceData: EvidenceItem[] = [
  // ── Horizon & Visibility ──────────────────────────────────────
  {
    id: 'ev-1',
    title: 'Horizon Always Rises to Eye Level',
    category: 'Horizon & Visibility',
    summary: 'At any altitude — from sea level to 120,000 feet — the horizon consistently rises to meet the observer\'s eye level.',
    description: 'One of the most fundamental observations anyone can make is that the horizon always appears at eye level regardless of altitude. On a curved surface, as an observer gains altitude the horizon should drop further and further below eye level at a predictable rate. Pilots, high-altitude balloonists, and amateur camera operators have all documented that the horizon remains at eye level even at extreme altitudes. Weather balloon footage with non-fisheye (rectilinear) lenses consistently shows a flat, eye-level horizon at 100,000+ feet.',
    keyObservations: [
      'Horizon remains at eye level from ground level to 120,000+ feet',
      'Only fisheye or wide-angle lenses produce a curved appearance',
      'Rectilinear (non-distorting) lenses show a flat horizon at all altitudes',
      'Pilots report no need to adjust nose-down to maintain altitude over long flights',
      'The amount of predicted horizon drop at high altitude is never observed'
    ],
    expectedVsObserved: [
      { label: 'At 35,000 ft (cruising altitude)', expected: 'Horizon drops ~3.27° below eye level', observed: 'Horizon appears at eye level' },
      { label: 'At 120,000 ft (balloon altitude)', expected: 'Horizon drops ~6.05° below eye level', observed: 'Horizon remains at eye level with rectilinear lens' },
      { label: 'Horizon appearance', expected: 'Noticeable downward angle required to see horizon', observed: 'Looking straight ahead meets the horizon' }
    ],
    howToVerify: 'Take a camera with a rectilinear (non-fisheye) lens to any elevated location. Use a spirit level or digital level app to confirm your camera is perfectly level. Photograph the horizon. Repeat at various altitudes.',
    verificationDifficulty: 'Easy',
    sources: [
      'Amateur high-altitude balloon footage (YouTube, multiple sources)',
      'Pilot testimonials and cockpit footage',
      'Samuel Rowbotham, "Zetetic Astronomy" (1881)'
    ],
    relatedExperimentIds: ['8', '9'],
    tags: ['horizon', 'altitude', 'eye level', 'balloon', 'pilot']
  },
  {
    id: 'ev-2',
    title: 'Long-Distance Visibility Beyond Curvature',
    category: 'Horizon & Visibility',
    summary: 'Landmarks, buildings, and landmasses are regularly photographed and observed at distances far beyond what Earth\'s curvature should allow.',
    description: 'Numerous documented observations show objects visible at distances where they should be completely hidden behind the curvature of the Earth. Using the standard curvature formula (8 inches per mile squared), objects at certain distances should be partially or fully obscured. Yet with telescopes, high-zoom cameras, and even the naked eye, these objects remain fully visible. Examples include seeing the Chicago skyline from across Lake Michigan (~60 miles), observing Corsica from the coast of Genoa (~100 miles), and many more.',
    keyObservations: [
      'Chicago skyline visible from ~60 miles across Lake Michigan (should be hidden by ~2,400 ft of curvature)',
      'Corsica visible from Genoa, Italy across ~100+ miles of Mediterranean Sea',
      'Mount Canigou visible from Marseille (~163 miles) — should be far below horizon',
      'Entire city skylines visible across large bodies of water with zoom cameras',
      'Lighthouses visible at distances exceeding their calculated curvature-limited range'
    ],
    expectedVsObserved: [
      { label: 'Chicago from 60 miles', expected: '~2,400 ft hidden by curvature', observed: 'Full skyline visible with zoom' },
      { label: 'Corsica from Genoa (100 mi)', expected: '~6,667 ft hidden', observed: 'Mountain peaks and coastline visible' },
      { label: 'Mt. Canigou from Marseille (163 mi)', expected: '~17,700 ft hidden', observed: 'Mountain visible at sunset' }
    ],
    howToVerify: 'Visit a large body of water with a clear line of sight to a distant landmark. Use a telescope or camera with 50x+ zoom. Document the distance and compare with the curvature calculator to determine how much should be hidden.',
    verificationDifficulty: 'Easy',
    sources: [
      'Rob Skiba, Joshua Nowicki — Chicago skyline photography',
      'Various long-distance photography communities',
      'Historical records of lighthouse visibility ranges'
    ],
    relatedExperimentIds: ['1', '3'],
    tags: ['visibility', 'curvature', 'long distance', 'photography', 'chicago']
  },
  {
    id: 'ev-3',
    title: 'No Visible Curvature from Any Altitude',
    category: 'Horizon & Visibility',
    summary: 'Even at the highest altitudes achieved by amateur balloons, no curvature is detectable with non-distorting lenses.',
    description: 'High-altitude weather balloons equipped with cameras have reached altitudes exceeding 120,000 feet. When a GoPro or similar wide-angle/fisheye lens is used, the horizon appears curved — but this is a known lens distortion artifact. When the same flights use rectilinear lenses (which do not distort straight lines), the horizon appears perfectly flat and level from edge to edge. This is significant because at 120,000 feet, the curvature should be readily apparent if the Earth were a sphere of 25,000 miles in circumference.',
    keyObservations: [
      'GoPro/fisheye footage shows convex AND concave horizon depending on lens position',
      'Rectilinear lens footage shows flat horizon at 120,000+ feet',
      'Lens distortion is the primary variable, not actual curvature',
      'No commercial airline passenger has ever photographed curvature with a standard phone camera',
      'NASA acknowledges that curvature is difficult to perceive below ~250,000 feet'
    ],
    expectedVsObserved: [
      { label: 'At 120,000 ft with rectilinear lens', expected: 'Visible curvature arc across frame', observed: 'Flat horizon edge to edge' },
      { label: 'Fisheye lens at same altitude', expected: 'Consistent curvature', observed: 'Curvature changes based on lens position (above/below center)' },
      { label: 'Commercial flight altitude (35,000 ft)', expected: 'Slight but measurable curvature', observed: 'No curvature visible to passengers' }
    ],
    howToVerify: 'Compare footage from the same balloon flight using both fisheye and rectilinear lenses. Note how the fisheye distorts the horizon differently depending on whether the horizon is above or below the lens center.',
    verificationDifficulty: 'Moderate',
    sources: [
      'Multiple amateur balloon launches on YouTube',
      'Dwayne Kellum high-altitude balloon footage',
      'Independent high-altitude photography projects'
    ],
    relatedExperimentIds: ['8', '9'],
    tags: ['curvature', 'balloon', 'fisheye', 'lens', 'altitude']
  },
  {
    id: 'ev-4',
    title: 'Ships Don\'t Actually Disappear Bottom-First',
    category: 'Horizon & Visibility',
    summary: 'Ships that appear to vanish "over the curve" can be brought back into full view with a telescope or zoom camera.',
    description: 'The classic argument for Earth\'s curvature is that ships disappear bottom-first over the horizon. However, when a powerful telescope or zoom camera is used, the entire ship — including the hull — can be brought back into full view. This demonstrates that the disappearance is caused by the angular resolution limit of the human eye and atmospheric perspective, not by curvature. The ship was never actually "behind" a physical curve of water.',
    keyObservations: [
      'Ships that appear to vanish can be restored to full view with optical zoom',
      'The effect is consistent with perspective and angular resolution limits',
      'Atmospheric conditions (haze, refraction) contribute to the disappearance',
      'If the ship were behind a physical curve, no amount of zoom could restore it',
      'The rate of "disappearance" varies with atmospheric conditions, not a fixed geometric curve'
    ],
    expectedVsObserved: [
      { label: 'Ship at 10 miles (naked eye)', expected: 'Bottom 66 ft hidden by curvature', observed: 'Ship appears to vanish in haze' },
      { label: 'Same ship with 60x zoom', expected: 'Bottom still hidden (physical obstruction)', observed: 'Entire ship restored to view' },
      { label: 'Disappearance rate', expected: 'Consistent with 8"/mi² formula', observed: 'Varies with weather and atmospheric conditions' }
    ],
    howToVerify: 'Watch a ship sail away from shore until it appears to vanish. Then use a telescope or camera with 50x+ optical zoom to bring it back into view. Document the distance and conditions.',
    verificationDifficulty: 'Easy',
    sources: [
      'Multiple zoom camera demonstrations on YouTube',
      'Nikon P900/P1000 long-distance photography',
      'Historical observations by Samuel Rowbotham'
    ],
    relatedExperimentIds: ['1', '3'],
    tags: ['ships', 'zoom', 'perspective', 'vanishing point', 'telescope']
  },

  // ── Water & Level ──────────────────────────────────────────────
  {
    id: 'ev-5',
    title: 'Water Always Finds and Maintains Its Level',
    category: 'Water & Level',
    summary: 'Large bodies of water consistently demonstrate a flat, level surface across vast distances when measured precisely.',
    description: 'The fundamental property of water is that it seeks and maintains its own level. This is the basis of spirit levels, water levels in construction, and the very word "sea level." On a sphere of 25,000 miles circumference, large bodies of water would need to curve at a rate of approximately 8 inches per mile squared. However, precision measurements across large lakes, canals, and bays consistently show that water surfaces are flat and level. Canal engineers, surveyors, and builders have relied on this property for millennia.',
    keyObservations: [
      'Spirit levels work because water is flat — they would be useless on a curved surface',
      'Canal engineering assumes flat water over distances of hundreds of miles',
      'The Suez Canal (120 miles) was built without locks, assuming flat water',
      'Lake surfaces show no measurable curvature with laser tests',
      'The word "level" itself implies flat, not curved'
    ],
    expectedVsObserved: [
      { label: 'Suez Canal (120 miles)', expected: '~9,600 ft of curvature to account for', observed: 'Built flat with no locks, no curvature compensation' },
      { label: 'Lake Pontchartrain (24 miles)', expected: '~384 ft of curvature', observed: 'Transmission lines appear level across entire span' },
      { label: 'Laser across calm lake (3 miles)', expected: 'Laser hits ~6 ft above target', observed: 'Laser hits at expected height (level)' }
    ],
    howToVerify: 'Use a laser level across a calm body of water at night. Set the laser at a known height and measure where it hits a target at various distances. Compare with the expected curvature drop.',
    verificationDifficulty: 'Moderate',
    sources: [
      'Canal engineering records (Suez, Panama, Erie)',
      'Bedford Level Experiment (1838, 1870)',
      'Modern laser level experiments documented online'
    ],
    relatedExperimentIds: ['2', '4', '12'],
    tags: ['water', 'level', 'flat', 'canal', 'laser']
  },
  {
    id: 'ev-6',
    title: 'Bedford Level Experiment',
    category: 'Water & Level',
    summary: 'The historic 6-mile experiment on the Old Bedford River showed no curvature across the water surface.',
    description: 'The Bedford Level Experiment is one of the most famous tests of Earth\'s shape. Originally conducted by Samuel Rowbotham in 1838 along a 6-mile stretch of the Old Bedford River in Norfolk, England, the experiment used markers at known heights to test whether the water surface curved. At 6 miles, the expected curvature drop would be approximately 24 feet. Rowbotham observed that markers remained visible at their original heights, indicating a flat water surface. The experiment has been repeated numerous times with consistent results.',
    keyObservations: [
      'Over 6 miles, ~24 feet of curvature drop is expected',
      'Markers at consistent heights remained visible across the full distance',
      'The experiment has been replicated by multiple independent researchers',
      'Alfred Russel Wallace\'s 1870 counter-experiment used a different methodology but is disputed',
      'Modern replications with laser levels confirm the original findings'
    ],
    expectedVsObserved: [
      { label: 'At 3 miles', expected: '~6 ft of curvature drop', observed: 'No measurable drop' },
      { label: 'At 6 miles', expected: '~24 ft of curvature drop', observed: 'Markers visible at original height' },
      { label: 'Water surface', expected: 'Curved downward in both directions from observer', observed: 'Flat and level across entire span' }
    ],
    howToVerify: 'Find a straight canal or calm waterway at least 3 miles long. Place markers at identical heights above water at regular intervals. Observe with a telescope from one end.',
    verificationDifficulty: 'Moderate',
    sources: [
      'Samuel Rowbotham, "Zetetic Astronomy" (1881)',
      'Lady Blount\'s replication (1901)',
      'Modern replications documented online'
    ],
    relatedExperimentIds: ['12', '2'],
    tags: ['bedford', 'canal', 'water', 'historic', 'rowbotham']
  },
  {
    id: 'ev-7',
    title: 'Laser Tests Across Frozen Lakes',
    category: 'Water & Level',
    summary: 'Laser beams projected across frozen lakes travel in straight lines with no curvature deviation detected.',
    description: 'Frozen lake surfaces provide an ideal testing ground because they eliminate wave interference and atmospheric effects near the water surface. Multiple experimenters have projected laser beams across frozen lakes spanning several miles. If the surface were curved, the laser would either hit the ice (curving away from the beam) or the beam would pass increasingly higher above the surface. Results consistently show the laser traveling at a constant height above the ice surface.',
    keyObservations: [
      'Laser maintains constant height above ice across multiple miles',
      'Frozen surface eliminates wave and water vapor variables',
      'Results are repeatable in cold, stable atmospheric conditions',
      'Expected curvature deviation is never detected',
      'Multiple independent experimenters have confirmed results'
    ],
    expectedVsObserved: [
      { label: 'Laser at 2 miles across ice', expected: 'Laser ~32 inches above target (curvature)', observed: 'Laser hits at expected level height' },
      { label: 'Laser at 5 miles across ice', expected: 'Laser ~16.6 ft above target', observed: 'Laser remains at consistent height' },
      { label: 'Surface profile', expected: 'Curved downward from observer', observed: 'Flat and level' }
    ],
    howToVerify: 'In winter, find a large frozen lake. Set up a laser at a known height on one shore and measure where it hits a target on the opposite shore. Compare with expected curvature.',
    verificationDifficulty: 'Moderate',
    sources: [
      'Flat Earth Community frozen lake experiments',
      'YouTube documented laser tests',
      'Independent replication videos'
    ],
    relatedExperimentIds: ['2', '4'],
    tags: ['laser', 'frozen', 'lake', 'ice', 'level']
  },
  {
    id: 'ev-8',
    title: 'Lake Pontchartrain Power Lines',
    category: 'Water & Level',
    summary: 'The 24-mile transmission line crossing Lake Pontchartrain shows no curvature sag matching Earth\'s predicted curve.',
    description: 'Lake Pontchartrain in Louisiana features a series of high-voltage transmission towers crossing approximately 24 miles of open water. These towers are built at uniform heights. On a curved Earth, the middle towers should appear to rise higher than the towers at either end (due to the "hump" of curvature in the middle), with an expected curvature of approximately 384 feet over 24 miles. Photographs and observations from various angles show the towers maintaining a consistent, level line across the entire span.',
    keyObservations: [
      'Transmission towers span ~24 miles across open water',
      'All towers appear at uniform height from various observation points',
      'Expected curvature "hump" of ~384 ft in the middle is not observed',
      'The towers follow a straight, level line',
      'Photographs from both shores confirm level appearance'
    ],
    expectedVsObserved: [
      { label: 'Center towers vs. end towers', expected: 'Center towers appear ~384 ft higher (curvature hump)', observed: 'All towers appear at same height' },
      { label: 'Tower alignment', expected: 'Curved arc following Earth\'s surface', observed: 'Straight, level line' },
      { label: 'Visibility from shore', expected: 'Distant towers partially hidden', observed: 'All towers visible from elevated positions' }
    ],
    howToVerify: 'Visit Lake Pontchartrain and photograph the transmission towers from various positions along the shore. Use a level reference line to compare tower heights.',
    verificationDifficulty: 'Easy',
    sources: [
      'Soundly\'s Lake Pontchartrain observations',
      'Google Earth imagery of the transmission line',
      'Independent photography from multiple observers'
    ],
    relatedExperimentIds: ['1', '3'],
    tags: ['pontchartrain', 'power lines', 'towers', 'lake', 'level']
  },

  // ── Celestial Observations ─────────────────────────────────────
  {
    id: 'ev-9',
    title: 'Stars Rotate Around a Fixed Polaris',
    category: 'Celestial Observations',
    summary: 'All visible stars in the northern sky rotate in perfect circles around Polaris, which remains virtually motionless.',
    description: 'Long-exposure photography of the night sky reveals that all visible stars trace perfect circular paths around Polaris (the North Star). Polaris itself remains nearly stationary at the celestial north pole. This pattern is consistent with a fixed, rotating star field above a stationary plane, where Polaris sits at the center point directly above the North Pole. The circular star trails are uniform and predictable, completing a full rotation every ~23 hours 56 minutes.',
    keyObservations: [
      'Polaris remains virtually motionless while all other stars rotate around it',
      'Star trails form perfect concentric circles in long-exposure photos',
      'The rotation completes every ~23 hours 56 minutes (sidereal day)',
      'Stars near Polaris trace small circles; distant stars trace large circles',
      'Southern sky stars rotate around a southern celestial point',
      'Star patterns have remained unchanged for thousands of years of recorded history'
    ],
    expectedVsObserved: [
      { label: 'Star motion pattern', expected: 'Complex parallax shifts if Earth orbits Sun at 67,000 mph', observed: 'Simple circular rotation, no parallax detectable to naked eye' },
      { label: 'Polaris position', expected: 'Should shift noticeably over months if Earth orbits', observed: 'Remains fixed at celestial north pole year-round' },
      { label: 'Constellation shapes', expected: 'Should distort over centuries due to relative star motion', observed: 'Unchanged for thousands of years of recorded observation' }
    ],
    howToVerify: 'Set up a camera on a tripod pointed at Polaris. Take a long exposure (30 min to several hours). Observe the perfect circular star trails.',
    verificationDifficulty: 'Easy',
    sources: [
      'Any long-exposure night sky photography',
      'Ancient astronomical records (Egyptian, Greek, Chinese)',
      'Modern astrophotography communities'
    ],
    relatedExperimentIds: ['5', '10'],
    tags: ['stars', 'polaris', 'rotation', 'night sky', 'star trails']
  },
  {
    id: 'ev-10',
    title: 'Sun\'s Local Circular Path',
    category: 'Celestial Observations',
    summary: 'The sun\'s observed behavior — hotspots, crepuscular rays, and angular size changes — suggests a local, circling light source.',
    description: 'Several observations about the sun suggest it may be much closer and smaller than conventionally claimed. Crepuscular rays (sunbeams through clouds) converge at angles that trace back to a local light source, not one 93 million miles away (which would produce perfectly parallel rays). Sun "hotspots" on clouds and water suggest a nearby spotlight-like source. The sun\'s angular size appears to change throughout the day, growing larger at sunrise/sunset, consistent with a local light moving closer and farther from the observer.',
    keyObservations: [
      'Crepuscular rays converge at angles inconsistent with a source 93 million miles away',
      'Sun hotspots on clouds indicate a local, concentrated light source',
      'The sun appears to change angular size throughout the day',
      'Sunlight illuminates clouds from below at certain angles, suggesting local proximity',
      'The sun\'s path varies seasonally in a pattern consistent with a circling local light'
    ],
    expectedVsObserved: [
      { label: 'Crepuscular ray angles', expected: 'Perfectly parallel (93 million mile source)', observed: 'Converging angles suggesting local source' },
      { label: 'Cloud hotspots', expected: 'Uniform illumination from distant source', observed: 'Concentrated bright spots on cloud layers' },
      { label: 'Angular size throughout day', expected: 'Constant 0.53° (fixed distance)', observed: 'Appears to vary, larger near horizon' }
    ],
    howToVerify: 'Photograph crepuscular rays and trace the ray angles back to their convergence point. Photograph the sun at different times of day (with proper solar filter) and compare angular size.',
    verificationDifficulty: 'Easy',
    sources: [
      'Crepuscular ray photography',
      'Time-lapse sun path documentation',
      'Solar filter photography projects'
    ],
    relatedExperimentIds: ['5', '10'],
    tags: ['sun', 'crepuscular', 'rays', 'local', 'circular']
  },
  {
    id: 'ev-11',
    title: 'Moonlight Is Cold',
    category: 'Celestial Observations',
    summary: 'Experiments measuring temperature in moonlight vs. moon shade consistently show moonlight is cooler, not warmer.',
    description: 'If moonlight is simply reflected sunlight, objects in direct moonlight should be slightly warmer than objects in moon shade (just as objects in sunlight are warmer than objects in shade). However, multiple controlled experiments using precision thermometers show the opposite: objects in direct moonlight are consistently cooler than objects in moon shade. This suggests moonlight has unique properties distinct from reflected sunlight.',
    keyObservations: [
      'Objects in direct moonlight measure cooler than objects in moon shade',
      'The temperature difference is small but consistent and repeatable',
      'This contradicts the reflected sunlight model',
      'Moonlight focused through a magnifying glass does not produce heat like sunlight',
      'The effect has been documented by multiple independent experimenters'
    ],
    expectedVsObserved: [
      { label: 'Temperature in moonlight', expected: 'Slightly warmer (reflected sunlight)', observed: 'Slightly cooler than moon shade' },
      { label: 'Focused moonlight', expected: 'Produces heat (concentrated reflected light)', observed: 'No measurable heat increase' },
      { label: 'Light properties', expected: 'Same spectrum as sunlight (reflected)', observed: 'Different thermal properties' }
    ],
    howToVerify: 'On a clear full moon night, place two identical thermometers outdoors — one in direct moonlight, one shaded from the moon but otherwise in identical conditions. Record temperatures over several hours.',
    verificationDifficulty: 'Easy',
    sources: [
      'Multiple independent thermometer experiments',
      'Historical observations documented in alternative research',
      'Controlled experiments shared in research communities'
    ],
    relatedExperimentIds: ['5'],
    tags: ['moon', 'moonlight', 'temperature', 'cold', 'thermometer']
  },
  {
    id: 'ev-12',
    title: 'Eclipses Don\'t Match the Model',
    category: 'Celestial Observations',
    summary: 'Lunar eclipses have been recorded when both the sun and moon are visible above the horizon simultaneously.',
    description: 'A selenelion (or selenehelion) is a rare event where both the sun and the eclipsed moon are visible above the horizon at the same time during a lunar eclipse. In the standard model, a lunar eclipse occurs when the Earth is directly between the sun and moon, casting its shadow on the moon. However, if both luminaries are above the horizon simultaneously, the observer should be able to see "around" the Earth, which contradicts the geometry required for the Earth\'s shadow to be on the moon.',
    keyObservations: [
      'Selenelion events are documented and acknowledged by mainstream astronomy',
      'Both sun and eclipsed moon visible above horizon simultaneously',
      'Standard geometry requires Earth to be directly between them',
      'Atmospheric refraction is cited as explanation but raises further questions',
      'The frequency and clarity of selenelion events challenge the standard model'
    ],
    expectedVsObserved: [
      { label: 'During lunar eclipse', expected: 'Sun and moon on opposite sides, Earth between', observed: 'Both sometimes visible above horizon simultaneously' },
      { label: 'Shadow source', expected: 'Earth\'s shadow causes the eclipse', observed: 'Geometry doesn\'t align when both are visible' },
      { label: 'Eclipse shadow shape', expected: 'Always matches Earth\'s spherical profile', observed: 'Shadow sometimes appears from unexpected angles' }
    ],
    howToVerify: 'Research upcoming selenelion events for your location. During the event, photograph both the sun and eclipsed moon above the horizon simultaneously.',
    verificationDifficulty: 'Advanced',
    sources: [
      'Historical selenelion records',
      'Astronomical event databases',
      'Photography from documented selenelion events'
    ],
    relatedExperimentIds: ['5', '10'],
    tags: ['eclipse', 'selenelion', 'moon', 'sun', 'shadow']
  },

  // ── Motion & Physics ───────────────────────────────────────────
  {
    id: 'ev-13',
    title: 'No Detectable Earth Rotation',
    category: 'Motion & Physics',
    summary: 'Despite the claimed 1,000+ mph rotation speed at the equator, no experiment has ever directly detected Earth\'s rotation.',
    description: 'At the equator, the Earth supposedly rotates at approximately 1,037 mph. At mid-latitudes, the speed is still several hundred mph. Despite this enormous velocity, no one has ever felt, measured, or detected this motion through direct experimentation. Helicopters can hover in place for hours without the ground moving beneath them. Long-range snipers do not account for Earth rotation in their calculations. Aircraft flying east and west experience no measurable difference in ground speed due to rotation.',
    keyObservations: [
      'No experiment has directly detected the Earth\'s rotation beneath us',
      'Helicopters hover stationary without ground moving at 1,000 mph beneath them',
      'Long-range ballistics do not account for Earth rotation in practice',
      'East-west flight times are explained by jet streams, not rotation',
      'The Michelson-Morley experiment failed to detect Earth\'s motion through space',
      'The Michelson-Gale experiment\'s results are disputed and difficult to replicate'
    ],
    expectedVsObserved: [
      { label: 'Hovering helicopter', expected: 'Ground moves at ~700-1,000 mph beneath it', observed: 'Helicopter remains over same ground position' },
      { label: 'East vs. west flight times', expected: 'Significant difference due to rotation', observed: 'Differences explained by jet streams and wind patterns' },
      { label: 'Dropped object from height', expected: 'Lands slightly east (Coriolis)', observed: 'Lands directly below drop point in controlled conditions' }
    ],
    howToVerify: 'Research the Michelson-Morley experiment results. Observe helicopter hovering behavior. Compare east-west flight times and research whether rotation is factored into navigation.',
    verificationDifficulty: 'Easy',
    sources: [
      'Michelson-Morley experiment (1887)',
      'Aviation navigation procedures',
      'Ballistics manuals and sniper training materials'
    ],
    relatedExperimentIds: ['7', '11'],
    tags: ['rotation', 'motion', 'michelson', 'morley', 'helicopter']
  },
  {
    id: 'ev-14',
    title: 'Gyroscopes Maintain Fixed Orientation',
    category: 'Motion & Physics',
    summary: 'Precision gyroscopes do not detect the 15°/hour rotation that should be present on a spinning Earth.',
    description: 'A gyroscope maintains its orientation in space regardless of how its mounting platform moves. On a rotating Earth, a precision gyroscope should detect a 15° per hour rotation (360° ÷ 24 hours). While some experiments claim to detect this drift, independent tests with high-precision gyroscopes in controlled environments have failed to consistently detect the expected rotation rate. Ring laser gyroscopes used in navigation systems require software corrections that could account for the expected drift artificially.',
    keyObservations: [
      'A free gyroscope should precess at 15°/hour on a rotating Earth',
      'Independent precision gyroscope tests show no consistent 15°/hour drift',
      'Navigation gyroscopes use software corrections that assume rotation',
      'Mechanical gyroscopes maintain orientation for extended periods without detected rotation',
      'The distinction between software-corrected and raw gyroscope data is crucial'
    ],
    expectedVsObserved: [
      { label: 'Gyroscope drift per hour', expected: '15° rotation detected', observed: 'No consistent drift in independent tests' },
      { label: 'Over 24 hours', expected: 'Full 360° rotation detected', observed: 'Gyroscope maintains original orientation' },
      { label: 'Navigation systems', expected: 'Raw data shows rotation', observed: 'Software corrections applied to match expected model' }
    ],
    howToVerify: 'Acquire a precision mechanical gyroscope. Set it spinning in a controlled environment and monitor its orientation over several hours. Compare any drift with the expected 15°/hour.',
    verificationDifficulty: 'Advanced',
    sources: [
      'Independent gyroscope experiments',
      'Navigation system technical documentation',
      'Bob Knodel gyroscope experiments'
    ],
    relatedExperimentIds: ['7'],
    tags: ['gyroscope', 'rotation', 'drift', 'navigation', 'orientation']
  },
  {
    id: 'ev-15',
    title: 'Foucault Pendulum Inconsistencies',
    category: 'Motion & Physics',
    summary: 'Foucault pendulums show inconsistent rotation rates and can be influenced by initial launch conditions and air currents.',
    description: 'The Foucault pendulum is often cited as proof of Earth\'s rotation. However, the pendulum\'s behavior is inconsistent: different pendulums at the same latitude show different rotation rates, the initial push significantly affects the rotation direction and speed, and air currents and the Allais effect during eclipses create anomalies. Additionally, the pendulum\'s rotation can be explained by the asymmetric release and the Coriolis-like effects of the pendulum\'s own mechanics.',
    keyObservations: [
      'Different Foucault pendulums at the same latitude show different rotation rates',
      'The initial push direction and force significantly affect the result',
      'Air currents and building vibrations influence the pendulum',
      'The Allais effect shows anomalous behavior during solar eclipses',
      'Short pendulums don\'t show the effect, suggesting it\'s mechanical, not rotational',
      'The pendulum requires careful "maintenance" to continue showing the expected rotation'
    ],
    expectedVsObserved: [
      { label: 'Rotation rate at 45° latitude', expected: 'Consistent 10.6°/hour at all pendulums', observed: 'Varies between installations' },
      { label: 'Independence from launch', expected: 'Same rotation regardless of initial push', observed: 'Launch conditions affect rotation direction and rate' },
      { label: 'During solar eclipses', expected: 'No change in rotation rate', observed: 'Anomalous behavior documented (Allais effect)' }
    ],
    howToVerify: 'Visit multiple Foucault pendulum installations and compare their rotation rates. Research the Allais effect and the conditions required to maintain a Foucault pendulum.',
    verificationDifficulty: 'Moderate',
    sources: [
      'Maurice Allais eclipse observations (1954)',
      'Foucault pendulum installation records',
      'Independent pendulum experiments'
    ],
    relatedExperimentIds: ['11', '7'],
    tags: ['foucault', 'pendulum', 'rotation', 'allais', 'eclipse']
  },
  {
    id: 'ev-16',
    title: 'No Measurable Coriolis on Small Scale',
    category: 'Motion & Physics',
    summary: 'Water drains randomly in both hemispheres, contradicting the popular claim that Coriolis determines drain direction.',
    description: 'The popular belief that water drains in opposite directions in the Northern and Southern hemispheres (due to the Coriolis effect) has been thoroughly debunked even by mainstream science. The Coriolis effect, if it exists, is far too weak to influence small-scale water drainage. Sinks, toilets, and bathtubs drain based on basin geometry, residual water motion, and other local factors — not hemisphere. This raises questions about the strength and detectability of the Coriolis effect in general.',
    keyObservations: [
      'Water drains randomly in both hemispheres — no consistent pattern',
      'Basin geometry and residual motion determine drain direction',
      'Even mainstream science acknowledges Coriolis doesn\'t affect small-scale drainage',
      'The Coriolis effect would need to be extraordinarily weak to not affect drains',
      'If too weak for a bathtub, questions arise about its role in weather systems'
    ],
    expectedVsObserved: [
      { label: 'Northern hemisphere drains', expected: 'Counterclockwise (Coriolis)', observed: 'Random direction based on local factors' },
      { label: 'Southern hemisphere drains', expected: 'Clockwise (Coriolis)', observed: 'Random direction based on local factors' },
      { label: 'At the equator', expected: 'Straight down (no Coriolis)', observed: 'Same random behavior as everywhere else' }
    ],
    howToVerify: 'Fill a sink or bathtub and let the water become completely still. Pull the drain and observe the direction. Repeat multiple times and record results.',
    verificationDifficulty: 'Easy',
    sources: [
      'Mainstream physics textbooks (acknowledge drain direction is not Coriolis)',
      'Snopes and other fact-checking sites confirm the myth',
      'Independent drain experiments'
    ],
    relatedExperimentIds: ['7'],
    tags: ['coriolis', 'drain', 'water', 'rotation', 'hemisphere']
  },

  // ── Navigation & Mapping ───────────────────────────────────────
  {
    id: 'ev-17',
    title: 'Flight Paths Match Flat Projection',
    category: 'Navigation & Mapping',
    summary: 'Commercial airline routes make logical sense on a flat azimuthal equidistant projection but appear illogical on a globe.',
    description: 'Many commercial flight paths appear to take bizarre, inefficient routes when plotted on a globe but make perfect sense as straight lines on a flat azimuthal equidistant projection (the same projection used in the United Nations logo). Emergency landings often occur at locations that are "nearby" on a flat map but far away on a globe. Southern hemisphere flights frequently route through northern hubs in ways that seem inefficient on a globe but are direct on a flat projection.',
    keyObservations: [
      'Southern hemisphere flights often route through northern hubs',
      'Emergency landings occur at locations "nearby" on flat projection',
      'Direct southern hemisphere routes (e.g., Santiago to Sydney) are rare or non-existent',
      'The UN logo uses an azimuthal equidistant projection',
      'Flight times between southern cities are often longer than expected on a globe',
      'Pilot testimony confirms flat, level flight with no curvature compensation'
    ],
    expectedVsObserved: [
      { label: 'Santiago to Sydney direct', expected: 'Short direct route over South Pacific', observed: 'Routes through LAX or Auckland, much longer' },
      { label: 'Johannesburg to Perth', expected: 'Direct route over Indian Ocean', observed: 'Often routes through Middle East or Asia' },
      { label: 'Emergency landing locations', expected: 'Nearest airport on globe', observed: 'Nearest airport on flat projection' }
    ],
    howToVerify: 'Research commercial flight routes between southern hemisphere cities. Plot them on both a globe and a flat azimuthal equidistant projection. Compare which map makes the routes appear more logical.',
    verificationDifficulty: 'Easy',
    sources: [
      'FlightAware and FlightRadar24 route data',
      'Airline route maps',
      'Emergency landing incident reports'
    ],
    relatedExperimentIds: [],
    tags: ['flights', 'routes', 'navigation', 'azimuthal', 'projection']
  },
  {
    id: 'ev-18',
    title: 'Antarctic Treaty & Restricted Access',
    category: 'Navigation & Mapping',
    summary: 'Independent exploration of Antarctica has been restricted since 1959, preventing verification of the continent\'s true nature.',
    description: 'The Antarctic Treaty, signed in 1959 by 12 nations (now 54), restricts independent exploration and militarizes the region under the guise of "peaceful scientific purposes." No independent civilian has been allowed to freely explore Antarctica. Guided tours visit only a tiny coastal area. The treaty effectively prevents anyone from independently verifying what lies beyond the known coastal regions. This restriction is unique — no other continent on Earth has such comprehensive access limitations.',
    keyObservations: [
      'The Antarctic Treaty (1959) restricts independent exploration',
      'No civilian has freely explored the interior of Antarctica',
      'Tourist visits are limited to small coastal areas with guides',
      'Military enforcement prevents unauthorized access',
      'No other continent has similar comprehensive access restrictions',
      'Admiral Byrd\'s accounts describe vast unexplored territory beyond the ice'
    ],
    expectedVsObserved: [
      { label: 'Access to Antarctica', expected: 'Open for exploration like any continent', observed: 'Heavily restricted by international treaty' },
      { label: 'Independent verification', expected: 'Anyone can explore and verify geography', observed: 'Only government-approved expeditions allowed' },
      { label: 'Admiral Byrd\'s testimony', expected: 'Consistent with standard geography', observed: 'Described land "beyond the pole" as large as the US' }
    ],
    howToVerify: 'Research the Antarctic Treaty provisions. Attempt to book an independent (non-guided) expedition to Antarctica\'s interior. Review Admiral Byrd\'s interviews and expedition records.',
    verificationDifficulty: 'Advanced',
    sources: [
      'Antarctic Treaty text (1959)',
      'Admiral Richard Byrd interviews and expedition logs',
      'Antarctic tourism regulations and restrictions'
    ],
    relatedExperimentIds: [],
    tags: ['antarctica', 'treaty', 'restricted', 'exploration', 'byrd']
  },
  {
    id: 'ev-19',
    title: 'Surveyors Don\'t Account for Curvature',
    category: 'Navigation & Mapping',
    summary: 'Professional land surveyors, engineers, and railway builders do not factor Earth\'s curvature into their calculations.',
    description: 'Professional surveyors, civil engineers, and railway builders work with the assumption of a flat, level surface. Over distances of miles and even tens of miles, no curvature correction is applied to their measurements. Railways are laid on flat, level grades. Canals are dug to flat specifications. If the Earth curved at 8 inches per mile squared, these professions would need to account for significant curvature over their working distances — but they don\'t.',
    keyObservations: [
      'Surveying manuals assume a flat working surface',
      'Railway engineering uses flat, level grade calculations',
      'Canal construction assumes flat water over hundreds of miles',
      'Bridge engineering over long spans doesn\'t account for curvature in the deck',
      'Construction lasers work on the assumption of flat, level surfaces',
      'No curvature correction factor exists in standard surveying practice'
    ],
    expectedVsObserved: [
      { label: 'Surveying over 10 miles', expected: 'Must account for ~66.6 ft of curvature', observed: 'No curvature correction applied' },
      { label: 'Railway grade calculations', expected: 'Include curvature compensation', observed: 'Assume flat, level surface' },
      { label: 'Long bridge construction', expected: 'Deck curves to match Earth', observed: 'Deck is built flat and level' }
    ],
    howToVerify: 'Consult professional surveying manuals and engineering textbooks. Ask a professional surveyor if they account for Earth\'s curvature in their daily work.',
    verificationDifficulty: 'Easy',
    sources: [
      'Professional surveying manuals',
      'Civil engineering textbooks',
      'Railway engineering specifications'
    ],
    relatedExperimentIds: ['6'],
    tags: ['surveying', 'engineering', 'railway', 'construction', 'level']
  },
  {
    id: 'ev-20',
    title: 'Compass Points to Magnetic North',
    category: 'Navigation & Mapping',
    summary: 'Compasses consistently point toward a central magnetic north, consistent with a central pole on a flat plane.',
    description: 'Every compass on Earth points toward magnetic north. On a flat, circular plane with the North Pole at the center, this behavior is perfectly explained — all compass needles point toward the center. The consistency of compass behavior worldwide, combined with the circular patterns of magnetic declination, aligns with a centrally-located magnetic source. The fact that compasses work identically at all "latitudes" suggests a simpler geometric explanation than a dipole field on a sphere.',
    keyObservations: [
      'All compasses point toward a central magnetic north',
      'Magnetic declination patterns form circular/radial patterns',
      'Compass behavior is consistent with a central pole on a flat plane',
      'No compass has ever pointed "down" toward the center of a sphere',
      'Magnetic field lines are consistent with a flat plane model'
    ],
    expectedVsObserved: [
      { label: 'Compass behavior', expected: 'Points along curved field lines on sphere', observed: 'Points toward central north consistently' },
      { label: 'At "south pole"', expected: 'Compass should be unreliable (near magnetic pole)', observed: 'Compasses work normally in southern regions' },
      { label: 'Magnetic declination', expected: 'Complex spherical harmonic pattern', observed: 'Radial pattern from central point' }
    ],
    howToVerify: 'Use a compass at various locations and note that it always points toward the same central north direction. Research magnetic declination maps and their patterns.',
    verificationDifficulty: 'Easy',
    sources: [
      'Magnetic declination maps (NOAA)',
      'Compass navigation principles',
      'Historical magnetic survey data'
    ],
    relatedExperimentIds: ['10'],
    tags: ['compass', 'magnetic', 'north', 'navigation', 'declination']
  },

  // ── Photography & Optics ───────────────────────────────────────
  {
    id: 'ev-21',
    title: 'Fisheye Lens Distortion in Space Footage',
    category: 'Photography & Optics',
    summary: 'Nearly all footage showing Earth\'s curvature from space uses wide-angle or fisheye lenses that artificially create curvature.',
    description: 'The vast majority of footage and photographs showing Earth\'s curvature from high altitudes or "space" use wide-angle or fisheye lenses. These lenses are known to distort straight lines into curves — this is a well-documented optical property, not a conspiracy. When the horizon passes above the lens center, it appears to curve upward (concave). When below center, it curves downward (convex). Only when perfectly centered does it appear straight. This means the apparent curvature in most space footage is a lens artifact.',
    keyObservations: [
      'GoPro cameras (standard on many missions) use fisheye lenses',
      'The same horizon appears convex, flat, or concave depending on lens position',
      'Rectilinear lens footage from similar altitudes shows no curvature',
      'NASA and other agencies predominantly use wide-angle lenses',
      'The barrel distortion effect is well-documented in optics',
      'ISS footage shows horizon curvature changing as camera angle shifts'
    ],
    expectedVsObserved: [
      { label: 'Space footage curvature', expected: 'Consistent curvature regardless of lens', observed: 'Curvature varies with lens type and position' },
      { label: 'Horizon above lens center', expected: 'Still shows convex curve', observed: 'Appears concave (curves upward)' },
      { label: 'Rectilinear lens at same altitude', expected: 'Shows same curvature', observed: 'Shows flat horizon' }
    ],
    howToVerify: 'Compare footage from the same altitude using fisheye vs. rectilinear lenses. Note how the fisheye distorts the horizon differently based on its position relative to the lens center.',
    verificationDifficulty: 'Easy',
    sources: [
      'Lens distortion technical documentation',
      'Side-by-side lens comparison videos',
      'GoPro lens specification sheets'
    ],
    relatedExperimentIds: ['8', '9'],
    tags: ['fisheye', 'lens', 'distortion', 'space', 'camera']
  },
  {
    id: 'ev-22',
    title: 'Infrared Photography Reveals Hidden Objects',
    category: 'Photography & Optics',
    summary: 'Infrared cameras can see objects that are invisible to the naked eye, revealing them "beyond the curve."',
    description: 'Infrared cameras can penetrate atmospheric haze and moisture that obscure distant objects from visible-light observation. When objects appear to have vanished "over the curve," infrared photography often reveals them still fully intact and visible. This demonstrates that atmospheric conditions — not curvature — are responsible for the apparent disappearance of distant objects. The infrared spectrum cuts through the very conditions that create the illusion of objects dropping below a curve.',
    keyObservations: [
      'Infrared cameras reveal objects invisible to the naked eye at distance',
      'Objects "hidden by curvature" reappear in infrared',
      'Atmospheric moisture and haze are the primary visibility limiters',
      'IR photography proves the objects were never physically behind a curve',
      'Military and maritime IR systems regularly see beyond the "visible horizon"'
    ],
    expectedVsObserved: [
      { label: 'Object at 30 miles (naked eye)', expected: 'Partially hidden by ~600 ft of curvature', observed: 'Invisible due to haze, not curvature' },
      { label: 'Same object in infrared', expected: 'Still hidden by physical curvature', observed: 'Fully visible in IR spectrum' },
      { label: 'Visibility limit cause', expected: 'Physical curvature of Earth', observed: 'Atmospheric conditions (haze, moisture, temperature)' }
    ],
    howToVerify: 'Use an infrared camera or IR-modified camera to photograph distant objects that are invisible to the naked eye. Compare visible-light and IR images of the same distant targets.',
    verificationDifficulty: 'Moderate',
    sources: [
      'FLIR camera demonstrations',
      'Military IR imaging documentation',
      'Independent IR photography experiments'
    ],
    relatedExperimentIds: ['1', '3'],
    tags: ['infrared', 'IR', 'camera', 'visibility', 'atmosphere']
  },
  {
    id: 'ev-23',
    title: 'Perspective Explains "Sunset"',
    category: 'Photography & Optics',
    summary: 'The sun\'s apparent setting can be explained by perspective and the vanishing point of angular resolution.',
    description: 'As any object moves away from an observer, it appears to descend toward the vanishing point at eye level due to perspective. The sun, if it is a local light source circling above a flat plane, would appear to descend toward the horizon as it moves away from the observer, eventually becoming too small and dim to see — creating the appearance of a "sunset." The reddening of the sun near the horizon is caused by atmospheric filtering as light travels through more atmosphere at low angles, consistent with both models.',
    keyObservations: [
      'Objects moving away appear to descend toward eye level (perspective)',
      'The sun\'s angular size appears to decrease as it "sets" (consistent with moving away)',
      'Atmospheric reddening occurs due to increased atmospheric path length',
      'The sun\'s light can sometimes be seen illuminating clouds from below the "horizon"',
      'Zooming in on a "setting" sun can sometimes bring it back above the horizon',
      'Anti-crepuscular rays converge at the anti-solar point, consistent with local light'
    ],
    expectedVsObserved: [
      { label: 'Sunset mechanism', expected: 'Sun physically drops below curved horizon', observed: 'Sun appears to shrink and merge with vanishing point' },
      { label: 'Sun size at sunset', expected: 'Same angular size (constant distance)', observed: 'Appears to change size near horizon' },
      { label: 'Zooming on setting sun', expected: 'Cannot restore sun above horizon', observed: 'Sometimes brings sun back into view briefly' }
    ],
    howToVerify: 'Photograph the sun at regular intervals during sunset using a solar filter. Measure its angular size in each photo. Attempt to zoom in on the sun after it appears to "set."',
    verificationDifficulty: 'Easy',
    sources: [
      'Perspective and vanishing point optics',
      'Solar filter photography at sunset',
      'Time-lapse sunset documentation'
    ],
    relatedExperimentIds: ['3', '5'],
    tags: ['sunset', 'perspective', 'vanishing point', 'angular', 'optics']
  },
  {
    id: 'ev-24',
    title: 'NASA Composite Images',
    category: 'Photography & Optics',
    summary: 'NASA has acknowledged that their iconic images of Earth from space are composites, not single photographs.',
    description: 'NASA graphic artist Robert Simmon acknowledged that the famous "Blue Marble" images of Earth are composites created from multiple data sources, not single photographs taken from space. Different versions of these "Blue Marble" images show continents at different sizes relative to each other. The color, cloud patterns, and overall appearance vary significantly between different official NASA Earth images. This raises questions about what Earth actually looks like from space, since the most widely-circulated images are acknowledged digital creations.',
    keyObservations: [
      'Robert Simmon (NASA) confirmed Blue Marble images are composites',
      'Continent sizes vary between different official NASA Earth images',
      'Cloud patterns in some images show repeated/copied sections',
      'Color and appearance differ significantly between versions',
      'No single, unedited photograph of the full Earth is widely available',
      'Different missions show Earth at dramatically different sizes'
    ],
    expectedVsObserved: [
      { label: 'Earth photographs', expected: 'Consistent single photographs from space', observed: 'Acknowledged composites from satellite data' },
      { label: 'Continent proportions', expected: 'Consistent across all images', observed: 'Vary significantly between different versions' },
      { label: 'Image authenticity', expected: 'Raw, unedited photographs', observed: 'Digitally composited and color-corrected' }
    ],
    howToVerify: 'Compare different official NASA "Blue Marble" images side by side. Research Robert Simmon\'s statements about creating the images. Look for repeated cloud patterns in the composites.',
    verificationDifficulty: 'Easy',
    sources: [
      'Robert Simmon interview and statements',
      'NASA image archive comparisons',
      'Official NASA image metadata and descriptions'
    ],
    relatedExperimentIds: [],
    tags: ['NASA', 'composite', 'blue marble', 'photography', 'images']
  }
];
