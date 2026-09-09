import React, { useCallback, useEffect, useState } from 'react';
import { NavTab, SceneMetadata, ValidationMetrics } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Overview } from './pages/Overview';
import { Workspace } from './pages/Workspace';
import { ModelComparison } from './pages/ModelComparison';
import { Analysis } from './pages/Analysis';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBanner } from './components/ErrorBanner';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('OVERVIEW');
  const [scenes, setScenes] = useState<SceneMetadata[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneMetadata | null>(null);
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number } | null>(null);

  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSelectScene = useCallback((scene: SceneMetadata) => {
    setSelectedScene(scene);
    setMetrics(null);
    void api.getMetrics(scene.scene_id)
      .then(setMetrics)
      .catch((err) => console.error('Failed to load scene metrics:', err));
  }, []);

  const initApp = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await api.getHealth();
      setIsBackendOnline(health.status === 'ONLINE');

      const availableScenes = await api.getDemoScenes();
      if (!availableScenes || availableScenes.length === 0) {
        throw new Error('The backend returned no available satellite demo scenes.');
      }

      setScenes(availableScenes);
      const initialScene = availableScenes[0];
      setSelectedScene(initialScene);

      const initMetrics = await api.getMetrics(initialScene.scene_id);
      setMetrics(initMetrics);
    } catch (err) {
      console.error('Failed to initialize GeoSR-NTRO frontend:', err);
      setIsBackendOnline(false);
      setError(err instanceof Error ? err.message : 'Unable to connect to the GeoSR FastAPI backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#070a0f] text-slate-100 flex items-center justify-center">
        <LoadingSpinner label="Initializing GeoSR-NTRO Satellite Command System..." />
      </div>
    );
  }

  if (error || !selectedScene) {
    return (
      <div className="h-screen w-screen bg-[#070a0f] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full">
          <ErrorBanner
            title="System Initialization Failed"
            message={error || 'No demo satellite scenes could be loaded.'}
            onRetry={initApp}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070a0f] text-slate-100 overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendOnline={isBackendOnline}
        mouseCoords={activeTab === 'WORKSPACE' ? mouseCoords : null}
      />

      {/* Main View Router */}
      {activeTab === 'OVERVIEW' && (
        <Overview
          scenes={scenes}
          selectedScene={selectedScene}
          onSelectScene={handleSelectScene}
          metrics={metrics}
          onLaunchWorkspace={() => setActiveTab('WORKSPACE')}
        />
      )}

      {activeTab === 'WORKSPACE' && (
        <Workspace
          scenes={scenes}
          selectedScene={selectedScene}
          onSelectScene={handleSelectScene}
          onHoverCoords={setMouseCoords}
        />
      )}

      {activeTab === 'MODELS' && (
        <ModelComparison scene={selectedScene} />
      )}

      {activeTab === 'ANALYSIS' && (
        <Analysis scene={selectedScene} />
      )}
    </div>
  );
};

export default App;
