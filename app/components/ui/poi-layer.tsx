import { useState, useMemo } from "react";
import { Source, Layer, Popup } from "react-map-gl/maplibre";
import type { FeatureCollection, Point } from "geojson";
import { POI_CATEGORY_COLORS, POI_CATEGORY_LABELS } from "~/lib/poi-constants";

interface PoiLayerProps {
  /** GeoJSON FeatureCollection of POIs loaded server-side */
  data: FeatureCollection<Point>;
  /** Which categories to show (empty = all). */
  visibleCategories?: string[];
}

interface SelectedPoi {
  lng: number;
  lat: number;
  name: string;
  category: string;
  color: string;
  label: string;
  phone?: string | null;
  website?: string | null;
  opening_hours?: string | null;
}

/**
 * Renders OSM POI data on the cyberpunk map as glowing colored circles
 * with popups on click.
 */
export function PoiLayer({ data, visibleCategories }: PoiLayerProps) {
  const [selected, setSelected] = useState<SelectedPoi | null>(null);

  // Filter data if visibleCategories is specified
  const filteredData = useMemo(() => {
    if (!visibleCategories || visibleCategories.length === 0) return data;
    return {
      ...data,
      features: data.features.filter((f) =>
        visibleCategories.includes(f.properties?.category),
      ),
    };
  }, [data, visibleCategories]);

  // Build unique category color stops for data-driven styling
  const categoryColors = useMemo(() => {
    const stops: (string | string[])[] = ["match", ["get", "category"]];
    for (const [cat, color] of Object.entries(POI_CATEGORY_COLORS)) {
      stops.push(cat, color);
    }
    stops.push("#94a3b8"); // fallback
    return stops;
  }, []);

  return (
    <>
      <Source id="pois" type="geojson" data={filteredData}>
        {/* Outer glow circle */}
        <Layer
          id="poi-glow"
          type="circle"
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              12,
              6,
              16,
              14,
              18,
              20,
            ],
            "circle-color": categoryColors as any,
            "circle-opacity": 0.15,
            "circle-blur": 1,
          }}
        />

        {/* Core circle */}
        <Layer
          id="poi-core"
          type="circle"
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              12,
              3,
              16,
              6,
              18,
              9,
            ],
            "circle-color": categoryColors as any,
            "circle-opacity": 0.85,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 0.8,
            "circle-stroke-opacity": 0.3,
          }}
        />

        {/* Labels at high zoom */}
        <Layer
          id="poi-name"
          type="symbol"
          minzoom={15.5}
          layout={{
            "text-field": ["get", "name"],
            "text-font": ["Noto Sans Regular"],
            "text-size": 10,
            "text-anchor": "top",
            "text-offset": [0, 1],
            "text-max-width": 8,
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": categoryColors as any,
            "text-halo-color": "#07070d",
            "text-halo-width": 1.5,
            "text-opacity": 0.8,
          }}
        />
      </Source>

      {/* Popup for selected POI */}
      {selected && (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          closeOnClick={false}
          onClose={() => setSelected(null)}
          className="poi-popup"
          offset={12}
        >
          <div className="p-2 min-w-[160px]">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selected.color }}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                {selected.label}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white leading-tight mb-1">
              {selected.name}
            </h3>
            {selected.opening_hours && (
              <p className="text-[11px] text-white/50">
                {selected.opening_hours}
              </p>
            )}
            {selected.phone && (
              <p className="text-[11px] text-white/50 mt-0.5">
                {selected.phone}
              </p>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}

/**
 * POI category filter pills shown above or beside the map.
 */
export function PoiCategoryFilter({
  activeCategories,
  onToggle,
}: {
  activeCategories: string[];
  onToggle: (category: string) => void;
}) {
  const allCategories = Object.entries(POI_CATEGORY_LABELS);

  return (
    <div className="flex flex-wrap gap-1.5">
      {allCategories.map(([id, label]) => {
        const isActive =
          activeCategories.length === 0 || activeCategories.includes(id);
        const color = POI_CATEGORY_COLORS[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={`
              px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer
              ${
                isActive
                  ? "border-white/20 bg-white/10"
                  : "border-white/5 bg-white/3 opacity-40"
              }
            `}
            style={{ color }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ backgroundColor: color }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
