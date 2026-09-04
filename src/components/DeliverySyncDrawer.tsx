import React, { useState, useEffect } from 'react';
import { DeliveryOrder } from '../types';
import { generateRandomIncomingOrder } from '../services/apiService';
import { 
  Radio, 
  Plus, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Check, 
  Sparkles, 
  X, 
  RefreshCw, 
  SlidersHorizontal,
  Package,
  MapPin,
  Flame
} from 'lucide-react';

interface DeliverySyncDrawerProps {
  orders: DeliveryOrder[];
  isOpen: boolean;
  onClose: () => void;
  onAcceptOrder: (order: DeliveryOrder) => void;
  onAutoOptimizeRoute: () => void;
}

export const DeliverySyncDrawer: React.FC<DeliverySyncDrawerProps> = ({
  orders,
  isOpen,
  onClose,
  onAcceptOrder,
  onAutoOptimizeRoute,
}) => {
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [incomingFeed, setIncomingFeed] = useState<DeliveryOrder[]>([]);
  const [simulatedPlatform, setSimulatedPlatform] = useState<'All' | 'GrabFood' | 'Foodpanda'>('All');

  // Stream generator effect
  useEffect(() => {
    if (!isLiveStreaming) return;
    
    // Seed an initial incoming order
    if (incomingFeed.length === 0) {
      setIncomingFeed([generateRandomIncomingOrder()]);
    }

    const interval = setInterval(() => {
      // Simulate periodic live orders popping in from Grab / Foodpanda dispatcher
      if (Math.random() > 0.4 && incomingFeed.length < 5) {
        const newOrd = generateRandomIncomingOrder();
        setIncomingFeed((prev) => [newOrd, ...prev.slice(0, 4)]);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, incomingFeed.length]);

  if (!isOpen) return null;

  const handleManualAddSimulated = () => {
    const newOrd = generateRandomIncomingOrder();
    setIncomingFeed((prev) => [newOrd, ...prev]);
  };

  const filteredFeed = incomingFeed.filter((o) => {
    if (simulatedPlatform === 'All') return true;
    return o.platform === simulatedPlatform;
  });

  return (
    <div id="delivery-sync-drawer" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-[#040505] border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F39444]/20 border border-[#F39444]/40 flex items-center justify-center text-[#F39444]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                Delivery App Stream
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </h3>
              <p className="text-xs text-zinc-400">GrabFood & Foodpanda Live Orders (Option B)</p>
            </div>
          </div>

          <button
            id="close-sync-drawer-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stream Status & Controls */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Sync Status:</span>
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-colors flex items-center gap-1.5 ${
                isLiveStreaming 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
              {isLiveStreaming ? 'LIVE DISPATCH CONNECTED' : 'STREAM PAUSED'}
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {(['All', 'GrabFood', 'Foodpanda'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setSimulatedPlatform(plat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  simulatedPlatform === plat
                    ? 'bg-[#F39444] text-black shadow-md'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
              >
                {plat}
              </button>
            ))}

            <button
              onClick={handleManualAddSimulated}
              title="Trigger simulated incoming order"
              className="ml-auto px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-[#F39444]" /> Order
            </button>
          </div>
        </div>

        {/* Order Feed Queue */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>Incoming Opportunity Queue ({filteredFeed.length})</span>
            <span className="font-mono text-[11px] text-zinc-500">Auto-Refreshes</span>
          </div>

          {filteredFeed.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 space-y-2">
              <Package className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-xs">No pending unassigned orders right now.</p>
              <button
                onClick={handleManualAddSimulated}
                className="text-xs font-bold text-[#F39444] hover:underline"
              >
                Generate Test Order
              </button>
            </div>
          ) : (
            filteredFeed.map((ord) => {
              const isGrab = ord.platform === 'GrabFood';
              return (
                <div
                  key={ord.id}
                  className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 space-y-3 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          isGrab
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {ord.platform.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{ord.orderNumber}</span>
                    </div>

                    <span className="text-sm font-bold text-white font-mono flex items-center gap-0.5 text-emerald-400">
                      S${ord.earnings.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-white">{ord.restaurantName}</div>
                        <div className="text-zinc-400 text-[11px] truncate">{ord.pickupAddress}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#F39444] mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-zinc-200">Customer: {ord.customerName} ({ord.unitNumber})</div>
                        <div className="text-zinc-400 text-[11px] truncate">{ord.dropoffAddress}</div>
                      </div>
                    </div>
                  </div>

                  {ord.items && (
                    <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300">
                      <div className="text-[10px] uppercase font-mono text-zinc-500 mb-0.5">Order Bag:</div>
                      {ord.items.join(', ')}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      ⏱ {ord.readyTime}
                    </span>

                    <button
                      id={`accept-order-${ord.id}`}
                      onClick={() => {
                        onAcceptOrder(ord);
                        setIncomingFeed((prev) => prev.filter((item) => item.id !== ord.id));
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#F39444] hover:bg-[#F39444]/90 text-[#040505] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#F39444]/20 transition-transform active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Accept & Plot</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Route Optimizer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 space-y-2">
          <button
            id="optimize-nearest-pickup-btn"
            onClick={() => {
              onAutoOptimizeRoute();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Sparkles className="w-4 h-4 text-[#F39444]" />
            <span>Re-Optimize Route From Nearest Pickup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
