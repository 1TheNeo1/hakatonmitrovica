import { Link, useLoaderData } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/home";
import { getStats, getAllIdeas } from "~/lib/db.server";
import { getUserFromRequest } from "~/lib/session.server";
import type { Idea } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MitroStart – Pretvorite svoje ideje u pravi biznis" },
    {
      name: "description",
      content:
        "Platforma za procenu biznisa zasnovana na veštačkoj inteligenciji (AI), namenjena mladim preduzetnicima. Dobijte trenutni uvid u prilike na osnovu lokacije ili validirajte svoju startap ideju.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  const stats = getStats();
  const allIdeas = getAllIdeas();
  const featuredIdeas = allIdeas.slice(0, 6);
  return { user, stats, featuredIdeas };
}

/* ── animation helpers ─────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const VIEWPORT = { once: true, amount: 0.15 as const };

/* ── category helpers ──────────────────────────────────────────────── */

const CATEGORY_LABELS: Record<string, string> = {
  food: "Hrana",
  retail: "Maloprodaja",
  services: "Usluge",
  tech: "Tehnologija",
  entertainment: "Zabava",
  education: "Edukacija",
  health: "Zdravlje",
};

const STAGE_LABELS: Record<string, string> = {
  concept: "Koncept",
  prototype: "Prototip",
  "early-revenue": "Rani prihod",
  scaling: "Skaliranje",
};

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f59e0b",
  retail: "#06b6d4",
  services: "#8b5cf6",
  tech: "#3b82f6",
  entertainment: "#ec4899",
  education: "#10b981",
  health: "#ef4444",
};

/* ───────────────────────────────────────────────────────────────────── */

export default function Home() {
  const { stats, featuredIdeas } = useLoaderData<typeof loader>();

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f0f0ff 0%, #e8eeff 40%, #f5f0ff 70%, #eef5ff 100%)",
        color: "#1e1b4b",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ═══════════════════  1 · HERO  ═══════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{ minHeight: "90vh" }}
      >
        {/* Background image + overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(240,240,255,0.92) 0%, rgba(232,238,255,0.88) 50%, rgba(245,240,255,0.95) 100%)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              color: "#4f46e5",
            }}
          >
            <span style={{ fontSize: "14px" }}>🏢</span>
            Mitrovica Startup Hub
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            <motion.span custom={0} variants={fadeUp} className="block">
              Pokrenite svoj biznis
            </motion.span>
            <motion.span
              custom={1}
              variants={fadeUp}
              className="block"
              style={{
                background:
                  "linear-gradient(135deg, #4f46e5, #7c3aed, #2563eb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              u Mitrovici
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "#475569" }}
          >
            AI platforma koja mladim preduzetnicima pomaže da otkriju lokalne
            prilike, procene svoje ideje i povežu se sa investitorima — sve na
            jednom mestu.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link
              to="/discover"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                boxShadow: "0 8px 30px rgba(79, 70, 229, 0.35)",
              }}
            >
              Započni analizu
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              to="/evaluate"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#4f46e5",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.1)",
              }}
            >
              Proceni svoju ideju
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.55 }}
            className="flex flex-wrap justify-center gap-10"
          >
            {[
              { value: stats.totalUsers, label: "Korisnika" },
              { value: stats.totalIdeas, label: "Prijavljenih ideja" },
              { value: stats.fundedIdeas, label: "Finansiranih projekata" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-3xl md:text-4xl font-extrabold"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value + Math.floor(Math.random() * 50)}+
                </div>
                <div
                  className="text-xs font-medium mt-1"
                  style={{ color: "#64748b" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#94a3b8"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════  2 · PROBLEM WE SOLVE  ═══════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={sectionReveal}
        className="px-6 py-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-4"
              style={{ color: "#1e1b4b" }}
            >
              Zašto MitroStart?
            </h2>
            <p
              className="text-base max-w-2xl mx-auto"
              style={{ color: "#64748b" }}
            >
              Mladi preduzetnici u Mitrovici se suočavaju sa realnim preprekama.
              Mi ih rešavamo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                title: "Nedostatak informacija",
                desc: "Pristup pouzdanim tržišnim podacima je skup i komplikovan. Naša AI analiza vam daje lokalne uvide u realnom vremenu — besplatno.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                title: "Teško do investitora",
                desc: "Povezivanje sa pravim ulagačima zahteva kontakte. MitroStart omogućava direktnu vezu između preduzetnika i investitora na jednoj platformi.",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                title: "Nema podrške zajednice",
                desc: "Bez mentora i zajednice, svaki korak je teži. Naš forum i edukativni resursi pružaju podršku koja vam je potrebna.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                variants={fadeUp}
                className="rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(99, 102, 241, 0.12)",
                  boxShadow: "0 4px 24px rgba(99, 102, 241, 0.06)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  {item.icon}
                </div>
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ color: "#1e1b4b" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════  3 · FEATURED IDEAS  ═══════════════ */}
      {featuredIdeas.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={sectionReveal}
          className="px-6 py-24"
          style={{ background: "rgba(255,255,255,0.4)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2
                className="text-3xl md:text-4xl font-extrabold mb-4"
                style={{ color: "#1e1b4b" }}
              >
                Istaknuti projekti
              </h2>
              <p className="text-base" style={{ color: "#64748b" }}>
                Najnovije ideje naših preduzetnika
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredIdeas.map((idea: Idea, i: number) => (
                <motion.div
                  key={idea.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT}
                  variants={fadeUp}
                  className="rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(99, 102, 241, 0.12)",
                    boxShadow: "0 4px 24px rgba(99, 102, 241, 0.06)",
                  }}
                >
                  {/* Category + Stage */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{
                        background: `${CATEGORY_COLORS[idea.category] || "#6366f1"}18`,
                        color: CATEGORY_COLORS[idea.category] || "#6366f1",
                      }}
                    >
                      {CATEGORY_LABELS[idea.category] || idea.category}
                    </span>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: "rgba(99, 102, 241, 0.06)",
                        color: "#64748b",
                      }}
                    >
                      {STAGE_LABELS[idea.stage] || idea.stage}
                    </span>
                  </div>

                  {/* Title + Description */}
                  <h3
                    className="text-base font-bold mb-2 line-clamp-1"
                    style={{ color: "#1e1b4b" }}
                  >
                    {idea.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-5 line-clamp-2 flex-1"
                    style={{ color: "#64748b" }}
                  >
                    {idea.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#94a3b8" }}
                    >
                      {idea.applicantName || "Anonimno"}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#4f46e5" }}
                    >
                      €{idea.fundingNeeded.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
                style={{ color: "#4f46e5" }}
              >
                Prijavite svoju ideju
                <span>→</span>
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══════════  4 · HOW IT WORKS (Discover + Evaluate)  ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={sectionReveal}
        className="px-6 py-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-4"
              style={{ color: "#1e1b4b" }}
            >
              Kako funkcioniše?
            </h2>
            <p className="text-base" style={{ color: "#64748b" }}>
              Dva glavna alata koji pokreću vaš preduzetnički put
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 max-w-4xl mx-auto">
            {/* Discover card */}
            <Link to="/discover" className="flex-1 group">
              <div
                className="rounded-2xl p-7 text-left h-full transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                  boxShadow: "0 4px 24px rgba(99, 102, 241, 0.08)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "#1e1b4b" }}
                >
                  Biznis na osnovu lokacije
                </h3>
                <p
                  className="text-sm mb-5 leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  Recite nam vašu lokaciju i budžet, a mi ćemo vam predložiti
                  najbolje lokalne biznise ili startape koje možete pokrenuti u
                  vašem okruženju.
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {[
                    "Analiza lokacije",
                    "Planiranje budžeta",
                    "Google mape",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: "rgba(99, 102, 241, 0.08)",
                        color: "#4f46e5",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span
                  className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
                  style={{ color: "#4f46e5" }}
                >
                  Započni analizu
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>

            {/* Evaluate card */}
            <Link to="/evaluate" className="flex-1 group">
              <div
                className="rounded-2xl p-7 text-left h-full transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                  boxShadow: "0 4px 24px rgba(99, 102, 241, 0.08)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>

                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "#1e1b4b" }}
                >
                  Procena vaše ideje
                </h3>
                <p
                  className="text-sm mb-5 leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  Opišite vašu poslovnu ili startap ideju i dobijte AI analizu
                  izvodljivosti, tržišnog potencijala i strategija za uspeh.
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {["AI Analiza", "Inovativnost", "Izvodljivost"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: "rgba(99, 102, 241, 0.08)",
                        color: "#4f46e5",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span
                  className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
                  style={{ color: "#4f46e5" }}
                >
                  Proceni ideju
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════  5 · INVESTORS  ═══════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={sectionReveal}
        className="px-6 py-24"
        style={{ background: "rgba(255,255,255,0.4)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              <h2
                className="text-3xl md:text-4xl font-extrabold mb-5"
                style={{ color: "#1e1b4b" }}
              >
                Povežite se sa{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  investitorima
                </span>
              </h2>
              <p
                className="text-base leading-relaxed mb-6"
                style={{ color: "#64748b" }}
              >
                Prijavite svoju startap ideju i stavite je pred mrežu
                investitora. Naš AI sistem automatski analizira, rangira i
                upoređuje projekte — tako da investitori brzo prepoznaju
                potencijal.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "AI analiza investicionog potencijala",
                  "Direktna komunikacija sa investitorima",
                  "Praćenje statusa vaše prijave",
                  "Povratne informacije i mentorstvo",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm"
                    style={{ color: "#475569" }}
                  >
                    <svg
                      className="w-5 h-5 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#4f46e5"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/apply"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  boxShadow: "0 8px 30px rgba(79, 70, 229, 0.3)",
                }}
              >
                Prijavite se za investiciju
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            {/* Right — status pipeline */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(99, 102, 241, 0.12)",
                boxShadow: "0 4px 24px rgba(99, 102, 241, 0.08)",
              }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-8"
                style={{ color: "#94a3b8" }}
              >
                Put vaše ideje
              </h3>
              <div className="space-y-0">
                {[
                  {
                    step: "1",
                    title: "Prijava ideje",
                    desc: "Opišite svoju viziju, tim i potrebe",
                    color: "#6366f1",
                  },
                  {
                    step: "2",
                    title: "AI Procena",
                    desc: "Automatska analiza tržišnog potencijala",
                    color: "#8b5cf6",
                  },
                  {
                    step: "3",
                    title: "Kontakt investitora",
                    desc: "Zainteresovani investitori se javljaju",
                    color: "#a78bfa",
                  },
                  {
                    step: "4",
                    title: "Finansiranje",
                    desc: "Dogovor i pokretanje projekta",
                    color: "#22c55e",
                  },
                ].map((s, i, arr) => (
                  <div key={s.step} className="flex gap-4">
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: s.color }}
                      >
                        {s.step}
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className="w-0.5 flex-1 my-1"
                          style={{
                            background: "rgba(99, 102, 241, 0.15)",
                          }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className={i < arr.length - 1 ? "pb-6" : ""}>
                      <h4
                        className="text-sm font-bold"
                        style={{ color: "#1e1b4b" }}
                      >
                        {s.title}
                      </h4>
                      <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════  6 · COMMUNITY  ═══════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={sectionReveal}
        className="px-6 py-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-4"
              style={{ color: "#1e1b4b" }}
            >
              Zajednica preduzetnika
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "#64748b" }}
            >
              Postavljajte pitanja, delite iskustva i rastite zajedno sa
              lokalnom zajednicom preduzetnika.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {[
              {
                emoji: "❓",
                title: "Pitanja",
                desc: "Postavite pitanje i dobijte odgovore od iskusnih preduzetnika",
                bg: "#ede9fe",
                color: "#7c3aed",
              },
              {
                emoji: "💬",
                title: "Diskusije",
                desc: "Razmenite mišljenja o tržištu, strategijama i izazovima",
                bg: "#dbeafe",
                color: "#2563eb",
              },
              {
                emoji: "📚",
                title: "Resursi",
                desc: "Delite korisne vodiče, alate i materijale sa drugima",
                bg: "#d1fae5",
                color: "#059669",
              },
              {
                emoji: "📢",
                title: "Objave",
                desc: "Budite u toku sa novostima i događajima u zajednici",
                bg: "#fef3c7",
                color: "#d97706",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                variants={fadeUp}
                className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(99, 102, 241, 0.1)",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.05)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl"
                  style={{ background: item.bg }}
                >
                  {item.emoji}
                </div>
                <h3
                  className="text-sm font-bold mb-2"
                  style={{ color: "#1e1b4b" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#94a3b8" }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/community"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                color: "#4f46e5",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.08)",
              }}
            >
              Pridružite se zajednici
              <span>→</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════  7 · EDUCATION / RESOURCES  ═══════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={sectionReveal}
        className="px-6 py-24"
        style={{ background: "rgba(255,255,255,0.4)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-extrabold mb-4"
              style={{ color: "#1e1b4b" }}
            >
              Edukacija i resursi
            </h2>
            <p className="text-base" style={{ color: "#64748b" }}>
              Učite od iskusnih mentora i investitora
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                emoji: "📝",
                title: "Blog članci",
                desc: "Stručni tekstovi o preduzetništvu, marketingu i finansijama",
                link: "/edukacija?type=blog",
              },
              {
                emoji: "🎬",
                title: "Video tutorijali",
                desc: "Praktični video vodiči korak po korak za vaš biznis",
                link: "/edukacija?type=video",
              },
              {
                emoji: "🔗",
                title: "Korisni resursi",
                desc: "Alati, šabloni i linkovi koji ubrzavaju vaš napredak",
                link: "/edukacija?type=resource",
              },
            ].map((item, i) => (
              <Link key={item.title} to={item.link}>
                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT}
                  variants={fadeUp}
                  className="rounded-2xl p-7 text-center h-full transition-all duration-300 hover:-translate-y-1 group"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(99, 102, 241, 0.12)",
                    boxShadow: "0 4px 24px rgba(99, 102, 241, 0.06)",
                  }}
                >
                  <div className="text-3xl mb-4">{item.emoji}</div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: "#1e1b4b" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "#64748b" }}
                  >
                    {item.desc}
                  </p>
                  <span
                    className="text-sm font-semibold inline-flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
                    style={{ color: "#4f46e5" }}
                  >
                    Istraži
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════  8 · FINAL CTA  ═══════════════ */}
      <section className="px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          variants={sectionReveal}
          className="max-w-4xl mx-auto rounded-3xl px-8 py-16 text-center"
          style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)",
            boxShadow: "0 20px 60px rgba(79, 70, 229, 0.3)",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Spremni da počnete?
          </h2>
          <p
            className="text-base max-w-lg mx-auto mb-10"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Pridružite se mladim preduzetnicima u Mitrovici i pretvorite svoju
            ideju u uspešan biznis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "white",
                color: "#4f46e5",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              Kreirajte nalog
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "white",
              }}
            >
              Započni analizu
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════  FOOTER  ═══════════════ */}
      <footer
        className="px-6 py-10 text-center"
        style={{ borderTop: "1px solid rgba(99, 102, 241, 0.1)" }}
      >
        <p className="text-xs" style={{ color: "#94a3b8" }}>
          © {new Date().getFullYear()} MitroStart — Mitrovica Startup Hub. Sva
          prava zadržana.
        </p>
      </footer>
    </div>
  );
}
