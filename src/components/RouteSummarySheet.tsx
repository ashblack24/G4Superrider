import React, { useState } from 'react';
import { RouteStop, DeliveryOrder, MotorcycleParking } from '../types';
import { 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Navigation, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Footprints, 
  Sparkles, 
  ArrowUpRight,
  Store,
  MapPin,
  Flame,
  AlertTriangle
} from 'lucide-react';

interface RouteSummarySheetProps {
  stops: RouteStop[];
  activeStopIndex: number;
  totalDistanceKm: number;
  totalDurationMins: number;
  totalTimeSavedMins: number;
  onNextStop: () => void;
  onSelectStop: (stop: RouteStop, index: number) => void;
  onOpenStreetView: (stop: RouteStop) => void;
  onOptimizeRoute: () => void;
}

export const RouteSummarySheet: React.FC<RouteSummarySheetProps> = ({
  stops,
  activeStopIndex,
  totalDistanceKm,
  totalDurationMins,
  totalTimeSavedMins,
  onNextStop,
  onSelectStop,
  onOpenStreetView,
  onOptimizeRoute,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeStop = stops[activeStopIndex] || stops[0];
  const isDropoff = activeStop?.type === 'dropoff';

  return (
    <div
      id="route-summary-sheet"
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
        isExpanded ? 'max-h-[85vh]' : 'max-h-[290px] md:max-h-[310px]'
      } bg-gradient-to-t from-[#040505] via-zinc-950/95 to-zinc-900/90 border-t border-zinc-800/90 backdrop-blur-2xl rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.8)] flex flex-col text-[#F8F8F8]`}
    >
      {/* Drag Handle & Quick Expand Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="pt-2 pb-1 flex flex-col items-center justify-center cursor-pointer select-none"
      >
        <div className="w-12 h-1.5 rounded-full bg-zinc-700/80 mb-1" />
        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
          <span>{isExpanded ? 'Tap to Collapse' : 'Multi-Delivery Waypoints & Shortcuts'}</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Reference Image Style Frosted Cards */}
      <div className="p-4 pt-1 space-y-3 overflow-y-auto">
        
        {/* Top Active Stop Card & Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Main Status / Next Stop Highlight (Matching Screenshot Style) */}
          <div className="md:col-span-2 relative p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                    activeStop?.type === 'pickup' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-[#F39444]/20 text-[#F39444] border border-[#F39444]/30'
                  }`}>
                    {activeStop?.type === 'pickup' ? 'NEXT PICKUP' : 'NEXT DELIVER'}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Stop {activeStopIndex + 1} of {stops.length}</span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white tracking-tight leading-snug">
                  {activeStop?.title}
                </h3>
                <p className="text-xs text-zinc-400 truncate max-w-sm">
                  {activeStop?.address}
                </p>
              </div>

              {/* ETA / Load Indicator */}
              <div className="text-right flex-shrink-0">
                <div className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
                  {activeStop?.durationMins}<span className="text-xs text-zinc-400 font-sans font-normal ml-0.5">MIN</span>
                </div>
                <div className="text-[11px] text-[#F39444] font-mono font-bold flex items-center justify-end gap-1">
                  <Zap className="w-3 h-3" />
                  <span>-{activeStop?.shortcutSavingsMins || 5}m BIKE CUT</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[11px] font-mono">
                  ETA: {activeStop?.estimatedArrival}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{activeStop?.distanceKm} km away</span>
              </div>

              <div className="flex items-center gap-2">
                {isDropoff && (
                  <button
                    id="open-foot-3d-btn"
                    onClick={() => onOpenStreetView(activeStop)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>3D Foot Guidance</span>
                  </button>
                )}

                <button
                  id="advance-next-stop-btn"
                  onClick={onNextStop}
                  className="px-4 py-1.5 rounded-xl bg-[#F39444] hover:bg-[#F39444]/90 text-[#040505] text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <span>{isDropoff ? 'Arrived / Completed' : 'Picked Up Food'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Warning / Guardrail Status Card (Matching Screenshot Warning Card) */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-xl flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active Safety & Shortcut Status</span>
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                Legal motorcycle shortcuts active. Avoiding peak ERP gantries & restricted highway sections.
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] space-y-1">
              <div className="flex justify-between text-zinc-300">
                <span>Total Saved:</span>
                <span className="font-mono font-bold text-[#F39444]">~{totalTimeSavedMins} mins</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Guardrails:</span>
                <span className="font-mono text-emerald-400">100% Step-Free & Legal</span>
              </div>
            </div>

            <button
              onClick={onOptimizeRoute}
              className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1 border border-zinc-700 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[#F39444]" />
              <span>Optimize From Nearest Stop</span>
            </button>
          </div>
        </div>

        {/* Expanded Waypoint List */}
        {isExpanded && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
              Complete Multi-Drop Route Sequence
            </h4>

            <div className="space-y-2">
              {stops.map((stop, idx) => {
                const isActive = idx === activeStopIndex;
                const isStopPickup = stop.type === 'pickup';

                return (
                  <div
                    key={stop.id}
                    onClick={() => onSelectStop(stop, idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[#F39444]/15 border-[#F39444] shadow-lg'
                        : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                          isActive
                            ? 'bg-[#F39444] text-black'
                            : isStopPickup
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{stop.title}</span>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">
                            ({isStopPickup ? 'Pickup' : 'Dropoff'})
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-xs">{stop.address}</div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono font-bold text-white">{stop.distanceKm} km</div>
                      <div className="text-[10px] text-[#F39444] font-mono">-{stop.shortcutSavingsMins}m saved</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
