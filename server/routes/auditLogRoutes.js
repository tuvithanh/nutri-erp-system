const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditLogController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.use(verifyToken);
// CHỈ QUYỀN ADMIN MỚI ĐƯỢC XEM AUDIT LOGS
router.get("/", authorizeRoles("admin"), getAuditLogs);

module.exports = router;
