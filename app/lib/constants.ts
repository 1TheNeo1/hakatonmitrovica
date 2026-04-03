export const MITROVICA_CENTER = {
  lat: 42.8833,
  lng: 20.8667,
};

export const DEFAULT_ZOOM = 14;

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
