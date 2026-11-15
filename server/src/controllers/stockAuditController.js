const stockAuditService = require("../services/stockAuditService");

// [GET] /api/stock-audits - Lấy danh sách phiếu kiểm kê
const getStockAudits = async (req, res, next) => {
  try {
    const audits = await stockAuditService.getAllStockAudits();
    res.json(audits);
  } catch (error) {
    next(error);
  }
};

// [POST] /api/stock-audits - Tạo phiếu kiểm kê & Cập nhật tồn kho thực tế
const createStockAudit = async (req, res, next) => {
  try {
    const newAudit = await stockAuditService.createStockAuditWithTransaction(
      req.body,
      req.user.id,
      req.ip,
    );

    res.status(201).json({
      message: `Đã lưu phiếu kiểm kê ${newAudit.auditCode} và cân bằng lại số lượng tồn kho thành công!`,
      audit: newAudit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockAudits,
  createStockAudit,
};
