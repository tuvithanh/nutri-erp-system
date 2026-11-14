const express = require("express");
const router = express.Router();
const { getDashboardSummary } = require("../controllers/dashboardController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.use(verifyToken);
router.get(
  "/summary",
  authorizeRoles("admin", "hr", "warehouse", "sales"),
  getDashboardSummary,
);

module.exports = router;
