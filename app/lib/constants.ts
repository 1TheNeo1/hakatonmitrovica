export const MITROVICA_CENTER = {
  lat: 42.8833,
  lng: 20.8667,
};

export const DEFAULT_ZOOM = 14;

export type ZoneRating = "green" | "yellow" | "red";

export interface BusinessZone {
  id: string;
  name: string;
  description: string;
  rating: ZoneRating;
  color: string;
  fillColor: string;
  highlights: string[];
  paths: Array<{ lat: number; lng: number }>;
}

export const BUSINESS_ZONES: BusinessZone[] = [
  {
    id: "city-center",
    name: "City Center – Pedestrian Zone",
    description: "Highest foot traffic in the city. Prime retail, café, and services location.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: ["High foot traffic", "Strong purchasing power", "Excellent visibility"],
    paths: [
      { lat: 42.8855, lng: 20.8620 },
      { lat: 42.8855, lng: 20.8710 },
      { lat: 42.8815, lng: 20.8710 },
      { lat: 42.8815, lng: 20.8620 },
    ],
  },
  {
    id: "university-quarter",
    name: "University Quarter",
    description: "Student-dense area near Mitrovica faculties. Great for tech startups, tutoring, food, and creative services.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: ["Large student population", "Low competition", "Tech & education demand"],
    paths: [
      { lat: 42.8800, lng: 20.8540 },
      { lat: 42.8800, lng: 20.8625 },
      { lat: 42.8755, lng: 20.8625 },
      { lat: 42.8755, lng: 20.8540 },
    ],
  },
  {
    id: "main-bazaar",
    name: "Main Bazaar & Market",
    description: "Traditional market hub. Ideal for retail, food stalls, wholesale, and mixed businesses.",
    rating: "green",
    color: "#22c55e",
    fillColor: "#22c55e",
    highlights: ["Daily market activity", "Mixed demographics", "Strong local demand"],
    paths: [
      { lat: 42.8835, lng: 20.8710 },
      { lat: 42.8835, lng: 20.8790 },
      { lat: 42.8795, lng: 20.8790 },
      { lat: 42.8795, lng: 20.8710 },
    ],
  },
  {
    id: "south-residential",
    name: "South Residential-Commercial",
    description: "Growing mixed-use area with moderate demand. Good for local services, health & wellness, delivery startups.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: ["Growing population", "Underserved market", "Lower rent costs"],
    paths: [
      { lat: 42.8755, lng: 20.8580 },
      { lat: 42.8755, lng: 20.8720 },
      { lat: 42.8700, lng: 20.8720 },
      { lat: 42.8700, lng: 20.8580 },
    ],
  },
  {
    id: "west-corridor",
    name: "Western Commercial Corridor",
    description: "Emerging strip along main western road. Suitable for auto services, wholesale, and delivery hubs.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: ["Road-side visibility", "Growing traffic", "Affordable space"],
    paths: [
      { lat: 42.8870, lng: 20.8480 },
      { lat: 42.8870, lng: 20.8590 },
      { lat: 42.8800, lng: 20.8590 },
      { lat: 42.8800, lng: 20.8480 },
    ],
  },
  {
    id: "north-center",
    name: "North Mitrovica Center",
    description: "Commercial activity exists but cross-community dynamics add complexity. Niche opportunities for bold entrepreneurs.",
    rating: "yellow",
    color: "#eab308",
    fillColor: "#eab308",
    highlights: ["Underserved niches", "Cross-community potential", "Lower competition"],
    paths: [
      { lat: 42.8970, lng: 20.8590 },
      { lat: 42.8970, lng: 20.8760 },
      { lat: 42.8900, lng: 20.8760 },
      { lat: 42.8900, lng: 20.8590 },
    ],
  },
  {
    id: "industrial-north",
    name: "Northern Industrial Zone",
    description: "Old heavy industrial area with low consumer traffic. Not recommended for retail or services.",
    rating: "red",
    color: "#ef4444",
    fillColor: "#ef4444",
    highlights: ["Low foot traffic", "Industrial land use", "Poor consumer access"],
    paths: [
      { lat: 42.9080, lng: 20.8540 },
      { lat: 42.9080, lng: 20.8760 },
      { lat: 42.8980, lng: 20.8760 },
      { lat: 42.8980, lng: 20.8540 },
    ],
  },
  {
    id: "east-outskirts",
    name: "Eastern Outskirts",
    description: "Low-density suburban fringe with minimal infrastructure. Very challenging for most business types.",
    rating: "red",
    color: "#ef4444",
    fillColor: "#ef4444",
    highlights: ["Sparse population", "Poor infrastructure", "Limited access"],
    paths: [
      { lat: 42.8860, lng: 20.8800 },
      { lat: 42.8860, lng: 20.8960 },
      { lat: 42.8770, lng: 20.8960 },
      { lat: 42.8770, lng: 20.8800 },
    ],
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

export const TUTORIAL_TYPES = [
  { id: "blog", label: "Blog" },
  { id: "video", label: "Video" },
  { id: "resource", label: "Resurs" },
] as const;

export type TutorialTypeId = (typeof TUTORIAL_TYPES)[number]["id"];
