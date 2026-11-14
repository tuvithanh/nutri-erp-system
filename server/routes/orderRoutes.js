const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", authorizeRoles("admin", "sales", "warehouse"), getOrders);
router.post("/", authorizeRoles("admin", "sales"), createOrder);
router.put(
  "/:id/status",
  authorizeRoles("admin", "warehouse", "sales"),
  updateOrderStatus,
);

module.exports = router;
