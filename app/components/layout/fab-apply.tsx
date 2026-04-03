import { Link } from "react-router";
import { motion } from "framer-motion";
import type { User } from "~/lib/types";

interface FabApplyProps {
  user: User | null;
}

export function FabApply({ user }: FabApplyProps) {
  // Hidden for logged-in admins and investors
  if (user && (user.role === "admin" || user.role === "investor")) {
    return null;
  }

  const href = user?.role === "applicant" ? "/apply" : "/login?redirect=/apply";

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.4, ease: "easeOut" }}
    >
      <Link
        to={href}
        className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full font-semibold text-sm text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
        style={{
          background: "linear-gradient(135deg, #4f46e5, #6366f1, #7c3aed)",
          boxShadow:
            "0 8px 32px rgba(99, 102, 241, 0.4), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <svg
          className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
        Prijavite se za investiciju
      </Link>
    </motion.div>
  );
}
