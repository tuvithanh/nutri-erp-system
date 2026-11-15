const authService = require("../services/authService");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
};

// [POST] /api/auth/register
const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      message: "Tạo tài khoản nhân viên thành công",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/auth/login
const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.loginUser(
      req.body,
    );

    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// [POST] /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const newAccessToken = await authService.verifyAndRefreshAccessToken(
      req.cookies?.refreshToken,
    );
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.clearCookie) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
    }
    next(error);
  }
};

// [POST] /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.sendStatus(204);

    await authService.logoutUser(token);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    next(error);
  }
};

// [GET] /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// [PUT] /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    res.json({
      message: "Cập nhật thông tin cá nhân thành công",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
};
