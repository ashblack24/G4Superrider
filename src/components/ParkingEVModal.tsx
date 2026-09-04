import React, { useState } from 'react';
import { MotorcycleParking, EVCharger } from '../types';
import { 
  X, 
  MapPin, 
  BatteryCharging, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ArrowRight, 
  Compass, 
  Filter,
  ShieldAlert,
  Clock,
  CircleDollarSign
} from 'lucide-react';

interface ParkingEVModalProps {
  isOpen: boolean;
  activeTab: 'parking' | 'ev';
  parkingSpots: MotorcycleParking[];
  evChargers: EVCharger[];
  onClose: () => void;
  onSelectParking: (spot: MotorcycleParking) => void;
  onSelectEV: (charger: EVCharger) => void;
}

export const ParkingEVModal: React.FC<ParkingEVModalProps> = ({
  isOpen,
  activeTab: initialTab,
  parkingSpots,
  evChargers,
  onClose,
  onSelectParking,
  onSelectEV,
}) => {
  const [tab, setTab] = useState<'parking' | 'ev'>(initialTab);
  const [parkingFilter, setParkingFilter] = useState<'all' | 'free_grace' | 'paid'>('all');
  const [evOperatorFilter, setEvOperatorFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredParking = parkingSpots.filter((p) => {
    if (parkingFilter === 'free_grace') return p.type === 'free' || p.gracePeriodMins > 0;
    if (parkingFilter === 'paid') return p.type === 'paid';
    return true;
  });

  const filteredEV = evChargers.filter((e) => {
    if (evOperatorFilter !== 'all') return e.operator === evOperatorFilter;
    return true;
  });

  return (
    <div id="parking-ev-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#040505] border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#F8F8F8]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-800/80 p-1 rounded-xl border border-zinc-700">
              <button
                id="tab-parking-btn"
                onClick={() => setTab('parking')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  tab === 'parking'
                    ? 'bg-[#F39444] text-[#040505] shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🏍 Motorcycle Parking</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full font-mono">
                  {parkingSpots.length}
                </span>
              </button>

              <button
                id="tab-ev-btn"
                onClick={() => setTab('ev')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  tab === 'ev'
                    ? 'bg-cyan-400 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>⚡ EV Charging Points</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-full font-mono">
                  {evChargers.length}
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Filters */}
        <div className="p-3 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center gap-2 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          {tab === 'parking' ? (
            <>
              <button
                onClick={() => setParkingFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold ${
                  parkingFilter === 'all' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Lots
              </button>
              <button
                onClick={() => setParkingFilter('free_grace')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 ${
                  parkingFilter === 'free_grace' ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Free & Grace Period (10-20m)</span>
              </button>
              <button
                onClick={() => setParkingFilter('paid')}
                className={`px-3 py-1 rounded-lg font-semibold ${
                  parkingFilter === 'paid' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Paid Lots (EPS)
              </button>
            </>
          ) : (
            <>
              {['all', 'SP Group', 'Shell Recharge', 'CDG ENGIE', 'Charge+'].map((op) => (
                <button
                  key={op}
                  onClick={() => setEvOperatorFilter(op)}
                  className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap ${
                    evOperatorFilter === op ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {op === 'all' ? 'All Operators' : op}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === 'parking' ? (
            filteredParking.map((spot) => (
              <div
                key={spot.id}
                className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        spot.type === 'free' || spot.gracePeriodMins > 0 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {spot.gracePeriodMins > 0 ? `${spot.gracePeriodMins} MIN GRACE FREE` : 'PAID EPS'}
                      </span>
                      {spot.gantryBypassAvailable && (
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                          Barrier Bypass Available
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-sm">{spot.name}</h4>
                    <p className="text-xs text-zinc-400">{spot.address}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {spot.availableLots} Lots Free
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      of {spot.totalLots} total
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 pt-1 border-t border-zinc-800/60">
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <CircleDollarSign className="w-3.5 h-3.5" />
                    {spot.costPerHour}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {spot.liftLobbyNearby}
                  </span>
                </div>

                {spot.restrictionsWarning && (
                  <div className="p-2 rounded-xl bg-red-950/20 border border-red-900/40 text-[11px] text-red-300 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Guardrail: {spot.restrictionsWarning}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {spot.trolleyAccessibleToMall ? 'Trolley Step-Free Accessible' : 'Stairs Only'}
                  </span>

                  <button
                    id={`select-parking-${spot.id}`}
                    onClick={() => {
                      onSelectParking(spot);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F39444] hover:bg-[#F39444]/90 text-[#040505] font-bold text-xs flex items-center gap-1 shadow"
                  >
                    <span>View On Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            filteredEV.map((charger) => (
              <div
                key={charger.id}
                className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                        {charger.operator}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {charger.powerOutput}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{charger.name}</h4>
                    <p className="text-xs text-zinc-400">{charger.address}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold font-mono text-cyan-400">
                      {charger.availablePlugs} Plugs
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      of {charger.totalPlugs} total
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1 border-t border-zinc-800/60">
                  <span className="text-zinc-200 font-mono">
                    Rate: <strong className="text-cyan-300">{charger.ratePerKwh}</strong>
                  </span>
                  <span className="text-zinc-400 font-mono">
                    Connector: {charger.connectorType}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-400">
                    {charger.parkingFeeRequired ? 'Standard parking fees apply' : 'Dedicated EV charging bay'}
                  </span>

                  <button
                    id={`select-ev-${charger.id}`}
                    onClick={() => {
                      onSelectEV(charger);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#040505] font-bold text-xs flex items-center gap-1 shadow"
                  >
                    <span>View On Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
