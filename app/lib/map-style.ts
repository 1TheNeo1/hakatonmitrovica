/**
 * Cyberpunk / Neon dark map style for MapLibre GL JS.
 *
 * Uses MapTiler "Basic" vector tiles as the source and completely overrides
 * every visual layer to produce a deep-dark background with neon-cyan roads,
 * indigo highlights, and glowing labels — matching the app's glass-morphism
 * dark theme.
 *
 * The style is built programmatically so we can reference the MapTiler key
 * at runtime without a separate JSON file.
 */

import type { StyleSpecification } from "maplibre-gl";

export function getCyberpunkStyle(maptilerKey: string): StyleSpecification {
  return {
    version: 8,
    name: "MitroStart Cyberpunk",
    glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${maptilerKey}`,
    sprite: `https://api.maptiler.com/maps/basic-v2/sprite?key=${maptilerKey}`,
    sources: {
      openmaptiles: {
        type: "vector",
        url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${maptilerKey}`,
      },
    },
    layers: [
      // ── Background ────────────────────────────────────────────
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#07070d",
        },
      },

      // ── Water ─────────────────────────────────────────────────
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: {
          "fill-color": "#080820",
          "fill-opacity": 0.9,
        },
      },
      {
        id: "water-glow",
        type: "line",
        source: "openmaptiles",
        "source-layer": "water",
        paint: {
          "line-color": "#1e3a5f",
          "line-width": 1.5,
          "line-blur": 4,
          "line-opacity": 0.6,
        },
      },

      // ── Land cover (parks, grass, wood) ───────────────────────
      {
        id: "landcover-grass",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["==", "class", "grass"],
        paint: {
          "fill-color": "#0a1a12",
          "fill-opacity": 0.6,
        },
      },
      {
        id: "landcover-wood",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["==", "class", "wood"],
        paint: {
          "fill-color": "#0d1a0f",
          "fill-opacity": 0.5,
        },
      },

      // ── Landuse (residential, commercial, industrial) ─────────
      {
        id: "landuse-residential",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: ["==", "class", "residential"],
        paint: {
          "fill-color": "#0c0c18",
          "fill-opacity": 0.4,
        },
      },
      {
        id: "landuse-commercial",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: ["in", "class", "commercial", "retail"],
        paint: {
          "fill-color": "#10101e",
          "fill-opacity": 0.3,
        },
      },

      // ── Buildings (flat fills + neon outlines) ────────────────
      {
        id: "building-fill",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 13,
        paint: {
          "fill-color": "#0e0e1a",
          "fill-opacity": 0.8,
        },
      },
      {
        id: "building-outline",
        type: "line",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 14,
        paint: {
          "line-color": "#6366f1",
          "line-width": 0.6,
          "line-opacity": 0.35,
        },
      },
      {
        id: "building-glow",
        type: "line",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 15,
        paint: {
          "line-color": "#6366f1",
          "line-width": 2,
          "line-blur": 6,
          "line-opacity": 0.15,
        },
      },

      // ── 3D Buildings (fill-extrusion) ─────────────────────────
      {
        id: "building-3d",
        type: "fill-extrusion",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 14.5,
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "render_height"], 10],
            0,
            "#0e0e1a",
            15,
            "#141428",
            40,
            "#1a1a3a",
          ],
          "fill-extrusion-height": ["coalesce", ["get", "render_height"], 10],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 0.7,
          "fill-extrusion-vertical-gradient": true,
        },
      },

      // ── Roads ─────────────────────────────────────────────────
      // Road casings (dark outline for depth)
      {
        id: "road-casing-major",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "motorway", "trunk", "primary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#000005",
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            2,
            16,
            16,
          ],
          "line-opacity": 0.8,
        },
      },

      // Major roads — neon cyan
      {
        id: "road-major",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "motorway", "trunk", "primary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#06b6d4",
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            0.8,
            16,
            6,
          ],
          "line-opacity": 0.9,
        },
      },
      {
        id: "road-major-glow",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "motorway", "trunk", "primary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#06b6d4",
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            8,
            4,
            16,
            20,
          ],
          "line-blur": 8,
          "line-opacity": 0.2,
        },
      },

      // Secondary roads — indigo
      {
        id: "road-secondary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "secondary", "tertiary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#818cf8",
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            10,
            0.5,
            16,
            4,
          ],
          "line-opacity": 0.7,
        },
      },
      {
        id: "road-secondary-glow",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "secondary", "tertiary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#818cf8",
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            10,
            2,
            16,
            12,
          ],
          "line-blur": 6,
          "line-opacity": 0.12,
        },
      },

      // Minor roads — dim slate
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "minor", "service", "path", "track"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#2a2a45",
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            12,
            0.3,
            16,
            2,
          ],
          "line-opacity": 0.6,
        },
      },

      // ── Railways ──────────────────────────────────────────────
      {
        id: "railway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", "class", "rail"],
        paint: {
          "line-color": "#f59e0b",
          "line-width": 1.2,
          "line-opacity": 0.4,
          "line-dasharray": [4, 4],
        },
      },

      // ── Boundaries ────────────────────────────────────────────
      {
        id: "boundary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        paint: {
          "line-color": "#6366f1",
          "line-width": 1,
          "line-opacity": 0.25,
          "line-dasharray": [3, 2],
        },
      },

      // ── Labels — Road names ───────────────────────────────────
      {
        id: "road-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 14,
        layout: {
          "text-field": ["get", "name:latin"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 14, 9, 18, 13],
          "symbol-placement": "line",
          "text-rotation-alignment": "map",
          "text-max-angle": 30,
        },
        paint: {
          "text-color": "#4a5568",
          "text-halo-color": "#07070d",
          "text-halo-width": 1.5,
          "text-opacity": 0.7,
        },
      },

      // ── Labels — Places (cities, towns, etc.) ─────────────────
      {
        id: "place-city",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["==", "class", "city"],
        layout: {
          "text-field": ["get", "name:latin"],
          "text-font": ["Noto Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 8, 14, 14, 22],
          "text-anchor": "center",
        },
        paint: {
          "text-color": "#22d3ee",
          "text-halo-color": "#07070d",
          "text-halo-width": 2,
          "text-halo-blur": 1,
        },
      },
      {
        id: "place-town",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", "class", "town", "village"],
        layout: {
          "text-field": ["get", "name:latin"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 10, 10, 14, 15],
          "text-anchor": "center",
        },
        paint: {
          "text-color": "#94a3b8",
          "text-halo-color": "#07070d",
          "text-halo-width": 1.5,
        },
      },

      // ── Labels — POI category labels ──────────────────────────
      {
        id: "poi-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "poi",
        minzoom: 15,
        layout: {
          "text-field": ["get", "name:latin"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "text-anchor": "top",
          "text-offset": [0, 0.8],
          "text-max-width": 8,
        },
        paint: {
          "text-color": "#64748b",
          "text-halo-color": "#07070d",
          "text-halo-width": 1,
          "text-opacity": 0.6,
        },
      },
    ],
  } as StyleSpecification;
}
