const express = require("express");
const router = express.Router();
const {
  createLeave,
  getMyLeaves,
  getPendingLeaves,
  approveOrRejectLeave,
  getLeaveStats,
} = require("../controllers/leaveController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Tất cả API yêu cầu đăng nhập
router.use(verifyToken);

// API Dành cho mọi Nhân viên
router.post("/", createLeave);
router.get("/my-leaves", getMyLeaves);

// API Dành cho Quản lý (HR & Admin)
router.get("/pending", authorizeRoles("admin", "hr"), getPendingLeaves);
router.put("/:id/approve", authorizeRoles("admin", "hr"), approveOrRejectLeave);
router.get("/stats", authorizeRoles("admin", "hr"), getLeaveStats);

module.exports = router;
