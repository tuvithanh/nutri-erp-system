const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Hàm tạo Access Token (15 phút)
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Hàm tạo Refresh Token (7 ngày)
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// [POST] /api/auth/register (Chỉ Admin tạo tài khoản nhân viên)
const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email này đã tồn tại trong hệ thống" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "sales",
    });

    res.status(201).json({
      message: "Tạo tài khoản nhân viên thành công",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra User có tồn tại trong hệ thống không
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // 2. Kiểm tra Mật khẩu có khớp không
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // 3. Kiểm tra Trạng thái tài khoản (Nên đặt sau bước verify password để tránh leak thông tin)
    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!",
      });
    }

    // 4. Cấp Tokens nếu hợp lệ
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Đổi "lax" cho Dev
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res
        .status(401)
        .json({ message: "Không tìm thấy Refresh Token Cookie" });
    }

    const refreshToken = cookies.refreshToken;
    const user = await User.findOne({ refreshToken });

    // Nếu không tìm thấy user hoặc tài khoản ĐÃ BỊ KHÓA
    if (!user || !user.isActive) {
      // Clear cookie cũ ngay lập tức
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(403).json({
        message:
          "Tài khoản của bạn đã bị khóa hoặc phiên làm việc không hợp lệ",
      });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({ message: "Refresh Token đã hết hạn" });
      }

      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/auth/logout
const logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(204);

    const refreshToken = cookies.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = "";
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/auth/profile - Lấy thông tin cá nhân
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken",
    );
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/auth/profile - Cập nhật họ tên & đổi mật khẩu
const updateProfile = async (req, res) => {
  try {
    const { fullName, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Cập nhật Họ và tên nếu có
    if (fullName) {
      user.fullName = fullName;
    }

    // Xử lý Đổi Mật Khẩu
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập mật khẩu hiện tại" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Mật khẩu hiện tại không chính xác" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.json({
      message: "Cập nhật thông tin cá nhân thành công",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export thêm 2 hàm này ở cuối file:
module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
};
