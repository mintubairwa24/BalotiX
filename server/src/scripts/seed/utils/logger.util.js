/**
 * @file logger.util.js
 * @location src/scripts/seed/utils/logger.util.js
 *
 * WHY THIS FILE EXISTS:
 * Every seeder needs to report progress, successes, and failures. Without
 * a shared logger, each file would invent its own console.log formatting,
 * making the terminal output inconsistent and hard to scan.
 *
 * HOW IT INTEGRATES:
 * Imported by every seeder (category, product, inventory), reset.js, and
 * index.js. Pure console wrapper — no dependencies, no DB access.
 *
 * WHY PRODUCTION-READY:
 * Uses ANSI color codes directly (no chalk/colors dependency needed) and
 * degrades gracefully in CI environments that don't render color.
 */

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
};

export const logger = {
  /** Section header — used to mark the start of a seeding phase */
  step(message) {
    console.log(`\n${COLORS.cyan}${COLORS.bold}▶ ${message}${COLORS.reset}`);
  },

  /** Successful operation */
  success(message) {
    console.log(`${COLORS.green}  ✔ ${message}${COLORS.reset}`);
  },

  /** Non-fatal warning (e.g. skipped duplicate SKU) */
  warn(message) {
    console.log(`${COLORS.yellow}  ⚠ ${message}${COLORS.reset}`);
  },

  /** Fatal or unexpected error */
  error(message) {
    console.error(`${COLORS.red}  ✘ ${message}${COLORS.reset}`);
  },

  /** Neutral informational line */
  info(message) {
    console.log(`${COLORS.gray}  · ${message}${COLORS.reset}`);
  },

  /** Final summary block */
  summary(title, rows) {
    console.log(`\n${COLORS.bold}${COLORS.green}${title}${COLORS.reset}`);
    rows.forEach(([label, value]) => {
      console.log(`  ${COLORS.gray}${label.padEnd(20)}${COLORS.reset}${COLORS.bold}${value}${COLORS.reset}`);
    });
    console.log("");
  },
};

export default logger;