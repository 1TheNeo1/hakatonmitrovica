import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Route } from "./+types/register";
import { getUserByEmail, createUser, createOtp } from "~/lib/db.server";
import { generateOtp, sendOtp } from "~/lib/auth.server";
import { getUserFromRequest } from "~/lib/session.server";
import { redirect } from "react-router";
import {
  CATEGORIES,
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_STEP,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";
import type { UserRole } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register - MitroStart" },
    { name: "description", content: "Create your MitroStart account" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  if (user) throw redirect("/dashboard");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string)?.trim();
  const role = formData.get("role") as UserRole;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !name || !role) {
    return { error: "Name, email, and role are required" };
  }

  if (!["investor", "applicant"].includes(role)) {
    return { error: "Invalid role selected" };
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return {
      error: "An account with this email already exists. Please sign in.",
    };
  }

  // Role-specific fields
  const userData: Parameters<typeof createUser>[0] = { email, name, role };

  if (role === "investor") {
    userData.organization =
      (formData.get("organization") as string)?.trim() || undefined;
    const focusValues = formData.getAll("investmentFocus") as string[];
    userData.investmentFocus =
      focusValues.length > 0 ? focusValues.join(",") : undefined;
    userData.investmentMin = Number(formData.get("investmentMin")) || undefined;
    userData.investmentMax = Number(formData.get("investmentMax")) || undefined;
    userData.bio = (formData.get("bio") as string)?.trim() || undefined;
    userData.linkedinUrl =
      (formData.get("linkedinUrl") as string)?.trim() || undefined;
  }

  if (role === "applicant") {
    userData.phone = (formData.get("phone") as string)?.trim() || undefined;
    userData.city = (formData.get("city") as string)?.trim() || "Mitrovica";
  }

  try {
    createUser(userData);
  } catch (e) {
    return { error: "Failed to create account. Please try again." };
  }

  const code = generateOtp();
  createOtp(email, code);
  await sendOtp(email, code);

  throw redirect(
    `/verify?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectTo)}`,
  );
}

export default function Register({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const error = actionData?.error as string | undefined;

  const [role, setRole] = useState<UserRole>("applicant");
  const [investmentMin, setInvestmentMin] = useState(BUDGET_MIN);
  const [investmentMax, setInvestmentMax] = useState(BUDGET_MAX);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);

  const toggleFocus = (id: string) => {
    setSelectedFocus((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-start justify-center px-6">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-xs font-medium text-secondary uppercase tracking-widest">
            Create Account
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Join MitroStart
          </h1>
          <p className="text-text-secondary">
            Sign up to apply for investment or browse ideas
          </p>
        </div>

        <Form method="post" className="glass rounded-2xl p-6 space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Your full name"
              className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
            />
          </div>

          {/* Role Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {(["applicant", "investor"] as const).map((r) => (
                <label key={r} className="cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    className="peer sr-only"
                  />
                  <div className="px-4 py-3 rounded-xl text-sm font-medium border border-border-subtle text-text-secondary text-center peer-checked:border-primary/50 peer-checked:bg-primary/10 peer-checked:text-primary transition-all hover:bg-primary/5">
                    {r === "applicant" ? "🚀 Applicant" : "💼 Investor"}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Investor-specific fields */}
          {role === "investor" && (
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Organization */}
              <div>
                <label
                  htmlFor="organization"
                  className="block text-sm font-medium mb-2"
                >
                  Organization{" "}
                  <span className="text-text-secondary font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Your company or fund"
                  className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                />
              </div>

              {/* Investment Focus */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Investment Focus{" "}
                  <span className="text-text-secondary font-normal">
                    (optional)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleFocus(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        selectedFocus.includes(cat.id)
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border-subtle text-text-secondary hover:bg-primary/5"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                {/* Hidden inputs for selected focus categories */}
                {selectedFocus.map((f) => (
                  <input
                    key={f}
                    type="hidden"
                    name="investmentFocus"
                    value={f}
                  />
                ))}
              </div>

              {/* Investment Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Min Investment:{" "}
                    <span className="text-primary font-bold">
                      {investmentMin.toLocaleString()} EUR
                    </span>
                  </label>
                  <input
                    type="range"
                    name="investmentMin"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    value={investmentMin}
                    onChange={(e) => setInvestmentMin(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-primary/10 accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Investment:{" "}
                    <span className="text-primary font-bold">
                      {investmentMax.toLocaleString()} EUR
                    </span>
                  </label>
                  <input
                    type="range"
                    name="investmentMax"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    value={investmentMax}
                    onChange={(e) => setInvestmentMax(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-primary/10 accent-primary"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">
                  Bio{" "}
                  <span className="text-text-secondary font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="Tell applicants about yourself..."
                  className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all resize-none"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label
                  htmlFor="linkedinUrl"
                  className="block text-sm font-medium mb-2"
                >
                  LinkedIn URL{" "}
                  <span className="text-text-secondary font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* Applicant-specific fields */}
          {role === "applicant" && (
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
                >
                  Phone{" "}
                  <span className="text-text-secondary font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+383 ..."
                  className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium mb-2"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue="Mitrovica"
                  className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                />
              </div>
            </motion.div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full py-4 text-base"
          >
            {isSubmitting
              ? "Creating Account..."
              : "Create Account & Send Code"}
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <a
              href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-primary hover:text-primary-light transition-colors font-medium"
            >
              Sign In
            </a>
          </p>
        </Form>
      </motion.div>
    </div>
  );
}
