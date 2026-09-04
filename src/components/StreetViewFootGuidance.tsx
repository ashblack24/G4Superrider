import React, { useState } from 'react';
import { 
  FootDeliveryGuide, 
  RouteStop, 
  MotorcycleParking 
} from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  ArrowLeft, 
  Navigation, 
  Layers, 
  Maximize2, 
  ExternalLink,
  Footprints,
  FileCheck2,
  Box,
  Building2,
  XCircle,
  Eye
} from 'lucide-react';

interface StreetViewFootGuidanceProps {
  guide: FootDeliveryGuide;
  stop: RouteStop;
  parkingSpot?: MotorcycleParking;
  onClose: () => void;
  onCompleteDelivery: () => void;
}

export const StreetViewFootGuidance: React.FC<StreetViewFootGuidanceProps> = ({
  guide,
  stop,
  parkingSpot,
  onClose,
  onCompleteDelivery,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [viewAngle, setViewAngle] = useState<'3d_drone' | 'street_pano' | 'isometric_building'>('3d_drone');
  const [checklist, setChecklist] = useState({
    parkedInLegalBay: false,
    avoidedFireExits: true,
    stayedInCourierPath: true,
    usedAccessibleRamp: false,
    securityCheckedIn: false,
  });

  const allPassedGuardrails = 
    checklist.parkedInLegalBay && 
    checklist.avoidedFireExits && 
    checklist.stayedInCourierPath && 
    checklist.securityCheckedIn;

  // Real coordinate links for Google Maps / Street View
  const lat = guide.coords[0];
  const lng = guide.coords[1];
  const googleStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&heading=-45&pitch=10&fov=80`;
  const googleDirectionsWalkUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;

  return (
    <div id="street-view-foot-guidance-modal" className="fixed inset-0 z-50 bg-[#040505]/95 backdrop-blur-xl flex flex-col overflow-hidden text-[#F8F8F8]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/70">
        <div className="flex items-center gap-3">
          <button
            id="close-foot-guidance-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[#F39444] border border-[#F39444]/40 text-[10px] font-bold font-mono">
                ON-FOOT 3D GUIDANCE
              </span>
              <span className="text-xs text-zinc-400 font-mono">Walk ETA: {guide.walkTimeMins} min</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">
              {guide.buildingName}
            </h2>
          </div>
        </div>

        {/* External Google Street View Link */}
        <a
          href={googleStreetViewUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
        >
          <span>Open in Google 3D</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#F39444]" />
        </a>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto space-y-5 pb-24">
        
        {/* STRICT COMPLIANCE & SAFETY GUARDRAIL BANNER */}
        <div id="strict-guardrail-banner" className="p-4 rounded-2xl bg-zinc-900/90 border-2 border-red-500/50 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>Strict Safety & Building Guardrails Enforced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
            <div className="flex items-start gap-2 p-2 rounded-xl bg-red-950/20 border border-red-900/40">
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-red-300 block">NO Fire Exits / Emergency Stairs:</strong>
                Never use fire exit doors or stairwells. Alarms will trigger building lockdowns.
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-red-950/20 border border-red-900/40">
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-red-300 block">NO Restricted Zones / Trespassing:</strong>
                Stay strictly inside designated courier hallways. Do not enter tenant plant rooms.
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-red-950/20 border border-red-900/40">
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-red-300 block">NO Illegal Parking:</strong>
                Park strictly in designated motorcycle lots. Red kerbs & fire engine hardstandings are strictly monitored.
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-emerald-300 block">Trolley & Lift Access Enabled:</strong>
                Zero-step ramp access verified. Use authorized freight/courier elevator banks.
              </div>
            </div>
          </div>
        </div>

        {/* 3D Visual Perspective Canvas / Street View Emulation */}
        <div id="interactive-3d-stage" className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-900 to-black shadow-2xl flex flex-col justify-between p-4">
          
          {/* Top Stage Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setViewAngle('3d_drone')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  viewAngle === '3d_drone' ? 'bg-[#F39444] text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                3D Entrance
              </button>
              <button
                onClick={() => setViewAngle('isometric_building')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  viewAngle === 'isometric_building' ? 'bg-[#F39444] text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ramp & Lift Core
              </button>
              <button
                onClick={() => setViewAngle('street_pano')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  viewAngle === 'street_pano' ? 'bg-[#F39444] text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Street Level
              </button>
            </div>

            <span className="text-[11px] font-mono bg-black/70 px-2 py-1 rounded-md text-[#F39444] border border-[#F39444]/30 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>3D Pedestrian Perspective</span>
            </span>
          </div>

          {/* SVG 3D Isometric / Street Perspective Graphics */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {viewAngle === '3d_drone' && (
              <svg className="w-full h-full opacity-80" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice">
                {/* Simulated 3D Building Exterior & Pedestrian Ramp */}
                <defs>
                  <linearGradient id="wallGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="rampGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {/* Ground grid */}
                <path d="M0 240 L300 160 L600 240 L300 290 Z" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
                {/* Building Tower Block */}
                <polygon points="180,180 180,40 320,10 320,150" fill="url(#wallGrad)" stroke="#334155" />
                <polygon points="320,10 420,50 420,180 320,150" fill="#0b0f19" stroke="#334155" />
                {/* Entrance Canopy */}
                <polygon points="190,170 310,140 310,150 190,180" fill="#F39444" opacity="0.9" />
                {/* Designated Walking Path with Green Ramp */}
                <path d="M 60,260 Q 180,240 250,180" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeDasharray="8 6" />
                {/* Forbidden Red Zone marker on Fire Stairwell */}
                <polygon points="380,170 410,180 410,130 380,120" fill="#ef4444" opacity="0.2" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                <text x="395" y="145" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">FIRE EXIT (NO ENTRY)</text>
                {/* Green Courier Ramp Marker */}
                <circle cx="250" cy="180" r="10" fill="#10b981" />
                <text x="250" y="205" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">Courier Ramp Entrance</text>
                {/* Rider Motorcycle Staging Lot */}
                <rect x="40" y="245" width="40" height="25" rx="4" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
                <text x="60" y="261" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">MOTO LOT</text>
              </svg>
            )}

            {viewAngle === 'isometric_building' && (
              <svg className="w-full h-full opacity-80" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice">
                {/* Lift Lobby Core & Trolley Way */}
                <rect x="120" y="50" width="360" height="190" rx="16" fill="#111827" stroke="#374151" strokeWidth="2" />
                {/* Lift Bank B */}
                <rect x="160" y="80" width="100" height="110" rx="8" fill="#1f2937" stroke="#10b981" strokeWidth="2" />
                <text x="210" y="105" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">CARGO LIFT B</text>
                <text x="210" y="125" fill="#9ca3af" fontSize="9" textAnchor="middle">Trolley Approved</text>
                <text x="210" y="140" fill="#9ca3af" fontSize="9" textAnchor="middle">Floors 1 - 35</text>
                {/* Security Counter */}
                <rect x="330" y="80" width="110" height="60" rx="8" fill="#1f2937" stroke="#F39444" strokeWidth="1.5" />
                <text x="385" y="105" fill="#F39444" fontSize="11" fontWeight="bold" textAnchor="middle">SECURITY DESK</text>
                <text x="385" y="122" fill="#d1d5db" fontSize="9" textAnchor="middle">Badge Check-in</text>
                {/* Step-Free Ramp Arrow */}
                <path d="M 385,210 L 385,155 L 265,155 L 265,135" fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 4" />
                <text x="385" y="230" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">Step-Free Ramp Route</text>
              </svg>
            )}

            {viewAngle === 'street_pano' && (
              <div className="text-center p-6 bg-black/70 backdrop-blur-md rounded-2xl border border-zinc-800 max-w-sm">
                <Building2 className="w-10 h-10 text-[#F39444] mx-auto mb-2" />
                <h4 className="font-bold text-white text-sm">Real-World Google Street View</h4>
                <p className="text-zinc-400 text-xs mt-1 mb-3">
                  Delivering to {guide.buildingName} at ({lat.toFixed(4)}, {lng.toFixed(4)}).
                </p>
                <a
                  href={googleDirectionsWalkUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F39444] text-[#040505] text-xs font-bold"
                >
                  Launch 360° Walk Navigation <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Bottom Stage Pill */}
          <div className="z-10 flex items-center justify-between text-xs text-zinc-300 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono font-medium">Trolley & Lift Access Verified</span>
            </div>
            <span className="text-[#F39444] font-semibold">{stop.title} • {stop.address.split(',')[1] || stop.address}</span>
          </div>
        </div>

        {/* Step-by-Step Designated Walking Paths */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Footprints className="w-4 h-4 text-[#F39444]" />
              Designated Step-by-Step Walking Sequence
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              Step {currentStep + 1} of {guide.designatedWalkingPath.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {guide.designatedWalkingPath.map((stepText, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  currentStep === idx
                    ? 'bg-[#F39444]/10 border-[#F39444] text-white shadow-lg'
                    : idx < currentStep
                    ? 'bg-zinc-950/40 border-emerald-500/40 text-zinc-300'
                    : 'bg-zinc-950/30 border-zinc-800 text-zinc-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5 ${
                    currentStep === idx
                      ? 'bg-[#F39444] text-black font-black'
                      : idx < currentStep
                      ? 'bg-emerald-500 text-black'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <div className="text-xs leading-relaxed flex-1">
                  {stepText}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Details: Trolley Ramp & Lift Core */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Box className="w-4 h-4 text-emerald-400" />
              <span>Trolley & Heavy Parcel Ramp</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {guide.trolleyRampLocation}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F39444]">
              <Layers className="w-4 h-4 text-[#F39444]" />
              <span>Lift Lobby & Service Core</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {guide.liftLobbyAccess}
            </p>
          </div>
        </div>

        {/* Rider Compliance Verification Checklist */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Mandatory Rider Compliance Checklist
          </h4>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={checklist.parkedInLegalBay}
                onChange={(e) => setChecklist({ ...checklist, parkedInLegalBay: e.target.checked })}
                className="w-4 h-4 rounded text-[#F39444] focus:ring-0 accent-[#F39444]"
              />
              <span className="text-zinc-200">
                Parked in authorized motorcycle lot ({parkingSpot ? parkingSpot.name : 'Legal Loading Bay'})
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={checklist.securityCheckedIn}
                onChange={(e) => setChecklist({ ...checklist, securityCheckedIn: e.target.checked })}
                className="w-4 h-4 rounded text-[#F39444] focus:ring-0 accent-[#F39444]"
              />
              <span className="text-zinc-200">
                Security registration completed / Badge acquired (Security procedure verified)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-800/50">
              <input
                type="checkbox"
                checked={checklist.avoidedFireExits}
                onChange={(e) => setChecklist({ ...checklist, avoidedFireExits: e.target.checked })}
                className="w-4 h-4 rounded text-[#F39444] focus:ring-0 accent-[#F39444]"
              />
              <span className="text-zinc-200">
                Confirmed: Did NOT open emergency fire exits or trespass into restricted tenant areas
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
          >
            Back to Bike Cockpit
          </button>

          <button
            id="mark-delivery-completed-btn"
            onClick={onCompleteDelivery}
            disabled={!allPassedGuardrails}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
              allPassedGuardrails
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {allPassedGuardrails ? 'Confirm & Mark Delivery Completed' : 'Complete Safety Checklist First'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
