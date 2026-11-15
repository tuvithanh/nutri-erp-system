const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const registerUser = async ({ fullName, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("Email này đã tồn tại trong hệ thống");
    err.statusCode = 400;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: role || "sales",
  });

  return {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Email hoặc mật khẩu không đúng");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Email hoặc mật khẩu không đúng");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error(
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!",
    );
    err.statusCode = 403;
    throw err;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

const verifyAndRefreshAccessToken = async (token) => {
  if (!token) {
    const err = new Error("Không tìm thấy Refresh Token Cookie");
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findOne({ refreshToken: token });
  if (!user || !user.isActive) {
    const err = new Error(
      "Tài khoản của bạn đã bị khóa hoặc phiên làm việc không hợp lệ",
    );
    err.statusCode = 403;
    err.clearCookie = true;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (user._id.toString() !== decoded.id) {
      const err = new Error("Refresh Token không hợp lệ");
      err.statusCode = 403;
      throw err;
    }

    return generateAccessToken(user);
  } catch (error) {
    const err = new Error("Refresh Token đã hết hạn");
    err.statusCode = 403;
    throw err;
  }
};

const logoutUser = async (token) => {
  if (!token) return;
  const user = await User.findOne({ refreshToken: token });
  if (user) {
    user.refreshToken = "";
    await user.save();
  }
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    const err = new Error("Không tìm thấy người dùng");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const updateUserProfile = async (
  userId,
  { fullName, currentPassword, newPassword },
) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("Không tìm thấy người dùng");
    err.statusCode = 404;
    throw err;
  }

  if (fullName) {
    user.fullName = fullName;
  }

  if (newPassword) {
    if (!currentPassword) {
      const err = new Error("Vui lòng nhập mật khẩu hiện tại");
      err.statusCode = 400;
      throw err;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const err = new Error("Mật khẩu hiện tại không chính xác");
      err.statusCode = 400;
      throw err;
    }

    if (newPassword.length < 6) {
      const err = new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
      err.statusCode = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  await user.save();

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
};

module.exports = {
  registerUser,
  loginUser,
  verifyAndRefreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
