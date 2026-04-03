import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { BUSINESS_ZONES, type BusinessZone } from "~/lib/constants";

interface ZoneOverlaysProps {
  onZoneClick?: (zone: BusinessZone) => void;
}

export function ZoneOverlays({ onZoneClick }: ZoneOverlaysProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const polygons = BUSINESS_ZONES.map((zone) => {
      const polygon = new google.maps.Polygon({
        paths: zone.paths,
        strokeColor: zone.color,
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: zone.fillColor,
        fillOpacity: 0.22,
        map,
        clickable: true,
        zIndex: 1,
      });

      polygon.addListener("click", () => {
        onZoneClick?.(zone);
      });

      polygon.addListener("mouseover", () => {
        polygon.setOptions({ fillOpacity: 0.42 });
      });

      polygon.addListener("mouseout", () => {
        polygon.setOptions({ fillOpacity: 0.22 });
      });

      return polygon;
    });

    return () => {
      polygons.forEach((p) => p.setMap(null));
    };
  }, [map, onZoneClick]);

  return null;
}
