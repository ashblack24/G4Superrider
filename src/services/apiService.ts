import { ApiCredentials, MotorcycleParking, EVCharger, DeliveryOrder } from '../types';
import { MOTORCYCLE_PARKING_SPOTS, EV_CHARGERS } from '../data/singaporeData';

const CREDENTIALS_KEY = 'superrider_api_credentials_v1';

export const getSavedCredentials = (): ApiCredentials => {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading saved credentials', e);
  }
  return {
    oneMapToken: '',
    ltaAccountKey: '',
    aaasEndpoint: 'https://api.singaporedelivery.sg/v1/motorcycle-routes',
    aaasApiKey: '',
    useMockData: true,
  };
};

export const saveCredentials = (creds: ApiCredentials) => {
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
  } catch (e) {
    console.warn('Error saving credentials', e);
  }
};

/**
 * Attempt to query LTA DataMall for motorcycle carparks or fallback to local Singapore data
 */
export async function fetchMotorcycleParking(creds: ApiCredentials): Promise<{
  data: MotorcycleParking[];
  source: 'live_lta' | 'mock_singapore';
  message?: string;
}> {
  if (!creds.useMockData && creds.ltaAccountKey) {
    try {
      // In browser preview, LTA DataMall may have CORS headers, so we test connectivity
      const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2', {
        headers: {
          AccountKey: creds.ltaAccountKey,
          accept: 'application/json',
        },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.value && Array.isArray(json.value)) {
          // Map LTA data
          const mapped: MotorcycleParking[] = json.value
            .filter((item: any) => item.LotType === 'M' || item.CarParkID)
            .slice(0, 15)
            .map((item: any, idx: number) => {
              const [latStr, lngStr] = (item.Location || '1.2858 103.8525').split(' ');
              return {
                id: `lta-${item.CarParkID || idx}`,
                name: `${item.Development || 'Motorcycle Parking'} (${item.Area || 'CBD'})`,
                address: item.Development || 'Singapore Central',
                coords: [parseFloat(latStr) || 1.2858, parseFloat(lngStr) || 103.8525],
                type: item.LotType === 'M' ? 'grace_period' : 'paid',
                costPerHour: '$1.20 / entry (10m Grace Free)',
                gracePeriodMins: 10,
                availableLots: parseInt(item.AvailableLots, 10) || 5,
                totalLots: 20,
                gantryBypassAvailable: true,
                trolleyAccessibleToMall: true,
                liftLobbyNearby: 'Loading Bay Service Lift',
              };
            });
          if (mapped.length > 0) {
            return { data: mapped, source: 'live_lta', message: 'Connected to live LTA DataMall feed' };
          }
        }
      }
    } catch (err) {
      console.warn('LTA live fetch failed or blocked by CORS, using mock fallback', err);
    }
  }

  // Graceful fallback to verified Singapore mock spots
  return {
    data: MOTORCYCLE_PARKING_SPOTS,
    source: 'mock_singapore',
    message: creds.ltaAccountKey 
      ? 'LTA Key saved; using validated local Singapore CBD dataset' 
      : 'Using local verified Singapore motorcycle parking dataset (10-20m free grace & loading docks)',
  };
}

/**
 * Fetch EV chargers from live AAAS/LTA or fallback
 */
export async function fetchEVChargers(creds: ApiCredentials): Promise<{
  data: EVCharger[];
  source: 'live_aaas' | 'mock_singapore';
}> {
  if (!creds.useMockData && creds.aaasEndpoint && creds.aaasApiKey) {
    try {
      const resp = await fetch(`${creds.aaasEndpoint}/ev-chargers`, {
        headers: {
          Authorization: `Bearer ${creds.aaasApiKey}`,
        },
      });
      if (resp.ok) {
        const json = await resp.json();
        if (Array.isArray(json.data)) {
          return { data: json.data, source: 'live_aaas' };
        }
      }
    } catch (e) {
      console.warn('AAAS live EV fetch failed, falling back', e);
    }
  }

  return {
    data: EV_CHARGERS,
    source: 'mock_singapore',
  };
}

/**
 * Simulate live delivery app feed push (Option B)
 */
export function generateRandomIncomingOrder(): DeliveryOrder {
  const platforms = ['GrabFood', 'Foodpanda'] as const;
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const randomId = Math.floor(10000 + Math.random() * 90000);

  const samplePickups = [
    {
      name: 'Tim Ho Wan @ Plaza Singapura',
      address: '68 Orchard Rd, #01-29A Plaza Singapura, Singapore 238839',
      coords: [1.3006, 103.8453] as [number, number],
      items: ['Baked BBQ Pork Buns (3pcs)', 'Pan-Fried Radish Cake', 'Steamed Dumplings'],
    },
    {
      name: 'Boon Tat Street Satay Club',
      address: '18 Boon Tat St, Singapore 069619',
      coords: [1.2801, 103.8509] as [number, number],
      items: ['Chicken Satay 20 sticks', 'Mutton Satay 10 sticks', 'Ketupat 4pcs'],
    },
    {
      name: 'Aroy-Dee Thai Kitchen @ Bugis',
      address: '262 Waterloo St, Singapore 180262',
      coords: [1.2998, 103.8521] as [number, number],
      items: ['Tom Yum Seafood Soup', 'Phad Thai Kung', 'Thai Milk Tea (Large)'],
    },
  ];

  const sampleDropoffs = [
    {
      address: 'UIC Building, #18-05, 5 Shenton Way, Singapore 068808',
      coords: [1.2782, 103.8499] as [number, number],
      unit: '#18-05',
    },
    {
      address: 'Guoco Tower, #22-03, 1 Wallich St, Singapore 078881',
      coords: [1.2770, 103.8458] as [number, number],
      unit: '#22-03',
    },
    {
      address: 'The Sail @ Marina Bay, #35-12, 4 Marina Blvd, Singapore 018986',
      coords: [1.2809, 103.8538] as [number, number],
      unit: '#35-12',
    },
  ];

  const p = samplePickups[Math.floor(Math.random() * samplePickups.length)];
  const d = sampleDropoffs[Math.floor(Math.random() * sampleDropoffs.length)];

  return {
    id: `ord-stream-${Date.now()}`,
    orderNumber: `${platform === 'GrabFood' ? 'GF' : 'FP'}-${randomId}`,
    platform,
    customerName: ['Alex Wong', 'Stephanie Koh', 'Farhan Rahim', 'Priya Menon'][Math.floor(Math.random() * 4)],
    restaurantName: p.name,
    pickupAddress: p.address,
    dropoffAddress: d.address,
    pickupCoords: p.coords,
    dropoffCoords: d.coords,
    unitNumber: d.unit,
    items: p.items,
    earnings: Number((6.50 + Math.random() * 7.50).toFixed(2)),
    readyTime: 'Ready in 2 min',
    status: 'pending',
    specialNotes: 'Contactless delivery, follow designated building courier route.',
    requiresTrolley: Math.random() > 0.6,
  };
}
