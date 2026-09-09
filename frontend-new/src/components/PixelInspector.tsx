import React from 'react';
import { PixelInspectionResponse } from '../types';
import { X, Search, Shield, TreePine, Droplets, MapPin, Building2 } from 'lucide-react';

interface PixelInspectorProps {
  data: PixelInspectionResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export const PixelInspector: React.FC<PixelInspectorProps> = ({
  data,
  loading,
  error,
  onClose,
}) => {
  if (!data && !loading && !error) return null;

  return (
    <div className="bg-[#0b0f17]/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md w-80 select-none text-slate-100 flex flex-col max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Pixel Inspection
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Sampling raster reflectance...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-mono">
          <p className="font-semibold mb-1">Inspection Failed</p>
          <p className="text-[11px] text-rose-400">{error}</p>
        </div>
      )}

      {/* Content */}
      {data && !loading && (
        <div className="space-y-4 text-xs font-mono">
          {/* Coordinates Header */}
          <div className="bg-[#111723] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="font-semibold text-slate-200">Location Coordinates</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {data.lat.toFixed(5)}°, {data.lon.toFixed(5)}°
            </span>
          </div>

          {/* Classified Feature */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-1">CLASSIFIED FEATURE</span>
            <div className="flex items-center gap-2 text-slate-100 font-sans font-semibold">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>{data.downstream_feature}</span>
            </div>
          </div>

          {/* Spectral Reflectance Comparison (10m vs 2.5m) */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
              Band Reflectance Values (0.0 – 1.0)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* 10m LR Observation */}
              <div className="bg-[#111723] p-2 rounded-lg border border-indigo-500/20">
                <p className="text-[10px] font-semibold text-indigo-300 mb-1.5 border-b border-slate-800 pb-1">
                  10 m Sentinel-2
                </p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Red:</span>
                    <span className="text-slate-200">{data.reflectance_10m.B04_Red}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Green:</span>
                    <span className="text-slate-200">{data.reflectance_10m.B03_Green}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blue:</span>
                    <span className="text-slate-200">{data.reflectance_10m.B02_Blue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">NIR:</span>
                    <span className="text-slate-200">{data.reflectance_10m.B08_NIR}</span>
                  </div>
                </div>
              </div>

              {/* 2.5m GeoSR Output */}
              <div className="bg-[#111723] p-2 rounded-lg border border-emerald-500/20">
                <p className="text-[10px] font-semibold text-emerald-300 mb-1.5 border-b border-slate-800 pb-1">
                  2.5 m GeoSR SR
                </p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Red:</span>
                    <span className="text-emerald-300 font-bold">{data.reflectance_2_5m.B04_Red}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Green:</span>
                    <span className="text-emerald-300 font-bold">{data.reflectance_2_5m.B03_Green}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blue:</span>
                    <span className="text-emerald-300 font-bold">{data.reflectance_2_5m.B02_Blue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">NIR:</span>
                    <span className="text-emerald-300 font-bold">{data.reflectance_2_5m.B08_NIR}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indices & Metrics */}
          <div className="space-y-2">
            {/* NDVI */}
            <div className="bg-[#111723] p-2.5 rounded-lg border border-green-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-green-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">NDVI Vegetation</p>
                  <p className="text-[10px] text-slate-400">{data.vegetation_class}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-400">{data.ndvi}</span>
            </div>

            {/* NDWI */}
            <div className="bg-[#111723] p-2.5 rounded-lg border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">NDWI Water Index</p>
                  <p className="text-[10px] text-slate-400">{data.water_class}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-cyan-400">{data.ndwi}</span>
            </div>

            {/* Uncertainty Proxy */}
            <div className="bg-[#111723] p-2.5 rounded-lg border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">Uncertainty Score</p>
                  <p className="text-[10px] text-slate-400">
                    {data.uncertainty_proxy < 0.2
                      ? 'High Model Confidence'
                      : data.uncertainty_proxy < 0.4
                      ? 'Moderate Confidence'
                      : 'Higher Refinement Uncertainty'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-400">{data.uncertainty_proxy}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
