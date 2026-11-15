const mongoose = require("mongoose");
const StockAudit = require("../models/StockAudit");
const Inventory = require("../models/Inventory");
const AuditLog = require("../models/AuditLog");

const getAllStockAudits = async () => {
  return await StockAudit.find()
    .populate("auditedBy", "fullName")
    .sort({ createdAt: -1 });
};

const createStockAuditWithTransaction = async (
  { note, items },
  userId,
  ipAddress,
) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("Phiếu kiểm kê phải có ít nhất 1 lô hàng!");
    err.statusCode = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auditCode = `PKK-${Date.now().toString().slice(-6)}`;

    // 1. Tạo phiếu kiểm kê trong Transaction
    const [newAudit] = await StockAudit.create(
      [
        {
          auditCode,
          note: note || "",
          auditedBy: userId,
          items,
        },
      ],
      { session },
    );

    // 2. Cập nhật số lượng thực tế cho từng lô & xác thực lô tồn tại
    for (const item of items) {
      if (Number(item.actualQty) < 0) {
        const err = new Error("Số lượng kiểm kê thực tế không được nhỏ hơn 0!");
        err.statusCode = 400;
        throw err;
      }

      const updatedBatch = await Inventory.findByIdAndUpdate(
        item.inventoryId,
        { quantity: Number(item.actualQty) },
        { session, new: true },
      );

      if (!updatedBatch) {
        const err = new Error(
          `Không tìm thấy lô hàng ID ${item.inventoryId} để cập nhật!`,
        );
        err.statusCode = 404;
        throw err;
      }
    }

    // 3. Tự động ghi vết vào Nhật ký hệ thống (AuditLog)
    await AuditLog.create(
      [
        {
          user: userId,
          action: "AUDIT",
          module: "INVENTORY",
          description: `Chốt phiếu kiểm kê ${auditCode} và cân bằng tồn kho ${items.length} lô hàng`,
          ipAddress: ipAddress || "::1",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return newAudit;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllStockAudits,
  createStockAuditWithTransaction,
};
