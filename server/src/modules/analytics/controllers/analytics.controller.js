/**
 * analytics.controller.js
 *
 * WHO CALLS IT:
 *   analytics.routes.js wires each admin-only endpoint here.
 *
 * WHY IT EXISTS:
 *   Controllers remain thin: they delegate business calculations to the
 *   service layer and format a stable JSON response for the admin UI.
 */

import sendResponse from "../../../shared/utils/sendResponse.js";
import * as analyticsService from "../services/analytics.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardOverview();
    return sendResponse(res, {
      statusCode: 200,
      message: "Dashboard analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const data = await analyticsService.getRevenueAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Revenue analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const data = await analyticsService.getSalesAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Sales analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const data = await analyticsService.getProductAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Product analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const data = await analyticsService.getCategoryAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Category analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const data = await analyticsService.getCustomerAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Customer analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const data = await analyticsService.getCouponAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Coupon analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const data = await analyticsService.getInventoryAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Inventory analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const data = await analyticsService.getPaymentAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Payment analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const data = await analyticsService.getReviewAnalytics(req.query);
    return sendResponse(res, {
      statusCode: 200,
      message: "Review analytics loaded successfully",
      data: { analytics: data },
    });
  } catch (error) {
    return next(error);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const csv = await analyticsService.exportAnalyticsCsv(req.query.report, req.query);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-${req.query.report}-${Date.now()}.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};

export const exportExcel = async (req, res, next) => {
  try {
    const excelXml = await analyticsService.exportAnalyticsExcel(req.query.report, req.query);

    res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-${req.query.report}-${Date.now()}.xls"`
    );

    return res.status(200).send(excelXml);
  } catch (error) {
    return next(error);
  }
};
