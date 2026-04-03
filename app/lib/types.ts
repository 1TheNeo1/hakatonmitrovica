// --- Auth & User types ---

export type UserRole = "admin" | "investor" | "applicant";
export type IdeaStage = "concept" | "prototype" | "early-revenue" | "scaling";
export type TutorialType = "blog" | "video" | "resource";

export interface Tutorial {
  id: string;
  authorId: string;
  title: string;
  summary: string;
  body: string | null;
  type: TutorialType;
  category: string;
  videoUrl: string | null;
  resourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}
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

// --- Investor AI types ---

export interface InvestorProfile {
  name: string;
  organization: string | null;
  investmentFocus: string[];
  investmentMin: number | null;
  investmentMax: number | null;
}

export interface IdeaInsightResult {
  investmentScore: number;
  keyBenefits: string[];
  riskFactors: string[];
  marketOpportunity: string;
  returnPotential: string;
  recommendation: string;
  alignmentNote: string;
}

export interface RankedIdea {
  ideaId: string;
  rank: number;
  title: string;
  alignmentScore: number;
  reasoning: string;
  topBenefit: string;
}

export interface RankIdeasResult {
  rankedIdeas: RankedIdea[];
  summaryNote: string;
}

export interface ComparisonDimension {
  label: string;
  scores: Record<string, number>;
  winner: string;
}

export interface IdeaComparisonEntry {
  ideaId: string;
  title: string;
  investmentScore: number;
  summary: string;
}

export interface CompareIdeasResult {
  winner: string;
  winnerReason: string;
  ideas: IdeaComparisonEntry[];
  dimensions: ComparisonDimension[];
  recommendation: string;
}

// --- Community Hub types ---

export type ForumCategory = "pitanje" | "diskusija" | "resurs" | "objava";

export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: ForumCategory;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorRole?: string;
}

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  authorName?: string;
  authorRole?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  senderName?: string;
}

export interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
