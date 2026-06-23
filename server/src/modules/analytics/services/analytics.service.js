/**
 * analytics.service.js
 *
 * WHO CALLS IT:
 *   analytics.controller.js is the HTTP caller. This service is the only
 *   place that should compose reporting pipelines over the domain models.
 *
 * WHY IT EXISTS:
 *   Analytics is a read-only reporting layer. It never owns data; it reads
 *   from existing collections and reshapes that data into operational views
 *   for the admin dashboard.
 *
 * DESIGN PRINCIPLES:
 *   - Prefer aggregation pipelines over loading documents into memory.
 *   - Filter early, project narrowly, group late.
 *   - Use $facet and targeted lookups where multiple stats share a source.
 *   - Keep calculations explicit so business rules are easy to audit.
 *
 * PERFORMANCE NOTES:
 *   These queries are designed to stay efficient at 100k+ users and 1M+
 *   orders/payments by leaning on indexed fields and server-side reduction.
 *   For later scale-out, the same functions are strong candidates for Redis
 *   caching, materialized snapshots, or scheduled report generation.
 */

import User from "../../auth/models/user.model.js";
import UserProfile from "../../users/models/userProfile.model.js";
import Product from "../../products/models/product.model.js";
import Category from "../../categories/models/category.model.js";
import Order from "../../orders/models/order.model.js";
import OrderItem from "../../orders/models/orderitem.model.js";
import Payment from "../../payments/models/payment.model.js";
import Review from "../../reviews/models/review.model.js";
import CouponRedemption from "../../coupons/models/couponredempation.model.js";
import Inventory from "../../inventory/models/inventory.model.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (value) => new Date(value);

const startOfDayUTC = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const endOfDayUTC = (date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
  );

const buildDateMatch = (field, from, to) => {
  const range = {};
  if (from) {
    range.$gte = from;
  }
  if (to) {
    range.$lte = to;
  }

  return Object.keys(range).length ? { [field]: range } : {};
};

const parseRange = (query = {}) => {
  const now = new Date();
  let from = query.from ? toDate(query.from) : null;
  let to = query.to ? toDate(query.to) : null;

  if (query.period && !from && !to) {
    if (query.period === "day") {
      from = new Date(now.getTime() - DAY_MS);
    } else if (query.period === "week") {
      from = new Date(now.getTime() - 7 * DAY_MS);
    } else if (query.period === "month") {
      from = new Date(now.getTime() - 30 * DAY_MS);
    } else if (query.period === "year") {
      from = new Date(now.getTime() - 365 * DAY_MS);
    }
    to = now;
  }

  if (!from && !to) {
    // Default to a 30-day window for trend-style dashboards. The overview
    // report does not use this helper, so it remains all-time.
    from = new Date(now.getTime() - 30 * DAY_MS);
    to = now;
  }

  if (from) {
    from = startOfDayUTC(from);
  }

  if (to) {
    to = endOfDayUTC(to);
  }

  return { from, to };
};

const safeDivide = (numerator, denominator) => (denominator > 0 ? numerator / denominator : 0);

const countFromAggregation = (rows) => rows[0]?.count || 0;

const sumFromAggregation = (rows, field) => rows[0]?.[field] || 0;

const buildTimeSeries = async ({ from, to, format }) => {
  const rows = await Payment.aggregate([
    {
      $match: {
        status: "paid",
        paidAt: buildDateMatch("paidAt", from, to).paidAt,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format,
            date: "$paidAt",
            timezone: "UTC",
          },
        },
        revenue: { $sum: "$amount" },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({
    label: row._id,
    revenue: row.revenue,
    transactions: row.transactions,
  }));
};

const buildPaidOrderRevenueWindow = async (from, to) => {
  const rows = await Order.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        ...buildDateMatch("createdAt", from, to),
      },
    },
    {
      $group: {
        _id: null,
        orderCount: { $sum: 1 },
        revenue: { $sum: { $ifNull: ["$totalAmount", 0] } },
      },
    },
  ]);

  return {
    orderCount: rows[0]?.orderCount || 0,
    revenue: rows[0]?.revenue || 0,
  };
};

const buildProductSalesPipeline = ({ from, to, sortDirection = -1, limit = 10 }) => [
  {
    $lookup: {
      from: "orders",
      localField: "orderId",
      foreignField: "_id",
      as: "order",
    },
  },
  { $unwind: "$order" },
  {
    $match: {
      "order.paymentStatus": "paid",
      ...buildDateMatch("order.createdAt", from, to),
    },
  },
  {
    $group: {
      _id: {
        productId: "$productId",
        productName: "$productNameSnapshot",
      },
      unitsSold: { $sum: "$quantity" },
      revenue: { $sum: "$lineTotal" },
    },
  },
  {
    $sort: {
      unitsSold: sortDirection,
      revenue: sortDirection,
      "_id.productName": 1,
    },
  },
  { $limit: limit },
  {
    $project: {
      _id: 0,
      productId: "$_id.productId",
      productName: "$_id.productName",
      unitsSold: 1,
      revenue: 1,
    },
  },
];

const buildCategorySalesPipeline = ({ from, to, sortDirection = -1, limit = 10 }) => [
  {
    $lookup: {
      from: "orders",
      localField: "orderId",
      foreignField: "_id",
      as: "order",
    },
  },
  { $unwind: "$order" },
  {
    $match: {
      "order.paymentStatus": "paid",
      ...buildDateMatch("order.createdAt", from, to),
    },
  },
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product",
    },
  },
  { $unwind: "$product" },
  {
    $lookup: {
      from: "categories",
      localField: "product.categoryId",
      foreignField: "_id",
      as: "category",
    },
  },
  { $unwind: "$category" },
  {
    $group: {
      _id: {
        categoryId: "$category._id",
        categoryName: "$category.name",
      },
      unitsSold: { $sum: "$quantity" },
      revenue: { $sum: "$lineTotal" },
    },
  },
  {
    $sort: {
      revenue: sortDirection,
      unitsSold: sortDirection,
      "_id.categoryName": 1,
    },
  },
  { $limit: limit },
  {
    $project: {
      _id: 0,
      categoryId: "$_id.categoryId",
      categoryName: "$_id.categoryName",
      unitsSold: 1,
      revenue: 1,
    },
  },
];

const getActiveCustomerCount = async () => {
  const rows = await User.aggregate([
    { $match: { role: "customer" } },
    {
      $lookup: {
        from: "userprofiles",
        localField: "_id",
        foreignField: "userId",
        as: "profile",
      },
    },
    {
      $match: {
        $or: [
          {
            $expr: {
              $eq: [{ $size: "$profile" }, 0],
            },
          },
          {
            profile: {
              $elemMatch: { accountStatus: "active" },
            },
          },
        ],
      },
    },
    { $count: "count" },
  ]);

  return countFromAggregation(rows);
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const getDashboardOverview = async () => {
  const [revenueRows, totalOrders, totalCustomers, totalProducts, totalCategories, totalReviews] =
    await Promise.all([
      Payment.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]),
      Order.estimatedDocumentCount(),
      User.countDocuments({ role: "customer" }),
      Product.estimatedDocumentCount(),
      Category.estimatedDocumentCount(),
      Review.estimatedDocumentCount(),
    ]);

  return {
    totalRevenue: sumFromAggregation(revenueRows, "totalRevenue"),
    totalOrders,
    totalCustomers,
    totalProducts,
    totalCategories,
    totalReviews,
  };
};

// ---------------------------------------------------------------------------
// Revenue
// ---------------------------------------------------------------------------

export const getRevenueAnalytics = async (query = {}) => {
  const { from, to } = parseRange(query);

  const [dailyRevenue, weeklyRevenue, monthlyRevenue, yearlyRevenue, totalRows] =
    await Promise.all([
      buildTimeSeries({ from, to, format: "%Y-%m-%d" }),
      buildTimeSeries({ from, to, format: "%G-W%V" }),
      buildTimeSeries({ from, to, format: "%Y-%m" }),
      buildTimeSeries({ from, to, format: "%Y" }),
      Payment.aggregate([
        {
          $match: {
            status: "paid",
            ...buildDateMatch("paidAt", from, to),
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$amount" },
            paidTransactions: { $sum: 1 },
          },
        },
      ]),
    ]);

  return {
    range: { from, to },
    revenue: sumFromAggregation(totalRows, "revenue"),
    paidTransactions: sumFromAggregation(totalRows, "paidTransactions"),
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    yearlyRevenue,
  };
};

// ---------------------------------------------------------------------------
// Sales
// ---------------------------------------------------------------------------

export const getSalesAnalytics = async (query = {}) => {
  const { from, to } = parseRange(query);
  const windowMs = to.getTime() - from.getTime();
  const previousFrom = new Date(from.getTime() - windowMs);
  const previousTo = from;

  const [current, previous] = await Promise.all([
    buildPaidOrderRevenueWindow(from, to),
    buildPaidOrderRevenueWindow(previousFrom, previousTo),
  ]);

  return {
    range: { from, to },
    totalSales: current.revenue,
    averageOrderValue: safeDivide(current.revenue, current.orderCount),
    orderCount: current.orderCount,
    revenueGrowth: Number(
      (
        previous.revenue === 0
          ? current.revenue > 0
            ? 100
            : 0
          : ((current.revenue - previous.revenue) / previous.revenue) * 100
      ).toFixed(2)
    ),
  };
};

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const getProductAnalytics = async (query = {}) => {
  const { from, to } = parseRange(query);

  const [topSellingProducts, worstSellingProducts, revenuePerProduct] = await Promise.all([
    OrderItem.aggregate(buildProductSalesPipeline({ from, to, sortDirection: -1, limit: 10 })),
    OrderItem.aggregate(buildProductSalesPipeline({ from, to, sortDirection: 1, limit: 10 })),
    OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.paymentStatus": "paid",
          ...buildDateMatch("order.createdAt", from, to),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: {
            productId: "$product._id",
            productName: "$product.name",
          },
          revenue: { $sum: "$lineTotal" },
          unitsSold: { $sum: "$quantity" },
        },
      },
      { $sort: { revenue: -1, unitsSold: -1, "_id.productName": 1 } },
      {
        $project: {
          _id: 0,
          productId: "$_id.productId",
          productName: "$_id.productName",
          revenue: 1,
          unitsSold: 1,
        },
      },
    ]),
  ]);

  return {
    range: { from, to },
    topSellingProducts,
    worstSellingProducts,
    revenuePerProduct,
  };
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const getCategoryAnalytics = async (query = {}) => {
  const { from, to } = parseRange(query);

  const [bestCategories, revenuePerCategory, productCountPerCategory] = await Promise.all([
    OrderItem.aggregate(buildCategorySalesPipeline({ from, to, sortDirection: -1, limit: 10 })),
    OrderItem.aggregate(buildCategorySalesPipeline({ from, to, sortDirection: -1, limit: 100 })),
    Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: {
            categoryId: "$category._id",
            categoryName: "$category.name",
          },
          productCount: { $sum: 1 },
        },
      },
      { $sort: { productCount: -1, "_id.categoryName": 1 } },
      {
        $project: {
          _id: 0,
          categoryId: "$_id.categoryId",
          categoryName: "$_id.categoryName",
          productCount: 1,
        },
      },
    ]),
  ]);

  return {
    range: { from, to },
    bestCategories,
    revenuePerCategory,
    productCountPerCategory,
  };
};

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const getCustomerAnalytics = async (query = {}) => {
  const { from, to } = parseRange(query);

  const [totalUsers, newUsers, activeUsers, repeatCustomers] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({
      role: "customer",
      createdAt: buildDateMatch("createdAt", from, to).createdAt,
    }),
    getActiveCustomerCount(),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
        },
      },
      { $match: { orderCount: { $gte: 2 } } },
      { $count: "count" },
    ]),
  ]);

  return {
    range: { from, to },
    totalUsers,
    newUsers,
    activeUsers,
    repeatCustomers: countFromAggregation(repeatCustomers),
  };
};

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export const getCouponAnalytics = async (query = {}) => {
  const { from, to } = parseRange(query);
  const match = buildDateMatch("createdAt", from, to);

  const [mostUsedCoupons, couponUsageCounts, couponRevenueImpact] = await Promise.all([
    CouponRedemption.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $lookup: {
          from: "coupons",
          localField: "couponId",
          foreignField: "_id",
          as: "coupon",
        },
      },
      { $unwind: "$coupon" },
      {
        $group: {
          _id: {
            couponId: "$coupon._id",
            code: "$coupon.code",
          },
          usageCount: { $sum: 1 },
          revenueImpact: { $sum: "$discountApplied" },
        },
      },
      { $sort: { usageCount: -1, revenueImpact: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          couponId: "$_id.couponId",
          code: "$_id.code",
          usageCount: 1,
          revenueImpact: 1,
        },
      },
    ]),
    CouponRedemption.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $group: {
          _id: "$couponId",
          usageCount: { $sum: 1 },
          revenueImpact: { $sum: "$discountApplied" },
        },
      },
      { $sort: { usageCount: -1 } },
      { $limit: 50 },
    ]),
    CouponRedemption.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      {
        $group: {
          _id: null,
          couponRevenueImpact: { $sum: "$discountApplied" },
        },
      },
    ]),
  ]);

  return {
    range: { from, to },
    mostUsedCoupons,
    couponUsageCounts,
    couponRevenueImpact: sumFromAggregation(couponRevenueImpact, "couponRevenueImpact"),
  };
};

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export const getInventoryAnalytics = async (query = {}) => {
  const [lowStockProducts, outOfStockProducts, inventoryValue] = await Promise.all([
    Inventory.aggregate([
      { $match: { status: "low_stock" } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          productName: "$product.name",
          sku: 1,
          availableStock: { $subtract: ["$warehouseStock", "$reservedStock"] },
          lowStockThreshold: 1,
        },
      },
      { $sort: { availableStock: 1 } },
      { $limit: 50 },
    ]),
    Inventory.aggregate([
      { $match: { status: "out_of_stock" } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          productName: "$product.name",
          sku: 1,
          availableStock: { $subtract: ["$warehouseStock", "$reservedStock"] },
        },
      },
      { $sort: { productName: 1 } },
      { $limit: 50 },
    ]),
    Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: null,
          inventoryValue: {
            $sum: {
              $multiply: ["$warehouseStock", "$product.price"],
            },
          },
        },
      },
    ]),
  ]);

  return {
    range: null,
    lowStockProducts,
    outOfStockProducts,
    inventoryValue: sumFromAggregation(inventoryValue, "inventoryValue"),
  };
};

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const getReviewAnalytics = async (query = {}) => {
  const { from, to } = parseRange(query);

  const [summary, topRatedProducts, lowestRatedProducts] = await Promise.all([
    Review.aggregate([
      {
        $match: {
          ...buildDateMatch("createdAt", from, to),
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]),
    Review.aggregate([
      {
        $match: {
          ...buildDateMatch("createdAt", from, to),
        },
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1, totalReviews: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          productName: "$product.name",
          averageRating: 1,
          totalReviews: 1,
        },
      },
    ]),
    Review.aggregate([
      {
        $match: {
          ...buildDateMatch("createdAt", from, to),
        },
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { averageRating: 1, totalReviews: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          productName: "$product.name",
          averageRating: 1,
          totalReviews: 1,
        },
      },
    ]),
  ]);

  return {
    range: { from, to },
    platformAverageRating: summary[0]?.averageRating || 0,
    totalReviews: summary[0]?.totalReviews || 0,
    topRatedProducts,
    lowestRatedProducts,
  };
};

// ---------------------------------------------------------------------------
// Export + Cache Hooks
// ---------------------------------------------------------------------------

/**
 * In-memory cache hook.
 *
 * Why this exists:
 *   The module is read-heavy and a dashboard usually asks for the same
 *   slices repeatedly. This cache is intentionally tiny and pluggable: it
 *   works now without extra dependencies, and it gives us a clean seam for
 *   Redis later without changing controller or route contracts.
 */
const analyticsCache = new Map();
const ANALYTICS_CACHE_TTL_MS =
  Number(process.env.ANALYTICS_CACHE_TTL_SECONDS || 300) * 1000;

const makeCacheKey = (report, query = {}) =>
  `analytics:${report}:${JSON.stringify(query)}`;

const getCached = (key) => {
  const entry = analyticsCache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    analyticsCache.delete(key);
    return null;
  }

  return entry.value;
};

const setCached = (key, value) => {
  analyticsCache.set(key, {
    value,
    expiresAt: Date.now() + ANALYTICS_CACHE_TTL_MS,
  });
};

export const getAnalyticsReport = async (report, query = {}) => {
  const cacheKey = makeCacheKey(report, query);
  const cached = getCached(cacheKey);

  if (cached) {
    return cached;
  }

  let payload;

  switch (report) {
    case "dashboard":
      payload = await getDashboardOverview();
      break;
    case "revenue":
      payload = await getRevenueAnalytics(query);
      break;
    case "sales":
      payload = await getSalesAnalytics(query);
      break;
    case "products":
      payload = await getProductAnalytics(query);
      break;
    case "categories":
      payload = await getCategoryAnalytics(query);
      break;
    case "customers":
      payload = await getCustomerAnalytics(query);
      break;
    case "coupons":
      payload = await getCouponAnalytics(query);
      break;
    case "inventory":
      payload = await getInventoryAnalytics(query);
      break;
    case "reviews":
      payload = await getReviewAnalytics(query);
      break;
    default: {
      const error = new Error("Unsupported analytics report");
      error.statusCode = 400;
      throw error;
    }
  }

  setCached(cacheKey, payload);
  return payload;
};

const sectionFromRows = (section, rows) =>
  rows.map((row) => ({ section, ...row }));

const rowsToCsv = (rows) => {
  if (!rows.length) {
    return "";
  }

  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escapeCell = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    const escaped = stringValue.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(headers.map((header) => escapeCell(row[header])).join(","));
  }

  return lines.join("\n");
};

const toSheetXml = (sheetName, rows) => {
  const headers = rows.length ? [...new Set(rows.flatMap((row) => Object.keys(row)))] : [];
  const xmlEscape = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const buildCell = (value) => {
    if (value === null || value === undefined) {
      return "<Cell><Data ss:Type=\"String\"></Data></Cell>";
    }

    if (typeof value === "number") {
      return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
    }

    if (typeof value === "boolean") {
      return `<Cell><Data ss:Type="Boolean">${value ? 1 : 0}</Data></Cell>`;
    }

    return `<Cell><Data ss:Type="String">${xmlEscape(
      typeof value === "object" ? JSON.stringify(value) : value
    )}</Data></Cell>`;
  };

  const rowsXml = [];
  if (headers.length) {
    rowsXml.push(
      `<Row>${headers
        .map((header) => `<Cell><Data ss:Type="String">${xmlEscape(header)}</Data></Cell>`)
        .join("")}</Row>`
    );
  }

  for (const row of rows) {
    rowsXml.push(`<Row>${headers.map((header) => buildCell(row[header])).join("")}</Row>`);
  }

  return `<Worksheet ss:Name="${xmlEscape(sheetName)}"><Table>${rowsXml.join("")}</Table></Worksheet>`;
};

const buildExportSections = (report, payload) => {
  switch (report) {
    case "dashboard":
      return [
        {
          name: "Dashboard",
          rows: [payload],
        },
      ];
    case "revenue":
      return [
        { name: "Summary", rows: [{ rangeFrom: payload.range.from, rangeTo: payload.range.to, revenue: payload.revenue, paidTransactions: payload.paidTransactions }] },
        { name: "Daily Revenue", rows: sectionFromRows("daily", payload.dailyRevenue) },
        { name: "Weekly Revenue", rows: sectionFromRows("weekly", payload.weeklyRevenue) },
        { name: "Monthly Revenue", rows: sectionFromRows("monthly", payload.monthlyRevenue) },
        { name: "Yearly Revenue", rows: sectionFromRows("yearly", payload.yearlyRevenue) },
      ];
    case "sales":
      return [
        {
          name: "Sales",
          rows: [payload],
        },
      ];
    case "products":
      return [
        { name: "Top Selling Products", rows: sectionFromRows("top_selling", payload.topSellingProducts) },
        { name: "Worst Selling Products", rows: sectionFromRows("worst_selling", payload.worstSellingProducts) },
        { name: "Revenue Per Product", rows: sectionFromRows("revenue_per_product", payload.revenuePerProduct) },
      ];
    case "categories":
      return [
        { name: "Best Categories", rows: sectionFromRows("best_categories", payload.bestCategories) },
        { name: "Revenue Per Category", rows: sectionFromRows("revenue_per_category", payload.revenuePerCategory) },
        { name: "Product Count Per Category", rows: sectionFromRows("product_count_per_category", payload.productCountPerCategory) },
      ];
    case "customers":
      return [
        {
          name: "Customers",
          rows: [payload],
        },
      ];
    case "coupons":
      return [
        { name: "Most Used Coupons", rows: sectionFromRows("most_used", payload.mostUsedCoupons) },
        { name: "Coupon Usage Counts", rows: sectionFromRows("usage_counts", payload.couponUsageCounts) },
        { name: "Summary", rows: [{ rangeFrom: payload.range.from, rangeTo: payload.range.to, couponRevenueImpact: payload.couponRevenueImpact }] },
      ];
    case "inventory":
      return [
        { name: "Low Stock Products", rows: sectionFromRows("low_stock", payload.lowStockProducts) },
        { name: "Out Of Stock Products", rows: sectionFromRows("out_of_stock", payload.outOfStockProducts) },
        { name: "Summary", rows: [{ inventoryValue: payload.inventoryValue }] },
      ];
    case "reviews":
      return [
        {
          name: "Summary",
          rows: [
            {
              rangeFrom: payload.range.from,
              rangeTo: payload.range.to,
              platformAverageRating: payload.platformAverageRating,
              totalReviews: payload.totalReviews,
            },
          ],
        },
        { name: "Top Rated Products", rows: sectionFromRows("top_rated", payload.topRatedProducts) },
        { name: "Lowest Rated Products", rows: sectionFromRows("lowest_rated", payload.lowestRatedProducts) },
      ];
    default:
      return [];
  }
};

const buildCsvExport = (report, payload) => {
  const sections = buildExportSections(report, payload);
  const chunks = [];

  for (const section of sections) {
    chunks.push(`# ${section.name}`);
    chunks.push(rowsToCsv(section.rows));
    chunks.push("");
  }

  return chunks.join("\n");
};

const buildExcelExport = (report, payload) => {
  const sections = buildExportSections(report, payload);
  const worksheets = sections
    .map((section) => toSheetXml(section.name, section.rows))
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${worksheets}
</Workbook>`;
};

export const exportAnalyticsCsv = async (report, query = {}) => {
  const payload = await getAnalyticsReport(report, query);
  return buildCsvExport(report, payload);
};

export const exportAnalyticsExcel = async (report, query = {}) => {
  const payload = await getAnalyticsReport(report, query);
  return buildExcelExport(report, payload);
};
