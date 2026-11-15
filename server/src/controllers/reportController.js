const reportService = require("../services/reportService");

// [GET] /api/reports/dashboard-summary - Lấy tổng quan số liệu báo cáo
const getReportSummary = async (req, res, next) => {
  try {
    const reportData = await reportService.getReportSummaryData(req.query);
    res.json(reportData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportSummary,
};
