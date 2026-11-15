const dashboardService = require("../services/dashboardService");

// [GET] /api/dashboard/summary - Lấy toàn bộ số liệu thống kê tổng quan
const getDashboardSummary = async (req, res, next) => {
  try {
    const summaryData = await dashboardService.getDashboardSummaryData();
    res.json(summaryData);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
