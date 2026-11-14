const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    lotNumber: {
      type: String,
      required: [true, "Vui lòng nhập số Lô sản xuất (LOT)"],
      trim: true,
    },
    mfgDate: {
      type: Date, // Ngày sản xuất
    },
    expDate: {
      type: Date,
      required: [true, "Vui lòng nhập Hạn sử dụng (EXP)"],
    },
    quantity: {
      type: Number,
      required: [true, "Vui lòng nhập số lượng nhập kho"],
      min: [0, "Số lượng không được âm"],
    },
    importPrice: {
      type: Number,
      default: 0, // Giá nhập đợt này
    },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Inventory", inventorySchema);
