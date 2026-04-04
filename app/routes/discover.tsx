import { Form, useNavigation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import type { Route } from "./+types/discover";
import { analyzeLocation } from "~/lib/openai.server";
import { fetchMitrovicaPois } from "~/lib/overpass.server";
import type { DiscoverResult } from "~/lib/types";
import { BUSINESS_ZONES, type BusinessZone } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { ScoreRing } from "~/components/ui/score-ring";
import { CardSkeleton } from "~/components/ui/skeleton";
import { BudgetBreakdown } from "~/components/ui/budget-breakdown";
import {
  ZoneOverlays,
  ZONE_INTERACTIVE_LAYER_IDS,
} from "~/components/ui/zone-overlays";
import { CyberpunkMap, Marker } from "~/components/ui/cyberpunk-map";
import { PoiLayer, PoiCategoryFilter } from "~/components/ui/poi-layer";
import type { FeatureCollection, Point } from "geojson";

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

export async function loader() {
  const [pois] = await Promise.allSettled([fetchMitrovicaPois()]);
  return {
    maptilerKey: process.env.MAPTILER_API_KEY || "",
    pois:
      pois.status === "fulfilled"
        ? pois.value
        : ({
            type: "FeatureCollection",
            features: [],
          } as FeatureCollection<Point>),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const budget = Number(formData.get("budget"));
  const businessType = formData.get("businessType") as string;
  const categoriesRaw = formData.get("categories") as string;
  const categories = categoriesRaw
    ? categoriesRaw.split(",").filter(Boolean)
    : [];

  if (!lat || !lng || !budget || !businessType) {
    return {
      error: "Please select a location on the map and fill in all fields",
      result: null,
    };
  }

  try {
    const result = await analyzeLocation(
      lat,
      lng,
      budget,
      businessType,
      categories,
    );
    return { error: null, result };
  } catch (e) {
    return {
      error: "Failed to analyze location. Please try again.",
      result: null,
    };
  }
}

// ── UI constants ──────────────────────────────────────────────────────────────

const ZONE_RATING_LABELS = {
  green: {
    label: "Visoki Potencijal",
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    dot: "bg-green-500",
  },
  yellow: {
    label: "Umereni Potencijal",
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
    dot: "bg-amber-500",
  },
  red: {
    label: "Izazovno Podrucje",
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    dot: "bg-red-500",
  },
} as const;

const BUSINESS_TYPES_SR = [
  { id: "physical", label: "Fizicka prodavnica" },
  { id: "online", label: "Online / Kucni" },
  { id: "delivery", label: "Dostava" },
  { id: "mixed", label: "Mesovito" },
] as const;

const CATEGORIES_SR = [
  { id: "food", label: "Hrana i pice" },
  { id: "tech", label: "Tehnologija" },
  { id: "retail", label: "Trgovina" },
  { id: "services", label: "Usluge" },
  { id: "entertainment", label: "Zabava" },
  { id: "education", label: "Edukacija" },
  { id: "health", label: "Zdravlje" },
] as const;

const FOOT_TRAFFIC_SR: Record<string, string> = {
  high: "Visok",
  medium: "Srednji",
  low: "Nizak",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Discover({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [budget, setBudget] = useState(10000);
  const [businessType, setBusinessType] = useState("physical");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeZone, setActiveZone] = useState<BusinessZone | null>(null);
  const [showZones, setShowZones] = useState(true);
  const [showPois, setShowPois] = useState(true);
  const [activePoiCategories, setActivePoiCategories] = useState<string[]>([]);

  const result = actionData?.result as DiscoverResult | null;
  const error = actionData?.error as string | null;

  const handleMapClick = useCallback(
    (e: {
      lngLat: { lng: number; lat: number };
      features?: Record<string, unknown>[];
    }) => {
      const zoneFeature = e.features?.find(
        (f) => (f as any).layer?.id === "zone-fill",
      );
      if (zoneFeature) {
        const id = (zoneFeature as any).properties?.id as string;
        const zone = BUSINESS_ZONES.find((z: BusinessZone) => z.id === id);
        if (zone) {
          setActiveZone(zone);
          return;
        }
      }
      setSelectedLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      setActiveZone(null);
    },
    [],
  );

  const togglePoiCategory = useCallback((cat: string) => {
    setActivePoiCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleZoneClick = useCallback((zone: BusinessZone) => {
    setActiveZone(zone);
  }, []);

  return (
    <>
      {/* Two-panel layout */}
      <div
        className="flex flex-col lg:flex-row"
        style={{ minHeight: "calc(100vh - 4rem)", marginTop: "4rem" }}
      >
        {/* Left sidebar form */}
        <motion.aside
          className="w-full lg:w-[380px] shrink-0 flex flex-col px-8 py-10 border-r border-border-subtle bg-bg-primary z-10"
          style={{ minHeight: "calc(100vh - 4rem)" }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-xs font-medium text-secondary uppercase tracking-widest">
              Location Mode
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-1">
              Analiziraj lokaciju
            </h2>
            <p className="text-text-secondary text-sm">
              Pronadjite najbolju lokaciju za vas biznis
            </p>
          </div>

          <Form method="post" className="flex flex-col gap-6 flex-1">
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
            <input type="hidden" name="businessType" value={businessType} />
            <input
              type="hidden"
              name="categories"
              value={selectedCategories.join(",")}
            />

            {/* Lokacija */}
            <div>
              <label className="block text-sm font-medium mb-2">Lokacija</label>
              <div
                className={`rounded-xl px-4 py-3 text-sm border transition-colors cursor-default ${
                  selectedLocation
                    ? "bg-secondary/5 border-secondary/30 text-secondary"
                    : "bg-white/60 border-border-subtle text-text-secondary"
                }`}
              >
                {selectedLocation
                  ? `${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`
                  : "Unesi lokaciju"}
              </div>
            </div>

            {/* Tip biznisa */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tip biznisa
              </label>
              <div className="relative">
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm border border-border-subtle bg-white/60 text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-secondary/50 focus:bg-secondary/5 transition-colors pr-10"
                >
                  <option
                    value=""
                    disabled
                    className="bg-bg-secondary text-text-primary"
                  >
                    Izaberi tip
                  </option>
                  {BUSINESS_TYPES_SR.map((bt) => (
                    <option
                      key={bt.id}
                      value={bt.id}
                      className="bg-bg-secondary text-text-primary"
                    >
                      {bt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Kategorije */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Kategorije
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_SR.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      selectedCategories.includes(cat.id)
                        ? "border-secondary/50 bg-secondary/10 text-secondary"
                        : "border-border-subtle text-text-secondary hover:bg-primary/5"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budzet */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Budzet{" "}
                <span className="text-secondary font-bold">
                  {"\u20ac"}
                  {budget.toLocaleString()}
                </span>
              </label>
              <input
                type="range"
                name="budget"
                min={5000}
                max={100000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-primary/10 accent-secondary"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1.5">
                <span>{"\u20ac"}5,000</span>
                <span className="text-secondary font-medium">
                  {"\u20ac"}
                  {budget.toLocaleString()}
                </span>
                <span>{"\u20ac"}100,000</span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-600">
                {error ===
                "Please select a location on the map and fill in all fields"
                  ? "Niste odabrali lokaciju ili popunili sva polja"
                  : error}
              </div>
            )}

            <Button
              type="submit"
              variant="secondary"
              isLoading={isSubmitting}
              disabled={!selectedLocation}
              className="w-full py-4 text-base mt-auto"
            >
              {isSubmitting ? "Analiziranje..." : "Analiziraj"}
            </Button>
          </Form>
        </motion.aside>

        {/* Right map panel */}
        <motion.div
          className="flex-1 relative"
          style={{ minHeight: "calc(100vh - 4rem)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <CyberpunkMap
            maptilerKey={loaderData.maptilerKey}
            onMapClick={handleMapClick}
            className="w-full h-full"
            minHeight={500}
            interactiveLayerIds={showZones ? ZONE_INTERACTIVE_LAYER_IDS : []}
          >
            {showZones && <ZoneOverlays onZoneClick={handleZoneClick} />}
            {showPois && (
              <PoiLayer
                data={loaderData.pois}
                visibleCategories={
                  activePoiCategories.length > 0
                    ? activePoiCategories
                    : undefined
                }
              />
            )}
            {selectedLocation && (
              <Marker
                longitude={selectedLocation.lng}
                latitude={selectedLocation.lat}
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-secondary border-2 border-white shadow-lg shadow-secondary/40" />
                  <div className="absolute inset-0 w-6 h-6 rounded-full bg-secondary/50 animate-ping" />
                </div>
              </Marker>
            )}
          </CyberpunkMap>

          {/* Floating zone info card */}
          <div className="absolute top-4 right-4 w-72 z-20 pointer-events-none">
            <AnimatePresence mode="wait">
              {activeZone && (
                <motion.div
                  key={activeZone.id}
                  className={`glass rounded-2xl p-4 border pointer-events-auto ${
                    ZONE_RATING_LABELS[activeZone.rating].border
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
                          ZONE_RATING_LABELS[activeZone.rating].text
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ZONE_RATING_LABELS[activeZone.rating].dot
                          }`}
                        />
                        {ZONE_RATING_LABELS[activeZone.rating].label}
                      </span>
                      <h3 className="font-bold text-sm">{activeZone.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveZone(null)}
                      className="text-text-secondary hover:text-primary transition-colors text-lg leading-none cursor-pointer ml-2 shrink-0"
                    >
                      x
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
                          ZONE_RATING_LABELS[activeZone.rating].bg
                        } ${ZONE_RATING_LABELS[activeZone.rating].text}`}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Map toolbar */}
          <div className="absolute bottom-20 left-4 z-20 flex flex-col gap-2 items-start">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowZones((v) => !v)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border-subtle bg-white/70 backdrop-blur text-text-secondary hover:bg-primary/10 transition-all cursor-pointer"
              >
                {showZones ? "Sakrij zone" : "Prikazi zone"}
              </button>
              <button
                type="button"
                onClick={() => setShowPois((v) => !v)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border-subtle bg-white/70 backdrop-blur text-text-secondary hover:bg-primary/10 transition-all cursor-pointer"
              >
                {showPois ? "Sakrij POI" : "Prikazi POI"}
              </button>
            </div>
            <AnimatePresence>
              {showPois && (
                <motion.div
                  className="flex flex-wrap gap-1.5"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                >
                  <PoiCategoryFilter
                    activeCategories={activePoiCategories}
                    onToggle={togglePoiCategory}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Score legend */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-4 px-4 py-2 rounded-full glass text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-text-secondary">High Score</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
              <span className="text-text-secondary">Medium Score</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-text-secondary">Low Score</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Results section */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            className="px-8 py-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4"
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

      <AnimatePresence>
        {result && !isSubmitting && (
          <motion.div
            className="px-8 py-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="glass rounded-2xl p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-3">Analiza podrucja</h2>
              <p className="text-text-secondary text-sm mb-4">
                {result.summary}
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    result.areaAnalysis.footTraffic === "high"
                      ? "bg-green-100 text-green-700"
                      : result.areaAnalysis.footTraffic === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  Prolaznost: {FOOT_TRAFFIC_SR[result.areaAnalysis.footTraffic]}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1 text-text-secondary">
                    Konkurencija
                  </h4>
                  <p className="text-text-secondary/80">
                    {result.areaAnalysis.competition}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-text-secondary">
                    Demografija
                  </h4>
                  <p className="text-text-secondary/80">
                    {result.areaAnalysis.demographics}
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium mb-2 text-green-700 text-sm">
                    Prednosti
                  </h4>
                  <ul className="space-y-1">
                    {result.areaAnalysis.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-green-700">&#10003;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-amber-700 text-sm">
                    Rizici
                  </h4>
                  <ul className="space-y-1">
                    {result.areaAnalysis.risks.map((r, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span className="text-amber-700">&#9888;</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            <h2 className="text-xl font-bold mb-4">Predlozi biznisa</h2>
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
                      <h3 className="font-bold text-lg">{suggestion.name}</h3>
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
                    <span className="text-text-secondary">Budzet: </span>
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
                      Savjeti
                    </h4>
                    <ul className="space-y-1">
                      {suggestion.tips.map((tip, j) => (
                        <li
                          key={j}
                          className="text-xs text-text-secondary flex items-start gap-1.5"
                        >
                          <span className="text-primary mt-0.5">&#8250;</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {suggestion.budgetBreakdown && (
                    <BudgetBreakdown
                      breakdown={suggestion.budgetBreakdown}
                      delay={0.5 + i * 0.1}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
