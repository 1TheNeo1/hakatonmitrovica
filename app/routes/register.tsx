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
    { title: "Registracija - MitroStart" },
    { name: "description", content: "Kreirajte vaš MitroStart nalog" },
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
    return { error: "Ime, email i uloga su obavezni" };
  }

  if (!["investor", "applicant"].includes(role)) {
    return { error: "Izabrana uloga nije validna" };
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return {
      error: "Nalog sa ovim emailom već postoji. Molimo prijavite se.",
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
    return { error: "Kreiranje naloga nije uspelo. Pokušajte ponovo." };
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
            Kreirajte nalog
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Pridružite se MitroStart-u
          </h1>
          <p className="text-text-secondary">
            Registrujte se da biste aplicirali za investiciju ili pregledali
            ideje
          </p>
        </div>

        <Form method="post" className="glass rounded-2xl p-6 space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Puno ime
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Vaše puno ime"
              className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email adresa
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="vas@email.com"
              className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
            />
          </div>

          {/* Role Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">Ja sam...</label>
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
                    {r === "applicant" ? "🚀 Aplikan" : "💼 Investitor"}
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
                  Organizacija{" "}
                  <span className="text-text-secondary font-normal">
                    (opciono)
                  </span>
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Vaša kompanija ili fond"
                  className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                />
              </div>

              {/* Investment Focus */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Oblast investiranja{" "}
                  <span className="text-text-secondary font-normal">
                    (opciono)
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
                    Min. investicija:{" "}
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
                    Maks. investicija:{" "}
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
                  Biografija{" "}
                  <span className="text-text-secondary font-normal">
                    (opciono)
                  </span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="Opišite se aplikanima..."
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
                    (opciono)
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
                  Telefon{" "}
                  <span className="text-text-secondary font-normal">
                    (opciono)
                  </span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+381 ..."
                  className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium mb-2"
                >
                  Grad
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
              ? "Kreiranje naloga..."
              : "Kreirajte nalog i pošaljite kod"}
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Već imate nalog?{" "}
            <a
              href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-primary hover:text-primary-light transition-colors font-medium"
            >
              Prijavite se
            </a>
          </p>
        </Form>
      </motion.div>
    </div>
  );
}
