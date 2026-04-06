export interface Experiment {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  image: string;
  description: string;
  materials: string[];
  steps: string[];
  expectedResults: string;
}

export const experiments: Experiment[] = [
  {
    id: '1',
    title: 'Horizon Distance Observation',
    category: 'Horizon',
    difficulty: 'Beginner',
    duration: '30 mins',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817800245_9868f345.webp',
    description: 'Observe distant objects across water to measure visibility and horizon effects.',
    materials: ['Telescope or binoculars', 'Camera with zoom', 'Measuring tape', 'Notebook'],
    steps: ['Find a large body of water', 'Identify distant landmarks', 'Measure visibility', 'Document observations'],
    expectedResults: 'Objects remain visible at distances that can be calculated and verified.'
  },
  {
    id: '2',
    title: 'Laser Level Water Test',
    category: 'Water Level',
    difficulty: 'Intermediate',
    duration: '2 hours',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817801219_75765907.webp',
    description: 'Use laser level to measure water surface across long distances.',
    materials: ['Laser level', 'Tripods', 'Measuring equipment', 'Still water body'],
    steps: ['Set up laser at water level', 'Measure at multiple points', 'Record heights', 'Calculate curvature'],
    expectedResults: 'Water surface maintains level across measured distance.'
  },
  {
    id: '3',
    title: 'Long Distance Photography',
    category: 'Perspective',
    difficulty: 'Beginner',
    duration: '1 hour',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817802115_6cca7d28.webp',
    description: 'Photograph distant objects to analyze perspective and visibility.',
    materials: ['Camera with telephoto lens', 'Tripod', 'Clear weather conditions'],
    steps: ['Choose elevated position', 'Identify distant landmarks', 'Take photos at various zoom levels', 'Analyze results'],
    expectedResults: 'Distant objects remain visible and measurable with proper equipment.'
  },
  {
    id: '4',
    title: 'Spirit Level Experiment',
    category: 'Water Level',
    difficulty: 'Beginner',
    duration: '20 mins',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817803065_d1a88e6a.webp',
    description: 'Test water level consistency using precision spirit levels.',
    materials: ['Spirit level', 'Long straight edge', 'Water container', 'Measuring tools'],
    steps: ['Place level on water surface', 'Check bubble position', 'Move to different locations', 'Record findings'],
    expectedResults: 'Level maintains consistent reading across surface.'
  },
  {
    id: '5',
    title: 'Sun Path Tracking',
    category: 'Celestial',
    difficulty: 'Intermediate',
    duration: '12 hours',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817803962_ec84f4e7.webp',
    description: 'Track the sun\'s movement throughout the day to analyze its path.',
    materials: ['Sun path diagram', 'Compass', 'Camera', 'Time-lapse capability'],
    steps: ['Mark sun position hourly', 'Record angles and directions', 'Create path diagram', 'Analyze pattern'],
    expectedResults: 'Sun follows predictable circular path overhead.'
  },
  {
    id: '6',
    title: 'Theodolite Survey',
    category: 'Horizon',
    difficulty: 'Advanced',
    duration: '4 hours',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817804852_5b68316c.webp',
    description: 'Professional surveying to measure angles and distances accurately.',
    materials: ['Theodolite', 'Survey markers', 'GPS device', 'Field notebook'],
    steps: ['Set up theodolite', 'Establish baseline', 'Measure angles to targets', 'Calculate distances'],
    expectedResults: 'Precise measurements confirm observable geometry.'
  },
  {
    id: '7',
    title: 'Gyroscope Rotation Test',
    category: 'Motion',
    difficulty: 'Intermediate',
    duration: '1 hour',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817805848_c56f9c37.webp',
    description: 'Use gyroscope to detect rotational forces and movements.',
    materials: ['Precision gyroscope', 'Stable platform', 'Timer', 'Recording device'],
    steps: ['Calibrate gyroscope', 'Start rotation', 'Monitor for 24 hours', 'Analyze drift'],
    expectedResults: 'Gyroscope maintains orientation without external rotation detected.'
  },
  {
    id: '8',
    title: 'Weather Balloon Launch',
    category: 'Altitude',
    difficulty: 'Advanced',
    duration: '6 hours',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817806668_942d0e50.webp',
    description: 'Launch high-altitude balloon with camera to observe from above.',
    materials: ['Weather balloon', 'Helium', 'Camera rig', 'GPS tracker', 'Parachute'],
    steps: ['Prepare payload', 'Inflate balloon', 'Launch and track', 'Recover and analyze footage'],
    expectedResults: 'High altitude footage shows horizon at eye level.'
  },
  {
    id: '9',
    title: 'High Altitude Camera',
    category: 'Altitude',
    difficulty: 'Advanced',
    duration: '8 hours',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817807542_70ec39e5.webp',
    description: 'Deploy camera rig to capture high altitude observations.',
    materials: ['Action camera', 'GPS logger', 'Battery pack', 'Mounting equipment'],
    steps: ['Build camera rig', 'Program GPS logging', 'Deploy to altitude', 'Review footage'],
    expectedResults: 'Footage reveals true horizon characteristics at altitude.'
  },
  {
    id: '10',
    title: 'Nautical Sextant Navigation',
    category: 'Celestial',
    difficulty: 'Intermediate',
    duration: '2 hours',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817808429_da759632.webp',
    description: 'Use traditional navigation tools to measure celestial angles.',
    materials: ['Sextant', 'Nautical almanac', 'Accurate timepiece', 'Clear horizon'],
    steps: ['Calibrate sextant', 'Measure sun/star angles', 'Calculate position', 'Verify with GPS'],
    expectedResults: 'Traditional navigation provides accurate positioning.'
  },
  {
    id: '11',
    title: 'Foucault Pendulum',
    category: 'Motion',
    difficulty: 'Advanced',
    duration: '24 hours',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817809315_d2ccdc79.webp',
    description: 'Set up pendulum to observe rotation effects over time.',
    materials: ['Long wire/cable', 'Heavy weight', 'Stable mounting', 'Protractor', 'Camera'],
    steps: ['Suspend pendulum', 'Start swing', 'Mark positions hourly', 'Measure rotation'],
    expectedResults: 'Pendulum swing plane remains fixed in space.'
  },
  {
    id: '12',
    title: 'Bedford Level Experiment',
    category: 'Water Level',
    difficulty: 'Advanced',
    duration: '4 hours',
    image: 'https://d64gsuwffb70l.cloudfront.net/6921b905a44250e318108d2c_1763817801219_75765907.webp',
    description: 'Replicate the famous Bedford Level water surface experiment.',
    materials: ['Telescope', 'Markers at known heights', 'Long straight canal', 'Measuring equipment'],
    steps: ['Set markers at equal heights', 'View through telescope', 'Measure visibility', 'Calculate expected vs actual'],
    expectedResults: 'All markers remain visible at same height across distance.'
  }
];
