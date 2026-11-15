const mongoose = require("mongoose");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const GoodsReceipt = require("../models/GoodsReceipt");
const Order = require("../models/Order");

const getAllProducts = async () => {
  return await Product.find().sort({ name: 1 });
};

const quickAddProduct = async ({ sku, name, unit, price }) => {
  const existing = await Product.findOne({ sku: sku.toUpperCase() });
  if (existing) {
    const err = new Error("Mã SKU này đã tồn tại trong hệ thống!");
    err.statusCode = 400;
    throw err;
  }

  return await Product.create({
    sku: sku.toUpperCase(),
    name,
    unit: unit || "Hộp",
    price: price || 0,
  });
};

const getInventoryList = async () => {
  return await Inventory.find()
    .populate("product", "sku name unit price")
    .populate("importedBy", "fullName")
    .sort({ expDate: 1 }); // Xếp lô gần hết hạn lên đầu (FEFO)
};

const importSingleBatch = async (data, userId) => {
  const { productId, lotNumber, mfgDate, expDate, quantity, importPrice } =
    data;
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error("Sản phẩm chọn không tồn tại trong CSDL!");
    err.statusCode = 404;
    throw err;
  }

  return await Inventory.create({
    product: productId,
    lotNumber,
    mfgDate: mfgDate ? new Date(mfgDate) : null,
    expDate: new Date(expDate),
    quantity: Number(quantity),
    importPrice: Number(importPrice) || 0,
    importedBy: userId,
  });
};

// Nghiệp vụ Nhập kho Đa dòng có bọc Transaction
const createGoodsReceiptWithTransaction = async (
  { supplier, note, items },
  userId,
) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("Phiếu nhập kho phải có ít nhất 1 sản phẩm!");
    err.statusCode = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const inventoryDocs = [];

    for (const item of items) {
      if (!item.product || !item.lotNumber || !item.expDate || !item.quantity) {
        const err = new Error("Thông tin một số dòng sản phẩm chưa đầy đủ!");
        err.statusCode = 400;
        throw err;
      }

      totalAmount += Number(item.quantity) * (Number(item.importPrice) || 0);
      inventoryDocs.push({
        product: item.product,
        lotNumber: item.lotNumber,
        mfgDate: item.mfgDate ? new Date(item.mfgDate) : null,
        expDate: new Date(item.expDate),
        quantity: Number(item.quantity),
        importPrice: Number(item.importPrice) || 0,
        importedBy: userId,
      });
    }

    const receiptCode = `PNK-${Date.now().toString().slice(-6)}`;
    const [newReceipt] = await GoodsReceipt.create(
      [
        {
          receiptCode,
          supplier: supplier || "Nhà cung cấp",
          note: note || "",
          items,
          totalAmount,
          importedBy: userId,
        },
      ],
      { session },
    );

    await Inventory.insertMany(inventoryDocs, { session });

    await session.commitTransaction();
    return newReceipt;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const importExcelBatches = async (items, userId) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("Dữ liệu file Excel rỗng hoặc không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const product = await Product.findOne({
      sku: item.sku?.toString().trim().toUpperCase(),
    });

    if (!product) {
      errors.push(
        `Dòng ${i + 2}: Mã SKU "${item.sku}" chưa tồn tại trong danh mục sản phẩm!`,
      );
      continue;
    }

    const newBatch = await Inventory.create({
      product: product._id,
      lotNumber: item.lotNumber || `LOT-${Date.now()}`,
      mfgDate: item.mfgDate ? new Date(item.mfgDate) : null,
      expDate: new Date(item.expDate),
      quantity: Number(item.quantity) || 0,
      importPrice: Number(item.importPrice) || 0,
      importedBy: userId,
    });

    results.push(newBatch);
  }

  return { successCount: results.length, errors };
};

const updateProductById = async (id, { name, category, unit, price }) => {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error("Không tìm thấy sản phẩm");
    err.statusCode = 404;
    throw err;
  }

  product.name = name || product.name;
  product.category = category || product.category;
  product.unit = unit || product.unit;
  product.price = price !== undefined ? price : product.price;

  return await product.save();
};

const deleteProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const err = new Error("Không tìm thấy sản phẩm");
    err.statusCode = 404;
    throw err;
  }
  await Product.findByIdAndDelete(id);
};

const getMergedInventoryHistory = async () => {
  const receipts = await GoodsReceipt.find()
    .populate("importedBy", "fullName")
    .populate("items.product", "name sku")
    .sort({ createdAt: -1 });

  const importLogs = receipts.map((r) => ({
    _id: r._id,
    code: r.receiptCode || `PNK-${r._id.toString().slice(-6)}`,
    type: "import",
    partnerName: r.supplier || "Nhà cung cấp",
    createdAt: r.createdAt,
    createdByName: r.importedBy?.fullName || "Thủ kho",
    note: r.note || "",
    items: (r.items || []).map((i) => ({
      productName: i.product?.name || i.productName || "Sản phẩm",
      lotNumber: i.lotNumber || "---",
      expDate: i.expDate,
      quantity: i.quantity,
      price: i.importPrice || 0,
    })),
  }));

  let exportLogs = [];
  try {
    const orders = await Order.find()
      .populate("createdBy", "fullName")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 });

    exportLogs = orders.map((o) => ({
      _id: o._id,
      code: o.orderCode || `PXK-${o._id.toString().slice(-6)}`,
      type: "export",
      partnerName: o.customerName || "Khách hàng",
      createdAt: o.createdAt,
      createdByName: o.createdBy?.fullName || "Nhân viên bán hàng",
      note: o.note || "",
      items: (o.items || []).map((i) => ({
        productName: i.product?.name || i.productName || "Sản phẩm",
        lotNumber: i.lotNumber || "---",
        expDate: i.expDate || null,
        quantity: i.quantity,
        price: i.price || 0,
      })),
    }));
  } catch (orderErr) {
    exportLogs = [];
  }

  return [...importLogs, ...exportLogs].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
};

module.exports = {
  getAllProducts,
  quickAddProduct,
  getInventoryList,
  importSingleBatch,
  createGoodsReceiptWithTransaction,
  importExcelBatches,
  updateProductById,
  deleteProductById,
  getMergedInventoryHistory,
};
