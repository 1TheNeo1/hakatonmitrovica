import { Form, useNavigation, useSearchParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
} from "~/lib/db.server";
import { redirect } from "react-router";
import { CATEGORIES, IDEA_STAGES, IDEA_STATUSES } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import type { User, Idea } from "~/lib/types";

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
    // Add interest counts
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

  const filtered = ideas.filter((idea) => {
    if (filterCategory && idea.category !== filterCategory) return false;
    if (filterStage && idea.stage !== filterStage) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        className="flex flex-wrap gap-3 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
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
      </motion.div>

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
              <motion.div
                key={idea.id}
                className="glass rounded-2xl p-5 flex flex-col"
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
              </motion.div>
            );
          })}
        </div>
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
