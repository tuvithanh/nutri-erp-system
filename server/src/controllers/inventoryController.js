const inventoryService = require("../services/inventoryService");

const getAllProducts = async (req, res, next) => {
  try {
    const products = await inventoryService.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const quickAddProduct = async (req, res, next) => {
  try {
    const newProduct = await inventoryService.quickAddProduct(req.body);
    res
      .status(201)
      .json({ message: "Tạo sản phẩm mới thành công", product: newProduct });
  } catch (error) {
    next(error);
  }
};

const getInventoryList = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getInventoryList();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

const importInventory = async (req, res, next) => {
  try {
    const newBatch = await inventoryService.importSingleBatch(
      req.body,
      req.user.id,
    );
    res
      .status(201)
      .json({ message: "Nhập kho lô hàng thành công", batch: newBatch });
  } catch (error) {
    next(error);
  }
};

const createGoodsReceipt = async (req, res, next) => {
  try {
    const newReceipt = await inventoryService.createGoodsReceiptWithTransaction(
      req.body,
      req.user.id,
    );
    res.status(201).json({
      message: `Tạo thành công Phiếu Nhập Kho ${newReceipt.receiptCode} gồm ${req.body.items.length} danh mục lô hàng!`,
      receipt: newReceipt,
    });
  } catch (error) {
    next(error);
  }
};

const importExcelInventory = async (req, res, next) => {
  try {
    const { successCount, errors } = await inventoryService.importExcelBatches(
      req.body.items,
      req.user.id,
    );
    res.json({
      message:
        `Nhập thành công ${successCount} lô hàng.` +
        (errors.length > 0 ? ` Có ${errors.length} lỗi.` : ""),
      successCount,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await inventoryService.updateProductById(
      req.params.id,
      req.body,
    );
    res.json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await inventoryService.deleteProductById(req.params.id);
    res.json({ message: "Đã xóa sản phẩm khỏi CSDL" });
  } catch (error) {
    next(error);
  }
};

const getInventoryHistory = async (req, res, next) => {
  try {
    const history = await inventoryService.getMergedInventoryHistory();
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  quickAddProduct,
  getInventoryList,
  importInventory,
  createGoodsReceipt,
  importExcelInventory,
  updateProduct,
  deleteProduct,
  getInventoryHistory,
};
