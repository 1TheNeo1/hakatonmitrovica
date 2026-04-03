import {
  Form,
  useNavigation,
  useSearchParams,
  Link,
  useFetcher,
} from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { Route } from "./+types/dashboard";
import { requireUser } from "~/lib/session.server";
import {
  getAllIdeas,
  getAllUsers,
  getIdeasByApplicant,
  getInvestorInterests,
  getStats,
  updateIdeaStatus,
  expressInterest,
  removeInterest,
  getIdeaInterestCount,
  getIdeaById,
  getIdeasByIds,
} from "~/lib/db.server";
import {
  analyzeIdeaForInvestor,
  rankIdeasForInvestor,
  compareIdeasForInvestor,
} from "~/lib/openai.server";
import { redirect } from "react-router";
import { CATEGORIES, IDEA_STAGES, IDEA_STATUSES } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { ScoreRing } from "~/components/ui/score-ring";
import { Skeleton, CardSkeleton } from "~/components/ui/skeleton";
import type {
  User,
  Idea,
  InvestorProfile,
  IdeaInsightResult,
  RankIdeasResult,
  CompareIdeasResult,
} from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - MitroStart" },
    { name: "description", content: "Your MitroStart dashboard" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);

  if (user.role === "admin") {
    const stats = getStats();
    const ideas = getAllIdeas();
    const users = getAllUsers();
    return {
      user,
      stats,
      ideas,
      users,
      myIdeas: null,
      interests: null,
    } as const;
  }

  if (user.role === "investor") {
    const ideas = getAllIdeas();
    const interestRows = getInvestorInterests(user.id);
    const interests = interestRows.map((r) => r.ideaId);
    const ideasWithCounts = ideas.map((idea) => ({
      ...idea,
      interestCount: getIdeaInterestCount(idea.id),
    }));
    return {
      user,
      stats: null,
      ideas: ideasWithCounts,
      users: null,
      myIdeas: null,
      interests,
    } as const;
  }

  // applicant
  const myIdeas = getIdeasByApplicant(user.id);
  return {
    user,
    stats: null,
    ideas: null,
    users: null,
    myIdeas,
    interests: null,
  } as const;
}

function buildInvestorProfile(user: User): InvestorProfile {
  const raw = user.investmentFocus || "";
  const focus = raw.startsWith("[")
    ? (JSON.parse(raw) as string[])
    : raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  return {
    name: user.name,
    organization: user.organization,
    investmentFocus: focus,
    investmentMin: user.investmentMin,
    investmentMax: user.investmentMax,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "updateStatus" && user.role === "admin") {
    const ideaId = formData.get("ideaId") as string;
    const status = formData.get("status") as string;
    if (ideaId && status) {
      updateIdeaStatus(ideaId, status);
    }
    return { ok: true };
  }

  if (intent === "expressInterest" && user.role === "investor") {
    const ideaId = formData.get("ideaId") as string;
    if (ideaId) {
      expressInterest(user.id, ideaId);
    }
    return { ok: true };
  }

  if (intent === "removeInterest" && user.role === "investor") {
    const ideaId = formData.get("ideaId") as string;
    if (ideaId) {
      removeInterest(user.id, ideaId);
    }
    return { ok: true };
  }

  if (intent === "analyzeIdea" && user.role === "investor") {
    const ideaId = formData.get("ideaId") as string;
    const idea = getIdeaById(ideaId);
    if (!idea) return { ok: false };
    const profile = buildInvestorProfile(user);
    try {
      const insight = await analyzeIdeaForInvestor(idea, profile);
      return { intent: "analyzeIdea", ideaId, insight };
    } catch {
      return { intent: "analyzeIdea", ideaId, error: "AI analysis failed. Please try again." };
    }
  }

  if (intent === "rankIdeas" && user.role === "investor") {
    const ideas = getAllIdeas();
    if (ideas.length === 0) return { intent: "rankIdeas", result: { rankedIdeas: [], summaryNote: "" } };
    const profile = buildInvestorProfile(user);
    try {
      const result = await rankIdeasForInvestor(ideas, profile);
      return { intent: "rankIdeas", result };
    } catch {
      return { intent: "rankIdeas", error: "AI ranking failed." };
    }
  }

  if (intent === "compareIdeas" && user.role === "investor") {
    const ideaIdsRaw = formData.get("ideaIds") as string;
    const ids = ideaIdsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (ids.length < 2) return { ok: false };
    const ideas = getIdeasByIds(ids);
    const profile = buildInvestorProfile(user);
    try {
      const result = await compareIdeasForInvestor(ideas, profile);
      return { intent: "compareIdeas", result };
    } catch {
      return { intent: "compareIdeas", error: "AI comparison failed. Please try again." };
    }
  }

  return { ok: false };
}

export default function Dashboard({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;
  const [searchParams] = useSearchParams();
  const submitted = searchParams.get("submitted") === "true";

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-xs font-medium text-secondary uppercase tracking-widest">
            {user.role === "admin"
              ? "Admin Panel"
              : user.role === "investor"
                ? "Investor Dashboard"
                : "My Ideas"}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            Welcome, <span className="animated-gradient-text">{user.name}</span>
          </h1>
          <p className="text-text-secondary">
            {user.role === "admin" && "Manage ideas and users"}
            {user.role === "investor" &&
              "Discover promising ideas to invest in"}
            {user.role === "applicant" && "Track your submitted ideas"}
          </p>
        </motion.div>

        {submitted && (
          <motion.div
            className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your idea was submitted successfully! It will be reviewed soon.
          </motion.div>
        )}

        {user.role === "admin" && <AdminDashboard data={loaderData as any} />}
        {user.role === "investor" && (
          <InvestorDashboard data={loaderData as any} />
        )}
        {user.role === "applicant" && (
          <ApplicantDashboard data={loaderData as any} />
        )}
      </div>
    </div>
  );
}

// ==================== ADMIN ====================

function AdminDashboard({
  data,
}: {
  data: {
    stats: {
      totalUsers: number;
      totalIdeas: number;
      pendingIdeas: number;
      fundedIdeas: number;
    };
    ideas: Idea[];
    users: User[];
  };
}) {
  const { stats, ideas } = data;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          color="primary"
        />
        <StatCard
          label="Total Ideas"
          value={stats.totalIdeas}
          color="secondary"
        />
        <StatCard label="Pending" value={stats.pendingIdeas} color="tertiary" />
        <StatCard label="Funded" value={stats.fundedIdeas} color="green" />
      </motion.div>

      {/* Ideas Table */}
      <motion.div
        className="glass rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-5 border-b border-border-subtle">
          <h2 className="text-lg font-bold">All Ideas</h2>
        </div>
        {ideas.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            No ideas submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-text-secondary">
                  <th className="text-left px-5 py-3 font-medium">Title</th>
                  <th className="text-left px-5 py-3 font-medium">Applicant</th>
                  <th className="text-left px-5 py-3 font-medium">Category</th>
                  <th className="text-left px-5 py-3 font-medium">Stage</th>
                  <th className="text-left px-5 py-3 font-medium">Funding</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea) => (
                  <tr
                    key={idea.id}
                    className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 font-medium">{idea.title}</td>
                    <td className="px-5 py-3 text-text-secondary">
                      {idea.applicantName || idea.applicantEmail}
                    </td>
                    <td className="px-5 py-3">
                      <CategoryBadge category={idea.category} />
                    </td>
                    <td className="px-5 py-3">
                      <StageBadge stage={idea.stage} />
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {idea.fundingNeeded.toLocaleString()} EUR
                    </td>
                    <td className="px-5 py-3">
                      <StatusDropdown
                        ideaId={idea.id}
                        currentStatus={idea.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ==================== INVESTOR ====================

function InvestorDashboard({
  data,
}: {
  data: {
    ideas: (Idea & { interestCount: number })[];
    interests: string[];
  };
}) {
  const { ideas, interests } = data;
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] =
    useState<CompareIdeasResult | null>(null);

  const rankFetcher = useFetcher<{
    intent: "rankIdeas";
    result?: RankIdeasResult;
    error?: string;
  }>();
  const compareFetcher = useFetcher<{
    intent: "compareIdeas";
    result?: CompareIdeasResult;
    error?: string;
  }>();

  // Auto-load ranking on mount
  useEffect(() => {
    if (rankFetcher.state === "idle" && !rankFetcher.data && ideas.length > 0) {
      rankFetcher.submit({ intent: "rankIdeas" }, { method: "post" });
    }
  }, []);

  // Store comparison result when it arrives
  useEffect(() => {
    if (compareFetcher.data?.intent === "compareIdeas" && compareFetcher.data.result) {
      setComparisonResult(compareFetcher.data.result);
    }
  }, [compareFetcher.data]);

  const filtered = ideas.filter((idea) => {
    if (filterCategory && idea.category !== filterCategory) return false;
    if (filterStage && idea.stage !== filterStage) return false;
    return true;
  });

  function toggleSelection(ideaId: string) {
    setSelectedIdeas((prev) =>
      prev.includes(ideaId)
        ? prev.filter((id) => id !== ideaId)
        : prev.length < 3
          ? [...prev, ideaId]
          : prev
    );
  }

  function handleCompare() {
    if (selectedIdeas.length < 2) return;
    setComparisonResult(null);
    compareFetcher.submit(
      { intent: "compareIdeas", ideaIds: selectedIdeas.join(",") },
      { method: "post" }
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Best Matches Section */}
      <BestMatchesSection
        fetcher={rankFetcher}
        ideas={ideas}
      />

      {/* Filters + Selection Toggle */}
      <motion.div
        className="flex flex-wrap gap-3 items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-text-secondary font-medium">Filter:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg bg-white/5 border border-border-subtle px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="rounded-lg bg-white/5 border border-border-subtle px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
          >
            <option value="">All Stages</option>
            {IDEA_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setSelectionMode((v) => !v);
            setSelectedIdeas([]);
            setComparisonResult(null);
          }}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            selectionMode
              ? "bg-primary/20 border-primary/40 text-primary"
              : "bg-white/5 border-border-subtle text-text-secondary hover:text-white hover:border-white/20"
          }`}
        >
          {selectionMode ? "Exit Compare Mode" : "Compare Ideas"}
        </button>
      </motion.div>

      {/* Comparison Panel */}
      <AnimatePresence>
        {(comparisonResult || compareFetcher.state === "submitting") && (
          <ComparisonPanel
            result={comparisonResult}
            loading={compareFetcher.state === "submitting"}
            ideas={ideas}
            onClose={() => setComparisonResult(null)}
          />
        )}
      </AnimatePresence>

      {/* Idea Cards */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-text-secondary">
          No ideas match your filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((idea, i) => {
            const interested = interests.includes(idea.id);
            return (
              <IdeaCardWithAI
                key={idea.id}
                idea={idea}
                interested={interested}
                index={i}
                selectionMode={selectionMode}
                selected={selectedIdeas.includes(idea.id)}
                onToggleSelect={() => toggleSelection(idea.id)}
              />
            );
          })}
        </div>
      )}

      {/* Compare Action Bar */}
      <AnimatePresence>
        {selectionMode && (
          <CompareActionBar
            count={selectedIdeas.length}
            onCompare={handleCompare}
            onClear={() => setSelectedIdeas([])}
            loading={compareFetcher.state === "submitting"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== BEST MATCHES SECTION ====================

function BestMatchesSection({
  fetcher,
  ideas,
}: {
  fetcher: ReturnType<typeof useFetcher<{ intent: "rankIdeas"; result?: RankIdeasResult; error?: string }>>;
  ideas: (Idea & { interestCount: number })[];
}) {
  const isLoading = fetcher.state !== "idle";
  const result = fetcher.data?.result;
  const hasIdeas = ideas.length > 0;

  if (!hasIdeas) return null;

  return (
    <motion.div
      className="glass rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h2 className="font-bold text-base">Best Matches for You</h2>
        <span className="text-xs text-text-secondary ml-1">AI-powered recommendations</span>
        {isLoading && (
          <span className="ml-auto text-xs text-primary animate-pulse">Analyzing…</span>
        )}
      </div>

      <div className="divide-y divide-border-subtle">
        {isLoading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
              </div>
            ))}
          </>
        ) : result && result.rankedIdeas.length > 0 ? (
          <>
            {result.rankedIdeas.map((ranked, i) => {
              const idea = ideas.find((id) => id.id === ranked.ideaId);
              const rankColors = [
                "text-amber-400 bg-amber-400/10 border-amber-400/30",
                "text-slate-300 bg-slate-300/10 border-slate-300/30",
                "text-amber-700 bg-amber-700/10 border-amber-700/30",
              ];
              const rankLabels = ["1st", "2nd", "3rd"];
              return (
                <motion.div
                  key={ranked.ideaId}
                  className="px-5 py-4 flex items-center gap-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full border flex-shrink-0 ${rankColors[i] || rankColors[2]}`}
                  >
                    {rankLabels[i] || `${ranked.rank}th`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {ranked.title}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                      {ranked.reasoning}
                    </div>
                    {ranked.topBenefit && (
                      <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                        {ranked.topBenefit}
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <ScoreRing
                      score={ranked.alignmentScore}
                      size={56}
                      strokeWidth={5}
                      label="fit"
                    />
                  </div>
                </motion.div>
              );
            })}
            {result.summaryNote && (
              <div className="px-5 py-3 text-xs text-text-secondary bg-white/[0.02]">
                {result.summaryNote}
              </div>
            )}
          </>
        ) : fetcher.data?.error ? (
          <div className="px-5 py-4 text-sm text-red-400">{fetcher.data.error}</div>
        ) : null}
      </div>
    </motion.div>
  );
}

// ==================== IDEA CARD WITH AI ====================

function IdeaCardWithAI({
  idea,
  interested,
  index,
  selectionMode,
  selected,
  onToggleSelect,
}: {
  idea: Idea & { interestCount: number };
  interested: boolean;
  index: number;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const [insightOpen, setInsightOpen] = useState(false);
  const insightFetcher = useFetcher<{
    intent: "analyzeIdea";
    ideaId?: string;
    insight?: IdeaInsightResult;
    error?: string;
  }>();

  function handleAnalyze() {
    if (insightOpen) {
      setInsightOpen(false);
      return;
    }
    setInsightOpen(true);
    if (!insightFetcher.data) {
      insightFetcher.submit(
        { intent: "analyzeIdea", ideaId: idea.id },
        { method: "post" }
      );
    }
  }

  const isAnalyzing = insightFetcher.state !== "idle";
  const insight = insightFetcher.data?.insight;

  return (
    <motion.div
      className={`glass rounded-2xl flex flex-col transition-all ${
        selected ? "ring-2 ring-primary/60 ring-offset-1 ring-offset-transparent" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          {selectionMode && (
            <button
              onClick={onToggleSelect}
              className={`mr-2 flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                selected
                  ? "bg-primary border-primary"
                  : "border-border-subtle bg-transparent hover:border-primary/50"
              }`}
              aria-label={selected ? "Deselect idea" : "Select idea"}
            >
              {selected && (
                <svg viewBox="0 0 10 8" className="w-full h-full p-0.5">
                  <path
                    d="M1 4l2.5 2.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}
          <h3 className="font-bold text-base leading-tight flex-1 mr-2">
            {idea.title}
          </h3>
          <StatusBadge status={idea.status} />
        </div>

        <p className="text-text-secondary text-sm line-clamp-3 mb-4 flex-1">
          {idea.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <CategoryBadge category={idea.category} />
          <StageBadge stage={idea.stage} />
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary mb-4">
          <span>{idea.fundingNeeded.toLocaleString()} EUR</span>
          <span>Team: {idea.teamSize}</span>
          <span>{idea.interestCount} interested</span>
        </div>

        <div className="space-y-2">
          <Form method="post">
            <input type="hidden" name="ideaId" value={idea.id} />
            <Button
              type="submit"
              name="intent"
              value={interested ? "removeInterest" : "expressInterest"}
              variant={interested ? "outline" : "primary"}
              className="w-full text-xs py-2"
            >
              {interested ? "✓ Interested" : "Express Interest"}
            </Button>
          </Form>

          <button
            onClick={handleAnalyze}
            className={`w-full text-xs py-2 rounded-xl border transition-all font-medium ${
              insightOpen
                ? "bg-secondary/10 border-secondary/30 text-secondary"
                : "bg-white/5 border-border-subtle text-text-secondary hover:text-white hover:border-white/20"
            }`}
          >
            {isAnalyzing
              ? "Analyzing…"
              : insightOpen
                ? "Hide AI Insight"
                : "✦ AI Insight"}
          </button>
        </div>
      </div>

      {/* AI Insight Panel */}
      <AnimatePresence>
        {insightOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <AIInsightPanel
              insight={insight}
              loading={isAnalyzing}
              error={insightFetcher.data?.error}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==================== AI INSIGHT PANEL ====================

function AIInsightPanel({
  insight,
  loading,
  error,
}: {
  insight?: IdeaInsightResult;
  loading: boolean;
  error?: string;
}) {
  if (error) {
    return (
      <div className="border-t border-border-subtle px-5 py-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (loading || !insight) {
    return (
      <div className="border-t border-border-subtle px-5 py-4 space-y-3">
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="border-t border-border-subtle px-5 py-4 space-y-4">
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0">
          <ScoreRing
            score={insight.investmentScore}
            size={80}
            strokeWidth={6}
            label="Score"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">
              Key Benefits
            </div>
            <ul className="space-y-1">
              {insight.keyBenefits.map((b, i) => (
                <li key={i} className="text-xs text-text-secondary flex gap-1.5">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
              Risk Factors
            </div>
            <ul className="space-y-1">
              {insight.riskFactors.map((r, i) => (
                <li key={i} className="text-xs text-text-secondary flex gap-1.5">
                  <span className="text-red-400 flex-shrink-0">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-text-secondary">
          <span className="font-semibold text-white">Market: </span>
          {insight.marketOpportunity}
        </div>
        <div className="text-xs text-text-secondary">
          <span className="font-semibold text-white">Return: </span>
          {insight.returnPotential}
        </div>
        <div className="text-xs text-text-secondary">
          <span className="font-semibold text-white">Fit: </span>
          {insight.alignmentNote}
        </div>
      </div>

      <div className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5 text-xs text-primary font-medium">
        {insight.recommendation}
      </div>
    </div>
  );
}

// ==================== COMPARE ACTION BAR ====================

function CompareActionBar({
  count,
  onCompare,
  onClear,
  loading,
}: {
  count: number;
  onCompare: () => void;
  onClear: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center gap-3 glass rounded-2xl px-5 py-3 shadow-2xl border border-border-subtle">
        <span className="text-sm font-medium">
          {count === 0
            ? "Select 2–3 ideas to compare"
            : `${count} idea${count > 1 ? "s" : ""} selected`}
        </span>
        <button
          onClick={onCompare}
          disabled={count < 2 || loading}
          className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all ${
            count >= 2 && !loading
              ? "bg-primary text-white hover:bg-primary/80"
              : "bg-white/10 text-text-secondary cursor-not-allowed"
          }`}
        >
          {loading ? "Comparing…" : "Compare with AI"}
        </button>
        {count > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-text-secondary hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ==================== COMPARISON PANEL ====================

function ComparisonPanel({
  result,
  loading,
  ideas,
  onClose,
}: {
  result: CompareIdeasResult | null;
  loading: boolean;
  ideas: (Idea & { interestCount: number })[];
  onClose: () => void;
}) {
  return (
    <motion.div
      className="glass rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <h2 className="font-bold text-base">AI Comparison</h2>
        </div>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-white transition-colors text-sm"
        >
          ✕ Close
        </button>
      </div>

      {loading ? (
        <div className="p-6 space-y-4">
          <div className="flex gap-4 justify-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="h-16 w-full" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : result ? (
        <div className="p-5 space-y-6">
          {/* Winner callout */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🏆</span>
            <div>
              <div className="font-bold text-sm text-amber-400 mb-0.5">
                Recommended Investment
              </div>
              <div className="text-sm text-text-secondary">
                {result.winnerReason}
              </div>
            </div>
          </div>

          {/* Per-idea investment scores */}
          <div className="flex flex-wrap gap-6 justify-center">
            {result.ideas.map((entry) => {
              const isWinner = entry.ideaId === result.winner;
              return (
                <div
                  key={entry.ideaId}
                  className={`flex flex-col items-center gap-2 ${isWinner ? "relative" : ""}`}
                >
                  {isWinner && (
                    <span className="absolute -top-3 text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-full px-2 py-0.5 font-semibold">
                      Winner
                    </span>
                  )}
                  <ScoreRing
                    score={entry.investmentScore}
                    size={80}
                    strokeWidth={6}
                    label="score"
                  />
                  <div className="text-xs font-semibold text-center max-w-[100px] line-clamp-2">
                    {entry.title}
                  </div>
                  <div className="text-xs text-text-secondary text-center max-w-[120px] line-clamp-2">
                    {entry.summary}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dimension scores */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Head-to-Head
            </div>
            {result.dimensions.map((dim) => (
              <div key={dim.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{dim.label}</span>
                  <span className="text-xs text-text-secondary">
                    {result.ideas.find((i) => i.ideaId === dim.winner)?.title}
                    {" "}wins
                  </span>
                </div>
                <div className="space-y-1">
                  {result.ideas.map((entry) => (
                    <DimensionScoreBar
                      key={entry.ideaId}
                      label={entry.title}
                      score={dim.scores[entry.ideaId] ?? 0}
                      isWinner={entry.ideaId === dim.winner}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary">
            {result.recommendation}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

function DimensionScoreBar({
  label,
  score,
  isWinner,
}: {
  label: string;
  score: number;
  isWinner: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-secondary w-24 truncate flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isWinner ? "bg-primary" : "bg-white/20"}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span
        className={`text-xs font-semibold w-8 text-right ${isWinner ? "text-primary" : "text-text-secondary"}`}
      >
        {score}
      </span>
      {isWinner && (
        <span className="text-xs">👑</span>
      )}
    </div>
  );
}

// ==================== APPLICANT ====================

function ApplicantDashboard({
  data,
}: {
  data: {
    myIdeas: Idea[];
  };
}) {
  const { myIdeas } = data;

  return (
    <div className="space-y-6">
      {myIdeas.length === 0 ? (
        <motion.div
          className="glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-text-secondary mb-4">
            You haven't submitted any ideas yet.
          </p>
          <Link to="/apply">
            <Button variant="primary">Submit Your First Idea</Button>
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="flex justify-end">
            <Link to="/apply">
              <Button variant="primary" className="text-sm">
                + Submit Another Idea
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {myIdeas.map((idea, i) => (
              <motion.div
                key={idea.id}
                className="glass rounded-2xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-base leading-tight flex-1 mr-2">
                    {idea.title}
                  </h3>
                  <StatusBadge status={idea.status} />
                </div>

                <p className="text-text-secondary text-sm line-clamp-2 mb-4">
                  {idea.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <CategoryBadge category={idea.category} />
                  <StageBadge stage={idea.stage} />
                </div>

                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{idea.fundingNeeded.toLocaleString()} EUR</span>
                  <span>
                    Submitted {new Date(idea.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "primary" | "secondary" | "tertiary" | "green";
}) {
  const colorMap = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
    green: "text-green-400",
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className={`text-3xl font-extrabold ${colorMap[color]} mb-1`}>
        {value}
      </div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusDef = IDEA_STATUSES.find((s) => s.id === status);
  return (
    <span
      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${statusDef?.color || "text-text-secondary bg-white/5 border-border-subtle"}`}
    >
      {statusDef?.label || status}
    </span>
  );
}

function StatusDropdown({
  ideaId,
  currentStatus,
}: {
  ideaId: string;
  currentStatus: string;
}) {
  const navigation = useNavigation();

  return (
    <Form method="post" className="inline">
      <input type="hidden" name="intent" value="updateStatus" />
      <input type="hidden" name="ideaId" value={ideaId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => {
          (e.target.closest("form") as HTMLFormElement)?.requestSubmit();
        }}
        className="rounded-lg bg-white/5 border border-border-subtle px-2 py-1 text-xs focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
      >
        {IDEA_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </Form>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const cat = CATEGORIES.find((c) => c.id === category);
  return (
    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
      {cat?.label || category}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const s = IDEA_STAGES.find((st) => st.id === stage);
  return (
    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
      {s?.label || stage}
    </span>
  );
}
