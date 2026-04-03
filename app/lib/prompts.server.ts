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
      "tips": ["tip 1", "tip 2", "tip 3"]
    }
  ]
}

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
  "pivotSuggestions": ["pivot idea 1", "pivot idea 2"]
}

Be honest but constructive. If the idea needs work, explain why and offer concrete pivot suggestions. Consider the local market size, purchasing power, cultural factors, and infrastructure.`;
}
