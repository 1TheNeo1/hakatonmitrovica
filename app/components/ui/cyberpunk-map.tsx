import { useCallback, useMemo, type ReactNode } from "react";
import MapGL, {
  Marker,
  Popup,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { getCyberpunkStyle } from "~/lib/map-style";
import { MITROVICA_CENTER, DEFAULT_ZOOM } from "~/lib/constants";
import { MapControls } from "./map-controls";

export interface MapClickPayload {
  lngLat: { lng: number; lat: number };
  features?: Record<string, unknown>[];
}

export interface CyberpunkMapProps {
  /** MapTiler API key */
  maptilerKey: string;
  /** Called when the user clicks on the map */
  onMapClick?: (e: MapClickPayload) => void;
  /** Child elements rendered inside the map (Marker, Popup, Source/Layer, etc.) */
  children?: ReactNode;
  /** Additional CSS class on the wrapper */
  className?: string;
  /** Minimum height of the map container */
  minHeight?: number;
  /** Initial center override */
  center?: { lat: number; lng: number };
  /** Initial zoom override */
  zoom?: number;
  /** Max pitch (0 = flat, 60 = tilted) */
  maxPitch?: number;
  /** Layer IDs that should fire click events with feature data */
  interactiveLayerIds?: string[];
}

export function CyberpunkMap({
  maptilerKey,
  onMapClick,
  children,
  className = "",
  minHeight = 400,
  center,
  zoom,
  maxPitch = 60,
  interactiveLayerIds,
}: CyberpunkMapProps) {
  const mapStyle = useMemo(() => getCyberpunkStyle(maptilerKey), [maptilerKey]);

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      onMapClick?.({
        lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat },
        features: e.features as Record<string, unknown>[] | undefined,
      });
    },
    [onMapClick],
  );

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ minHeight }}
    >
      <MapGL
        initialViewState={{
          longitude: center?.lng ?? MITROVICA_CENTER.lng,
          latitude: center?.lat ?? MITROVICA_CENTER.lat,
          zoom: zoom ?? DEFAULT_ZOOM,
          pitch: 45,
          bearing: -10,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        onClick={handleClick}
        maxPitch={maxPitch}
        attributionControl={false}
        interactiveLayerIds={interactiveLayerIds}
      >
        {children}
      </MapGL>

      {/* Custom map controls overlay */}
      <MapControls />
    </div>
  );
}

// Re-export useful primitives so consumers don't need to import from react-map-gl directly
export { Marker, Popup } from "react-map-gl/maplibre";
export { Source, Layer } from "react-map-gl/maplibre";
