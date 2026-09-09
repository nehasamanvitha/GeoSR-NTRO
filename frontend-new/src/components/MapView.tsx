import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import OSM from 'ol/source/OSM';
import { fromLonLat, transformExtent, toLonLat } from 'ol/proj';
import { SceneMetadata, ActiveLayersState } from '../types';
import { api } from '../services/api';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { SwipeSlider } from './SwipeSlider';

interface MapViewProps {
  scene: SceneMetadata;
  activeLayers: ActiveLayersState;
  sliderPos: number;
  setSliderPos: (pos: number) => void;
  onHoverCoords?: (coords: { lat: number; lon: number }) => void;
  onSelectPixel?: (lat: number, lon: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  scene,
  activeLayers,
  sliderPos,
  setSliderPos,
  onHoverCoords,
  onSelectPixel,
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const olMapRef = useRef<Map | null>(null);
  const sliderPosRef = useRef(sliderPos);
  const activeLayersRef = useRef(activeLayers);

  // Store layer instances in refs so we can dynamically toggle visibility/source without map teardown
  const layersRef = useRef<{
    obs10m?: ImageLayer<ImageStatic>;
    geosr25m?: ImageLayer<ImageStatic>;
    confidence?: ImageLayer<ImageStatic>;
    ndvi?: ImageLayer<ImageStatic>;
    ndwi?: ImageLayer<ImageStatic>;
    segmentation?: ImageLayer<ImageStatic>;
  }>({});

  // Keep sliderPosRef in sync
  useEffect(() => {
    sliderPosRef.current = sliderPos;
    if (olMapRef.current) {
      olMapRef.current.render();
    }
  }, [sliderPos]);

  // Keep activeLayersRef in sync
  useEffect(() => {
    activeLayersRef.current = activeLayers;
  }, [activeLayers]);

  // Update layer visibility without map teardown
  useEffect(() => {
    const l = layersRef.current;
    if (l.obs10m) l.obs10m.setVisible(activeLayers.obs10m);
    if (l.geosr25m) l.geosr25m.setVisible(activeLayers.geosr25m);
    if (l.confidence) l.confidence.setVisible(activeLayers.confidence);
    if (l.ndvi) l.ndvi.setVisible(activeLayers.ndvi);
    if (l.ndwi) l.ndwi.setVisible(activeLayers.ndwi);
    if (l.segmentation) l.segmentation.setVisible(activeLayers.segmentation);

    if (olMapRef.current) {
      olMapRef.current.render();
    }
  }, [activeLayers]);

  // Initialize map once on mount
  useEffect(() => {
    if (!mapElementRef.current) return;

    const bbox = scene.bbox;
    const mapExtent = transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
    const center = fromLonLat([scene.coordinates[1], scene.coordinates[0]]);

    // Base OSM layer with subtle dark opacity
    const baseOsm = new TileLayer({
      source: new OSM(),
      opacity: 0.25,
    });

    // Create ImageLayers with initial sources
    const obs10m = new ImageLayer({
      source: new ImageStatic({
        url: api.getLayerTileUrl(scene.scene_id, '10m'),
        imageExtent: mapExtent,
        projection: 'EPSG:3857',
      }),
      visible: activeLayers.obs10m,
    });

    const geosr25m = new ImageLayer({
      source: new ImageStatic({
        url: api.getLayerTileUrl(scene.scene_id, 'geosr'),
        imageExtent: mapExtent,
        projection: 'EPSG:3857',
      }),
      visible: activeLayers.geosr25m,
    });

    const confidence = new ImageLayer({
      source: new ImageStatic({
        url: api.getLayerTileUrl(scene.scene_id, 'confidence'),
        imageExtent: mapExtent,
        projection: 'EPSG:3857',
      }),
      visible: activeLayers.confidence,
      opacity: 0.85,
    });

    const ndvi = new ImageLayer({
      source: new ImageStatic({
        url: api.getLayerTileUrl(scene.scene_id, 'ndvi'),
        imageExtent: mapExtent,
        projection: 'EPSG:3857',
      }),
      visible: activeLayers.ndvi,
      opacity: 0.9,
    });

    const ndwi = new ImageLayer({
      source: new ImageStatic({
        url: api.getLayerTileUrl(scene.scene_id, 'ndwi'),
        imageExtent: mapExtent,
        projection: 'EPSG:3857',
      }),
      visible: activeLayers.ndwi,
      opacity: 0.9,
    });

    const segmentation = new ImageLayer({
      source: new ImageStatic({
        url: api.getLayerTileUrl(scene.scene_id, 'segmentation'),
        imageExtent: mapExtent,
        projection: 'EPSG:3857',
      }),
      visible: activeLayers.segmentation,
      opacity: 0.85,
    });

    layersRef.current = { obs10m, geosr25m, confidence, ndvi, ndwi, segmentation };

    const map = new Map({
      target: mapElementRef.current,
      layers: [baseOsm, obs10m, geosr25m, confidence, ndvi, ndwi, segmentation],
      view: new View({
        center,
        zoom: 14,
        minZoom: 10,
        maxZoom: 18,
      }),
      controls: [],
    });

    olMapRef.current = map;

    // Prerender clip for Swipe comparison between 10m (Left) and 2.5m GeoSR (Right)
    const prerenderListener = (event: any) => {
      const active = activeLayersRef.current;
      if (!active.geosr25m || !active.obs10m) return;

      const ctx = event.context as CanvasRenderingContext2D;
      const mapSize = map.getSize();
      if (ctx && mapSize) {
        const width = mapSize[0];
        const height = mapSize[1];
        const clipX = width * (sliderPosRef.current / 100);
        ctx.save();
        ctx.beginPath();
        ctx.rect(clipX, 0, width - clipX, height);
        ctx.clip();
      }
    };

    const postrenderListener = (event: any) => {
      const active = activeLayersRef.current;
      if (!active.geosr25m || !active.obs10m) return;

      const ctx = event.context as CanvasRenderingContext2D;
      if (ctx) {
        ctx.restore();
      }
    };

    geosr25m.on('prerender', prerenderListener);
    geosr25m.on('postrender', postrenderListener);

    // Pointer move event listener
    const pointerMoveListener = (e: any) => {
      const coords = toLonLat(e.coordinate);
      if (onHoverCoords && coords && coords.length >= 2) {
        onHoverCoords({ lat: coords[1], lon: coords[0] });
      }
    };
    map.on('pointermove', pointerMoveListener);

    // Single click event listener for pixel inspector
    const singleClickListener = (e: any) => {
      const coords = toLonLat(e.coordinate);
      if (onSelectPixel && coords && coords.length >= 2) {
        onSelectPixel(coords[1], coords[0]);
      }
    };
    map.on('singleclick', singleClickListener);

    return () => {
      geosr25m.un('prerender', prerenderListener);
      geosr25m.un('postrender', postrenderListener);
      map.un('pointermove', pointerMoveListener);
      map.un('singleclick', singleClickListener);
      map.setTarget(undefined);
      olMapRef.current = null;
    };
  }, []); // Run once on mount!

  // Update layer sources when scene changes without tearing down map
  useEffect(() => {
    if (!olMapRef.current) return;

    const bbox = scene.bbox;
    const mapExtent = transformExtent(bbox, 'EPSG:4326', 'EPSG:3857');
    const center = fromLonLat([scene.coordinates[1], scene.coordinates[0]]);

    const l = layersRef.current;
    if (l.obs10m) {
      l.obs10m.setSource(
        new ImageStatic({
          url: api.getLayerTileUrl(scene.scene_id, '10m'),
          imageExtent: mapExtent,
          projection: 'EPSG:3857',
        })
      );
    }
    if (l.geosr25m) {
      l.geosr25m.setSource(
        new ImageStatic({
          url: api.getLayerTileUrl(scene.scene_id, 'geosr'),
          imageExtent: mapExtent,
          projection: 'EPSG:3857',
        })
      );
    }
    if (l.confidence) {
      l.confidence.setSource(
        new ImageStatic({
          url: api.getLayerTileUrl(scene.scene_id, 'confidence'),
          imageExtent: mapExtent,
          projection: 'EPSG:3857',
        })
      );
    }
    if (l.ndvi) {
      l.ndvi.setSource(
        new ImageStatic({
          url: api.getLayerTileUrl(scene.scene_id, 'ndvi'),
          imageExtent: mapExtent,
          projection: 'EPSG:3857',
        })
      );
    }
    if (l.ndwi) {
      l.ndwi.setSource(
        new ImageStatic({
          url: api.getLayerTileUrl(scene.scene_id, 'ndwi'),
          imageExtent: mapExtent,
          projection: 'EPSG:3857',
        })
      );
    }
    if (l.segmentation) {
      l.segmentation.setSource(
        new ImageStatic({
          url: api.getLayerTileUrl(scene.scene_id, 'segmentation'),
          imageExtent: mapExtent,
          projection: 'EPSG:3857',
        })
      );
    }

    olMapRef.current.getView().setCenter(center);
    olMapRef.current.getView().setZoom(14);
  }, [scene.scene_id]);

  const handleZoomIn = () => {
    if (!olMapRef.current) return;
    const view = olMapRef.current.getView();
    view.setZoom((view.getZoom() || 14) + 1);
  };

  const handleZoomOut = () => {
    if (!olMapRef.current) return;
    const view = olMapRef.current.getView();
    view.setZoom((view.getZoom() || 14) - 1);
  };

  const handleResetView = () => {
    if (!olMapRef.current) return;
    const view = olMapRef.current.getView();
    view.setCenter(fromLonLat([scene.coordinates[1], scene.coordinates[0]]));
    view.setZoom(14);
  };

  const isSwipeActive = activeLayers.obs10m && activeLayers.geosr25m;

  return (
    <div className="relative w-full h-full bg-[#070a0f] overflow-hidden select-none">
      {/* Map DOM Element */}
      <div ref={mapElementRef} className="w-full h-full" />

      {/* Swipe Overlay Control */}
      {isSwipeActive && (
        <SwipeSlider sliderPos={sliderPos} setSliderPos={setSliderPos} />
      )}

      {/* Labels for Swipe comparison when active */}
      {isSwipeActive && (
        <>
          <div className="absolute top-4 left-4 z-20 pointer-events-none bg-slate-950/80 border border-indigo-500/30 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-mono font-medium text-indigo-300 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            10 m Sentinel-2 Input (Left)
          </div>
          <div className="absolute top-4 right-4 z-20 pointer-events-none bg-slate-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-mono font-medium text-emerald-300 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            2.5 m GeoSR Output (Right)
          </div>
        </>
      )}

      {/* Floating Zoom & Controls Box */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-[#0b0f17]/90 p-1.5 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded-lg transition-colors border-t border-slate-800/80 pt-2"
          title="Fit to Scene Bounds"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
