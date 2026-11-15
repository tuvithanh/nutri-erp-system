const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      required: true,
      unique: true, // Ví dụ: KH-0001
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên khách hàng"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      unique: true,
      trim: true,
    },
    email: { type: String, trim: true, default: "" },
    address: { type: String, default: "" },
    type: {
      type: String,
      enum: ["b2c", "b2b"], // b2c: Khách lẻ, b2b: Đại lý/Phòng Gym
      default: "b2c",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Customer", customerSchema);
