const express = require("express");
const router = express.Router();
const { getReportSummary } = require("../controllers/reportController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(verifyToken);
// Báo cáo chỉ cho phép Admin và Kho / HR truy cập
router.get(
  "/summary",
  authorizeRoles("admin", "warehouse", "hr"),
  getReportSummary,
);

module.exports = router;
