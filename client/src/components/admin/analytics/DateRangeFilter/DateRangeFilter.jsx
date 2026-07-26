/**
 * FILE: src/components/admin/analytics/DateRangeFilter/DateRangeFilter.jsx
 *
 * ============================================================================
 * DateRangeFilter — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The single control every analytics component in this phase reacts to —
 * preset buttons (Today / 7 Days / 30 Days / 90 Days) plus a custom
 * start/end date picker, writing to analytics.store.js's `startDate`/
 * `endDate`/`preset`. Since every useAnalytics.js hook reads that store
 * directly (see that file's header), changing the range here automatically
 * refetches every card/chart/list on the page — this component doesn't
 * need to know what else exists on the page or manually trigger anything.
 *
 * WHY PRESETS COMPUTE DATES CLIENT-SIDE (this is safe, unlike backend
 * business logic elsewhere in this project): "last 7 days" as a date
 * range is pure calendar arithmetic — today's date minus N days — not a
 * domain-specific business rule like stock thresholds or discount
 * calculations. Every prior phase's "never invent business logic" caution
 * was about domain rules the BACKEND should own (what counts as low
 * stock, how a discount applies); computing what "30 days ago" means as a
 * calendar date is not that kind of rule.
 *
 * PRODUCTION-READY BECAUSE:
 * - Active preset is visually highlighted (reads `preset` from the store,
 *   not re-derived from dates — see analytics.store.js's header for why)
 * - Custom range inputs prevent an end date before the start date
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useAnalyticsStore } from "../../../../store/analytics.store";

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const PRESETS = [
  { key: "today", label: "Today", days: 0 },
  { key: "7d", label: "7 Days", days: 7 },
  { key: "30d", label: "30 Days", days: 30 },
  { key: "90d", label: "90 Days", days: 90 },
];

const DateRangeFilter = () => {
  const preset = useAnalyticsStore((s) => s.preset);
  const startDate = useAnalyticsStore((s) => s.startDate);
  const endDate = useAnalyticsStore((s) => s.endDate);
  const setPreset = useAnalyticsStore((s) => s.setPreset);
  const setCustomRange = useAnalyticsStore((s) => s.setCustomRange);

  const handlePresetClick = (presetKey, days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setPreset(presetKey, toIsoDate(start), toIsoDate(end));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
        {PRESETS.map((p, i) => (
          <button
            key={p.key}
            onClick={() => handlePresetClick(p.key, p.days)}
            aria-pressed={preset === p.key}
            className={`px-3 py-1.5 text-sm font-medium transition ${
              i === 0 ? "rounded-l-lg" : ""
            } ${i === PRESETS.length - 1 ? "rounded-r-lg" : "border-r border-gray-300 dark:border-gray-600"} ${
              preset === p.key
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={startDate}
          max={endDate}
          onChange={(e) => setCustomRange(e.target.value, endDate)}
          aria-label="Start date"
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        />
        <span className="text-sm text-gray-400">to</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          max={toIsoDate(new Date())}
          onChange={(e) => setCustomRange(startDate, e.target.value)}
          aria-label="End date"
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;