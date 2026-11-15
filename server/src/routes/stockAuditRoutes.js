const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validateMiddleware");
const { createStockAuditSchema } = require("../validations/erpValidation");
const {
  getStockAudits,
  createStockAudit,
} = require("../controllers/stockAuditController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(verifyToken);
router.get("/", authorizeRoles("admin", "warehouse"), getStockAudits);
router.post("/", authorizeRoles("admin", "warehouse"), createStockAudit);
router.post(
  "/",
  verifyToken,
  validate(createStockAuditSchema),
  createStockAudit,
);

module.exports = router;
