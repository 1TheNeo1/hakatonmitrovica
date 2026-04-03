import { Form, useActionData, useNavigation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import type { Route } from "./+types/evaluate";
import { evaluateIdea } from "~/lib/openai.server";
import type { EvaluateResult } from "~/lib/types";
import { BUDGET_MIN, BUDGET_MAX, BUDGET_STEP } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { ScoreRing } from "~/components/ui/score-ring";
import { CardSkeleton, ScoreSkeleton } from "~/components/ui/skeleton";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Evaluate Your Idea - MitroStart" },
    {
      name: "description",
      content: "Get AI-powered evaluation of your business idea for Kosovska Mitrovica",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const idea = formData.get("idea") as string;
  const audience = formData.get("audience") as string;
  const budget = Number(formData.get("budget"));
  const locationType = formData.get("locationType") as string;

  if (!idea || !audience || !budget || !locationType) {
    return { error: "Please fill in all fields", result: null };
  }

  try {
    const result = await evaluateIdea(idea, audience, budget, locationType);
    return { error: null, result };
  } catch (e) {
    return { error: "Failed to evaluate idea. Please try again.", result: null };
  }
}

export default function Evaluate({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [budget, setBudget] = useState(5000);
  const result = actionData?.result as EvaluateResult | null;
  const error = actionData?.error as string | null;

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-xs font-medium text-tertiary uppercase tracking-widest">
            Evaluate Mode
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Evaluate Your{" "}
            <span className="text-tertiary">Business Idea</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Describe your concept and let AI analyze its potential in Mitrovica
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Form method="post" className="space-y-6">
            {/* Business Idea */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Business Idea
              </label>
              <textarea
                name="idea"
                rows={4}
                required
                placeholder="Describe your business idea in detail. What product or service will you offer? What problem does it solve?"
                className="w-full rounded-xl bg-white/5 border border-border-subtle px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all resize-none"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Audience
              </label>
              <input
                type="text"
                name="audience"
                required
                placeholder="e.g., University students aged 18-25, Young professionals, Local families"
                className="w-full rounded-xl bg-white/5 border border-border-subtle px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
              />
            </div>

            {/* Budget Slider */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Budget:{" "}
                <span className="text-tertiary font-bold">
                  {budget.toLocaleString()} EUR
                </span>
              </label>
              <input
                type="range"
                name="budget"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-tertiary"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>{BUDGET_MIN.toLocaleString()} EUR</span>
                <span>{BUDGET_MAX.toLocaleString()} EUR</span>
              </div>
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Location Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "physical", label: "Physical Location" },
                  { value: "online", label: "Online / Home-based" },
                  { value: "both", label: "Both (Physical + Online)" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="locationType"
                      value={opt.value}
                      required
                      className="peer sr-only"
                      defaultChecked={opt.value === "physical"}
                    />
                    <div className="px-4 py-2 rounded-xl text-sm font-medium border border-border-subtle text-text-secondary peer-checked:border-tertiary/50 peer-checked:bg-tertiary/10 peer-checked:text-tertiary transition-all hover:bg-white/5">
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full bg-tertiary hover:bg-tertiary-light shadow-tertiary/25 hover:shadow-tertiary/40 py-4 text-base"
            >
              {isSubmitting ? "Analyzing..." : "Evaluate My Idea"}
            </Button>
          </Form>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              className="mt-12 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-center">
                <ScoreSkeleton />
              </div>
              <div className="grid gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !isSubmitting && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Overall Score */}
              <div className="flex justify-center mb-10">
                <ScoreRing
                  score={result.overallScore}
                  size={160}
                  strokeWidth={10}
                  label="Overall Score"
                />
              </div>

              {/* Score Breakdown */}
              <div className="glass rounded-2xl p-6 mb-6">
                <h3 className="font-bold mb-4">Score Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { key: "marketDemand", label: "Market Demand" },
                    { key: "competition", label: "Competition Edge" },
                    { key: "budgetFit", label: "Budget Fit" },
                    { key: "locationFit", label: "Location Fit" },
                    { key: "scalability", label: "Scalability" },
                  ].map((item, i) => {
                    const score =
                      result.scores[
                        item.key as keyof typeof result.scores
                      ];
                    return (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text-secondary">
                            {item.label}
                          </span>
                          <span className="font-medium">{score}/100</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor:
                                score >= 70
                                  ? "#22c55e"
                                  : score >= 40
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{
                              duration: 1,
                              delay: 0.7 + i * 0.1,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Analysis Sections */}
              <div className="grid gap-4">
                <AnalysisCard
                  title="Market Analysis"
                  content={result.marketAnalysis}
                  icon="chart"
                  delay={1}
                />
                <AnalysisCard
                  title="Competitor Landscape"
                  content={result.competitorLandscape}
                  icon="users"
                  delay={1.1}
                />

                {/* Strengths */}
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">
                      +
                    </span>
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-green-400 mt-0.5">&#10003;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Weaknesses */}
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs">
                      !
                    </span>
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-amber-400 mt-0.5">&#9888;</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Recommendations */}
                <motion.div
                  className="glass rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                >
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                      &#10148;
                    </span>
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((r, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-primary mt-0.5">&#8250;</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Pivot Suggestions */}
                {result.pivotSuggestions &&
                  result.pivotSuggestions.length > 0 && (
                    <motion.div
                      className="glass rounded-2xl p-6 border-tertiary/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 }}
                    >
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary text-xs">
                          &#8634;
                        </span>
                        Pivot Ideas
                      </h3>
                      <ul className="space-y-2">
                        {result.pivotSuggestions.map((p, i) => (
                          <li
                            key={i}
                            className="text-sm text-text-secondary flex items-start gap-2"
                          >
                            <span className="text-tertiary mt-0.5">
                              &#10148;
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnalysisCard({
  title,
  content,
  icon,
  delay,
}: {
  title: string;
  content: string;
  icon: string;
  delay: number;
}) {
  return (
    <motion.div
      className="glass rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{content}</p>
    </motion.div>
  );
}
