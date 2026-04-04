export const MITROVICA_CENTER = {
  lat: 42.8965,
  lng: 20.866,
};

export const DEFAULT_ZOOM = 15;

export type ZoneRating = "green" | "yellow" | "red";

export interface BusinessZone {
  id: string;
  name: string;
  description: string;
  rating: ZoneRating;
  color: string;
  fillColor: string;
  highlights: string[];
  center: { lat: number; lng: number };
  radius: number; // meters
}

/**
 * Generate a circle polygon (array of [lng, lat] coordinate pairs) from a
 * center point and radius in metres. Uses the haversine-based destination
 * formula so the circle is geographically accurate at any zoom / pitch.
 */
export function generateCirclePolygon(
  center: { lat: number; lng: number },
  radiusMeters: number,
  numPoints = 64,
): [number, number][] {
  const coords: [number, number][] = [];
  const earthRadius = 6371000; // metres
  const latRad = (center.lat * Math.PI) / 180;
  const lngRad = (center.lng * Math.PI) / 180;
  const angularDistance = radiusMeters / earthRadius;

  for (let i = 0; i <= numPoints; i++) {
    const bearing = (2 * Math.PI * i) / numPoints;
    const destLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance) +
        Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const destLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
        Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLat),
      );
    coords.push([(destLng * 180) / Math.PI, (destLat * 180) / Math.PI]);
  }
  return coords;
}

export const BUSINESS_ZONES: BusinessZone[] = [
  // ── GREEN zones (commercial core near the bridge / main square) ──────
  {
    id: "north-main-square",
    name: "North Main Square",
    description:
      "Central hub of North Mitrovica with highest foot traffic. Prime location for retail, cafés, and services.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: [
      "High foot traffic",
      "Strong purchasing power",
      "Excellent visibility",
    ],
    center: { lat: 42.8935, lng: 20.865 },
    radius: 220,
  },
  {
    id: "bridge-commercial",
    name: "Bridge Commercial District",
    description:
      "Busy commercial strip near the Ibar bridge. Great for restaurants, services, and cross-community businesses.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: ["Bridge proximity", "Mixed clientele", "High visibility"],
    center: { lat: 42.892, lng: 20.871 },
    radius: 200,
  },
  {
    id: "north-bazaar",
    name: "North Bazaar & Market",
    description:
      "Traditional market area with daily trading activity. Ideal for retail, food stalls, and wholesale.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: [
      "Daily market activity",
      "Mixed demographics",
      "Strong local demand",
    ],
    center: { lat: 42.895, lng: 20.858 },
    radius: 200,
  },
  // ── YELLOW zones (surrounding transitional areas) ────────────────────
  {
    id: "north-residential-west",
    name: "Western Residential Quarter",
    description:
      "Growing residential area west of center with emerging small businesses and affordable rent.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: [
      "Growing population",
      "Affordable space",
      "Underserved market",
    ],
    center: { lat: 42.897, lng: 20.852 },
    radius: 250,
  },
  {
    id: "north-residential-east",
    name: "Eastern Commercial Strip",
    description:
      "Mixed commercial-residential corridor east of the center. Road-side visibility and growing traffic.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: [
      "Road-side visibility",
      "Growing traffic",
      "Lower competition",
    ],
    center: { lat: 42.8955, lng: 20.877 },
    radius: 230,
  },
  {
    id: "north-upper-center",
    name: "Upper North Center",
    description:
      "Northern extension of the commercial core. Niche opportunities in an underserved area.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: [
      "Underserved niches",
      "Cross-community potential",
      "Lower competition",
    ],
    center: { lat: 42.9005, lng: 20.866 },
    radius: 250,
  },
  // ── RED zones (peripheral / industrial) ──────────────────────────────
  {
    id: "industrial-northwest",
    name: "Northwest Industrial Zone",
    description:
      "Old industrial area with low consumer traffic. Not recommended for retail or consumer services.",
    rating: "red",
    color: "#ef4444",
    fillColor: "#ef4444",
    highlights: [
      "Low foot traffic",
      "Industrial land use",
      "Poor consumer access",
    ],
    center: { lat: 42.904, lng: 20.853 },
    radius: 270,
  },
  {
    id: "far-northeast",
    name: "Northeast Outskirts",
    description:
      "Sparse suburban fringe with minimal infrastructure. Very challenging for most business types.",
    rating: "red",
    color: "#ef4444",
    fillColor: "#ef4444",
    highlights: ["Sparse population", "Poor infrastructure", "Limited access"],
    center: { lat: 42.903, lng: 20.878 },
    radius: 250,
  },
];

export const BUDGET_MIN = 500;
export const BUDGET_MAX = 50000;
export const BUDGET_STEP = 500;

export const BUSINESS_TYPES = [
  { id: "physical", label: "Physical Store" },
  { id: "online", label: "Online / Home-based" },
  { id: "delivery", label: "Delivery Service" },
  { id: "mixed", label: "Mixed" },
] as const;

export const CATEGORIES = [
  { id: "food", label: "Food & Beverage" },
  { id: "retail", label: "Retail" },
  { id: "services", label: "Services" },
  { id: "tech", label: "Tech" },
  { id: "entertainment", label: "Entertainment" },
  { id: "education", label: "Education" },
  { id: "health", label: "Health & Wellness" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["id"];
export type Category = (typeof CATEGORIES)[number]["id"];

export const IDEA_STAGES = [
  { id: "concept", label: "Concept" },
  { id: "prototype", label: "Prototype" },
  { id: "early-revenue", label: "Early Revenue" },
  { id: "scaling", label: "Scaling" },
] as const;

export const IDEA_STATUSES = [
  {
    id: "pending",
    label: "Pending",
    color: "text-yellow-700 bg-yellow-100 border-yellow-300",
  },
  {
    id: "reviewed",
    label: "Reviewed",
    color: "text-blue-700 bg-blue-100 border-blue-300",
  },
  {
    id: "contacted",
    label: "Contacted",
    color: "text-purple-700 bg-purple-100 border-purple-300",
  },
  {
    id: "funded",
    label: "Funded",
    color: "text-green-700 bg-green-100 border-green-300",
  },
  {
    id: "rejected",
    label: "Rejected",
    color: "text-red-700 bg-red-100 border-red-300",
  },
] as const;

export type IdeaStageId = (typeof IDEA_STAGES)[number]["id"];
export type IdeaStatusId = (typeof IDEA_STATUSES)[number]["id"];

export const TUTORIAL_TYPES = [
  { id: "blog", label: "Blog" },
  { id: "video", label: "Video" },
  { id: "resource", label: "Resurs" },
] as const;

export type TutorialTypeId = (typeof TUTORIAL_TYPES)[number]["id"];
