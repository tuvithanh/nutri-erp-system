const Leave = require("../models/Leave");

// [POST] /api/leaves - Tạo đơn xin nghỉ mới (Mọi nhân viên)
const createLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate } = req.body;
    if (!reason || !fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin đơn" });
    }

    const leave = await Leave.create({
      user: req.user.id,
      reason,
      fromDate,
      toDate,
    });

    res
      .status(201)
      .json({ message: "Đã gửi đơn xin nghỉ phép thành công", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/leaves/my-leaves - Lấy lịch sử đơn của chính người đang đăng nhập
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id })
      .populate("approvedBy", "fullName role")
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/leaves/pending - Lấy danh sách đơn cần duyệt (Được phân quyền cho HR & Admin)
const getPendingLeaves = async (req, res) => {
  try {
    let leaves = await Leave.find({ status: "pending" })
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 });

    // HR KHÔNG ĐƯỢC THẤY VÀ KHÔNG ĐƯỢC DUYỆT ĐƠN CỦA HR KHÁC HOẶC ADMIN
    if (req.user.role === "hr") {
      leaves = leaves.filter(
        (item) => item.user && ["sales", "warehouse"].includes(item.user.role),
      );
    }

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/leaves/:id/approve - Duyệt hoặc Từ chối đơn nghỉ phép
const approveOrRejectLeave = async (req, res) => {
  try {
    const { status, adminComment } = req.body; // status: 'approved' | 'rejected'
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const leave = await Leave.findById(req.params.id).populate(
      "user",
      "role fullName",
    );
    if (!leave) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn xin nghỉ phép" });
    }

    // RÀNG BUỘC PHÂN QUYỀN DUYỆT BẢO MẬT BẬC CAO:
    // 1. HR không thể duyệt đơn của Admin hoặc của HR khác
    if (req.user.role === "hr" && ["admin", "hr"].includes(leave.user.role)) {
      return res.status(403).json({
        message:
          "HR không có quyền duyệt đơn nghỉ phép của HR khác hoặc Admin!",
      });
    }

    // 2. Không thể tự duyệt đơn của chính mình
    if (leave.user._id.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: "Bạn không thể tự duyệt đơn của chính mình!" });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.adminComment = adminComment || "";
    await leave.save();

    res.json({
      message: `Đã ${status === "approved" ? "chấp thuận" : "từ chối"} đơn thành công`,
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/leaves/stats - Thống kê đơn nghỉ phép (Chỉ HR & Admin)
const getLeaveStats = async (req, res) => {
  try {
    const total = await Leave.countDocuments();
    const pending = await Leave.countDocuments({ status: "pending" });
    const approved = await Leave.countDocuments({ status: "approved" });
    const rejected = await Leave.countDocuments({ status: "rejected" });

    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLeave,
  getMyLeaves,
  getPendingLeaves,
  approveOrRejectLeave,
  getLeaveStats,
};
