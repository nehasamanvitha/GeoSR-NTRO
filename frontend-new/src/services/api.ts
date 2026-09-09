import {
  HealthResponse,
  SystemConfig,
  SceneMetadata,
  ValidationMetrics,
  InferenceResponse,
  PixelInspectionResponse,
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function checkOk(res: Response): Promise<void> {
  if (res.ok) return;

  let errorDetail = '';
  try {
    const data = await res.json();
    if (data?.detail) {
      errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
  } catch {
    // Non-JSON error body
  }

  throw new Error(`API Error (${res.status}): ${errorDetail || res.statusText || 'Request failed'}`);
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    await checkOk(res);
    return res.json();
  },

  async getConfig(): Promise<SystemConfig> {
    const res = await fetch(`${API_BASE}/config`);
    await checkOk(res);
    return res.json();
  },

  async getDemoScenes(): Promise<SceneMetadata[]> {
    const res = await fetch(`${API_BASE}/demo/scenes`);
    await checkOk(res);
    return res.json();
  },

  async getSceneMetadata(sceneId: string): Promise<SceneMetadata> {
    const res = await fetch(`${API_BASE}/demo/scene/${sceneId}`);
    await checkOk(res);
    return res.json();
  },

  async getMetrics(sceneId: string): Promise<ValidationMetrics> {
    const res = await fetch(`${API_BASE}/metrics/${sceneId}`);
    await checkOk(res);
    return res.json();
  },

  async runInference(sceneId: string, enableHardConstraint = true): Promise<InferenceResponse> {
    const res = await fetch(`${API_BASE}/inference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scene_id: sceneId,
        enable_hard_constraint: enableHardConstraint,
        enable_uncertainty: true,
        enable_spectral_indices: true,
      }),
    });
    await checkOk(res);
    return res.json();
  },

  async inspectPixel(sceneId: string, lat: number, lon: number): Promise<PixelInspectionResponse> {
    const res = await fetch(`${API_BASE}/analytics/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scene_id: sceneId, lat, lon }),
    });
    await checkOk(res);
    return res.json();
  },

  getLayerTileUrl(sceneId: string, layer: string): string {
    return `${API_BASE}/tiles/${sceneId}/${layer}`;
  },

  getDownloadUrl(sceneId: string, fileType: 'geotiff' | 'uncertainty' | 'metadata'): string {
    return `${API_BASE}/download/${sceneId}/${fileType}`;
  },
};
