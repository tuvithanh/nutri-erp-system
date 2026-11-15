const AuditLog = require("../models/AuditLog");

// [GET] /api/audit-logs - Lấy danh sách Nhật ký (Chỉ Admin)
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(200); // Lấy 200 bản ghi mới nhất

    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi lấy nhật ký hệ thống" });
  }
};

module.exports = {
  getAuditLogs,
};
