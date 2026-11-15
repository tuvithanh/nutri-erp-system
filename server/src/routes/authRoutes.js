const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Các API đăng nhập, đăng ký, cấp lại token và đăng xuất
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập tài khoản nhân viên
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@nutrierp.com
 *               password:
 *                 type: string
 *                 example: NutriErpSecret2026
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về AccessToken và đính kèm RefreshToken vào Cookie
 *       401:
 *         description: Sai email hoặc mật khẩu
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Tạo tài khoản nhân viên mới (Yêu cầu quyền Admin hoặc HR)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 example: nhanvien@nutrierp.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 enum: [admin, hr, warehouse, sales]
 *                 example: warehouse
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *       401:
 *         description: Chưa xác thực Token
 *       403:
 *         description: Không có quyền truy cập
 */
router.post("/register", verifyToken, authorizeRoles("admin", "hr"), register);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Cấp lại Access Token mới từ Refresh Token trong Cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Trả về Access Token mới thành công
 *       401:
 *         description: Không tìm thấy Cookie Refresh Token
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất hệ thống và xóa Cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post("/logout", logout);

// Protected routes (Dành cho tài khoản cá nhân)
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

module.exports = router;
