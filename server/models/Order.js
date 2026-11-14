const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true, // Ví dụ: HD-172934001
    },
    customerName: {
      type: String,
      required: [true, "Vui lòng nhập tên khách hàng"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      trim: true,
    },
    customerAddress: {
      type: String,
      required: [true, "Vui lòng nhập địa chỉ giao hàng"],
      trim: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // Giá bán tại thời điểm tạo đơn
        // Lưu lại chi tiết từng lô kho đã trừ theo FEFO để khi hủy đơn hoàn trả chính xác
        allocatedBatches: [
          {
            inventoryId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Inventory",
            },
            lotNumber: String,
            quantity: Number,
          },
        ],
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "shipping", "completed", "cancelled"],
      default: "pending",
    },
    createdCategory: {
      type: String,
      enum: ["b2c", "b2b"],
      default: "b2c",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
