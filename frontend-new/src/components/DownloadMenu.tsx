import React, { useState } from 'react';
import { SceneMetadata } from '../types';
import { api } from '../services/api';
import { Download, FileImage, FileCode, Shield } from 'lucide-react';

interface DownloadMenuProps {
  scene: SceneMetadata;
}

export const DownloadMenu: React.FC<DownloadMenuProps> = ({ scene }) => {
  const [isOpen, setIsOpen] = useState(false);

  const downloads = [
    {
      type: 'geotiff' as const,
      label: '2.5 m GeoTIFF Raster',
      sub: '4-Band (RGB + NIR) GeoTIFF Image',
      icon: FileImage,
      color: 'text-emerald-400',
    },
    {
      type: 'uncertainty' as const,
      label: 'Uncertainty Map (PNG)',
      sub: 'Model Confidence Heatmap Overlay',
      icon: Shield,
      color: 'text-amber-400',
    },
    {
      type: 'metadata' as const,
      label: 'Scene Metadata & Metrics (JSON)',
      sub: 'Full Sensor Specs & Benchmarks',
      icon: FileCode,
      color: 'text-indigo-400',
    },
  ];

  return (
    <div className="relative select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#0b0f17]/90 hover:bg-[#111723] border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 backdrop-blur-md shadow-xl transition-all"
      >
        <Download className="w-4 h-4 text-emerald-400" />
        <span>Export Products</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-12 z-40 bg-[#0b0f17] border border-slate-800 rounded-xl p-2 shadow-2xl backdrop-blur-md w-72 space-y-1">
            <div className="px-2 py-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Download Output Artifacts
            </div>

            {downloads.map((item) => {
              const Icon = item.icon;
              const downloadUrl = api.getDownloadUrl(scene.scene_id, item.type);
              return (
                <a
                  key={item.type}
                  href={downloadUrl}
                  download
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left group border border-transparent hover:border-slate-700/50"
                >
                  <Icon className={`w-4 h-4 ${item.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">{item.sub}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
