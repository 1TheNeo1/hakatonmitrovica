// --- Auth & User types ---

export type UserRole = "admin" | "investor" | "applicant";
export type IdeaStage = "concept" | "prototype" | "early-revenue" | "scaling";
export type IdeaStatus =
  | "pending"
  | "reviewed"
  | "contacted"
  | "funded"
  | "rejected";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string | null;
  investmentFocus: string | null;
  investmentMin: number | null;
  investmentMax: number | null;
  bio: string | null;
  linkedinUrl: string | null;
  phone: string | null;
  city: string | null;
  createdAt: string;
}

export interface Idea {
  id: string;
  applicantId: string;
  title: string;
  description: string;
  category: string;
  fundingNeeded: number;
  stage: IdeaStage;
  targetMarket: string;
  teamSize: number;
  problemSolved: string | null;
  competitiveAdvantage: string | null;
  status: IdeaStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  // joined fields
  applicantName?: string;
  applicantEmail?: string;
}

// --- AI types ---

export interface BudgetBreakdownItem {
  category: string;
  percentage: number;
  amount: number;
  description: string;
}

export interface BudgetBreakdown {
  items: BudgetBreakdownItem[];
  monthlyRunningCost: number;
}

export interface BusinessSuggestion {
  name: string;
  category: string;
  description: string;
  estimatedBudget: { min: number; max: number };
  viabilityScore: number;
  reasoning: string;
  tips: string[];
  budgetBreakdown?: BudgetBreakdown;
}

export interface AreaAnalysis {
  footTraffic: "low" | "medium" | "high";
  competition: string;
  demographics: string;
  strengths: string[];
  risks: string[];
}

export interface DiscoverResult {
  summary: string;
  suggestions: BusinessSuggestion[];
  areaAnalysis: AreaAnalysis;
}

export interface EvaluationScores {
  marketDemand: number;
  competition: number;
  budgetFit: number;
  locationFit: number;
  scalability: number;
}

export interface EvaluateResult {
  overallScore: number;
  scores: EvaluationScores;
  marketAnalysis: string;
  competitorLandscape: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  pivotSuggestions: string[];
  budgetBreakdown?: BudgetBreakdown;
}
