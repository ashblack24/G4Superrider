export type DeliveryPlatform = 'GrabFood' | 'Foodpanda' | 'Deliveroo' | 'Direct';

export type StopType = 'pickup' | 'dropoff';

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  platform: DeliveryPlatform;
  customerName: string;
  restaurantName: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupCoords: [number, number]; // [lat, lng]
  dropoffCoords: [number, number];
  unitNumber: string;
  items: string[];
  earnings: number;
  readyTime: string;
  status: 'pending' | 'picking_up' | 'picked_up' | 'delivering' | 'parked_foot_delivery' | 'completed';
  specialNotes?: string;
  requiresTrolley?: boolean;
}

export interface RouteStop {
  id: string;
  orderId: string;
  type: StopType;
  title: string;
  address: string;
  coords: [number, number];
  estimatedArrival: string;
  distanceKm: number;
  durationMins: number;
  shortcutSavingsMins: number;
  isCompleted: boolean;
  notes?: string;
  buildingGuideId?: string;
}

export interface MotorcycleParking {
  id: string;
  name: string;
  address: string;
  coords: [number, number];
  type: 'free' | 'grace_period' | 'paid';
  costPerHour: string;
  gracePeriodMins: number;
  availableLots: number;
  totalLots: number;
  gantryBypassAvailable: boolean;
  trolleyAccessibleToMall: boolean;
  liftLobbyNearby: string;
  restrictionsWarning?: string;
}

export interface EVCharger {
  id: string;
  operator: 'SP Group' | 'Shell Recharge' | 'CDG ENGIE' | 'Charge+';
  name: string;
  address: string;
  coords: [number, number];
  powerOutput: string; // e.g. "DC 50kW" or "AC 11kW"
  connectorType: string;
  availablePlugs: number;
  totalPlugs: number;
  ratePerKwh: string;
  parkingFeeRequired: boolean;
}

export interface FootDeliveryGuide {
  id: string;
  buildingName: string;
  address: string;
  coords: [number, number];
  recommendedParkingId: string;
  designatedWalkingPath: string[]; // Step by step
  trolleyRampLocation: string;
  liftLobbyAccess: string;
  securityProcedure: string;
  strictGuardrails: {
    noFireExits: boolean;
    noRestrictedZones: boolean;
    noIllegalParking: boolean;
    designatedCourierEntryOnly: boolean;
  };
  streetViewPanoId?: string;
  walkTimeMins: number;
}

export interface ApiCredentials {
  oneMapToken: string;
  ltaAccountKey: string;
  aaasEndpoint: string;
  aaasApiKey: string;
  useMockData: boolean;
}
