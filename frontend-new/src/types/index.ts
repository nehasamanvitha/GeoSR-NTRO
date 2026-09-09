export type NavTab = 'OVERVIEW' | 'WORKSPACE' | 'MODELS' | 'ANALYSIS';

export interface HealthResponse {
  status: string;
  demo_mode: boolean;
  version: string;
  timestamp: string;
}

export interface SystemConfig {
  project_name: string;
  demo_mode: boolean;
  backbone: string;
  trust_layer: string;
  trainable_params: number;
  hard_constraint: string;
  resolution_in_m: number;
  resolution_out_m: number;
  scale_factor: number;
}

export interface SceneMetadata {
  scene_id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [lat, lon]
  bbox: [number, number, number, number]; // [min_lon, min_lat, max_lon, max_lat]
  sensor: string;
  bands: string[];
  input_resolution: string;
  output_resolution: string;
  scale_factor: string;
  acquisition_date: string;
  cloud_cover_percentage: number;
  description: string;
}

export interface MethodMetrics {
  PSNR: number;
  SAM: number;
  SSIM: number;
  MAE: number;
  Consistency: number;
}

export interface ValidationMetrics {
  evaluation_scope: string;
  total_patches?: number;
  methods: Record<string, MethodMetrics>;
  delta_vs_mamba_hc: Record<string, number>;
}

export interface InferenceRequest {
  scene_id: string;
  enable_hard_constraint?: boolean;
  enable_uncertainty?: boolean;
  enable_spectral_indices?: boolean;
}

export interface InferenceResponse {
  job_id: string;
  scene_id: string;
  demo_mode: boolean;
  status: string;
  execution_time_seconds: number;
  metadata: SceneMetadata;
  metrics: ValidationMetrics;
  available_layers: string[];
  telemetry_logs: string[];
}

export interface PixelInspectionRequest {
  scene_id: string;
  lat: number;
  lon: number;
}

export interface PixelInspectionResponse {
  scene_id: string;
  lat: number;
  lon: number;
  reflectance_10m: {
    B04_Red: number;
    B03_Green: number;
    B02_Blue: number;
    B08_NIR: number;
  };
  reflectance_2_5m: {
    B04_Red: number;
    B03_Green: number;
    B02_Blue: number;
    B08_NIR: number;
  };
  ndvi: number;
  ndwi: number;
  uncertainty_proxy: number;
  vegetation_class: string;
  water_class: string;
  downstream_feature: string;
}

export interface ActiveLayersState {
  obs10m: boolean;
  geosr25m: boolean;
  confidence: boolean;
  ndvi: boolean;
  ndwi: boolean;
  segmentation: boolean;
}
