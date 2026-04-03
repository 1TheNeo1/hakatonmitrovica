/**
 * POI category constants shared between server (overpass.server.ts) and
 * client (poi-layer.tsx). NOT a server-only file.
 */

export const POI_CATEGORY_COLORS: Record<string, string> = {
  cafe: "#f59e0b", // amber
  restaurant: "#f97316", // orange
  shop: "#06b6d4", // cyan
  school: "#818cf8", // indigo-light
  office: "#a78bfa", // violet
  bank: "#22c55e", // green
  pharmacy: "#ef4444", // red
  hotel: "#ec4899", // pink
  healthcare: "#f43f5e", // rose
  entertainment: "#e879f9", // fuchsia
};

export const POI_CATEGORY_LABELS: Record<string, string> = {
  cafe: "Cafe",
  restaurant: "Restaurant",
  shop: "Shop",
  school: "Education",
  office: "Office",
  bank: "Bank",
  pharmacy: "Pharmacy",
  hotel: "Hotel",
  healthcare: "Healthcare",
  entertainment: "Entertainment",
};
