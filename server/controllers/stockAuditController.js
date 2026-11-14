const StockAudit = require("../models/StockAudit");
const Inventory = require("../models/Inventory");

// [GET] /api/stock-audits - Lấy danh sách phiếu kiểm kê
const getStockAudits = async (req, res) => {
  try {
    const audits = await StockAudit.find()
      .populate("auditedBy", "fullName")
      .sort({ createdAt: -1 });
    res.json(audits);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi lấy danh sách phiếu kiểm kê" });
  }
};

// [POST] /api/stock-audits - Tạo phiếu kiểm kê & Cập nhật tồn kho thực tế
const createStockAudit = async (req, res) => {
  try {
    const { note, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Phiếu kiểm kê phải có ít nhất 1 lô hàng!" });
    }

    const auditCode = `PKK-${Date.now().toString().slice(-6)}`;

    // 1. Tạo phiếu kiểm kê
    const newAudit = await StockAudit.create({
      auditCode,
      note: note || "",
      auditedBy: req.user.id,
      items,
    });

    // 2. Cập nhật lại số lượng thực tế vào bảng Inventory cho từng lô
    for (const item of items) {
      await Inventory.findByIdAndUpdate(item.inventoryId, {
        quantity: item.actualQty,
      });
    }

    res.status(201).json({
      message: `Đã lưu phiếu kiểm kê ${auditCode} và cân bằng lại số lượng tồn kho thành công!`,
      audit: newAudit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi tạo phiếu kiểm kê kho" });
  }
};

module.exports = {
  getStockAudits,
  createStockAudit,
};
