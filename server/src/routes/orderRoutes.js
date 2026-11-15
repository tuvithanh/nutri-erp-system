const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validateMiddleware");
const { createOrderSchema } = require("../validations/erpValidation");
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

router.use(verifyToken);

router.get("/", authorizeRoles("admin", "sales", "warehouse"), getOrders);
router.post(
  "/",
  authorizeRoles("admin", "sales"),
  validate(createOrderSchema),
  createOrder,
);
router.put(
  "/:id/status",
  authorizeRoles("admin", "warehouse", "sales"),
  updateOrderStatus,
);

module.exports = router;
