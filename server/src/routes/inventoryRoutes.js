const express = require("express");
const validate = require("../middlewares/validateMiddleware");
const { createGoodsReceiptSchema } = require("../validations/erpValidation");
const router = express.Router();
const { getInventoryHistory } = require("../controllers/inventoryController");
const {
  getAllProducts,
  quickAddProduct,
  getInventoryList,
  importInventory,
  createGoodsReceipt,
  importExcelInventory,
  updateProduct,
  deleteProduct,
} = require("../controllers/inventoryController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

// Tất cả các route bên dưới đều bắt buộc phải đăng nhập (verifyToken)
router.use(verifyToken);

// 1. CẢ ADMIN VÀ QUẢN LÝ KHO ĐỀU CÓ QUYỀN TRUY CẤP (Xem/Nhập kho)
router.get("/products", authorizeRoles("admin", "warehouse"), getAllProducts);
router.get("/", authorizeRoles("admin", "warehouse"), getInventoryList);
router.post("/import", authorizeRoles("admin", "warehouse"), importInventory);
router.get(
  "/history",
  authorizeRoles("admin", "warehouse"),
  getInventoryHistory,
);
router.post(
  "/receipt",
  authorizeRoles("admin", "warehouse"),
  validate(createGoodsReceiptSchema),
  createGoodsReceipt,
);
router.post(
  "/import-excel",
  authorizeRoles("admin", "warehouse"),
  importExcelInventory,
);

// Thêm nhanh sản phẩm mới (Dành cho Admin & Kho khi đang làm phiếu nhập)
router.post(
  "/products/quick-add",
  authorizeRoles("admin", "warehouse"),
  quickAddProduct,
);

// 2. CHỈ ADMIN MỚI CÓ QUYỀN SỬA, XÓA SẢN PHẨM TRỰC TIẾP
router.put("/products/:id", authorizeRoles("admin"), updateProduct);
router.delete("/products/:id", authorizeRoles("admin"), deleteProduct);

module.exports = router;
