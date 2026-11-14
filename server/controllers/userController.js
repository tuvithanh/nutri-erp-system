const User = require("../models/User");
const bcrypt = require("bcryptjs");

// [GET] /api/users - Lấy danh sách nhân viên (HR & Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/users/:id - Cập nhật thông tin nhân viên
const updateUser = async (req, res) => {
  try {
    const { fullName, email, role, isActive } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Ràng buộc HR: Không được sửa role của Admin hoặc tự thăng cấp lên Admin
    if (req.user.role === "hr") {
      if (targetUser.role === "admin" || role === "admin") {
        return res
          .status(403)
          .json({ message: "HR không có quyền can thiệp vào tài khoản Admin" });
      }
      // HR không có quyền thay đổi trạng thái Active/Inactive
      delete req.body.isActive;
    }

    targetUser.fullName = fullName || targetUser.fullName;
    targetUser.email = email || targetUser.email;
    targetUser.role = role || targetUser.role;

    if (req.user.role === "admin" && typeof isActive === "boolean") {
      targetUser.isActive = isActive;
      if (isActive === false) {
        targetUser.refreshToken = "";
      }
    }

    await targetUser.save();
    res.json({ message: "Cập nhật nhân viên thành công", user: targetUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [DELETE] /api/users/:id - Xóa nhân viên (Chỉ Admin)
const deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });

    if (targetUser._id.toString() === req.user.id) {
      return res
        .status(400)
        .json({ message: "Không thể tự xóa tài khoản của chính mình" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa tài khoản nhân viên khỏi hệ thống" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/users/:id/reset-password - Reset mật khẩu (Chỉ Admin)
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải từ 6 ký tự trở lên" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, updateUser, deleteUser, resetPassword };
