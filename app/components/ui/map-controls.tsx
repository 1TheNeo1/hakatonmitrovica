import { useMap } from "react-map-gl/maplibre";
import { motion } from "framer-motion";

/**
 * Custom glass-morphism styled map controls (zoom, pitch, compass).
 * Positioned in the bottom-right corner of the map container.
 */
export function MapControls() {
  const { current: map } = useMap();

  const zoomIn = () => map?.zoomIn({ duration: 300 });
  const zoomOut = () => map?.zoomOut({ duration: 300 });
  const resetNorth = () => map?.easeTo({ bearing: 0, pitch: 0, duration: 500 });
  const togglePitch = () => {
    if (!map) return;
    const pitch = map.getPitch();
    map.easeTo({ pitch: pitch > 10 ? 0 : 50, duration: 500 });
  };

  return (
    <motion.div
      className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Zoom In */}
      <ControlButton onClick={zoomIn} title="Zoom in" aria-label="Zoom in">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="8" y1="3" x2="8" y2="13" />
          <line x1="3" y1="8" x2="13" y2="8" />
        </svg>
      </ControlButton>

      {/* Zoom Out */}
      <ControlButton onClick={zoomOut} title="Zoom out" aria-label="Zoom out">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="8" x2="13" y2="8" />
        </svg>
      </ControlButton>

      {/* Divider */}
      <div className="h-px bg-white/10 mx-1" />

      {/* 3D Toggle */}
      <ControlButton
        onClick={togglePitch}
        title="Toggle 3D view"
        aria-label="Toggle 3D view"
      >
        <span className="text-[10px] font-bold leading-none">3D</span>
      </ControlButton>

      {/* Reset North */}
      <ControlButton
        onClick={resetNorth}
        title="Reset bearing"
        aria-label="Reset north"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Compass needle */}
          <path d="M8 2 L10 8 L8 14 L6 8 Z" fill="currentColor" opacity="0.3" />
          <path d="M8 2 L10 8 L8 6 L6 8 Z" fill="#06b6d4" />
        </svg>
      </ControlButton>
    </motion.div>
  );
}

function ControlButton({
  children,
  onClick,
  title,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  [key: string]: unknown;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="
        w-8 h-8 flex items-center justify-center rounded-lg
        bg-black/50 backdrop-blur-md border border-white/10
        text-white/70 hover:text-secondary hover:border-secondary/40
        hover:bg-black/70 transition-all duration-200
        cursor-pointer select-none
      "
      {...rest}
    >
      {children}
    </button>
  );
}
