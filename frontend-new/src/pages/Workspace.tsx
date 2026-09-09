import React, { useState } from 'react';
import { SceneMetadata, ActiveLayersState, PixelInspectionResponse } from '../types';
import { api } from '../services/api';
import { MapView } from '../components/MapView';
import { LayerControls } from '../components/LayerControls';
import { PixelInspector } from '../components/PixelInspector';
import { InferenceModal } from '../components/InferenceModal';
import { DownloadMenu } from '../components/DownloadMenu';
import { Play, Layers, Info } from 'lucide-react';

interface WorkspaceProps {
  scenes: SceneMetadata[];
  selectedScene: SceneMetadata;
  onSelectScene: (scene: SceneMetadata) => void;
  onHoverCoords: (coords: { lat: number; lon: number } | null) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  scenes,
  selectedScene,
  onSelectScene,
  onHoverCoords,
}) => {
  const [activeLayers, setActiveLayers] = useState<ActiveLayersState>({
    obs10m: true,
    geosr25m: true,
    confidence: false,
    ndvi: false,
    ndwi: false,
    segmentation: false,
  });

  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isInferenceOpen, setIsInferenceOpen] = useState(false);

  // Pixel inspection states
  const [pixelData, setPixelData] = useState<PixelInspectionResponse | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const handleSelectPixel = async (lat: number, lon: number) => {
    setInspectLoading(true);
    setInspectError(null);
    setPixelData(null);

    try {
      const response = await api.inspectPixel(selectedScene.scene_id, lat, lon);
      setPixelData(response);
    } catch (err) {
      console.error('Pixel inspection error:', err);
      setInspectError(err instanceof Error ? err.message : 'Pixel inspection request failed.');
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden select-none bg-[#070a0f]">
      {/* Workspace Top Toolbar */}
      <div className="h-12 bg-[#0b0f17]/90 border-b border-slate-800/80 px-4 flex items-center justify-between z-20 backdrop-blur-md">
        {/* Scene Selector */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Active Scene:</span>
            <select
              value={selectedScene.scene_id}
              onChange={(e) => {
                const sc = scenes.find((s) => s.scene_id === e.target.value);
                if (sc) {
                  onSelectScene(sc);
                  setPixelData(null);
                }
              }}
              className="bg-[#111723] text-slate-100 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold focus:outline-none focus:border-emerald-500"
            >
              {scenes.map((s) => (
                <option key={s.scene_id} value={s.scene_id}>
                  {s.name} ({s.location})
                </option>
              ))}
            </select>
          </label>

          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400 border-l border-slate-800 pl-3">
            <span>
              Sensor: <strong className="text-slate-200">{selectedScene.sensor}</strong>
            </span>
            <span>
              Acquisition: <strong className="text-slate-200">{selectedScene.acquisition_date}</strong>
            </span>
          </div>
        </div>

        {/* Workspace Actions */}
        <div className="flex items-center gap-2">
          {/* Run Inference Button */}
          <button
            onClick={() => setIsInferenceOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Run 4× Super-Res</span>
          </button>

          {/* Export Downloads Menu */}
          <DownloadMenu scene={selectedScene} />
        </div>
      </div>

      {/* Map Main Canvas */}
      <div className="flex-1 relative w-full h-full">
        <MapView
          scene={selectedScene}
          activeLayers={activeLayers}
          sliderPos={sliderPos}
          setSliderPos={setSliderPos}
          onHoverCoords={onHoverCoords}
          onSelectPixel={handleSelectPixel}
        />

        {/* Floating Layer Controls (Top Left) */}
        <div className="absolute top-4 left-4 z-20">
          <LayerControls activeLayers={activeLayers} setActiveLayers={setActiveLayers} />
        </div>

        {/* Floating Pixel Inspector Drawer (Top Right) */}
        {(pixelData || inspectLoading || inspectError) && (
          <div className="absolute top-4 right-4 z-20">
            <PixelInspector
              data={pixelData}
              loading={inspectLoading}
              error={inspectError}
              onClose={() => {
                setPixelData(null);
                setInspectError(null);
              }}
            />
          </div>
        )}

        {/* Click to Inspect Prompt Badge (Bottom Left) */}
        <div className="absolute bottom-6 left-4 z-20 pointer-events-none bg-[#0b0f17]/90 border border-slate-800 px-3 py-1.5 rounded-lg backdrop-blur-md text-[11px] font-mono text-slate-400 flex items-center gap-2 shadow-lg">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Click anywhere on the satellite image to inspect reflectance & spectral indices</span>
        </div>
      </div>

      {/* Run Inference Modal */}
      <InferenceModal
        scene={selectedScene}
        isOpen={isInferenceOpen}
        onClose={() => setIsInferenceOpen(false)}
      />
    </div>
  );
};
