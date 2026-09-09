import React from 'react';
import { NavTab } from '../types';
import { Layers, Activity, Cpu, Sparkles, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isBackendOnline: boolean;
  mouseCoords: { lat: number; lon: number } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendOnline,
  mouseCoords,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: Sparkles },
    { id: 'WORKSPACE', label: 'Interactive Map Workspace', icon: Layers },
    { id: 'MODELS', label: 'Model Benchmarks', icon: Cpu },
    { id: 'ANALYSIS', label: 'Spectral Analytics', icon: Activity },
  ];

  return (
    <header className="h-14 bg-[#0b0f17] border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-40 relative">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-sm">
          <svg className="w-5 h-5 stroke-emerald-400" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" />
            <circle cx="12" cy="12" r="5" stroke="currentColor" />
            <path d="M12 7V3M12 21V17M7 12H3M21 12H17" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-slate-100">GeoSR-NTRO</span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              2.5m (4× SR)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
            SIH 2026 • NTRO PS 26142
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#111723] p-1 rounded-lg border border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Side: Coordinates Readout & System Status */}
      <div className="flex items-center gap-3">
        {/* Lat/Lon Readout Badge */}
        {mouseCoords ? (
          <div className="hidden lg:flex items-center gap-1.5 bg-[#111723] border border-slate-800/80 px-2.5 py-1 rounded-md text-xs font-mono text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {mouseCoords.lat.toFixed(5)}°, {mouseCoords.lon.toFixed(5)}°
            </span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 bg-[#111723] border border-slate-800/80 px-2.5 py-1 rounded-md text-xs font-mono text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Hover map for coords</span>
          </div>
        )}

        {/* Backend Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border ${
            isBackendOnline
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
          title={isBackendOnline ? 'FastAPI Backend Online' : 'Backend Disconnected'}
        >
          {isBackendOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-semibold">API ONLINE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline font-semibold">API OFFLINE</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
