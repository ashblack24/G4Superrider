import React, { useState } from 'react';
import { FloorLevelPlan, StoreUnit, AccessNode } from '../types';
import { MALL_FLOORPLANS, AVAILABLE_FLOOR_LEVELS } from '../data/floorplanData';
import { 
  ChevronUp, 
  ChevronDown, 
  ShoppingBag, 
  ArrowUpRight, 
  Footprints, 
  CheckCircle2, 
  X, 
  Building2, 
  Utensils, 
  Sparkles,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface SimplifiedFloorplanMapProps {
  initialLevel?: string;
  targetLevel?: string;
  buildingName?: string;
  orderNumber?: string;
  onClose?: () => void;
  onNavigateToLevel?: (level: string) => void;
}

export const SimplifiedFloorplanMap: React.FC<SimplifiedFloorplanMapProps> = ({
  initialLevel = 'L4',
  targetLevel = 'L5',
  buildingName = 'Pavilion Mall & Luxury Galleries',
  orderNumber = 'GF-8841',
  onClose,
  onNavigateToLevel,
}) => {
  const [currentLevel, setCurrentLevel] = useState<string>(initialLevel);
  const [selectedStore, setSelectedStore] = useState<StoreUnit | null>(null);
  const [selectedNode, setSelectedNode] = useState<AccessNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const activePlan: FloorLevelPlan = MALL_FLOORPLANS[currentLevel] || MALL_FLOORPLANS['L4'];

  const handleSelectLevel = (level: string) => {
    setCurrentLevel(level);
    setSelectedStore(null);
    setSelectedNode(null);
    if (onNavigateToLevel) {
      onNavigateToLevel(level);
    }
  };

  const handleLevelStep = (direction: 'up' | 'down') => {
    const levels = [...AVAILABLE_FLOOR_LEVELS];
    const currentIndex = levels.indexOf(currentLevel as any);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex > 0) {
      handleSelectLevel(levels[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < levels.length - 1) {
      handleSelectLevel(levels[currentIndex + 1]);
    }
  };

  // Filter stores if search entered
  const filteredStores = searchQuery.trim() === ''
    ? activePlan.stores
    : activePlan.stores.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.unitCode.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div id="simplified-floorplan-container" className="relative w-full h-full min-h-[540px] bg-[#eceff3] text-[#1e293b] select-none overflow-hidden flex flex-col font-sans">
      
      {/* Top Floating Mini Header & Store Search */}
      <div className="absolute top-3 left-3 right-16 z-30 flex items-center gap-2 pointer-events-auto">
        <div className="flex-1 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#cbd5e1] shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 truncate">{buildingName}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  {currentLevel}
                </span>
                {targetLevel === currentLevel && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold">
                    Target Floor
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">{activePlan.name}</p>
            </div>
          </div>

          {/* Search bar inside header */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Find store or unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-32"
            />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl border border-[#cbd5e1] shadow-lg p-1 gap-1">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
            title="Zoom In"
            className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
            title="Zoom Out"
            className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/95 border border-[#cbd5e1] hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Floorplan Canvas / SVG Vector Render */}
      <div 
        id="floorplan-svg-viewport" 
        className="w-full h-full relative overflow-hidden flex items-center justify-center transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg 
          viewBox="0 0 1000 650" 
          className="w-full h-full max-w-5xl select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle architectural grid pattern */}
          <defs>
            <pattern id="floorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>

            {/* Drop shadow for 3D architectural walls */}
            <filter id="wallShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#94a3b8" floodOpacity="0.35" />
            </filter>

            {/* Pill callout shadow */}
            <filter id="calloutShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#047857" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background ground & street area */}
          <rect width="1000" height="650" fill="#f1f5f9" />
          <rect width="1000" height="650" fill="url(#floorGrid)" opacity="0.6" />

          {/* Exterior Streets (Bintang Walk & Crystal Fountain) */}
          <g id="exterior-streets" opacity="0.85">
            {/* Bottom street boundary */}
            <line x1="50" y1="600" x2="950" y2="600" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
            <text x="600" y="625" fill="#64748b" fontSize="14" fontWeight="600" fontFamily="sans-serif" letterSpacing="0.5">
              Bintang Walk
            </text>

            {/* Crystal fountain label on bottom left */}
            <text x="70" y="585" fill="#38bdf8" fontSize="13" fontWeight="600" fontFamily="sans-serif">
              Pavilion
            </text>
            <text x="70" y="602" fill="#38bdf8" fontSize="13" fontWeight="600" fontFamily="sans-serif">
              Crystal
            </text>
            <text x="70" y="619" fill="#38bdf8" fontSize="13" fontWeight="600" fontFamily="sans-serif">
              Fountain
            </text>
          </g>

          {/* Main Architectural Building Footprint (Clean Grey Polygons) */}
          <g id="architectural-hull">
            {/* Outer Building Wing Poly */}
            <polygon
              points="120,60 880,60 920,560 620,560 600,530 180,530 120,400"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              filter="url(#wallShadow)"
            />

            {/* Clean corridor walkways */}
            <polygon
              points="150,80 850,80 890,520 620,520 600,500 200,500 150,380"
              fill="#ffffff"
            />
          </g>

          {/* Store Unit Polygons matching Image reference */}
          <g id="stores-layer">
            {/* Top Left Store: Timepieces Gallery / e Watches */}
            <g 
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedStore(activePlan.stores.find(s => s.id === 'st-e-watches') || null)}
            >
              <polygon points="140,80 230,80 210,170 140,160" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="145" y="105" fill="#475569" fontSize="12" fontWeight="600">
                Timepieces
              </text>
            </g>

            {/* Top Center: Roger Dubuis (as in reference image) */}
            <g 
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedStore(activePlan.stores.find(s => s.id === 'st-roger-dubuis') || null)}
            >
              <polygon points="460,80 620,80 590,190 440,170" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Orange icon badge */}
              <circle cx="475" cy="115" r="14" fill="#f97316" />
              <circle cx="475" cy="115" r="5" fill="#ffffff" />
              <text x="500" y="120" fill="#1e293b" fontSize="14" fontWeight="bold">
                {currentLevel === 'L5' ? 'Din Tai Fung (#GF-8841)' : 'Roger Dubuis'}
              </text>
            </g>

            {/* Top Right: Panerai (as in reference image) */}
            <g 
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedStore(activePlan.stores.find(s => s.id === 'st-panerai') || null)}
            >
              <polygon points="650,90 790,100 810,210 670,200" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Orange icon badge */}
              <circle cx="685" cy="135" r="14" fill="#f97316" />
              <circle cx="685" cy="135" r="5" fill="#ffffff" />
              <text x="710" y="140" fill="#1e293b" fontSize="14" fontWeight="bold">
                {currentLevel === 'L5' ? 'Shake Shack' : 'Panerai'}
              </text>
            </g>

            {/* Mid Left: Michael Kors (as in reference image) */}
            <g 
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedStore(activePlan.stores.find(s => s.id === 'st-michael-kors') || null)}
            >
              <polygon points="210,180 370,180 340,300 200,280" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Orange icon badge */}
              <circle cx="235" cy="225" r="14" fill="#f97316" />
              <circle cx="235" cy="225" r="5" fill="#ffffff" />
              <text x="260" y="230" fill="#1e293b" fontSize="14" fontWeight="bold">
                {currentLevel === 'L5' ? 'Tim Ho Wan' : 'Michael Kors'}
              </text>
            </g>

            {/* Mid Center: Brunello Cucinelli (as in reference image) */}
            <g 
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedStore(activePlan.stores.find(s => s.id === 'st-brunello') || null)}
            >
              <polygon points="360,290 530,280 500,410 330,400" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Orange icon badge */}
              <circle cx="365" cy="345" r="14" fill="#f97316" />
              <circle cx="365" cy="345" r="5" fill="#ffffff" />
              <text x="390" y="350" fill="#1e293b" fontSize="14" fontWeight="bold">
                {currentLevel === 'L5' ? 'TWG Tea' : 'Brunello Cucinelli'}
              </text>
            </g>

            {/* Bottom Right: Cartier (as in reference image) */}
            <g 
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedStore(activePlan.stores.find(s => s.id === 'st-cartier') || null)}
            >
              <polygon points="700,340 850,330 820,490 680,480" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Orange icon badge */}
              <circle cx="725" cy="415" r="14" fill="#f97316" />
              <circle cx="725" cy="415" r="5" fill="#ffffff" />
              <text x="750" y="420" fill="#1e293b" fontSize="14" fontWeight="bold">
                {currentLevel === 'L5' ? 'Beauty in The Pot' : 'Cartier'}
              </text>
            </g>

            {/* Target Store Highlight for L5 Destination */}
            {currentLevel === 'L5' && (
              <g>
                <polygon 
                  points="460,80 620,80 590,190 440,170" 
                  fill="#fef3c7" 
                  stroke="#f59e0b" 
                  strokeWidth="3" 
                />
                <circle cx="475" cy="115" r="14" fill="#f59e0b" />
                <circle cx="475" cy="115" r="6" fill="#ffffff" />
                <text x="500" y="115" fill="#92400e" fontSize="14" fontWeight="900">
                  Din Tai Fung (Order #{orderNumber})
                </text>
                <text x="500" y="135" fill="#b45309" fontSize="11" fontWeight="bold">
                  ★ Active Delivery Pickup Counter
                </text>
              </g>
            )}
          </g>

          {/* Access Node 1: Circular Elevator (As shown in reference image) */}
          <g 
            id="elevator-node" 
            className="cursor-pointer"
            onClick={() => setSelectedNode(activePlan.accessNodes.find(n => n.type === 'elevator') || null)}
          >
            {/* Grey circular elevator well with 3D gradient/shadow */}
            <circle cx="150" cy="270" r="40" fill="#94a3b8" stroke="#64748b" strokeWidth="3" />
            <circle cx="150" cy="270" r="34" fill="#cbd5e1" />
            <circle cx="150" cy="270" r="28" fill="#94a3b8" opacity="0.4" />
            <text x="150" y="275" fill="#1e293b" fontSize="13" fontWeight="bold" textAnchor="middle">
              Elevator
            </text>
          </g>

          {/* Access Node 2: Blue Escalator Void & Steps (As shown in reference image) */}
          <g 
            id="escalator-node" 
            className="cursor-pointer"
            onClick={() => {
              if (activePlan.guidanceCallout?.targetLevel) {
                handleSelectLevel(activePlan.guidanceCallout.targetLevel);
              }
            }}
          >
            {/* Light blue escalator well container */}
            <polygon 
              points="580,290 625,275 585,420 540,435" 
              fill="#bfdbfe" 
              stroke="#60a5fa" 
              strokeWidth="2" 
            />

            {/* Blue Escalator Badge with steps icon */}
            <circle cx="560" cy="350" r="13" fill="#0284c7" />
            {/* Escalator step icon inside circle */}
            <path d="M555 354 L559 354 L562 348 L566 348" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            
            <text x="585" y="355" fill="#0369a1" fontSize="13" fontWeight="bold">
              Escalator
            </text>
          </g>

          {/* Walking Path: Bold Green Dotted Trail (Matching reference image) */}
          {activePlan.walkingPath && (
            <g id="dotted-walking-path">
              {/* Path coordinates transformed to SVG canvas space */}
              {currentLevel === 'L4' ? (
                <>
                  <path
                    d="M 920,290 L 780,260 L 640,240 L 590,320"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray="4 9"
                  />
                  {/* Ending pulse dot at escalator */}
                  <circle cx="590" cy="320" r="6" fill="#047857" />
                  <circle cx="590" cy="320" r="10" fill="#047857" opacity="0.3" className="animate-ping" />
                </>
              ) : currentLevel === 'L5' ? (
                <>
                  <path
                    d="M 590,320 L 580,220 L 520,160"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray="4 9"
                  />
                  <circle cx="520" cy="160" r="7" fill="#f59e0b" />
                </>
              ) : (
                <path
                  d="M 750,450 L 620,400 L 570,350"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray="4 9"
                />
              )}
            </g>
          )}

          {/* Green Floating Guidance Callout Bubble (Matching reference image: "Go up to L5 >") */}
          {activePlan.guidanceCallout && (
            <g 
              id="guidance-callout-pill"
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={() => handleSelectLevel(activePlan.guidanceCallout?.targetLevel || 'L5')}
              filter="url(#calloutShadow)"
            >
              {currentLevel === 'L4' ? (
                <g transform="translate(300, 195)">
                  {/* Speech bubble rounded pill */}
                  <rect 
                    x="0" 
                    y="0" 
                    width="265" 
                    height="62" 
                    rx="31" 
                    fill="#047857" 
                  />
                  {/* Pointer arrow pointing down to escalator */}
                  <polygon points="235,62 250,76 245,62" fill="#047857" />

                  {/* Left Escalator Circle Icon */}
                  <circle cx="34" cy="31" r="19" fill="#065f46" stroke="#10b981" strokeWidth="2" />
                  {/* Arrow up-right / escalator step */}
                  <path 
                    d="M27 36 L31 36 L36 27 L41 27" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M37 25 L43 25 L43 31" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />

                  {/* Text: "Go up to L5 >" */}
                  <text x="68" y="38" fill="#ffffff" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
                    Go up to L5
                  </text>
                  <text x="215" y="38" fill="#ffffff" fontSize="20" fontWeight="bold" fontFamily="sans-serif">
                    ›
                  </text>
                </g>
              ) : currentLevel === 'L5' ? (
                <g transform="translate(420, 35)">
                  <rect x="0" y="0" width="280" height="56" rx="28" fill="#b45309" />
                  <polygon points="120,56 130,68 140,56" fill="#b45309" />
                  <circle cx="30" cy="28" r="16" fill="#78350f" />
                  <text x="23" y="33" fill="#ffffff" fontSize="14">🛍️</text>
                  <text x="58" y="34" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                    Pick up at Counter ›
                  </text>
                </g>
              ) : (
                <g transform="translate(350, 210)">
                  <rect x="0" y="0" width="240" height="54" rx="27" fill="#047857" />
                  <polygon points="210,54 220,66 215,54" fill="#047857" />
                  <circle cx="28" cy="27" r="16" fill="#065f46" />
                  <text x="54" y="33" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                    {activePlan.guidanceCallout.text}
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Floating Vertical Level Selector Pill Bar (Right side, matching visual reference) */}
      <div 
        id="vertical-level-selector"
        className="absolute top-20 right-4 z-40 bg-white/95 backdrop-blur-md rounded-full border border-[#cbd5e1] shadow-2xl py-2 px-1 flex flex-col items-center gap-1 select-none pointer-events-auto w-12"
      >
        {/* Up Caret */}
        <button
          onClick={() => handleLevelStep('up')}
          className="w-8 h-7 text-slate-400 hover:text-slate-900 flex items-center justify-center active:scale-90 transition-transform"
          title="Level Up"
        >
          <ChevronUp className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* List of Floor Levels (L7 down to B1) */}
        <div className="flex flex-col gap-1 items-center py-1">
          {AVAILABLE_FLOOR_LEVELS.map((lvl) => {
            const isActive = currentLevel === lvl;
            const isTarget = targetLevel === lvl;

            return (
              <button
                key={lvl}
                id={`floor-btn-${lvl}`}
                onClick={() => handleSelectLevel(lvl)}
                className={`relative w-9 h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-400/40'
                    : isTarget
                    ? 'bg-amber-100 text-amber-900 border border-amber-400 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{lvl}</span>
                {/* Target Level indicator pulse */}
                {isTarget && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Down Caret */}
        <button
          onClick={() => handleLevelStep('down')}
          className="w-8 h-7 text-slate-400 hover:text-slate-900 flex items-center justify-center active:scale-90 transition-transform"
          title="Level Down"
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Selected Store / Transit Node Inspector Drawer */}
      {selectedStore && (
        <div 
          id="store-detail-card"
          className="absolute bottom-4 left-4 right-18 z-40 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedStore.name}</h4>
                <p className="text-xs text-slate-500 font-mono">Unit {selectedStore.unitCode} • Level {currentLevel}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedStore(null)}
              className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedStore.orderInfo ? (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{selectedStore.orderInfo}</span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-600">
              Authorized pedestrian courier delivery access verified via escalators & cargo lift.
            </div>
          )}
        </div>
      )}

      {/* Selected Node (Elevator/Escalator) Details */}
      {selectedNode && (
        <div 
          id="node-detail-card"
          className="absolute bottom-4 left-4 right-18 z-40 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xl max-w-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedNode.label}</h4>
                <p className="text-xs text-emerald-600 font-semibold">✓ Courier Approved Lift/Escalator</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="w-6 h-6 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {selectedNode.actionText} • Connects directly to Level {selectedNode.targetLevel || '5'} without fire stairs or restricted corridors.
          </p>
        </div>
      )}

      {/* Bottom Delivery Prompt Bar */}
      <div className="absolute bottom-3 left-3 right-20 z-20 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Footprints className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">
              {currentLevel === targetLevel ? (
                <strong className="text-amber-300">You are on the Pickup Floor ({currentLevel})</strong>
              ) : (
                <>Follow green trail to <strong>Escalator</strong> to reach <strong>Level {targetLevel}</strong></>
              )}
            </span>
          </div>

          <button
            onClick={() => handleSelectLevel(targetLevel)}
            className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold whitespace-nowrap transition-colors flex items-center gap-1 shadow"
          >
            <span>Jump to {targetLevel}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
