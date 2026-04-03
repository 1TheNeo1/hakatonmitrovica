import { Link } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "MitroStart - Launch Your Business in Mitrovica" },
    {
      name: "description",
      content:
        "AI-powered business intelligence for young entrepreneurs in Kosovska Mitrovica",
    },
  ];
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 animated-gradient opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px]" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="inline-block mb-6 px-4 py-1.5 rounded-full glass text-xs font-medium text-text-secondary uppercase tracking-widest"
          >
            AI-Powered Business Intelligence
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Launch Your Next
            <br />
            <span className="animated-gradient-text">
              Business in Mitrovica
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12"
          >
            Discover the best business opportunities or evaluate your startup
            idea with AI — tailored for Kosovska Mitrovica's growing market.
          </motion.p>

          {/* CTA Cards */}
          <motion.div
            custom={3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/discover" className="group">
              <div className="glass glass-hover rounded-2xl p-6 text-left transition-all duration-300 hover:glow-secondary sm:w-72">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                <h3 className="text-lg font-bold mb-1">
                  Discover Opportunities
                </h3>
                <p className="text-sm text-text-secondary">
                  Pick a location & budget. AI finds the best business for you.
                </p>
              </div>
            </Link>

            <Link to="/evaluate" className="group">
              <div className="glass glass-hover rounded-2xl p-6 text-left transition-all duration-300 hover:glow-tertiary sm:w-72">
                <div className="w-12 h-12 rounded-xl bg-tertiary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-6 h-6 text-tertiary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-1">Evaluate Your Idea</h3>
                <p className="text-sm text-text-secondary">
                  Describe your concept. AI scores and analyzes its potential.
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/50 via-secondary/50 to-tertiary/50" />

            {[
              {
                step: "01",
                title: "Choose Your Path",
                desc: "Pick a location on the map with your budget, or describe your business idea in detail.",
                color: "text-primary",
                bg: "bg-primary/20",
              },
              {
                step: "02",
                title: "AI Analyzes",
                desc: "Our AI evaluates market demand, competition, demographics, and local context in Mitrovica.",
                color: "text-secondary",
                bg: "bg-secondary/20",
              },
              {
                step: "03",
                title: "Get Insights",
                desc: "Receive actionable business suggestions with viability scores and practical recommendations.",
                color: "text-tertiary",
                bg: "bg-tertiary/20",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div
                  className={`w-20 h-20 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-4 relative z-10`}
                >
                  <span className={`text-2xl font-bold ${item.color}`}>
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-bg-secondary/50">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Built for Mitrovica
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                ),
                title: "Location Intelligence",
                desc: "Google Maps integration for precise area analysis and competitor mapping.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                ),
                title: "Market Analysis",
                desc: "AI-driven market demand scoring, competition analysis, and growth potential.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
                title: "Budget Planning",
                desc: "Realistic cost estimates and budget recommendations for the Kosovo market.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ),
                title: "Local Context",
                desc: "Tailored for Mitrovica's demographics, culture, and economic landscape.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass glass-hover rounded-2xl p-6 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <svg
                  className="w-8 h-8 text-primary mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {feature.icon}
                </svg>
                <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center">
        <p className="text-text-secondary text-sm">
          Built with AI for{" "}
          <span className="text-text-primary font-medium">
            Hackathon Mitrovica 2026
          </span>
        </p>
      </footer>
    </div>
  );
}
