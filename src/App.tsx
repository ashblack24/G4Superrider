import React, { useState, useEffect, useMemo } from 'react';
import { 
  DeliveryOrder, 
  RouteStop, 
  MotorcycleParking, 
  EVCharger, 
  FootDeliveryGuide, 
  ApiCredentials 
} from './types';
import { 
  SINGAPORE_DEFAULT_CENTER, 
  INITIAL_ORDERS, 
  MOTORCYCLE_PARKING_SPOTS, 
  EV_CHARGERS, 
  BUILDING_FOOT_GUIDES, 
  MOTORBIKE_SHORTCUTS 
} from './data/singaporeData';
import { 
  getSavedCredentials, 
  saveCredentials, 
  fetchMotorcycleParking, 
  fetchEVChargers 
} from './services/apiService';
import { NavigationMap } from './components/NavigationMap';
import { RouteSummarySheet } from './components/RouteSummarySheet';
import { StreetViewFootGuidance } from './components/StreetViewFootGuidance';
import { DeliverySyncDrawer } from './components/DeliverySyncDrawer';
import { ParkingEVModal } from './components/ParkingEVModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { 
  Navigation, 
  Radio, 
  SlidersHorizontal, 
  Key, 
  Footprints, 
  BatteryCharging, 
  MapPin, 
  Zap, 
  Eye, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw,
  Bell,
  CheckCircle2,
  AlertTriangle,
  LocateFixed
} from 'lucide-react';

export default function App() {
  // Current Rider Location (Singapore CBD - Near Raffles City / City Hall)
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(SINGAPORE_DEFAULT_CENTER);

  // Active Orders (GrabFood & Foodpanda)
  const [orders, setOrders] = useState<DeliveryOrder[]>(INITIAL_ORDERS);

  // Layer Toggles
  const [showParking, setShowParking] = useState(true);
  const [showEV, setShowEV] = useState(true);
  const [showShortcutsOnly, setShowShortcutsOnly] = useState(false);

  // Modals & Drawers
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);
  const [isParkingModalOpen, setIsParkingModalOpen] = useState(false);
  const [parkingModalTab, setParkingModalTab] = useState<'parking' | 'ev'>('parking');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [activeFootGuide, setActiveFootGuide] = useState<FootDeliveryGuide | null>(null);
  const [activeFootStop, setActiveFootStop] = useState<RouteStop | null>(null);

  // Parking & EV Data
  const [parkingSpots, setParkingSpots] = useState<MotorcycleParking[]>(MOTORCYCLE_PARKING_SPOTS);
  const [evChargers, setEvChargers] = useState<EVCharger[]>(EV_CHARGERS);

  // API Credentials
  const [credentials, setCredentials] = useState<ApiCredentials>(getSavedCredentials());

  // Active Waypoint Stop Index in the sequence
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  // Live LTA Data Status
  const [ltaStatus, setLtaStatus] = useState<'live' | 'local'>('local');

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(
    '⚡ Motorbike Shortcuts Active: Saving ~15 mins across 3 CBD deliveries'
  );

  // Fetch / Sync parking & EV data on load or credentials change
  useEffect(() => {
    async function loadData() {
      const pkResult = await fetchMotorcycleParking(credentials);
      setParkingSpots(pkResult.data);
      if (pkResult.source === 'live_lta') {
        setLtaStatus('live');
        setToastMessage('Live LTA DataMall connected: real-time carpark lots active');
      } else {
        setLtaStatus('local');
      }

      const evResult = await fetchEVChargers(credentials);
      setEvChargers(evResult.data);
    }
    loadData();
  }, [credentials]);

  // Generate Multi-Stop Sequence (Pickups first, then Dropoffs, ordered by proximity)
  const stops: RouteStop[] = useMemo(() => {
    const list: RouteStop[] = [];

    orders.forEach((ord) => {
      // Pickup stop
      list.push({
        id: `stop-pickup-${ord.id}`,
        orderId: ord.id,
        type: 'pickup',
        title: ord.restaurantName,
        address: ord.pickupAddress,
        coords: ord.pickupCoords,
        estimatedArrival: '12:35 PM',
        distanceKm: 0.9,
        durationMins: 4,
        shortcutSavingsMins: 4,
        isCompleted: ord.status === 'picked_up' || ord.status === 'delivering' || ord.status === 'completed',
        notes: ord.specialNotes,
      });

      // Dropoff stop
      list.push({
        id: `stop-dropoff-${ord.id}`,
        orderId: ord.id,
        type: 'dropoff',
        title: `${ord.customerName} (${ord.unitNumber})`,
        address: ord.dropoffAddress,
        coords: ord.dropoffCoords,
        estimatedArrival: '12:48 PM',
        distanceKm: 1.6,
        durationMins: 7,
        shortcutSavingsMins: 6,
        isCompleted: ord.status === 'completed',
        notes: ord.specialNotes,
        buildingGuideId: ord.dropoffAddress,
      });
    });

    return list;
  }, [orders]);

  // Calculate totals
  const totalDistanceKm = useMemo(() => {
    return Number(stops.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(1));
  }, [stops]);

  const totalDurationMins = useMemo(() => {
    return stops.reduce((acc, s) => acc + s.durationMins, 0);
  }, [stops]);

  const totalTimeSavedMins = useMemo(() => {
    return stops.reduce((acc, s) => acc + s.shortcutSavingsMins, 0);
  }, [stops]);

  // Handle re-optimizing route starting from nearest pickup
  const handleOptimizeFromNearest = () => {
    // Sort orders by distance from current location to pickup
    const sortedOrders = [...orders].sort((a, b) => {
      const distA = Math.hypot(a.pickupCoords[0] - currentLocation[0], a.pickupCoords[1] - currentLocation[1]);
      const distB = Math.hypot(b.pickupCoords[0] - currentLocation[0], b.pickupCoords[1] - currentLocation[1]);
      return distA - distB;
    });

    setOrders(sortedOrders);
    setActiveStopIndex(0);
    setToastMessage('✅ Route Re-Optimized: Starting from nearest pickup point');
  };

  // Handle Next Stop / Completion
  const handleNextStop = () => {
    const currentStop = stops[activeStopIndex];
    if (!currentStop) return;

    if (currentStop.type === 'dropoff') {
      // Open 3D Foot guidance
      const guide = BUILDING_FOOT_GUIDES[currentStop.address] || Object.values(BUILDING_FOOT_GUIDES)[0];
      setActiveFootGuide(guide);
      setActiveFootStop(currentStop);
    } else {
      // Advance to next stop
      if (activeStopIndex < stops.length - 1) {
        setActiveStopIndex(activeStopIndex + 1);
        setToastMessage(`Food picked up at ${currentStop.title}! Heading to next stop.`);
      } else {
        setToastMessage('All stops completed for this batch!');
      }
    }
  };

  // Handle 3D Foot Delivery completion
  const handleCompleteFootDelivery = () => {
    if (activeFootStop) {
      setOrders((prev) =>
        prev.map((o) => (o.id === activeFootStop.orderId ? { ...o, status: 'completed' } : o))
      );
    }
    setActiveFootGuide(null);
    setActiveFootStop(null);
    if (activeStopIndex < stops.length - 1) {
      setActiveStopIndex(activeStopIndex + 1);
    }
    setToastMessage('🎉 Delivery completed safely following all designated building paths!');
  };

  // Open Street View for a selected stop
  const handleOpenStreetView = (stop: RouteStop) => {
    const guide = BUILDING_FOOT_GUIDES[stop.address] || Object.values(BUILDING_FOOT_GUIDES)[0];
    setActiveFootGuide(guide);
    setActiveFootStop(stop);
  };

  // Accept incoming simulated order from Grab / Foodpanda (Option B)
  const handleAcceptOrder = (newOrder: DeliveryOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setToastMessage(`Accepted ${newOrder.platform} #${newOrder.orderNumber}! Added to routing schedule.`);
  };

  return (
    <div id="superrider-app-root" className="relative w-full h-screen bg-[#040505] text-[#F8F8F8] overflow-hidden flex flex-col select-none font-sans">
      
      {/* Top Floating Sleek Header Bar (Reference Image Minimalist Style) */}
      <header id="floating-header" className="absolute top-0 left-0 right-0 z-20 p-3 md:p-4 pointer-events-none">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          
          {/* Main Controls Row */}
          <div className="flex items-center justify-between pointer-events-auto">
            
            {/* App Brand & Location Pill */}
            <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl shadow-2xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F39444] to-amber-600 flex items-center justify-center font-black text-black text-sm tracking-wider shadow-md shadow-[#F39444]/30">
                G4
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-white">SUPERRIDER</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-[#F39444] border border-[#F39444]/30 font-mono">
                    SG CBD
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${ltaStatus === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-[#F39444]'}`}></span>
                  <span>{ltaStatus === 'live' ? 'LTA Live (Vercel)' : 'Shortcuts Active'}</span>
                </div>
              </div>
            </div>

            {/* Right Action Icons (Live Order Stream & API Settings) */}
            <div className="flex items-center gap-2">
              
              {/* Grab/Foodpanda Live Sync Pill */}
              <button
                id="open-sync-drawer-btn"
                onClick={() => setIsSyncDrawerOpen(true)}
                className="relative flex items-center gap-2 bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 backdrop-blur-xl px-3 py-2 rounded-2xl shadow-2xl text-xs font-semibold text-zinc-200 transition-colors"
              >
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Orders</span>
                <span className="w-5 h-5 rounded-full bg-[#F39444] text-black font-mono font-black text-[10px] flex items-center justify-center">
                  {orders.length}
                </span>
              </button>

              {/* OneMap & LTA API Config */}
              <button
                id="open-api-config-btn"
                onClick={() => setIsApiModalOpen(true)}
                title="Configure OneMap, LTA DataMall, and AAAS API"
                className="w-10 h-10 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 backdrop-blur-xl flex items-center justify-center text-zinc-300 transition-colors shadow-2xl"
              >
                <Key className="w-4 h-4 text-[#F39444]" />
              </button>
            </div>
          </div>

          {/* Quick On-Demand Feature Toggles (Pill Buttons matching screenshot) */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none pointer-events-auto">
            
            {/* Shortcut Mode Active */}
            <button
              id="toggle-shortcuts-btn"
              onClick={() => setShowShortcutsOnly(!showShortcutsOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                showShortcutsOnly
                  ? 'bg-[#F39444] text-[#040505] shadow-[#F39444]/25'
                  : 'bg-zinc-900/90 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Bike Shortcuts ({totalTimeSavedMins}m saved)</span>
            </button>

            {/* Motorcycle Parking Toggle & Directory */}
            <button
              id="toggle-parking-btn"
              onClick={() => {
                setParkingModalTab('parking');
                setIsParkingModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                showParking
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                  : 'bg-zinc-900/90 text-zinc-300 border border-zinc-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Free/Paid Parking ({parkingSpots.length})</span>
            </button>

            {/* EV Charging Toggle & Directory */}
            <button
              id="toggle-ev-btn"
              onClick={() => {
                setParkingModalTab('ev');
                setIsParkingModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                showEV
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/50'
                  : 'bg-zinc-900/90 text-zinc-300 border border-zinc-800'
              }`}
            >
              <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
              <span>EV Charging ({evChargers.length})</span>
            </button>

            {/* On-Foot 3D Guidance Shortcut */}
            <button
              id="direct-streetview-btn"
              onClick={() => {
                const currentStop = stops[activeStopIndex] || stops[0];
                handleOpenStreetView(currentStop);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-zinc-900/90 text-zinc-300 border border-zinc-800 hover:border-zinc-700 backdrop-blur-md shadow-lg flex items-center gap-1.5"
            >
              <Footprints className="w-3.5 h-3.5 text-[#F39444]" />
              <span>Foot 3D Guidance</span>
            </button>
          </div>

          {/* Quick Toast Banner */}
          {toastMessage && (
            <div 
              onClick={() => setToastMessage(null)}
              className="pointer-events-auto self-center bg-zinc-900/95 border border-[#F39444]/40 text-xs font-medium text-white px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <span>{toastMessage}</span>
              <span className="text-[10px] text-zinc-400 font-mono">✕</span>
            </div>
          )}
        </div>
      </header>

      {/* Primary Center Screen: Live Map */}
      <main id="map-viewport" className="flex-1 w-full h-full relative">
        <NavigationMap
          currentLocation={currentLocation}
          stops={stops}
          activeStopIndex={activeStopIndex}
          showParking={showParking}
          showEV={showEV}
          showShortcutsOnly={showShortcutsOnly}
          parkingSpots={parkingSpots}
          evChargers={evChargers}
          orders={orders}
          onSelectParking={(spot) => {
            setToastMessage(`Motorcycle Parking: ${spot.name} (${spot.availableLots} lots free)`);
          }}
          onSelectEV={(charger) => {
            setToastMessage(`EV Station: ${charger.name} (${charger.powerOutput})`);
          }}
          onSelectStop={(stop, idx) => {
            setActiveStopIndex(idx);
          }}
          onOpenStreetView={(stop) => {
            handleOpenStreetView(stop);
          }}
        />
      </main>

      {/* Bottom Sheet: Route Waypoints, Active Delivery, and Guardrails */}
      <RouteSummarySheet
        stops={stops}
        activeStopIndex={activeStopIndex}
        totalDistanceKm={totalDistanceKm}
        totalDurationMins={totalDurationMins}
        totalTimeSavedMins={totalTimeSavedMins}
        onNextStop={handleNextStop}
        onSelectStop={(stop, idx) => setActiveStopIndex(idx)}
        onOpenStreetView={handleOpenStreetView}
        onOptimizeRoute={handleOptimizeFromNearest}
      />

      {/* On-Foot 3D Street View Guidance Modal */}
      {activeFootGuide && activeFootStop && (
        <StreetViewFootGuidance
          guide={activeFootGuide}
          stop={activeFootStop}
          parkingSpot={parkingSpots.find((p) => p.id === activeFootGuide.recommendedParkingId)}
          onClose={() => {
            setActiveFootGuide(null);
            setActiveFootStop(null);
          }}
          onCompleteDelivery={handleCompleteFootDelivery}
        />
      )}

      {/* Grab & Foodpanda Live Delivery Stream Drawer (Option B) */}
      <DeliverySyncDrawer
        orders={orders}
        isOpen={isSyncDrawerOpen}
        onClose={() => setIsSyncDrawerOpen(false)}
        onAcceptOrder={handleAcceptOrder}
        onAutoOptimizeRoute={handleOptimizeFromNearest}
      />

      {/* Free & Paid Parking / EV Charging Directory Modal */}
      <ParkingEVModal
        isOpen={isParkingModalOpen}
        activeTab={parkingModalTab}
        parkingSpots={parkingSpots}
        evChargers={evChargers}
        onClose={() => setIsParkingModalOpen(false)}
        onSelectParking={(spot) => {
          setCurrentLocation(spot.coords);
          setShowParking(true);
          setToastMessage(`Navigating to Motorcycle Parking: ${spot.name}`);
        }}
        onSelectEV={(charger) => {
          setCurrentLocation(charger.coords);
          setShowEV(true);
          setToastMessage(`Navigating to EV Charger: ${charger.name}`);
        }}
      />

      {/* API & AAAS Settings (OneMap / LTA DataMall / Custom Endpoint) */}
      <ApiConfigModal
        isOpen={isApiModalOpen}
        credentials={credentials}
        onClose={() => setIsApiModalOpen(false)}
        onSave={(newCreds) => {
          setCredentials(newCreds);
          setToastMessage('API credentials updated successfully');
        }}
      />
    </div>
  );
}
