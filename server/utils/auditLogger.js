const AuditLog = require("../models/AuditLog");

const logAction = async ({ userId, action, module, description, req }) => {
  try {
    const ipAddress =
      req?.headers["x-forwarded-for"] ||
      req?.socket?.remoteAddress ||
      "127.0.0.1";
    await AuditLog.create({
      user: userId,
      action,
      module,
      description,
      ipAddress,
    });
  } catch (err) {
    console.error("Lỗi ghi nhận Audit Log:", err.message);
  }
};

module.exports = logAction;
