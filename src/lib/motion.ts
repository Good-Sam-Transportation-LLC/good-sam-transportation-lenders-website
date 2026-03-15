import type { Variants } from "framer-motion";

export const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const fadeUpProps = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, delay, ease },
});

export const fadeUpAnimateProps = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});

export const stagger = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, delay, ease },
});

// Backwards-compatible Variants-based exports
// For components using `variants={fadeIn}`
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
  // Alias for legacy animate="visible" / whileInView="visible" usage
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

// For components using `variants={staggerContainer}`
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  // Alias for legacy animate="visible" / whileInView="visible" usage
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Variants approximating the behavior of fadeUp helpers
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
  // Alias for legacy animate="visible" / whileInView="visible" usage
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

export const fadeUpAnimate: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
  // Alias for legacy animate="visible" / whileInView="visible" usage
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};
