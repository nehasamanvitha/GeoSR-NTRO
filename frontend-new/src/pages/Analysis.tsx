import React, { useState } from 'react';
import { SceneMetadata } from '../types';
import { api } from '../services/api';
import { Activity, TreePine, Droplets, Shield, Building2, ExternalLink } from 'lucide-react';

interface AnalysisProps {
  scene: SceneMetadata;
}

export const Analysis: React.FC<AnalysisProps> = ({ scene }) => {
  const [selectedLayer, setSelectedLayer] = useState<'ndvi' | 'ndwi' | 'confidence' | 'segmentation'>('ndvi');

  const layers = [
    {
      id: 'ndvi' as const,
      name: 'NDVI Vegetation Index',
      sub: 'Normalized Difference Vegetation Index',
      icon: TreePine,
      color: 'text-green-400 border-green-500/30 bg-green-950/20',
      formula: '(NIR - Red) / (NIR + Red)',
      useCase: 'Agriculture & Crop Health Monitoring',
      description:
        'NDVI quantifies vegetation greenness and canopy vigor by comparing Near-Infrared (NIR) reflectance against Red light absorption. At 2.5 m super-resolution, field edges, crop rows, and micro-vegetation stress are clearly resolvable.',
      legend: [
        { label: 'Dense Canopy Vigor (> 0.5)', color: 'bg-emerald-600' },
        { label: 'Moderate Crops / Grass (0.2 to 0.5)', color: 'bg-yellow-500' },
        { label: 'Bare Soil / Low Veg (0.0 to 0.2)', color: 'bg-amber-700' },
        { label: 'Water / Non-Veg (< 0.0)', color: 'bg-blue-600' },
      ],
    },
    {
      id: 'ndwi' as const,
      name: 'NDWI Water Index',
      sub: 'Normalized Difference Water Index',
      icon: Droplets,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
      formula: '(Green - NIR) / (Green + NIR)',
      useCase: 'Disaster Flood Response & Hydrology',
      description:
        'NDWI isolates surface water bodies and moisture concentration. At 2.5 m resolution, narrow canal channels, small irrigation ponds, and precise flood inundation borders become sharply defined.',
      legend: [
        { label: 'Open Water Body (> 0.25)', color: 'bg-cyan-500' },
        { label: 'Moist Soil / Wetland (0.0 to 0.25)', color: 'bg-teal-600' },
        { label: 'Dry Land Surface (< 0.0)', color: 'bg-slate-700' },
      ],
    },
    {
      id: 'confidence' as const,
      name: 'Uncertainty / Confidence Map',
      sub: 'Generative Model Trust Proxy',
      icon: Shield,
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
      formula: 'Residual Error Heatmap (0.0 to 1.0)',
      useCase: 'Scientific Interpretation & Risk Audit',
      description:
        'Highlights pixels where the deep learning model applied higher spectral refinement vs pixels with near-zero modification. Evaluators can immediately distinguish high-confidence observed structure from model-inferred detail.',
      legend: [
        { label: 'High Confidence / Low Refinement (< 0.15)', color: 'bg-slate-800' },
        { label: 'Moderate Model Refinement (0.15 to 0.35)', color: 'bg-amber-500' },
        { label: 'High Model Uncertainty (> 0.35)', color: 'bg-rose-500' },
      ],
    },
    {
      id: 'segmentation' as const,
      name: 'Infrastructure Segmentation',
      sub: 'Buildings & Transport Networks Mask',
      icon: Building2,
      color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
      formula: 'Multi-spectral Feature Extraction',
      useCase: 'Urban Mapping & Damage Assessment',
      description:
        'Downstream classification mask separating individual building structures, industrial complexes, and road transportation networks extracted from the 2.5 m super-resolved imagery.',
      legend: [
        { label: 'Building Structure', color: 'bg-purple-500' },
        { label: 'Highway / Road Network', color: 'bg-indigo-500' },
        { label: 'Open Vegetated Terrain', color: 'bg-emerald-700' },
      ],
    },
  ];

  const activeInfo = layers.find((l) => l.id === selectedLayer) || layers[0];
  const tileUrl = api.getLayerTileUrl(scene.scene_id, activeInfo.id);

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-100">Spectral Analytics & Derived Layers Explorer</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Analyzing scene: <span className="text-emerald-400 font-bold">{scene.name}</span> ({scene.scene_id})
          </p>
        </div>
      </div>

      {/* Layer Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {layers.map((l) => {
          const Icon = l.icon;
          const isSelected = selectedLayer === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setSelectedLayer(l.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isSelected
                  ? `${l.color} shadow-lg ring-1 ring-emerald-500/30`
                  : 'bg-[#0b0f17] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5 shrink-0" />
                {isSelected && <span className="text-[10px] font-mono font-bold uppercase">Viewing</span>}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{l.name}</h3>
                <p className="text-[10px] font-mono text-slate-400 truncate">{l.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Analysis Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Layer Image Render */}
        <div className="lg:col-span-2 bg-[#0b0f17] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span>2.5 m Spatial Layer Preview ({activeInfo.name})</span>
            <a
              href={tileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:underline text-[11px]"
            >
              <span>Full PNG Tile</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src={tileUrl}
              alt={activeInfo.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Colormap Legend */}
          <div className="bg-[#111723] p-3 rounded-xl border border-slate-800/80 space-y-2 font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Spectral Colormap Legend
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {activeInfo.legend.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded ${item.color} shrink-0`} />
                  <span className="text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Explanation Panel */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                USE CASE: {activeInfo.useCase}
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-2">{activeInfo.name}</h2>
              <p className="text-xs font-mono text-slate-400">{activeInfo.sub}</p>
            </div>

            <div className="bg-[#111723] p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Mathematical Formula</span>
              <span className="text-indigo-300 font-bold">{activeInfo.formula}</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">Scientific Value & SIH Context</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeInfo.description}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
            <p>Calculated dynamically from multi-band 2.5 m GeoSR raster matrix.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
