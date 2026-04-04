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
      "Centralno čvorište Severne Mitrovice sa najvećim prometom. Odlična lokacija za prodavnice, kafiće i usluge.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: [
      "Visok promet",
      "Jaka kupovna moć",
      "Odlična vidljivost",
    ],
    center: { lat: 42.8935, lng: 20.865 },
    radius: 220,
  },
  {
    id: "bridge-commercial",
    name: "Bridge Commercial District",
    description:
      "Prometna komercijalna zona u blizini mosta na Ibru. Odlično za restorane, usluge i međuzajedničke biznise.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: ["Blizina mosta", "Mešovita klijentela", "Visoka vidljivost"],
    center: { lat: 42.892, lng: 20.871 },
    radius: 200,
  },
  {
    id: "north-bazaar",
    name: "North Bazaar & Market",
    description:
      "Tradicionalna pijačna zona sa svakodnevnom trgovinskom aktivnošću. Idealno za maloprodaju, prehrambene štandove i veleprodaju.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: [
      "Svakodnevna tržišna aktivnost",
      "Mešovita demografija",
      "Jaka lokalna tražnja",
    ],
    center: { lat: 42.895, lng: 20.858 },
    radius: 200,
  },
  // ── YELLOW zones (surrounding transitional areas) ────────────────────
  {
    id: "north-residential-west",
    name: "Western Residential Quarter",
    description:
      "Rastuće stambeno područje zapadno od centra sa novonastalim malim biznisom i pristupačnom kirijom.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: [
      "Rastuće stanovništvo",
      "Pristupačan prostor",
      "Nedovoljno opsluženo tržište",
    ],
    center: { lat: 42.897, lng: 20.852 },
    radius: 250,
  },
  {
    id: "north-residential-east",
    name: "Eastern Commercial Strip",
    description:
      "Mešoviti komercijalno-stambeni koridor istočno od centra. Vidljivost uz put i rastući promet.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: [
      "Vidljivost uz put",
      "Rastući promet",
      "Manja konkurencija",
    ],
    center: { lat: 42.8955, lng: 20.877 },
    radius: 230,
  },
  {
    id: "north-upper-center",
    name: "Upper North Center",
    description:
      "Severno proširenje komercijalnog jezgra. Nišne prilike u nedovoljno opsluženoj oblasti.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: [
      "Neopslužene niše",
      "Međuzajednički potencijal",
      "Manja konkurencija",
    ],
    center: { lat: 42.9005, lng: 20.866 },
    radius: 250,
  },
  // ── RED zones (peripheral / industrial) ──────────────────────────────
  {
    id: "industrial-northwest",
    name: "Northwest Industrial Zone",
    description:
      "Stara industrijska zona sa malim prometom potrošača. Nije preporučljivo za maloprodaju ili potrošačke usluge.",
    rating: "red",
    color: "#ef4444",
    fillColor: "#ef4444",
    highlights: [
      "Mali promet",
      "Industrijska namena zemljišta",
      "Loš pristup potrošačima",
    ],
    center: { lat: 42.904, lng: 20.853 },
    radius: 270,
  },
  {
    id: "far-northeast",
    name: "Northeast Outskirts",
    description:
      "Rijetki prigradski rub sa minimalnom infrastrukturom. Veoma izazovno za većinu vrsta biznisa.",
    rating: "red",
    color: "#ef4444",
    fillColor: "#ef4444",
    highlights: ["Rijetko stanovništvo", "Loša infrastruktura", "Ograničen pristup"],
    center: { lat: 42.903, lng: 20.878 },
    radius: 250,
  },
];

export const BUDGET_MIN = 500;
export const BUDGET_MAX = 50000;
export const BUDGET_STEP = 500;

export const BUSINESS_TYPES = [
  { id: "physical", label: "Fizička prodavnica" },
  { id: "online", label: "Online / Kućni biznis" },
  { id: "delivery", label: "Dostava" },
  { id: "mixed", label: "Mešovito" },
] as const;

export const CATEGORIES = [
  { id: "food", label: "Hrana i piće" },
  { id: "retail", label: "Maloprodaja" },
  { id: "services", label: "Usluge" },
  { id: "tech", label: "Tehnologija" },
  { id: "entertainment", label: "Zabava" },
  { id: "education", label: "Edukacija" },
  { id: "health", label: "Zdravlje" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["id"];
export type Category = (typeof CATEGORIES)[number]["id"];

export const IDEA_STAGES = [
  { id: "concept", label: "Koncept" },
  { id: "prototype", label: "Prototip" },
  { id: "early-revenue", label: "Rani prihod" },
  { id: "scaling", label: "Skaliranje" },
] as const;

export const IDEA_STATUSES = [
  {
    id: "pending",
    label: "Na čekanju",
    color: "text-yellow-700 bg-yellow-100 border-yellow-300",
  },
  {
    id: "reviewed",
    label: "Pregledano",
    color: "text-blue-700 bg-blue-100 border-blue-300",
  },
  {
    id: "contacted",
    label: "Kontaktirano",
    color: "text-purple-700 bg-purple-100 border-purple-300",
  },
  {
    id: "funded",
    label: "Finansirano",
    color: "text-green-700 bg-green-100 border-green-300",
  },
  {
    id: "rejected",
    label: "Odbijeno",
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
