const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Vui lòng nhập lý do xin nghỉ phép"],
      trim: true,
    },
    fromDate: {
      type: Date,
      required: [true, "Vui lòng chọn ngày bắt đầu nghỉ"],
    },
    toDate: {
      type: Date,
      required: [true, "Vui lòng chọn ngày kết thúc"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Người thực hiện duyệt/từ chối
    },
    adminComment: {
      type: String, // Ghi chú từ HR hoặc Admin khi duyệt/từ chối
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Leave", leaveSchema);
