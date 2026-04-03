/**
 * Server-side utility to fetch Points of Interest from the OpenStreetMap
 * Overpass API for the Mitrovica area.
 *
 * Results are cached in-memory for 1 hour to avoid hitting the API on every
 * page load.
 */

import type { FeatureCollection, Point } from "geojson";
import { POI_CATEGORY_COLORS, POI_CATEGORY_LABELS } from "~/lib/poi-constants";

// Re-export so callers that imported from overpass.server still work
export { POI_CATEGORY_COLORS, POI_CATEGORY_LABELS };

// Bounding box: south, west, north, east — covers greater Mitrovica
const BBOX = "42.86,20.84,42.92,20.90";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

/**
 * Maps OSM tags to our POI category. The key is the category id, the value
 * is the Overpass QL filter expression.
 */
const POI_QUERIES: Record<string, string[]> = {
  cafe: [`node["amenity"="cafe"](${BBOX})`],
  restaurant: [`node["amenity"="restaurant"](${BBOX})`],
  shop: [`node["shop"](${BBOX})`],
  school: [
    `node["amenity"="school"](${BBOX})`,
    `node["amenity"="university"](${BBOX})`,
    `node["amenity"="college"](${BBOX})`,
  ],
  office: [`node["office"](${BBOX})`],
  bank: [`node["amenity"="bank"](${BBOX})`],
  pharmacy: [`node["amenity"="pharmacy"](${BBOX})`],
  hotel: [
    `node["tourism"="hotel"](${BBOX})`,
    `node["tourism"="hostel"](${BBOX})`,
  ],
  healthcare: [
    `node["amenity"="hospital"](${BBOX})`,
    `node["amenity"="clinic"](${BBOX})`,
    `node["amenity"="doctors"](${BBOX})`,
  ],
  entertainment: [
    `node["amenity"="cinema"](${BBOX})`,
    `node["amenity"="theatre"](${BBOX})`,
    `node["leisure"="fitness_centre"](${BBOX})`,
    `node["amenity"="bar"](${BBOX})`,
    `node["amenity"="nightclub"](${BBOX})`,
  ],
};

// ── In-memory cache ─────────────────────────────────────────────────
let cachedPois: FeatureCollection<Point> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Build the full Overpass QL query.
 */
function buildOverpassQuery(): string {
  const allStatements = Object.values(POI_QUERIES).flat();
  return `
[out:json][timeout:25];
(
  ${allStatements.join(";\n  ")};
);
out body;
`.trim();
}

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Determine the category for an OSM element based on its tags.
 */
function categorize(tags: Record<string, string>): string {
  if (tags.amenity === "cafe") return "cafe";
  if (tags.amenity === "restaurant") return "restaurant";
  if (tags.shop) return "shop";
  if (["school", "university", "college"].includes(tags.amenity))
    return "school";
  if (tags.office) return "office";
  if (tags.amenity === "bank") return "bank";
  if (tags.amenity === "pharmacy") return "pharmacy";
  if (["hotel", "hostel"].includes(tags.tourism)) return "hotel";
  if (["hospital", "clinic", "doctors"].includes(tags.amenity))
    return "healthcare";
  if (
    ["cinema", "theatre", "bar", "nightclub"].includes(tags.amenity) ||
    tags.leisure === "fitness_centre"
  )
    return "entertainment";
  return "other";
}

/**
 * Fetch POIs from the Overpass API and return a GeoJSON FeatureCollection.
 * Results are cached for 1 hour.
 */
export async function fetchMitrovicaPois(): Promise<FeatureCollection<Point>> {
  // Return cached version if still fresh
  if (cachedPois && Date.now() - cacheTime < CACHE_TTL) {
    return cachedPois;
  }

  const query = buildOverpassQuery();

  const res = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    console.error(
      "[Overpass] Failed to fetch POIs:",
      res.status,
      res.statusText,
    );
    // Return an empty collection so the page still works
    return { type: "FeatureCollection", features: [] };
  }

  const data = (await res.json()) as OverpassResponse;

  const features = data.elements
    .filter((el) => el.lat && el.lon && el.tags)
    .map((el) => {
      const category = categorize(el.tags!);
      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [el.lon, el.lat],
        },
        properties: {
          id: el.id,
          name: el.tags!.name || el.tags!["name:en"] || "Unnamed",
          category,
          color: POI_CATEGORY_COLORS[category] || "#94a3b8",
          label: POI_CATEGORY_LABELS[category] || "Other",
          // Extra metadata
          phone: el.tags!.phone || null,
          website: el.tags!.website || null,
          opening_hours: el.tags!.opening_hours || null,
        },
      };
    });

  cachedPois = { type: "FeatureCollection", features };
  cacheTime = Date.now();

  console.log(`[Overpass] Fetched ${features.length} POIs for Mitrovica`);
  return cachedPois;
}
