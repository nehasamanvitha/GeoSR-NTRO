import React, { useState } from 'react';
import { SceneMetadata, InferenceResponse } from '../types';
import { api } from '../services/api';
import { Play, X, CheckCircle2, AlertTriangle, Cpu, Terminal, Clock, Sparkles } from 'lucide-react';

interface InferenceModalProps {
  scene: SceneMetadata;
  isOpen: boolean;
  onClose: () => void;
  onInferenceComplete?: (result: InferenceResponse) => void;
}

export const InferenceModal: React.FC<InferenceModalProps> = ({
  scene,
  isOpen,
  onClose,
  onInferenceComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [enableHardConstraint, setEnableHardConstraint] = useState(true);

  if (!isOpen) return null;

  const handleRunInference = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.runInference(scene.scene_id, enableHardConstraint);
      if (response.status === 'COMPLETED' || response.status === 'SUCCESS' || response.job_id) {
        setResult(response);
        if (onInferenceComplete) {
          onInferenceComplete(response);
        }
      } else {
        throw new Error(`Inference returned unexpected status: ${response.status}`);
      }
    } catch (err) {
      console.error('Inference failed:', err);
      setError(err instanceof Error ? err.message : 'Inference execution request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-slate-100">
                Run AI 4× Super-Resolution
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Target Scene: {scene.name} ({scene.scene_id})
              </p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Configurations & Info */}
        {!result && !loading && !error && (
          <div className="space-y-4">
            <div className="bg-[#111723] p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Input Resolution:</span>
                <span className="text-indigo-400 font-bold">10 m (Sentinel-2 L2A)</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Target Output Resolution:</span>
                <span className="text-emerald-400 font-bold">2.5 m (4× Super-Resolution)</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Deep Learning Model:</span>
                <span className="text-slate-200">GeoSR-NTRO (Mamba + Hard Constraint)</span>
              </div>
            </div>

            {/* Toggle Hard Constraint */}
            <label className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={enableHardConstraint}
                onChange={(e) => setEnableHardConstraint(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">
                  Enable Physical Hard Constraint Adapter
                </span>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  Enforces strict downsampling equivalence to original 10m Sentinel-2 observations, ensuring zero ungrounded detail generation.
                </span>
              </div>
            </label>

            <button
              onClick={handleRunInference}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Execute GeoSR 4× Pipeline</span>
            </button>
          </div>
        )}

        {/* Pending / Running State */}
        {loading && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-12 h-12">
              <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
              <Cpu className="w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-200">Executing Deep Learning Inference</p>
              <p className="text-xs font-mono text-slate-400">Passing tensors through SEN2SR Mamba backbone...</p>
            </div>
          </div>
        )}

        {/* Failure State - VISIBLY SHOW FAILURE */}
        {error && !loading && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-950/50 border border-rose-500/40 rounded-xl space-y-2 text-rose-200">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Inference Failed</span>
              </div>
              <p className="text-xs font-mono text-rose-300">{error}</p>
            </div>
            <button
              onClick={handleRunInference}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Retry Inference Execution
            </button>
          </div>
        )}

        {/* Real Success Output State */}
        {result && !loading && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Super-Resolution Complete</span>
                </div>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {result.execution_time_seconds.toFixed(2)}s
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                <div className="bg-[#111723] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">JOB ID</span>
                  <span className="text-slate-200 font-bold text-[11px] truncate block">{result.job_id}</span>
                </div>
                <div className="bg-[#111723] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">PSNR SCORE</span>
                  <span className="text-emerald-400 font-bold">{result.metrics.methods['GeoSR-NTRO']?.PSNR.toFixed(2)} dB</span>
                </div>
                <div className="bg-[#111723] p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SSIM SCORE</span>
                  <span className="text-emerald-400 font-bold">{result.metrics.methods['GeoSR-NTRO']?.SSIM.toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* Telemetry Logs */}
            {result.telemetry_logs && result.telemetry_logs.length > 0 && (
              <div className="bg-[#070a0f] border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Execution Telemetry Logs</span>
                </div>
                <div className="bg-[#0b0f17] p-2.5 rounded-lg border border-slate-900 font-mono text-[11px] text-slate-300 space-y-1 max-h-32 overflow-y-auto">
                  {result.telemetry_logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-600 select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              View Output Layers on Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
