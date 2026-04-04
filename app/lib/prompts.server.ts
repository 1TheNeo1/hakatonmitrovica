import type { Idea, InvestorProfile } from "./types";

export function getDiscoverPrompt(
  lat: number,
  lng: number,
  budget: number,
  businessType: string,
  categories: string[]
): string {
  const categoryStr = categories.length > 0 ? categories.join(", ") : "any category";

  return `Analyze this location in Kosovska Mitrovica for business opportunities.

Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}
Budget: ${budget} EUR
Business type preference: ${businessType}
Preferred categories: ${categoryStr}

Based on your knowledge of this area of Kosovska Mitrovica, suggest the best business opportunities.

Respond with a JSON object in this exact format:
{
  "summary": "A 2-3 sentence overview of the location's business potential",
  "areaAnalysis": {
    "footTraffic": "low" | "medium" | "high",
    "competition": "Brief analysis of existing competition in the area",
    "demographics": "Who lives/works/visits this area",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "risks": ["risk 1", "risk 2"]
  },
  "suggestions": [
    {
      "name": "Business name/concept",
      "category": "Category",
      "description": "What the business does and why it works here",
      "estimatedBudget": { "min": number, "max": number },
      "viabilityScore": number (1-100),
      "reasoning": "Why this business would succeed at this location",
      "tips": ["tip 1", "tip 2", "tip 3"],
      "budgetBreakdown": {
        "items": [
          {
            "category": "Rent & Deposit",
            "percentage": number,
            "amount": number,
            "description": "one-line note"
          }
        ],
        "monthlyRunningCost": number
      }
    }
  ]
}

For each suggestion's budgetBreakdown: provide 5-7 items covering categories such as Rent & Deposit, Equipment, Inventory/Stock, Marketing, Staff/Salaries, Working Capital, and Other Setup Costs as appropriate. Percentages must sum to 100. Amounts must be consistent with the estimatedBudget midpoint. monthlyRunningCost is the estimated ongoing monthly operating cost in EUR.

Provide 3-5 business suggestions, sorted by viability score (highest first). Keep budgets realistic for Kosovo. Be specific about the location context.`;
}

export function getEvaluatePrompt(
  idea: string,
  audience: string,
  budget: number,
  locationType: string
): string {
  return `Evaluate this business idea for Kosovska Mitrovica, Kosovo.

Business Idea: ${idea}
Target Audience: ${audience}
Available Budget: ${budget} EUR
Location Type: ${locationType}

Provide a thorough evaluation of this business idea in the context of Kosovska Mitrovica.

Respond with a JSON object in this exact format:
{
  "overallScore": number (1-100),
  "scores": {
    "marketDemand": number (1-100),
    "competition": number (1-100, higher = less competition = better),
    "budgetFit": number (1-100, how well the budget matches the needs),
    "locationFit": number (1-100, how well it fits Mitrovica),
    "scalability": number (1-100)
  },
  "marketAnalysis": "Detailed analysis of market demand in Mitrovica for this idea",
  "competitorLandscape": "Who are the existing competitors and how saturated is the market",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "pivotSuggestions": ["pivot idea 1", "pivot idea 2"],
  "budgetBreakdown": {
    "items": [
      {
        "category": "Rent & Deposit",
        "percentage": number,
        "amount": number,
        "description": "one-line note"
      }
    ],
    "monthlyRunningCost": number
  },
  "zoneRatings": {
    "north-main-square": "green or yellow or red",
    "bridge-commercial": "green or yellow or red",
    "north-bazaar": "green or yellow or red",
    "north-residential-west": "green or yellow or red",
    "north-residential-east": "green or yellow or red",
    "north-upper-center": "green or yellow or red",
    "industrial-northwest": "green or yellow or red",
    "far-northeast": "green or yellow or red"
  }
}

For the budgetBreakdown: provide 5-7 items covering categories such as Rent & Deposit, Equipment, Inventory/Stock, Marketing, Staff/Salaries, Working Capital, and Other Setup Costs as appropriate. Percentages must sum to 100. Amounts must reflect how the available budget (${budget} EUR) would be allocated. monthlyRunningCost is the estimated ongoing monthly operating cost in EUR.

For zoneRatings: rate each of the 8 zone keys based on how suitable that zone of Kosovska Mitrovica is for THIS specific business idea. Use exactly the string "green", "yellow", or "red" for each value.
- "green" = high potential (right demographics, good foot traffic, low competition for this niche)
- "yellow" = moderate potential (some fit but with challenges)
- "red" = poor fit (wrong demographics, too much competition, or wrong zone type)

Be honest but constructive. If the idea needs work, explain why and offer concrete pivot suggestions. Consider the local market size, purchasing power, cultural factors, and infrastructure.`;
}

export function getIdeaInsightPrompt(idea: Idea, profile: InvestorProfile): string {
  const focusStr = profile.investmentFocus.length > 0
    ? profile.investmentFocus.join(", ")
    : "any sector";
  const budgetStr = profile.investmentMin && profile.investmentMax
    ? `€${profile.investmentMin.toLocaleString()} – €${profile.investmentMax.toLocaleString()}`
    : "flexible";

  return `You are advising an investor on whether to invest in a startup idea from Kosovska Mitrovica, Kosovo.

INVESTOR PROFILE:
- Name: ${profile.name}
- Organization: ${profile.organization || "Independent investor"}
- Investment focus: ${focusStr}
- Investment range: ${budgetStr}

IDEA DETAILS:
- Title: ${idea.title}
- Description: ${idea.description}
- Category: ${idea.category}
- Stage: ${idea.stage}
- Funding needed: €${idea.fundingNeeded.toLocaleString()}
- Target market: ${idea.targetMarket}
- Team size: ${idea.teamSize}
${idea.problemSolved ? `- Problem solved: ${idea.problemSolved}` : ""}
${idea.competitiveAdvantage ? `- Competitive advantage: ${idea.competitiveAdvantage}` : ""}

Analyze this idea from the investor's perspective. Focus on investment potential, not just business viability.

Respond with a JSON object in this exact format:
{
  "investmentScore": number (1-100, overall investment attractiveness),
  "keyBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "riskFactors": ["risk 1", "risk 2", "risk 3"],
  "marketOpportunity": "2-3 sentences on the market size and growth potential in Mitrovica/Kosovo",
  "returnPotential": "1-2 sentences on expected return timeline and magnitude",
  "recommendation": "Clear 1-sentence recommendation: invest, pass, or watch",
  "alignmentNote": "1-2 sentences on how well this matches the investor's focus and budget range"
}`;
}

export function getRankIdeasPrompt(ideas: Idea[], profile: InvestorProfile): string {
  const focusStr = profile.investmentFocus.length > 0
    ? profile.investmentFocus.join(", ")
    : "any sector";
  const budgetStr = profile.investmentMin && profile.investmentMax
    ? `€${profile.investmentMin.toLocaleString()} – €${profile.investmentMax.toLocaleString()}`
    : "flexible";

  const ideasList = ideas.map((idea) =>
    `- ID: ${idea.id} | Title: ${idea.title} | Category: ${idea.category} | Stage: ${idea.stage} | Funding: €${idea.fundingNeeded.toLocaleString()} | Description: ${idea.description.slice(0, 120)}...`
  ).join("\n");

  return `You are helping an investor find the best startup ideas to invest in from Kosovska Mitrovica, Kosovo.

INVESTOR PROFILE:
- Name: ${profile.name}
- Organization: ${profile.organization || "Independent investor"}
- Investment focus: ${focusStr}
- Investment range: ${budgetStr}

AVAILABLE IDEAS:
${ideasList}

Rank the top 3 ideas that best match this investor's profile. Consider: alignment with their focus areas, funding amount compatibility, stage appropriateness, and market potential in Mitrovica.

Respond with a JSON object in this exact format:
{
  "rankedIdeas": [
    {
      "ideaId": "the exact id from the list above",
      "rank": 1,
      "title": "idea title",
      "alignmentScore": number (1-100, how well it matches the investor profile),
      "reasoning": "1-2 sentences explaining why this is a top pick for this investor",
      "topBenefit": "The single most compelling benefit for this investor"
    }
  ],
  "summaryNote": "1-2 sentences summarizing the investment landscape across all ideas"
}

Return exactly 3 ranked ideas (or fewer if less than 3 ideas exist). Sort by rank ascending (1 = best).`;
}

export function getCompareIdeasPrompt(ideas: Idea[], profile: InvestorProfile): string {
  const focusStr = profile.investmentFocus.length > 0
    ? profile.investmentFocus.join(", ")
    : "any sector";
  const budgetStr = profile.investmentMin && profile.investmentMax
    ? `€${profile.investmentMin.toLocaleString()} – €${profile.investmentMax.toLocaleString()}`
    : "flexible";

  const ideasDetail = ideas.map((idea) =>
    `ID: ${idea.id}
Title: ${idea.title}
Category: ${idea.category} | Stage: ${idea.stage} | Funding needed: €${idea.fundingNeeded.toLocaleString()}
Team size: ${idea.teamSize}
Description: ${idea.description}
Target market: ${idea.targetMarket}
${idea.problemSolved ? `Problem solved: ${idea.problemSolved}` : ""}
${idea.competitiveAdvantage ? `Competitive advantage: ${idea.competitiveAdvantage}` : ""}`
  ).join("\n\n---\n\n");

  const ideaIds = ideas.map((i) => `"${i.id}"`).join(", ");

  return `You are helping an investor compare startup ideas from Kosovska Mitrovica, Kosovo.

INVESTOR PROFILE:
- Investment focus: ${focusStr}
- Investment range: ${budgetStr}

IDEAS TO COMPARE:
${ideasDetail}

Compare these ideas head-to-head from the investor's perspective.

Respond with a JSON object in this exact format:
{
  "winner": "the ideaId of the best investment choice",
  "winnerReason": "1-2 sentences explaining why this idea wins overall",
  "ideas": [
    {
      "ideaId": "id",
      "title": "title",
      "investmentScore": number (1-100),
      "summary": "1 sentence investment summary"
    }
  ],
  "dimensions": [
    {
      "label": "Market Opportunity",
      "scores": { ${ideas.map((i) => `"${i.id}": number`).join(", ")} },
      "winner": "ideaId with highest score"
    },
    {
      "label": "Risk Level",
      "scores": { ${ideas.map((i) => `"${i.id}": number`).join(", ")} },
      "winner": "ideaId with LOWEST risk (highest score = lowest risk)"
    },
    {
      "label": "Return Potential",
      "scores": { ${ideas.map((i) => `"${i.id}": number`).join(", ")} },
      "winner": "ideaId with highest score"
    },
    {
      "label": "Team Strength",
      "scores": { ${ideas.map((i) => `"${i.id}": number`).join(", ")} },
      "winner": "ideaId with highest score"
    },
    {
      "label": "Innovation",
      "scores": { ${ideas.map((i) => `"${i.id}": number`).join(", ")} },
      "winner": "ideaId with highest score"
    }
  ],
  "recommendation": "2-3 sentence actionable recommendation for the investor"
}

Valid ideaIds are: ${ideaIds}. Use these exact IDs in your response.`;
}
