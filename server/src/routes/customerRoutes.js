const express = require("express");
const router = express.Router();
const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(verifyToken);

// Sales, Warehouse và Admin đều được xem & tạo khách hàng
router.get("/", authorizeRoles("admin", "sales", "warehouse"), getCustomers);
router.post("/", authorizeRoles("admin", "sales"), createCustomer);

// Sửa/Xóa khách hàng
router.put("/:id", authorizeRoles("admin", "sales"), updateCustomer);
router.delete("/:id", authorizeRoles("admin"), deleteCustomer);

module.exports = router;
