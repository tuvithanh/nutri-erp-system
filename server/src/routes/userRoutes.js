const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
  resetPassword,
} = require("../controllers/userController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

// Tất cả API ở đây yêu cầu đã Đăng nhập và có quyền HR hoặc Admin
router.use(verifyToken, authorizeRoles("admin", "hr"));

router.get("/", getAllUsers);
router.put("/:id", updateUser);

// Các thao tác nguy hiểm: Chỉ Admin có quyền
router.delete("/:id", authorizeRoles("admin"), deleteUser);
router.post("/:id/reset-password", authorizeRoles("admin"), resetPassword);

module.exports = router;
