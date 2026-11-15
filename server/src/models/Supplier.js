const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // Ví dụ: NCC-001
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supplier", supplierSchema);
