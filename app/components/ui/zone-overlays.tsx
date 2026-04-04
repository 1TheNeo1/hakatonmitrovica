import { useMemo, useCallback, useState } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useMap } from "react-map-gl/maplibre";
import {
  BUSINESS_ZONES,
  generateCirclePolygon,
  type BusinessZone,
  type ZoneRating,
} from "~/lib/constants";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";

const RATING_COLORS: Record<ZoneRating, { color: string; fillColor: string }> = {
  green: { color: "#22c55e", fillColor: "#22c55e" },
  yellow: { color: "#eab308", fillColor: "#eab308" },
  red: { color: "#ef4444", fillColor: "#ef4444" },
};

interface ZoneOverlaysProps {
  onZoneClick?: (zone: BusinessZone) => void;
  /** Optional per-zone rating overrides (keyed by zone id). When provided,
   *  these ratings replace the default ratings from BUSINESS_ZONES. */
  zoneRatings?: Record<string, ZoneRating>;
}

/**
 * Renders business-zone circles as declarative MapLibre polygon layers with
 * neon glow outlines. Supports click and hover interactions.
 */
export function ZoneOverlays({ onZoneClick, zoneRatings }: ZoneOverlaysProps) {
  const { current: map } = useMap();
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Convert BUSINESS_ZONES to a GeoJSON FeatureCollection of circle polygons
  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: BUSINESS_ZONES.map((zone) => {
        const effectiveRating: ZoneRating = zoneRatings?.[zone.id] ?? zone.rating;
        const { color, fillColor } = RATING_COLORS[effectiveRating];
        return {
          type: "Feature" as const,
          id: zone.id,
          properties: {
            id: zone.id,
            name: zone.name,
            color,
            fillColor,
            rating: effectiveRating,
          },
          geometry: {
            type: "Polygon" as const,
            coordinates: [generateCirclePolygon(zone.center, zone.radius)],
          },
        };
      }),
    }),
    [zoneRatings],
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const zone = BUSINESS_ZONES.find((z) => z.id === feature.properties?.id);
      if (zone) onZoneClick?.(zone);
    },
    [onZoneClick],
  );

  const handleMouseEnter = useCallback(
    (e: MapLayerMouseEvent) => {
      if (map) map.getCanvas().style.cursor = "pointer";
      const id = e.features?.[0]?.properties?.id ?? null;
      setHoveredZoneId(id);
    },
    [map],
  );

  const handleMouseLeave = useCallback(() => {
    if (map) map.getCanvas().style.cursor = "";
    setHoveredZoneId(null);
  }, [map]);

  // Build a data-driven fill-opacity expression: 0.35 if hovered, else 0.18
  const fillOpacity: any = hoveredZoneId
    ? ["case", ["==", ["get", "id"], hoveredZoneId], 0.38, 0.18]
    : 0.18;

  return (
    <Source id="business-zones" type="geojson" data={geojson}>
      {/* Fill */}
      <Layer
        id="zone-fill"
        type="fill"
        paint={{
          "fill-color": ["get", "fillColor"],
          "fill-opacity": fillOpacity,
        }}
        // @ts-expect-error — react-map-gl typing doesn't expose interactiveLayerIds on Layer; handled via Map props
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Border */}
      <Layer
        id="zone-border"
        type="line"
        paint={{
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-opacity": 0.8,
        }}
      />

      {/* Neon glow on border */}
      <Layer
        id="zone-border-glow"
        type="line"
        paint={{
          "line-color": ["get", "color"],
          "line-width": 8,
          "line-blur": 8,
          "line-opacity": 0.2,
        }}
      />

      {/* Zone name labels */}
      <Layer
        id="zone-label"
        type="symbol"
        layout={{
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 11,
          "text-anchor": "center",
          "text-max-width": 10,
        }}
        paint={{
          "text-color": ["get", "color"],
          "text-halo-color": "#07070d",
          "text-halo-width": 2,
          "text-opacity": 0.7,
        }}
      />
    </Source>
  );
}

/** The interactive layer IDs that the parent Map must register for click/hover events */
export const ZONE_INTERACTIVE_LAYER_IDS = ["zone-fill"];
