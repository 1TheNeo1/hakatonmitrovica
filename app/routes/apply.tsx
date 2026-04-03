import { Form, useActionData, useNavigation } from "react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Route } from "./+types/apply";
import { requireUser } from "~/lib/session.server";
import { createIdea } from "~/lib/db.server";
import { redirect } from "react-router";
import {
  CATEGORIES,
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_STEP,
  IDEA_STAGES,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Apply for Investment - MitroStart" },
    {
      name: "description",
      content: "Submit your business idea for investment",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  if (user.role !== "applicant") {
    throw redirect("/dashboard");
  }
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  if (user.role !== "applicant") {
    return { error: "Only applicants can submit ideas" };
  }

  const formData = await request.formData();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category = formData.get("category") as string;
  const stage = formData.get("stage") as string;
  const fundingNeeded = Number(formData.get("fundingNeeded"));
  const targetMarket = (formData.get("targetMarket") as string)?.trim();
  const teamSize = Number(formData.get("teamSize")) || 1;
  const problemSolved =
    (formData.get("problemSolved") as string)?.trim() || undefined;
  const competitiveAdvantage =
    (formData.get("competitiveAdvantage") as string)?.trim() || undefined;

  if (
    !title ||
    !description ||
    !category ||
    !stage ||
    !fundingNeeded ||
    !targetMarket
  ) {
    return { error: "Please fill in all required fields" };
  }

  if (title.length > 100) {
    return { error: "Title must be 100 characters or less" };
  }

  try {
    createIdea({
      applicantId: user.id,
      title,
      description,
      category,
      fundingNeeded,
      stage,
      targetMarket,
      teamSize,
      problemSolved,
      competitiveAdvantage,
    });
  } catch (e) {
    return { error: "Failed to submit idea. Please try again." };
  }

  throw redirect("/dashboard?submitted=true");
}

export default function Apply({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const error = actionData?.error as string | undefined;

  const [funding, setFunding] = useState(5000);
  const [stage, setStage] = useState("concept");
  const [category, setCategory] = useState("");

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-xs font-medium text-secondary uppercase tracking-widest">
            Apply
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Submit Your <span className="animated-gradient-text">Idea</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Tell us about your business idea and apply for investment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Form method="post" className="glass rounded-2xl p-6 space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Idea Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={100}
                autoFocus
                placeholder="e.g. Mitrovica Student Meal Delivery"
                className="w-full rounded-xl bg-white/5 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe your business idea in detail..."
                className="w-full rounded-xl bg-white/5 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <label key={cat.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat.id}
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="peer sr-only"
                      required
                    />
                    <div className="px-3 py-1.5 rounded-full text-xs font-medium border border-border-subtle text-text-secondary peer-checked:border-primary/50 peer-checked:bg-primary/10 peer-checked:text-primary transition-all hover:bg-white/5">
                      {cat.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Stage <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {IDEA_STAGES.map((s) => (
                  <label key={s.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="stage"
                      value={s.id}
                      checked={stage === s.id}
                      onChange={() => setStage(s.id)}
                      className="peer sr-only"
                    />
                    <div className="px-3 py-2 rounded-xl text-xs font-medium border border-border-subtle text-text-secondary text-center peer-checked:border-secondary/50 peer-checked:bg-secondary/10 peer-checked:text-secondary transition-all hover:bg-white/5">
                      {s.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Funding Needed */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Funding Needed:{" "}
                <span className="text-secondary font-bold">
                  {funding.toLocaleString()} EUR
                </span>
              </label>
              <input
                type="range"
                name="fundingNeeded"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={funding}
                onChange={(e) => setFunding(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-secondary"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>{BUDGET_MIN.toLocaleString()}</span>
                <span>{BUDGET_MAX.toLocaleString()}</span>
              </div>
            </div>

            {/* Target Market */}
            <div>
              <label
                htmlFor="targetMarket"
                className="block text-sm font-medium mb-2"
              >
                Target Market <span className="text-red-400">*</span>
              </label>
              <input
                id="targetMarket"
                name="targetMarket"
                type="text"
                required
                placeholder="e.g. Students in Mitrovica"
                className="w-full rounded-xl bg-white/5 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
              />
            </div>

            {/* Team Size */}
            <div>
              <label
                htmlFor="teamSize"
                className="block text-sm font-medium mb-2"
              >
                Team Size
              </label>
              <input
                id="teamSize"
                name="teamSize"
                type="number"
                min={1}
                max={50}
                defaultValue={1}
                className="w-32 rounded-xl bg-white/5 border border-border-subtle px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
              />
            </div>

            {/* Problem Solved */}
            <div>
              <label
                htmlFor="problemSolved"
                className="block text-sm font-medium mb-2"
              >
                Problem Solved{" "}
                <span className="text-text-secondary font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                id="problemSolved"
                name="problemSolved"
                rows={2}
                placeholder="What problem does your idea solve?"
                className="w-full rounded-xl bg-white/5 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all resize-none"
              />
            </div>

            {/* Competitive Advantage */}
            <div>
              <label
                htmlFor="competitiveAdvantage"
                className="block text-sm font-medium mb-2"
              >
                Competitive Advantage{" "}
                <span className="text-text-secondary font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                id="competitiveAdvantage"
                name="competitiveAdvantage"
                rows={2}
                placeholder="What makes your idea stand out?"
                className="w-full rounded-xl bg-white/5 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all resize-none"
              />
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
              className="w-full py-4 text-base"
            >
              {isSubmitting ? "Submitting..." : "Submit Idea"}
            </Button>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
