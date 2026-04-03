export interface BusinessSuggestion {
  name: string;
  category: string;
  description: string;
  estimatedBudget: { min: number; max: number };
  viabilityScore: number;
  reasoning: string;
  tips: string[];
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
}
