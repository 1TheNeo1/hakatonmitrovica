import OpenAI from "openai";
import {
  getDiscoverPrompt,
  getEvaluatePrompt,
  getIdeaInsightPrompt,
  getRankIdeasPrompt,
  getCompareIdeasPrompt,
} from "./prompts.server";
import type {
  DiscoverResult,
  EvaluateResult,
  IdeaInsightResult,
  RankIdeasResult,
  CompareIdeasResult,
  InvestorProfile,
  Idea,
} from "./types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a business consultant specializing in Kosovska Mitrovica, Kosovo. You have deep knowledge of the local economy, demographics, and business landscape.

Key facts about Kosovska Mitrovica:
- Population: ~70,000 in the municipality
- University city (University of Pristina temporary seat) with a large young population
- Divided city with both Albanian and Serbian communities, creating unique market dynamics
- Growing entrepreneurship scene supported by EU programs and international organizations
- Key industries: education, services, small retail, food & beverage, agriculture
- Increasing internet penetration and tech adoption among youth
- Infrastructure improvements ongoing, with new roads and public spaces
- Cost of living and business costs significantly lower than Western Europe
- Strong cafe/restaurant culture, social gathering importance
- Growing demand for modern services (delivery, tech, e-commerce)

Always provide practical, actionable advice tailored to the local context. Be encouraging but realistic. All monetary values should be in EUR.`;

export async function analyzeLocation(
  lat: number,
  lng: number,
  budget: number,
  businessType: string,
  categories: string[]
): Promise<DiscoverResult> {
  const userPrompt = getDiscoverPrompt(lat, lng, budget, businessType, categories);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as DiscoverResult;
}

export async function evaluateIdea(
  idea: string,
  audience: string,
  budget: number,
  locationType: string
): Promise<EvaluateResult> {
  const userPrompt = getEvaluatePrompt(idea, audience, budget, locationType);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as EvaluateResult;
}

export async function analyzeIdeaForInvestor(
  idea: Idea,
  profile: InvestorProfile
): Promise<IdeaInsightResult> {
  const userPrompt = getIdeaInsightPrompt(idea, profile);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as IdeaInsightResult;
}

export async function rankIdeasForInvestor(
  ideas: Idea[],
  profile: InvestorProfile
): Promise<RankIdeasResult> {
  const userPrompt = getRankIdeasPrompt(ideas, profile);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as RankIdeasResult;
}

export async function compareIdeasForInvestor(
  ideas: Idea[],
  profile: InvestorProfile
): Promise<CompareIdeasResult> {
  const userPrompt = getCompareIdeasPrompt(ideas, profile);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as CompareIdeasResult;
}
