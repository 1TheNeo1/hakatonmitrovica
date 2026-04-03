import { Link } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/home";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
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
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-10 px-4 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            color: "#4f46e5",
          }}
        >
          <span style={{ fontSize: "14px" }}>🏢</span>
          Partner: Mitrovica Startup Hub
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 max-w-3xl"
          style={{ color: "#1e1b4b" }}
        >
          <motion.span custom={0} variants={fadeUp} className="block">
            Pretvorite svoje ideje
          </motion.span>
          <motion.span
            custom={1}
            variants={fadeUp}
            className="block"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed, #2563eb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            u pravi biznis
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55 }}
          className="text-lg max-w-xl mx-auto mb-14"
          style={{ color: "#64748b" }}
        >
          Platforma za procenu biznisa zasnovana na veštačkoj inteligenciji za
          mlade preduzetnike. Dobijte trenutni uvid u lokalne prilike ili
          testirajte svoju startap ideju.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl"
        >
          {/* Location-Based Business */}
          <Link to="/discover" className="flex-1 group">
            <div
              className="rounded-2xl p-6 text-left h-full transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                boxShadow: "0 4px 24px rgba(99, 102, 241, 0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 8px 32px rgba(99, 102, 241, 0.18)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(99, 102, 241, 0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 24px rgba(99, 102, 241, 0.08)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(99, 102, 241, 0.15)";
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
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
                className="text-base font-bold mb-2"
                style={{ color: "#1e1b4b" }}
              >
                Biznis na osnovu lokacije
              </h3>
              <p className="text-sm mb-4" style={{ color: "#64748b" }}>
                Recite nam vašu lokaciju i budžet, a mi ćemo vam predložiti
                najbolje lokalne biznise ili startape koje možete pokrenuti u
                vašem okruženju.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["Analiza lokacije", "Planiranje budžeta", "Google mape"].map(
                  (tag) => (
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
                  ),
                )}
              </div>

              <span
                className="text-sm font-semibold inline-flex items-center gap-1 transition-gap duration-200 group-hover:gap-2"
                style={{ color: "#4f46e5" }}
              >
                Započni analizu
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>

          {/* Evaluate Your Idea */}
          <Link to="/evaluate" className="flex-1 group">
            <div
              className="rounded-2xl p-6 text-left h-full transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                boxShadow: "0 4px 24px rgba(99, 102, 241, 0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 8px 32px rgba(99, 102, 241, 0.18)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(99, 102, 241, 0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 24px rgba(99, 102, 241, 0.08)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(99, 102, 241, 0.15)";
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
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
                className="text-base font-bold mb-2"
                style={{ color: "#1e1b4b" }}
              >
                Procena vaše ideje
              </h3>
              <p className="text-sm mb-4" style={{ color: "#64748b" }}>
                Opišite vašu poslovnu ili startap ideju i dobijte AI analizu
                izvodljivosti, tržišnog potencijala i strategija za uspeh.
              </p>

              {/* Tags */}
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
                className="text-sm font-semibold inline-flex items-center gap-1 transition-gap duration-200 group-hover:gap-2"
                style={{ color: "#4f46e5" }}
              >
                Proceni ideju
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Bottom Feature Strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.55 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {[
            {
              emoji: "⚡",
              label: "Brza analiza",
            },
            {
              emoji: "📊",
              label: "Tržišni uvid",
            },
            {
              emoji: "📋",
              label: "Poslovno planiranje",
            },
            {
              emoji: "✨",
              label: "Pokreće AI",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2"
              style={{ color: "#64748b" }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
