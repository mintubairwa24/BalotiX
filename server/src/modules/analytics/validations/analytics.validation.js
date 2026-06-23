/**
 * analytics.validation.js
 *
 * WHO CALLS IT:
 *   analytics.routes.js applies these schemas through the shared validate()
 *   and validateQuery() middleware before the controller runs.
 *
 * WHY IT EXISTS:
 *   Analytics endpoints are read-only, but they are still high-value data
 *   access paths. The query layer needs explicit validation so the service
 *   can safely build aggregation pipelines without defensive parsing in
 *   every function.
 *
 * FUTURE READY:
 *   The same query shape can later drive CSV / Excel exports, cached
 *   dashboard widgets, or scheduled reports without changing the request
 *   contract.
 */

import { z } from "zod";

const dateLike = z
  .string()
  .trim()
  .min(1, "Date value is required")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Must be a valid date",
  });

const analyticsRangeBaseSchema = z
  .object({
    from: dateLike.optional(),
    to: dateLike.optional(),
    period: z.enum(["day", "week", "month", "year"]).optional(),
  });

export const analyticsRangeSchema = analyticsRangeBaseSchema.superRefine((data, ctx) => {
  if (data.from && !data.to) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["to"],
      message: "End date is required when from date is provided",
    });
  }

  if (!data.from && data.to) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["from"],
      message: "Start date is required when end date is provided",
    });
  }

  if (data.from && data.to && new Date(data.from) > new Date(data.to)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["to"],
      message: "End date must be on or after start date",
    });
  }
});

export const analyticsExportSchema = analyticsRangeBaseSchema.extend({
  report: z.enum([
    "dashboard",
    "revenue",
    "sales",
    "products",
    "categories",
    "customers",
    "coupons",
    "inventory",
    "reviews",
  ]),
});
