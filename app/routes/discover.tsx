import { Form, useActionData, useNavigation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Map, AdvancedMarker, type MapMouseEvent } from "@vis.gl/react-google-maps";
import { useState, useCallback } from "react";
import type { Route } from "./+types/discover";
import { analyzeLocation } from "~/lib/openai.server";
import type { DiscoverResult } from "~/lib/types";
import {
  MITROVICA_CENTER,
  DEFAULT_ZOOM,
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_STEP,
  BUSINESS_TYPES,
  CATEGORIES,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { ScoreRing } from "~/components/ui/score-ring";
import { CardSkeleton } from "~/components/ui/skeleton";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Discover Opportunities - MitroStart" },
    {
      name: "description",
      content:
        "Find the best business opportunities in Kosovska Mitrovica based on location and budget",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const budget = Number(formData.get("budget"));
  const businessType = formData.get("businessType") as string;
  const categoriesRaw = formData.get("categories") as string;
  const categories = categoriesRaw ? categoriesRaw.split(",").filter(Boolean) : [];

  if (!lat || !lng || !budget || !businessType) {
    return {
      error: "Please select a location on the map and fill in all fields",
      result: null,
    };
  }

  try {
    const result = await analyzeLocation(lat, lng, budget, businessType, categories);
    return { error: null, result };
  } catch (e) {
    return {
      error: "Failed to analyze location. Please try again.",
      result: null,
    };
  }
}

export default function Discover({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [budget, setBudget] = useState(5000);
  const [businessType, setBusinessType] = useState("physical");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const result = actionData?.result as DiscoverResult | null;
  const error = actionData?.error as string | null;

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (e.detail.latLng) {
      setSelectedLocation({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng,
      });
    }
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-xs font-medium text-secondary uppercase tracking-widest">
            Discover Mode
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Discover{" "}
            <span className="text-secondary">Opportunities</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Click on the map to pick a location, set your budget, and let AI find
            the best business for that spot
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <motion.div
            className="lg:col-span-3 glass rounded-2xl overflow-hidden"
            style={{ minHeight: 400 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Map
              defaultCenter={MITROVICA_CENTER}
              defaultZoom={DEFAULT_ZOOM}
              gestureHandling="greedy"
              disableDefaultUI={true}
              onClick={handleMapClick}
              mapId="mitrostart-dark"
              className="w-full h-full min-h-[400px]"
              colorScheme="DARK"
            >
              {selectedLocation && (
                <AdvancedMarker position={selectedLocation}>
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-secondary border-2 border-white shadow-lg" />
                    <div className="absolute inset-0 w-6 h-6 rounded-full bg-secondary/50 animate-ping" />
                  </div>
                </AdvancedMarker>
              )}
            </Map>
          </motion.div>

          {/* Form Panel */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Form method="post" className="glass rounded-2xl p-6 space-y-5">
              {/* Hidden location fields */}
              <input
                type="hidden"
                name="lat"
                value={selectedLocation?.lat || ""}
              />
              <input
                type="hidden"
                name="lng"
                value={selectedLocation?.lng || ""}
              />
              <input
                type="hidden"
                name="categories"
                value={selectedCategories.join(",")}
              />

              {/* Selected Location */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selected Location
                </label>
                <div
                  className={`rounded-xl px-4 py-3 text-sm border ${
                    selectedLocation
                      ? "bg-secondary/5 border-secondary/30 text-secondary"
                      : "bg-white/5 border-border-subtle text-text-secondary"
                  }`}
                >
                  {selectedLocation
                    ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                    : "Click on the map to select a location"}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Budget:{" "}
                  <span className="text-secondary font-bold">
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
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-secondary"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>{BUDGET_MIN.toLocaleString()}</span>
                  <span>{BUDGET_MAX.toLocaleString()}</span>
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map((bt) => (
                    <label key={bt.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="businessType"
                        value={bt.id}
                        checked={businessType === bt.id}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="peer sr-only"
                      />
                      <div className="px-3 py-2 rounded-xl text-xs font-medium border border-border-subtle text-text-secondary text-center peer-checked:border-secondary/50 peer-checked:bg-secondary/10 peer-checked:text-secondary transition-all hover:bg-white/5">
                        {bt.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Categories{" "}
                  <span className="text-text-secondary font-normal">
                    (optional)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        selectedCategories.includes(cat.id)
                          ? "border-secondary/50 bg-secondary/10 text-secondary"
                          : "border-border-subtle text-text-secondary hover:bg-white/5"
                      }`}
                    >
                      {cat.label}
                    </button>
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
                variant="secondary"
                isLoading={isSubmitting}
                disabled={!selectedLocation}
                className="w-full py-4 text-base"
              >
                {isSubmitting
                  ? "Analyzing Location..."
                  : "Analyze This Location"}
              </Button>
            </Form>
          </motion.div>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !isSubmitting && (
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Area Analysis */}
              <motion.div
                className="glass rounded-2xl p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold mb-3">Area Analysis</h2>
                <p className="text-text-secondary text-sm mb-4">
                  {result.summary}
                </p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      result.areaAnalysis.footTraffic === "high"
                        ? "bg-green-500/15 text-green-400"
                        : result.areaAnalysis.footTraffic === "medium"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    Foot Traffic:{" "}
                    {result.areaAnalysis.footTraffic.charAt(0).toUpperCase() +
                      result.areaAnalysis.footTraffic.slice(1)}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1 text-text-secondary">
                      Competition
                    </h4>
                    <p className="text-text-secondary/80">
                      {result.areaAnalysis.competition}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-text-secondary">
                      Demographics
                    </h4>
                    <p className="text-text-secondary/80">
                      {result.areaAnalysis.demographics}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-400 text-sm">
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {result.areaAnalysis.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-sm text-text-secondary flex items-start gap-2"
                        >
                          <span className="text-green-400">&#10003;</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-amber-400 text-sm">
                      Risks
                    </h4>
                    <ul className="space-y-1">
                      {result.areaAnalysis.risks.map((r, i) => (
                        <li
                          key={i}
                          className="text-sm text-text-secondary flex items-start gap-2"
                        >
                          <span className="text-amber-400">&#9888;</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Business Suggestions */}
              <h2 className="text-xl font-bold mb-4">
                Top Business Suggestions
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    className="glass glass-hover rounded-2xl p-6 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">
                          {suggestion.name}
                        </h3>
                        <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                          {suggestion.category}
                        </span>
                      </div>
                      <ScoreRing
                        score={suggestion.viabilityScore}
                        size={60}
                        strokeWidth={5}
                      />
                    </div>

                    <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                      {suggestion.description}
                    </p>

                    <div className="text-sm mb-3">
                      <span className="text-text-secondary">Budget: </span>
                      <span className="font-medium">
                        {suggestion.estimatedBudget.min.toLocaleString()} -{" "}
                        {suggestion.estimatedBudget.max.toLocaleString()} EUR
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary mb-3 italic">
                      {suggestion.reasoning}
                    </p>

                    <div>
                      <h4 className="text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider">
                        Tips
                      </h4>
                      <ul className="space-y-1">
                        {suggestion.tips.map((tip, j) => (
                          <li
                            key={j}
                            className="text-xs text-text-secondary flex items-start gap-1.5"
                          >
                            <span className="text-primary mt-0.5">
                              &#8250;
                            </span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
