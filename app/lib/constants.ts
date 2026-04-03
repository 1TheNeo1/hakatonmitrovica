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
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
  {
    id: "reviewed",
    label: "Reviewed",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  {
    id: "contacted",
    label: "Contacted",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
  {
    id: "funded",
    label: "Funded",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  {
    id: "rejected",
    label: "Rejected",
    color: "text-red-400 bg-red-400/10 border-red-400/20",
  },
] as const;

export type IdeaStageId = (typeof IDEA_STAGES)[number]["id"];
export type IdeaStatusId = (typeof IDEA_STATUSES)[number]["id"];
