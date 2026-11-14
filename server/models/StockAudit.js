const mongoose = require("mongoose");

const stockAuditSchema = new mongoose.Schema(
  {
    auditCode: { type: String, required: true, unique: true },
    note: { type: String, default: "" },
    auditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "completed",
    },
    items: [
      {
        inventoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        productName: { type: String, required: true },
        sku: { type: String, required: true },
        lotNumber: { type: String, required: true },
        expDate: { type: Date },
        systemQty: { type: Number, required: true }, // Số lượng trên hệ thống
        actualQty: { type: Number, required: true }, // Số lượng đếm thực tế
        diffQty: { type: Number, required: true }, // Chênh lệch (thực tế - hệ thống)
        reason: { type: String, default: "" }, // Lý do chênh lệch (Hủy, hỏng, thất thoát...)
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("StockAudit", stockAuditSchema);
