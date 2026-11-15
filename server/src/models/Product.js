const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "Vui lòng nhập mã SKU"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên sản phẩm"],
      trim: true,
    },
    category: {
      type: String,
      default: "Thực phẩm bổ sung",
    },
    unit: {
      type: String,
      default: "Hộp", // Hộp, Chai, Gói, Lọ
    },
    price: {
      type: Number,
      default: 0, // Giá bán niêm yết
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
