import { Form, useActionData, useNavigation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import type { Route } from "./+types/evaluate";
import { evaluateIdea } from "~/lib/openai.server";
import type { EvaluateResult } from "~/lib/types";
import {
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_STEP,
  BUSINESS_ZONES,
  type BusinessZone,
  type ZoneRating,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { ScoreRing } from "~/components/ui/score-ring";
import { CardSkeleton, ScoreSkeleton } from "~/components/ui/skeleton";
import { BudgetBreakdown } from "~/components/ui/budget-breakdown";
import { CyberpunkMap } from "~/components/ui/cyberpunk-map";
import {
  ZoneOverlays,
  ZONE_INTERACTIVE_LAYER_IDS,
} from "~/components/ui/zone-overlays";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Evaluiraj Svoju Ideju - MitroStart" },
    {
      name: "description",
      content: "Dobij AI evaluaciju tvoje poslovne ideje za Kosovsku Mitrovicu",
    },
  ];
}

export async function loader() {
  return {
    maptilerKey: process.env.MAPTILER_API_KEY || "",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const idea = formData.get("idea") as string;
  const audience = formData.get("audience") as string;
  const budget = Number(formData.get("budget"));
  const locationType = formData.get("locationType") as string;

  if (!idea || !audience || !budget || !locationType) {
    return { error: "Molimo popunite sva polja", result: null };
  }

  try {
    const result = await evaluateIdea(idea, audience, budget, locationType);
    return { error: null, result };
  } catch (e) {
    return {
      error: "Evaluacija nije uspjela. Pokušajte ponovo.",
      result: null,
    };
  }
}

const ZONE_RATING_LABELS = {
  green: {
    label: "Visoki Potencijal",
    bg: "bg-green-500/15",
    text: "text-green-400",
    border: "border-green-500/30",
    dot: "bg-green-500",
  },
  yellow: {
    label: "Umereni Potencijal",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  red: {
    label: "Slaba Lokacija",
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
} as const;

export default function Evaluate({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [budget, setBudget] = useState(5000);
  const [activeZone, setActiveZone] = useState<BusinessZone | null>(null);
  const result = actionData?.result as EvaluateResult | null;
  const error = actionData?.error as string | null;

  const handleZoneClick = useCallback((zone: BusinessZone) => {
    setActiveZone(zone);
  }, []);

  const getEffectiveRating = (zoneId: string): ZoneRating => {
    const r = result?.zoneRatings?.[zoneId];
    if (r === "green" || r === "yellow" || r === "red") return r;
    return BUSINESS_ZONES.find((z) => z.id === zoneId)?.rating ?? "yellow";
  };

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
            Mod Evaluacije
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Evaluiraj Svoju{" "}
            <span className="text-tertiary">Poslovnu Ideju</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Opišite vaš koncept i pustite AI da analizira potencijal u Mitrovici
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
                Vaša Poslovna Ideja
              </label>
              <textarea
                name="idea"
                rows={4}
                required
                placeholder="Opišite vašu poslovnu ideju detaljno. Koji proizvod ili uslugu nudite? Koji problem rješava?"
                className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all resize-none"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ciljna Publika
              </label>
              <input
                type="text"
                name="audience"
                required
                placeholder="npr. Studenti 18-25 godina, Mladi profesionalci, Lokalne porodice"
                className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
              />
            </div>

            {/* Budget Slider */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Dostupan budzet:{" "}
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
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-primary/10 accent-tertiary"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>{BUDGET_MIN.toLocaleString()} EUR</span>
                <span>{BUDGET_MAX.toLocaleString()} EUR</span>
              </div>
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Tip Lokacije
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "physical", label: "Fizička Lokacija" },
                  { value: "online", label: "Online / Kućni" },
                  { value: "both", label: "Oboje (Fizička + Online)" },
                ].map((opt) => (
                  <label key={opt.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      value={opt.value}
                      required
                      className="peer sr-only"
                      defaultChecked={opt.value === "physical"}
                    />
                    <div className="px-4 py-2 rounded-xl text-sm font-medium border border-border-subtle text-text-secondary peer-checked:border-tertiary/50 peer-checked:bg-tertiary/10 peer-checked:text-tertiary transition-all hover:bg-primary/5">
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full bg-tertiary hover:bg-tertiary-light shadow-tertiary/25 hover:shadow-tertiary/40 py-4 text-base"
            >
              {isSubmitting ? "Analiziranje..." : "Evaluiraj Moju Ideju"}
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
                  label="Ukupni Rezultat"
                />
              </div>

              {/* Score Breakdown */}
              <div className="glass rounded-2xl p-6 mb-6">
                <h3 className="font-bold mb-4">Pregled Rezultata</h3>
                <div className="space-y-3">
                  {[
                    { key: "marketDemand", label: "Potražnja Tržišta" },
                    {
                      key: "competition",
                      label: "Prednost pred Konkurencijom",
                    },
                    { key: "budgetFit", label: "Prilagođenost Budžetu" },
                    { key: "locationFit", label: "Prilagođenost Lokaciji" },
                    { key: "scalability", label: "Skalabilnost" },
                  ].map((item, i) => {
                    const score =
                      result.scores[item.key as keyof typeof result.scores];
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
                        <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
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

              {/* Budget Allocation */}
              {result.budgetBreakdown && (
                <motion.div
                  className="glass rounded-2xl p-6 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  <h3 className="font-bold mb-1">Raspodjela Budžeta</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Kako bi vaših €{budget.toLocaleString()} bilo raspodijeljeno
                  </p>
                  <BudgetBreakdown
                    breakdown={result.budgetBreakdown}
                    delay={0.9}
                  />
                </motion.div>
              )}

              {/* Analysis Sections */}
              <div className="grid gap-4">
                <AnalysisCard
                  title="Analiza Tržišta"
                  content={result.marketAnalysis}
                  icon="chart"
                  delay={1}
                />
                <AnalysisCard
                  title="Pejzaž Konkurencije"
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
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs">
                      +
                    </span>
                    Snage
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-green-700 mt-0.5">&#10003;</span>
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
                    <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs">
                      !
                    </span>
                    Slabosti
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-amber-700 mt-0.5">&#9888;</span>
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
                    Preporuke
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
                        Ideje za Pivot
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

              {/* ── Zone Suitability Map ── */}
              {result.zoneRatings && loaderData?.maptilerKey && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <div className="glass rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4">
                      <h3 className="font-bold text-lg mb-1">
                        Mapa Lokacijskih Šansi
                      </h3>
                      <p className="text-sm text-text-secondary mb-3">
                        AI je ocijenio svaku zonu Mitrovice za vašu poslovnu
                        ideju. Kliknite na zonu za detalje.
                      </p>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        {(["green", "yellow", "red"] as const).map((r) => (
                          <span key={r} className="flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${ZONE_RATING_LABELS[r].dot}`}
                            />
                            <span className="text-text-secondary">
                              {ZONE_RATING_LABELS[r].label}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Map */}
                    <div className="relative" style={{ height: 420 }}>
                      <CyberpunkMap
                        maptilerKey={loaderData.maptilerKey}
                        className="w-full h-full"
                        minHeight={420}
                        interactiveLayerIds={ZONE_INTERACTIVE_LAYER_IDS}
                      >
                        <ZoneOverlays
                          onZoneClick={handleZoneClick}
                          zoneRatings={
                            result.zoneRatings as Record<
                              string,
                              "green" | "yellow" | "red"
                            >
                          }
                        />
                      </CyberpunkMap>

                      {/* Active zone info card */}
                      <div className="absolute top-3 right-3 w-64 z-20 pointer-events-none">
                        <AnimatePresence mode="wait">
                          {activeZone && (
                            <motion.div
                              key={activeZone.id}
                              className={`glass rounded-2xl p-4 border pointer-events-auto ${
                                ZONE_RATING_LABELS[
                                  getEffectiveRating(activeZone.id)
                                ].border
                              }`}
                              initial={{ opacity: 0, y: -8, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.97 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span
                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1 ${
                                      ZONE_RATING_LABELS[
                                        getEffectiveRating(activeZone.id)
                                      ].text
                                    }`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        ZONE_RATING_LABELS[
                                          getEffectiveRating(activeZone.id)
                                        ].dot
                                      }`}
                                    />
                                    {
                                      ZONE_RATING_LABELS[
                                        getEffectiveRating(activeZone.id)
                                      ].label
                                    }
                                  </span>
                                  <h4 className="font-bold text-sm">
                                    {activeZone.name}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveZone(null)}
                                  className="text-text-secondary hover:text-white transition-colors text-lg leading-none cursor-pointer ml-2 shrink-0"
                                >
                                  ×
                                </button>
                              </div>
                              <p className="text-xs text-text-secondary mb-2">
                                {activeZone.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {activeZone.highlights.map((h) => (
                                  <span
                                    key={h}
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      ZONE_RATING_LABELS[
                                        getEffectiveRating(activeZone.id)
                                      ].bg
                                    } ${
                                      ZONE_RATING_LABELS[
                                        getEffectiveRating(activeZone.id)
                                      ].text
                                    }`}
                                  >
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
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
