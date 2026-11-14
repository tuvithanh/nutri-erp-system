const mongoose = require("mongoose");

const goodsReceiptSchema = new mongoose.Schema(
  {
    receiptCode: {
      type: String,
      required: true,
      unique: true, // Mã phiếu nhập, ví dụ: PNK-172934000
    },
    supplier: {
      type: String,
      default: "Nhà cung cấp mặc định",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        lotNumber: { type: String, required: true },
        mfgDate: { type: Date },
        expDate: { type: Date, required: true },
        quantity: { type: Number, required: true, min: 1 },
        importPrice: { type: Number, default: 0 },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GoodsReceipt", goodsReceiptSchema);
