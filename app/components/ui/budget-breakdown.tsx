import { motion } from "framer-motion";
import type { BudgetBreakdown as BudgetBreakdownType } from "~/lib/types";

const COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#4ade80", "#c084fc", "#fb7185"];

export function BudgetBreakdown({
  breakdown,
  delay = 0,
  title = "Budget Breakdown",
}: {
  breakdown: BudgetBreakdownType;
  delay?: number;
  title?: string;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <h4 className="text-xs font-medium text-text-secondary mb-3 uppercase tracking-wider">
        {title}
      </h4>
      <div className="space-y-2.5">
        {breakdown.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.06, duration: 0.4 }}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">{item.category}</span>
              <span className="font-medium">
                {item.percentage}% · €{item.amount.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: delay + i * 0.07, duration: 0.7, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-text-secondary/60 mt-0.5">{item.description}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
        <span className="text-xs text-text-secondary">Est. Monthly Running Cost</span>
        <span className="text-sm font-semibold" style={{ color: "#f59e0b" }}>
          €{breakdown.monthlyRunningCost.toLocaleString()}/mo
        </span>
      </div>
    </div>
  );
}
