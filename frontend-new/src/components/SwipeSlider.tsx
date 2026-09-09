import React, { useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface SwipeSliderProps {
  sliderPos: number;
  setSliderPos: (pos: number) => void;
}

export const SwipeSlider: React.FC<SwipeSliderProps> = ({ sliderPos, setSliderPos }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
    },
    [setSliderPos]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture fails
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 pointer-events-none"
    >
      {/* Vertical Slider Bar */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.8)] pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Central Drag Handle */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#0b0f17] border-2 border-emerald-400 text-emerald-400 flex items-center justify-center cursor-ew-resize shadow-xl pointer-events-auto hover:scale-110 active:scale-95 transition-transform"
          title="Drag to compare 10m Input vs 2.5m GeoSR Output"
        >
          <ChevronsLeftRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
