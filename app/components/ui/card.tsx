import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  glow?: "primary" | "secondary" | "tertiary" | "none";
}

const glowClasses = {
  primary: "hover:glow-primary",
  secondary: "hover:glow-secondary",
  tertiary: "hover:glow-tertiary",
  none: "",
};

export function Card({
  glow = "none",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`glass glass-hover rounded-2xl p-6 transition-all duration-300 ${glowClasses[glow]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
