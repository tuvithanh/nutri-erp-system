const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Vui lòng nhập họ và tên"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "hr", "warehouse", "sales"],
      default: "sales",
    },
    refreshToken: {
      type: String, // Lưu refresh token để kiểm tra/revoke khi đăng xuất
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
