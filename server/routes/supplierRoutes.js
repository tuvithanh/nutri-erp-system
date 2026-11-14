const express = require("express");
const router = express.Router();
const {
  getSuppliers,
  quickAddSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", authorizeRoles("admin", "warehouse", "sales"), getSuppliers);
router.post(
  "/quick-add",
  authorizeRoles("admin", "warehouse"),
  quickAddSupplier,
);
router.put("/:id", authorizeRoles("admin"), updateSupplier);
router.delete("/:id", authorizeRoles("admin"), deleteSupplier);

module.exports = router;
