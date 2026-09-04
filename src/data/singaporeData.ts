import { DeliveryOrder, MotorcycleParking, EVCharger, FootDeliveryGuide } from '../types';

// Singapore center reference (Raffles Place / Downtown / Marina Bay / Bugis zone)
export const SINGAPORE_DEFAULT_CENTER: [number, number] = [1.2858, 103.8525];

export const INITIAL_ORDERS: DeliveryOrder[] = [
  {
    id: 'ord-grab-8841',
    orderNumber: 'GF-88419',
    platform: 'GrabFood',
    customerName: 'Marcus Tan',
    restaurantName: 'Shake Shack @ Raffles City',
    pickupAddress: '252 North Bridge Rd, #01-37 Raffles City, Singapore 179103',
    dropoffAddress: 'One Raffles Quay (North Tower), #28-01, Singapore 048583',
    pickupCoords: [1.2938, 103.8532],
    dropoffCoords: [1.2818, 103.8519],
    unitNumber: '#28-01',
    items: ['2x ShackBurger', '1x Cheese Fries', '2x Lemonade'],
    earnings: 8.80,
    readyTime: 'Ready now',
    status: 'pending',
    specialNotes: 'Use Service Lift B at Loading Bay. Strictly register with Security Counter B1.',
    requiresTrolley: false,
  },
  {
    id: 'ord-fp-4012',
    orderNumber: 'FP-40126',
    platform: 'Foodpanda',
    customerName: 'Chloe Lim',
    restaurantName: 'Toast Box @ Marina Square',
    pickupAddress: '6 Raffles Blvd, #02-315 Marina Square, Singapore 039594',
    dropoffAddress: 'CapitaGreen, #16-04, 138 Market St, Singapore 048946',
    pickupCoords: [1.2915, 103.8576],
    dropoffCoords: [1.2835, 103.8501],
    unitNumber: '#16-04',
    items: ['3x Traditional Kaya Toast Set', '3x Kopi-O Gao'],
    earnings: 7.40,
    readyTime: 'Ready in 3 min',
    status: 'pending',
    specialNotes: 'Leave at reception tray. Ramp access next to taxi stand.',
    requiresTrolley: false,
  },
  {
    id: 'ord-grab-9104',
    orderNumber: 'GF-91044',
    platform: 'GrabFood',
    customerName: 'David Lee',
    restaurantName: 'Guzman y Gomez @ Ocean Financial Centre',
    pickupAddress: '10 Collyer Quay, #B1-06 Ocean Financial Centre, Singapore 049315',
    dropoffAddress: 'Marina Bay Financial Centre Tower 3, #32-02, Singapore 018982',
    pickupCoords: [1.2837, 103.8524],
    dropoffCoords: [1.2789, 103.8542],
    unitNumber: '#32-02',
    items: ['Catering Box (4x Burritos, 2x Bowls, Tortilla Chips & Salsa)'],
    earnings: 13.50,
    readyTime: 'Ready in 5 min',
    status: 'pending',
    specialNotes: 'Heavy parcel - trolley recommended. Direct ramp from motorcycle parking lot.',
    requiresTrolley: true,
  },
];

export const MOTORCYCLE_PARKING_SPOTS: MotorcycleParking[] = [
  {
    id: 'pk-1',
    name: 'Raffles City Motorcycle Bay (Loading Dock)',
    address: 'Bras Basah Rd / Stamford Rd Entrance, Singapore 179103',
    coords: [1.2934, 103.8528],
    type: 'grace_period',
    costPerHour: '$1.40 / entry (10m Grace Free)',
    gracePeriodMins: 10,
    availableLots: 8,
    totalLots: 16,
    gantryBypassAvailable: true,
    trolleyAccessibleToMall: true,
    liftLobbyNearby: 'Cargo Lift 3 (Direct to L1 food court)',
    restrictionsWarning: 'Do not park along taxi queuing lane. Strictly park within yellow motorcycle bay.',
  },
  {
    id: 'pk-2',
    name: 'One Raffles Quay Motorcycle Lots',
    address: 'Marina Boulevard B1 Loading Bay, Singapore 048583',
    coords: [1.2813, 103.8522],
    type: 'grace_period',
    costPerHour: '$1.20 / entry (15m Grace Free for Couriers)',
    gracePeriodMins: 15,
    availableLots: 5,
    totalLots: 12,
    gantryBypassAvailable: true,
    trolleyAccessibleToMall: true,
    liftLobbyNearby: 'North Tower Service Lift lobby',
    restrictionsWarning: 'Courier badge exchange required. Strictly NO parking on emergency fire-engine hardstanding.',
  },
  {
    id: 'pk-3',
    name: 'CapitaGreen Loading Bay Motorcycle Bays',
    address: 'Cross Street / Market Street access, Singapore 048946',
    coords: [1.2831, 103.8496],
    type: 'free',
    costPerHour: 'Free (Courier 20m Grace Zone)',
    gracePeriodMins: 20,
    availableLots: 7,
    totalLots: 10,
    gantryBypassAvailable: true,
    trolleyAccessibleToMall: true,
    liftLobbyNearby: 'Ground Floor Courier Turnstiles',
    restrictionsWarning: 'Helmet must be removed before entering security turnstile.',
  },
  {
    id: 'pk-4',
    name: 'Lau Pa Sat Perimeter HDB/URA Motorcycle Lots',
    address: 'Boon Tat Street / Shenton Way, Singapore 069114',
    coords: [1.2805, 103.8505],
    type: 'paid',
    costPerHour: '$0.65 / per hour (HDB Electronic Parking)',
    gracePeriodMins: 10,
    availableLots: 14,
    totalLots: 24,
    gantryBypassAvailable: false,
    trolleyAccessibleToMall: true,
    liftLobbyNearby: 'Street level outdoor access',
    restrictionsWarning: 'EPS in effect. Ensure CashCard / EZ-Link has sufficient value.',
  },
  {
    id: 'pk-5',
    name: 'MBFC Tower 3 Underground Delivery Deck',
    address: 'Marina Way / Central Blvd, Singapore 018982',
    coords: [1.2783, 103.8537],
    type: 'grace_period',
    costPerHour: '$1.50 / entry (15m Grace Free)',
    gracePeriodMins: 15,
    availableLots: 9,
    totalLots: 18,
    gantryBypassAvailable: true,
    trolleyAccessibleToMall: true,
    liftLobbyNearby: 'Tower 3 High-Rise Lift Lobby C',
    restrictionsWarning: 'Follow speed limit 15 km/h. Strictly avoid parking in front of fire hose reel cabinet.',
  },
  {
    id: 'pk-6',
    name: 'Bugis Junction Courier Bay',
    address: 'Victoria Street Service Road, Singapore 188021',
    coords: [1.2995, 103.8552],
    type: 'free',
    costPerHour: 'Free (15m Rider Drop & Go)',
    gracePeriodMins: 15,
    availableLots: 11,
    totalLots: 20,
    gantryBypassAvailable: true,
    trolleyAccessibleToMall: true,
    liftLobbyNearby: 'Service Core D (Direct to B1 food hall)',
    restrictionsWarning: 'Keep engine off when inside sheltered courier bay.',
  },
];

export const EV_CHARGERS: EVCharger[] = [
  {
    id: 'ev-1',
    operator: 'SP Group',
    name: 'SP Mobility @ Marina Bay Financial Centre B2',
    address: '10 Marina Boulevard, B2 Green Zone, Singapore 018983',
    coords: [1.2798, 103.8533],
    powerOutput: 'DC 50kW Fast / AC 22kW',
    connectorType: 'CCS2 / Type 2',
    availablePlugs: 3,
    totalPlugs: 4,
    ratePerKwh: 'S$0.648 / kWh',
    parkingFeeRequired: true,
  },
  {
    id: 'ev-2',
    operator: 'Shell Recharge',
    name: 'Shell Recharge @ Havelock Road',
    address: '479 Havelock Road, Singapore 169637',
    coords: [1.2882, 103.8345],
    powerOutput: 'DC 120kW Ultra-Fast',
    connectorType: 'CCS2',
    availablePlugs: 2,
    totalPlugs: 2,
    ratePerKwh: 'S$0.690 / kWh',
    parkingFeeRequired: false,
  },
  {
    id: 'ev-3',
    operator: 'CDG ENGIE',
    name: 'CDG ENGIE @ Capitol Piazza B3',
    address: '13 Stamford Road, Singapore 178905',
    coords: [1.2929, 103.8516],
    powerOutput: 'AC 11kW Dual',
    connectorType: 'Type 2',
    availablePlugs: 4,
    totalPlugs: 6,
    ratePerKwh: 'S$0.550 / kWh',
    parkingFeeRequired: true,
  },
  {
    id: 'ev-4',
    operator: 'Charge+',
    name: 'Charge+ @ Suntec City Tower 2 B1',
    address: '9 Temasek Boulevard, Singapore 038989',
    coords: [1.2949, 103.8587],
    powerOutput: 'DC 60kW Fast Turbo',
    connectorType: 'CCS2',
    availablePlugs: 2,
    totalPlugs: 4,
    ratePerKwh: 'S$0.620 / kWh',
    parkingFeeRequired: true,
  },
];

export const BUILDING_FOOT_GUIDES: Record<string, FootDeliveryGuide> = {
  'One Raffles Quay (North Tower), #28-01, Singapore 048583': {
    id: 'guide-orq',
    buildingName: 'One Raffles Quay (North Tower)',
    address: 'One Raffles Quay, Singapore 048583',
    coords: [1.2818, 103.8519],
    recommendedParkingId: 'pk-2',
    designatedWalkingPath: [
      'From ORQ B1 motorcycle bay, exit through sliding barrier into Courier Staging Area.',
      'Follow marked high-visibility green painted pedestrian walkway past security guardhouse.',
      'Do NOT climb stairs if carrying trolley; take the gradual wheelchair/trolley ramp on the right.',
      'Register delivery at Security Counter B1 with Order ID to receive lift visitor barcode.',
      'Proceed to Service Lift Lobby B (Lifts B4 & B5) to access Level 28.',
      'Exit lift at Level 28, turn left toward reception unit #28-01.',
    ],
    trolleyRampLocation: 'Wide anti-slip ramp located beside Bay #4 leading directly to Security Counter B1.',
    liftLobbyAccess: 'Service Lift Bank B (Lifts B4 & B5 programmed for upper tower floors 20-35).',
    securityProcedure: 'Present Grab/Foodpanda active order screen; driver exchange pass provided.',
    strictGuardrails: {
      noFireExits: true,
      noRestrictedZones: true,
      noIllegalParking: true,
      designatedCourierEntryOnly: true,
    },
    streetViewPanoId: 'singapore_orq_north_tower_entrance_3d',
    walkTimeMins: 3,
  },
  'CapitaGreen, #16-04, 138 Market St, Singapore 048946': {
    id: 'guide-capitagreen',
    buildingName: 'CapitaGreen',
    address: '138 Market St, Singapore 048946',
    coords: [1.2835, 103.8501],
    recommendedParkingId: 'pk-3',
    designatedWalkingPath: [
      'Park at Market Street Courier Bay (20m free grace zone). Turn off engine.',
      'Take designated pedestrian pathway leading along the covered greenery sheltered walkway.',
      'Use the step-free drop-kerb ramp at main entrance plaza.',
      'Enter via designated Delivery Rider entrance on Level 1 (beside drop-off fountain).',
      'Scan digital pass at turnstile or request concierge clearance for #16-04.',
      'Take Passenger Lift Group 2 (Floors 12-24) to Level 16.',
    ],
    trolleyRampLocation: 'Zero-step flush pavement and ramp at Market Street taxi drop-off entrance.',
    liftLobbyAccess: 'Lift Group 2 (Low-Mid Rise, Floors 12 to 24).',
    securityProcedure: 'Self-kiosk visitor registration or show active order at Concierge Desk.',
    strictGuardrails: {
      noFireExits: true,
      noRestrictedZones: true,
      noIllegalParking: true,
      designatedCourierEntryOnly: true,
    },
    streetViewPanoId: 'singapore_capitagreen_lobby_3d',
    walkTimeMins: 2,
  },
  'Marina Bay Financial Centre Tower 3, #32-02, Singapore 018982': {
    id: 'guide-mbfc3',
    buildingName: 'MBFC Tower 3',
    address: '12 Marina Boulevard, Singapore 018982',
    coords: [1.2789, 103.8542],
    recommendedParkingId: 'pk-5',
    designatedWalkingPath: [
      'Enter Marina Way Underground delivery deck and park in marked motorcycle slots.',
      'Follow green floor signage marked "Couriers / Delivery Personnel".',
      'Trolleys must use Cargo Ramp Alpha leading to Loading Dock 2.',
      'Sign in at Security Station B2; obtain Level 32 elevator access card.',
      'Board High-Rise Cargo Lift HL-02 to Level 32.',
      'Deliver to Unit #32-02 reception counter.',
    ],
    trolleyRampLocation: 'Cargo Ramp Alpha with safety handrails connecting directly to Freight Lift HL-02.',
    liftLobbyAccess: 'Freight Lift HL-02 (Authorized delivery transport only).',
    securityProcedure: 'Photo ID / Order verification required at Security Station B2.',
    strictGuardrails: {
      noFireExits: true,
      noRestrictedZones: true,
      noIllegalParking: true,
      designatedCourierEntryOnly: true,
    },
    streetViewPanoId: 'singapore_mbfc_tower3_bay_3d',
    walkTimeMins: 4,
  },
};

// Motorbike specific shortcuts vs Car standard routes in Singapore CBD
export interface MotorbikeShortcut {
  id: string;
  name: string;
  description: string;
  startCoords: [number, number];
  endCoords: [number, number];
  timeSavedMins: number;
  distanceSavedKm: number;
  erpAvoidance: string;
  waypointCoordinates: [number, number][];
  carStandardPath: [number, number][];
  shortcutCategory: 'alleyway_bypass' | 'service_lane' | 'cbd_connector' | 'mall_slip_road';
}

export const MOTORBIKE_SHORTCUTS: MotorbikeShortcut[] = [
  {
    id: 'sc-1',
    name: 'Bras Basah to Raffles Quay Service Link',
    description: 'Bypasses Shenton Way congestion and avoids ERP Gantry on Nicoll Highway via Suntec South service tunnel & Esplanade slip road.',
    startCoords: [1.2938, 103.8532], // Raffles City
    endCoords: [1.2818, 103.8519],   // One Raffles Quay
    timeSavedMins: 6,
    distanceSavedKm: 1.4,
    erpAvoidance: 'Avoids ERP S$2.00 Gantry #32 (Nicoll Highway)',
    shortcutCategory: 'service_lane',
    // Realistic motorcycle path through legal motorcycle accessible connectors
    waypointCoordinates: [
      [1.2938, 103.8532], // Raffles City
      [1.2925, 103.8539], // Stamford Rd Slip
      [1.2910, 103.8548], // Esplanade Drive Connector
      [1.2878, 103.8544], // Fullerton Road Underpass Bike Bypass
      [1.2842, 103.8529], // Collyer Quay Service Lane
      [1.2818, 103.8519], // ORQ Arrival
    ],
    carStandardPath: [
      [1.2938, 103.8532],
      [1.2965, 103.8558],
      [1.2942, 103.8610],
      [1.2870, 103.8605],
      [1.2810, 103.8580],
      [1.2818, 103.8519],
    ],
  },
  {
    id: 'sc-2',
    name: 'Marina Square to CapitaGreen Alley Connector',
    description: 'Legal back-alley motorcycle access through Telok Ayer service road, saving 5 minutes around congested Robinson Road.',
    startCoords: [1.2915, 103.8576],
    endCoords: [1.2835, 103.8501],
    timeSavedMins: 5,
    distanceSavedKm: 1.1,
    erpAvoidance: 'Avoids ERP S$1.50 Gantry #44',
    shortcutCategory: 'alleyway_bypass',
    waypointCoordinates: [
      [1.2915, 103.8576], // Marina Sq
      [1.2890, 103.8562], // Marina Blvd Link
      [1.2858, 103.8525], // Cecil St Cut-through
      [1.2844, 103.8508], // Market St Service Bay
      [1.2835, 103.8501], // CapitaGreen
    ],
    carStandardPath: [
      [1.2915, 103.8576],
      [1.2940, 103.8615],
      [1.2880, 103.8620],
      [1.2800, 103.8560],
      [1.2815, 103.8490],
      [1.2835, 103.8501],
    ],
  },
  {
    id: 'sc-3',
    name: 'Ocean Financial to MBFC Tower 3 Transit Lane',
    description: 'Direct motorcycle access lane via Marina Boulevard subterranean loading connector, skipping 2 traffic lights.',
    startCoords: [1.2837, 103.8524],
    endCoords: [1.2789, 103.8542],
    timeSavedMins: 4,
    distanceSavedKm: 0.8,
    erpAvoidance: 'Zero ERP tolls',
    shortcutCategory: 'cbd_connector',
    waypointCoordinates: [
      [1.2837, 103.8524],
      [1.2815, 103.8528],
      [1.2798, 103.8535],
      [1.2789, 103.8542],
    ],
    carStandardPath: [
      [1.2837, 103.8524],
      [1.2820, 103.8500],
      [1.2770, 103.8510],
      [1.2775, 103.8560],
      [1.2789, 103.8542],
    ],
  },
];
