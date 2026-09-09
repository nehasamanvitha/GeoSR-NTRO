import React from 'react';
import { ActiveLayersState } from '../types';
import { Layers, Eye, EyeOff, Sparkles, Shield, TreePine, Droplets, Building2 } from 'lucide-react';

interface LayerControlsProps {
  activeLayers: ActiveLayersState;
  setActiveLayers: React.Dispatch<React.SetStateAction<ActiveLayersState>>;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  activeLayers,
  setActiveLayers,
}) => {
  const layerDefs: {
    key: keyof ActiveLayersState;
    label: string;
    sublabel: string;
    color: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      key: 'obs10m',
      label: '10 m Observation',
      sublabel: 'Sentinel-2 L2A Input',
      color: 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10',
      icon: Layers,
    },
    {
      key: 'geosr25m',
      label: '2.5 m GeoSR Output',
      sublabel: 'AI 4× Super-Resolution',
      color: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
      icon: Sparkles,
    },
    {
      key: 'confidence',
      label: 'Uncertainty Map',
      sublabel: 'Model Confidence Proxy',
      color: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
      icon: Shield,
    },
    {
      key: 'ndvi',
      label: 'NDVI Vegetation',
      sublabel: 'Normalized Diff Veg Index',
      color: 'border-green-500/30 text-green-300 bg-green-500/10',
      icon: TreePine,
    },
    {
      key: 'ndwi',
      label: 'NDWI Water Index',
      sublabel: 'Normalized Diff Water Index',
      color: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
      icon: Droplets,
    },
    {
      key: 'segmentation',
      label: 'Infrastructure',
      sublabel: 'Roads & Buildings Mask',
      color: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
      icon: Building2,
    },
  ];

  const toggleLayer = (key: keyof ActiveLayersState) => {
    setActiveLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="bg-[#0b0f17]/95 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md w-72 select-none">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Layer Stack
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {activeCount} active
        </span>
      </div>

      <div className="space-y-1.5">
        {layerDefs.map((layer) => {
          const isActive = activeLayers[layer.key];
          const Icon = layer.icon;
          return (
            <button
              key={layer.key}
              onClick={() => toggleLayer(layer.key)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-left transition-all ${
                isActive
                  ? `${layer.color} shadow-sm`
                  : 'border-slate-800/50 bg-slate-900/40 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'text-slate-500'}`} />
                <div className="truncate">
                  <p className="text-xs font-medium truncate">{layer.label}</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{layer.sublabel}</p>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                {isActive ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
