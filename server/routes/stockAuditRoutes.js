const express = require("express");
const router = express.Router();
const {
  getStockAudits,
  createStockAudit,
} = require("../controllers/stockAuditController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.use(verifyToken);
router.get("/", authorizeRoles("admin", "warehouse"), getStockAudits);
router.post("/", authorizeRoles("admin", "warehouse"), createStockAudit);

module.exports = router;
