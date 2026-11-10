import type { Variants } from "framer-motion";
// One easing curve and a small set of durations keep every transition consistent.
export const ease = [0.22, 1, 0.36, 1] as const;
export const dur = { fast: 0.15, base: 0.24, slow: 0.4 };

export const pageV: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: dur.base, ease } },
  exit: { opacity: 0, y: -6, transition: { duration: dur.fast, ease } },
};
export const listV: Variants = { animate: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } } };
export const itemV: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: dur.slow, ease } },
};
export const popV: Variants = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: dur.base, ease } },
  exit: { opacity: 0, scale: 0.98, y: 6, transition: { duration: dur.fast, ease } },
};
export const fadeV: Variants = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
export const tap = { scale: 0.97 };
