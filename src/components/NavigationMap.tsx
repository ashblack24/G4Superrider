import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteStop, MotorcycleParking, EVCharger, DeliveryOrder } from '../types';
import { MOTORBIKE_SHORTCUTS } from '../data/singaporeData';
import { Navigation, Building2 } from 'lucide-react';
import { SimplifiedFloorplanMap } from './SimplifiedFloorplanMap';

interface NavigationMapProps {
  currentLocation: [number, number];
  stops: RouteStop[];
  activeStopIndex: number;
  showParking: boolean;
  showEV: boolean;
  showShortcutsOnly: boolean;
  parkingSpots: MotorcycleParking[];
  evChargers: EVCharger[];
  orders: DeliveryOrder[];
  onSelectParking: (spot: MotorcycleParking) => void;
  onSelectEV: (charger: EVCharger) => void;
  onSelectStop: (stop: RouteStop, index: number) => void;
  onOpenStreetView: (stop: RouteStop) => void;
}

type MapTheme = 'satellite' | 'dark' | 'standard' | 'simplified';

export const NavigationMap: React.FC<NavigationMapProps> = ({
  currentLocation,
  stops,
  activeStopIndex,
  showParking,
  showEV,
  showShortcutsOnly,
  parkingSpots,
  evChargers,
  orders,
  onSelectParking,
  onSelectEV,
  onSelectStop,
  onOpenStreetView,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayersRef = useRef<L.Layer[]>([]);
  const [mapTheme, setMapTheme] = useState<MapTheme>('dark');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: currentLocation,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Reposition zoom controls to bottom-right for clean mobile thumb access
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Force tile recalculation on load and layout changes
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    setTimeout(() => {
      map.invalidateSize();
    }, 400);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layers based on Theme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    tileLayersRef.current.forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    tileLayersRef.current = [];

    if (mapTheme === 'satellite') {
      const satBase = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, className: 'map-tiles-satellite' }
      ).addTo(map);

      const satRoads = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(map);

      tileLayersRef.current = [satBase, satRoads];
    } else if (mapTheme === 'dark') {
      // ArcGIS World Dark Gray Base & Reference layers (100% watermark-free, no API key required)
      const darkBase = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, className: 'map-tiles-dark-base' }
      ).addTo(map);

      const darkRoads = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.9, className: 'map-tiles-dark-labels' }
      ).addTo(map);

      tileLayersRef.current = [darkBase, darkRoads];
    } else {
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      tileLayersRef.current = [osmLayer];
    }

    map.invalidateSize();
  }, [mapTheme]);

  // Render Dynamic Layers & Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Current Rider Marker (Pulsing Amber Dot)
    const riderIcon = L.divIcon({
      className: 'rider-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-[#F39444]/30 animate-ping"></div>
          <div class="relative w-4 h-4 rounded-full bg-[#F39444] border-2 border-[#040505] shadow-[0_0_12px_#F39444]"></div>
          <div class="absolute -bottom-5 bg-[#040505]/90 text-[#F8F8F8] text-[10px] font-bold px-1.5 py-0.5 rounded border border-zinc-700/80 shadow">
            YOU
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(currentLocation, { icon: riderIcon, zIndexOffset: 1000 })
      .addTo(layerGroup)
      .bindPopup(`
        <div class="text-xs p-1 text-zinc-100">
          <div class="font-bold text-[#F39444]">Rider Position (Online)</div>
          <div class="text-zinc-400">Singapore CBD • GPS Locked</div>
        </div>
      `);

    // 2. Draw Motorbike Shortcuts & Paths
    MOTORBIKE_SHORTCUTS.forEach((sc, idx) => {
      // Standard car path (dimmed dashed gray line showing congested regular road)
      if (!showShortcutsOnly) {
        L.polyline(sc.carStandardPath, {
          color: '#52525b',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.6,
        }).addTo(layerGroup);
      }

      // Motorbike Shortcut Path (Sleek high-contrast Amber #F39444 line)
      const shortcutPolyline = L.polyline(sc.waypointCoordinates, {
        color: '#F39444',
        weight: 5,
        opacity: 0.95,
      }).addTo(layerGroup);

      // Mid-point Shortcut Callout Badge
      const midCoord = sc.waypointCoordinates[Math.floor(sc.waypointCoordinates.length / 2)];
      const shortcutBadgeIcon = L.divIcon({
        className: 'shortcut-badge-marker',
        html: `
          <div class="bg-[#F39444] text-[#040505] font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-black/20 whitespace-nowrap -translate-x-1/2 -translate-y-1/2">
            <span>⚡ -${sc.timeSavedMins}m BIKE SHORTCUT</span>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });

      L.marker(midCoord, { icon: shortcutBadgeIcon })
        .addTo(layerGroup)
        .bindPopup(`
          <div class="text-xs space-y-1.5 p-1 text-zinc-200">
            <div class="font-bold text-[#F39444] text-sm">${sc.name}</div>
            <p class="text-zinc-300 text-[11px] leading-tight">${sc.description}</p>
            <div class="flex items-center gap-2 text-[10px] font-mono text-emerald-400 font-bold">
              <span>Save ${sc.timeSavedMins} min</span>
              <span>•</span>
              <span>${sc.erpAvoidance}</span>
            </div>
          </div>
        `);
    });

    // 3. Stop Markers (Pickups & Dropoffs)
    stops.forEach((stop, index) => {
      const isCurrentActive = index === activeStopIndex;
      const isPickup = stop.type === 'pickup';

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer">
            <div class="px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xl border flex items-center gap-1 ${
              isCurrentActive 
                ? 'bg-[#F39444] text-[#040505] border-[#F39444] shadow-[0_0_12px_#F39444]' 
                : isPickup 
                  ? 'bg-emerald-500 text-[#040505] border-emerald-400' 
                  : 'bg-zinc-800 text-white border-zinc-700'
            }">
              <span>${index + 1}.</span>
              <span>${isPickup ? 'PICKUP' : 'DELIVER'}</span>
            </div>
            <div class="w-3.5 h-3.5 rotate-45 -mt-1.5 ${
              isCurrentActive ? 'bg-[#F39444]' : isPickup ? 'bg-emerald-500' : 'bg-zinc-800'
            } border-r border-b border-black/30"></div>
          </div>
        `,
        iconSize: [70, 40],
        iconAnchor: [35, 36],
      });

      const marker = L.marker(stop.coords, { icon: stopIcon, zIndexOffset: isCurrentActive ? 900 : 500 })
        .addTo(layerGroup)
        .on('click', () => onSelectStop(stop, index));

      marker.bindPopup(`
        <div class="text-xs p-1 text-zinc-100 space-y-1.5 min-w-[200px]">
          <div class="flex items-center justify-between">
            <span class="font-bold ${isPickup ? 'text-emerald-400' : 'text-[#F39444]'}">
              Stop ${index + 1}: ${isPickup ? 'Pickup Food' : 'Customer Delivery'}
            </span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono">
              ${stop.estimatedArrival}
            </span>
          </div>
          <div class="font-semibold text-white text-sm">${stop.title}</div>
          <div class="text-zinc-400 text-[11px] leading-tight">${stop.address}</div>
          ${stop.notes ? `<div class="p-1.5 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-amber-300">⚠️ ${stop.notes}</div>` : ''}
          ${!isPickup ? `
            <button id="view-building-guide-popup-btn" class="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-[#F39444] hover:bg-[#F39444]/90 text-[#040505] font-bold text-xs flex items-center justify-center gap-1.5">
              <span>🚶 Foot 3D Guidance</span>
            </button>
          ` : ''}
        </div>
      `);
    });

    // 4. Motorcycle Parking Spots (Free / Grace Period / Paid)
    if (showParking) {
      parkingSpots.forEach((pk) => {
        const isFree = pk.type === 'free' || pk.gracePeriodMins > 0;
        const pkIcon = L.divIcon({
          className: 'custom-parking-marker',
          html: `
            <div class="relative flex items-center justify-center w-7 h-7 rounded-xl ${
              isFree ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-400' : 'bg-zinc-900/90 border border-zinc-600 text-zinc-300'
            } shadow-lg text-xs font-black cursor-pointer hover:scale-110 transition-transform">
              <span class="font-mono">P</span>
              <span class="absolute -top-1.5 -right-1.5 bg-emerald-500 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                ${pk.availableLots}
              </span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker(pk.coords, { icon: pkIcon })
          .addTo(layerGroup)
          .on('click', () => onSelectParking(pk))
          .bindPopup(`
            <div class="text-xs p-1 text-zinc-100 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-400">Motorcycle Parking</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                  ${pk.gracePeriodMins}m Free Grace
                </span>
              </div>
              <div class="font-semibold text-white">${pk.name}</div>
              <div class="text-zinc-400 text-[11px]">${pk.address}</div>
              <div class="text-xs text-amber-300 font-medium">Rate: ${pk.costPerHour}</div>
              <div class="text-[11px] text-zinc-300 flex items-center gap-1 mt-1">
                <span>Available Lots:</span>
                <span class="font-bold text-emerald-400 font-mono">${pk.availableLots} / ${pk.totalLots}</span>
              </div>
              ${pk.restrictionsWarning ? `<div class="text-[10px] text-rose-300 bg-rose-950/40 p-1 rounded border border-rose-900/60 mt-1">⚠️ ${pk.restrictionsWarning}</div>` : ''}
            </div>
          `);
      });
    }

    // 5. EV Charging Points
    if (showEV) {
      evChargers.forEach((ev) => {
        const evIcon = L.divIcon({
          className: 'custom-ev-marker',
          html: `
            <div class="relative flex items-center justify-center w-7 h-7 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-lg text-xs font-black cursor-pointer hover:scale-110 transition-transform">
              <span>⚡</span>
              <span class="absolute -top-1.5 -right-1.5 bg-cyan-400 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                ${ev.availablePlugs}
              </span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker(ev.coords, { icon: evIcon })
          .addTo(layerGroup)
          .on('click', () => onSelectEV(ev))
          .bindPopup(`
            <div class="text-xs p-1 text-zinc-100 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-cyan-400">EV Station • ${ev.operator}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                  ${ev.powerOutput}
                </span>
              </div>
              <div class="font-semibold text-white">${ev.name}</div>
              <div class="text-zinc-400 text-[11px]">${ev.address}</div>
              <div class="text-xs text-zinc-200">Rate: ${ev.ratePerKwh}</div>
              <div class="text-[11px] text-zinc-300 flex items-center gap-1 mt-1">
                <span>Plugs:</span>
                <span class="font-bold text-cyan-400 font-mono">${ev.availablePlugs} / ${ev.totalPlugs} Available (${ev.connectorType})</span>
              </div>
            </div>
          `);
      });
    }

    // Fit bounds smoothly to show the active delivery corridor
    if (stops.length > 0) {
      const allPoints = [currentLocation, ...stops.map((s) => s.coords)];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [currentLocation, stops, activeStopIndex, showParking, showEV, showShortcutsOnly, parkingSpots, evChargers]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(currentLocation, 15, { duration: 0.8 });
    }
  };

  return (
    <div id="live-map-container" className="relative w-full h-full min-h-[480px]">
      {/* Fullscreen Simplified Indoor Floorplan when theme is 'simplified' */}
      {mapTheme === 'simplified' ? (
        <div className="absolute inset-0 z-10">
          <SimplifiedFloorplanMap
            initialLevel="L4"
            targetLevel="L5"
            buildingName="Pavilion & Luxury Mall (CBD)"
            orderNumber={orders[0]?.orderNumber || 'GF-8841'}
            onClose={() => setMapTheme('dark')}
          />
        </div>
      ) : null}

      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Basemap Style Switcher (Top Right) */}
      <div className="absolute top-20 right-3 z-[400] flex flex-col gap-1.5 pointer-events-auto">
        <div className="bg-[#0e1015]/95 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-2xl flex flex-col gap-1">
          <button
            id="map-style-simplified-btn"
            onClick={() => setMapTheme('simplified')}
            title="Simplified Building Floorplan & Level Guide"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapTheme === 'simplified'
                ? 'bg-emerald-500 text-[#040505] shadow font-black'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-white/5'
            }`}
          >
            <span>🏢</span>
            <span className="text-[11px]">Floorplan</span>
          </button>
          <button
            id="map-style-satellite-btn"
            onClick={() => setMapTheme('satellite')}
            title="Satellite Imagery"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapTheme === 'satellite'
                ? 'bg-[#F39444] text-[#040505] shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🛰️</span>
            <span className="text-[11px]">Satellite</span>
          </button>
          <button
            id="map-style-dark-btn"
            onClick={() => setMapTheme('dark')}
            title="Dark Matter Map"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapTheme === 'dark'
                ? 'bg-[#F39444] text-[#040505] shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🌙</span>
            <span className="text-[11px]">Dark</span>
          </button>
          <button
            id="map-style-standard-btn"
            onClick={() => setMapTheme('standard')}
            title="Street Map"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mapTheme === 'standard'
                ? 'bg-[#F39444] text-[#040505] shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🗺️</span>
            <span className="text-[11px]">Street</span>
          </button>
        </div>

        {/* Re-center on Rider Button */}
        {mapTheme !== 'simplified' && (
          <button
            id="recenter-rider-btn"
            onClick={handleRecenter}
            title="Center on GPS Location"
            className="w-10 h-10 rounded-xl bg-[#0e1015]/95 backdrop-blur-md border border-white/10 text-[#F39444] hover:bg-[#F39444] hover:text-[#040505] flex items-center justify-center shadow-xl transition-all self-end active:scale-95"
          >
            <Navigation className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
