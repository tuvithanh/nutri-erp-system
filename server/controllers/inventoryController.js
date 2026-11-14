const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const GoodsReceipt = require("../models/GoodsReceipt");
const Order = require("../models/Order"); // Bổ sung model Order để truy vấn phiếu xuất

// [GET] /api/inventory/products - Lấy danh sách sản phẩm (Dùng cho Dropdown Chọn)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/inventory/products/quick-add - Thêm nhanh sản phẩm mới trực tiếp từ Modal Nhập kho
const quickAddProduct = async (req, res) => {
  try {
    const { sku, name, unit, price } = req.body;

    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Mã SKU này đã tồn tại trong hệ thống!" });
    }

    const newProduct = await Product.create({
      sku: sku.toUpperCase(),
      name,
      unit: unit || "Hộp",
      price: price || 0,
    });

    res
      .status(201)
      .json({ message: "Tạo sản phẩm mới thành công", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/inventory - Lấy danh sách Lô hàng tồn kho (Có Sort & Filter FEFO)
const getInventoryList = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("product", "sku name unit price")
      .populate("importedBy", "fullName")
      .sort({ expDate: 1 }); // Mặc định xếp lô gần hết hạn lên đầu (FEFO)

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/inventory/import - Nhập kho đơn thủ công (1 sản phẩm)
const importInventory = async (req, res) => {
  try {
    const { productId, lotNumber, mfgDate, expDate, quantity, importPrice } =
      req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Sản phẩm chọn không tồn tại trong CSDL!" });
    }

    const newBatch = await Inventory.create({
      product: productId,
      lotNumber,
      mfgDate: mfgDate ? new Date(mfgDate) : null,
      expDate: new Date(expDate),
      quantity: Number(quantity),
      importPrice: Number(importPrice) || 0,
      importedBy: req.user.id,
    });

    res
      .status(201)
      .json({ message: "Nhập kho lô hàng thành công", batch: newBatch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/inventory/receipt - Tạo Phiếu Nhập Kho Đa Dòng Sản Phẩm
const createGoodsReceipt = async (req, res) => {
  try {
    const { supplier, note, items } = req.body; // items là MẢNG gồm các dòng sản phẩm

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Phiếu nhập kho phải có ít nhất 1 sản phẩm!" });
    }

    let totalAmount = 0;
    const inventoryDocs = [];

    for (const item of items) {
      if (!item.product || !item.lotNumber || !item.expDate || !item.quantity) {
        return res
          .status(400)
          .json({ message: "Thông tin một số dòng sản phẩm chưa đầy đủ!" });
      }

      const lineTotal = Number(item.quantity) * (Number(item.importPrice) || 0);
      totalAmount += lineTotal;

      // Chuẩn bị dữ liệu lưu tồn kho FEFO
      inventoryDocs.push({
        product: item.product,
        lotNumber: item.lotNumber,
        mfgDate: item.mfgDate ? new Date(item.mfgDate) : null,
        expDate: new Date(item.expDate),
        quantity: Number(item.quantity),
        importPrice: Number(item.importPrice) || 0,
        importedBy: req.user.id,
      });
    }

    // 1. Tạo Phiếu nhập kho chính
    const receiptCode = `PNK-${Date.now().toString().slice(-6)}`;
    const newReceipt = await GoodsReceipt.create({
      receiptCode,
      supplier: supplier || "Nhà cung cấp",
      note: note || "",
      items,
      totalAmount,
      importedBy: req.user.id,
    });

    // 2. Lưu từng lô hàng vào kho (Inventory)
    await Inventory.insertMany(inventoryDocs);

    res.status(201).json({
      message: `Tạo thành công Phiếu Nhập Kho ${receiptCode} gồm ${items.length} danh mục lô hàng!`,
      receipt: newReceipt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/inventory/import-excel - Nhập kho hàng loạt từ file Excel/CSV
const importExcelInventory = async (req, res) => {
  try {
    const { items } = req.body; // Mảng các dòng đọc từ file Excel ở Frontend
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Dữ liệu file Excel rỗng hoặc không hợp lệ" });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // Tìm sản phẩm theo SKU
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
        importedBy: req.user.id,
      });

      results.push(newBatch);
    }

    res.json({
      message:
        `Nhập thành công ${results.length} lô hàng.` +
        (errors.length > 0 ? ` Có ${errors.length} lỗi.` : ""),
      successCount: results.length,
      errors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/inventory/products/:id - Cập nhật thông tin sản phẩm (Chỉ Admin)
const updateProduct = async (req, res) => {
  try {
    const { name, category, unit, price } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.unit = unit || product.unit;
    product.price = price !== undefined ? price : product.price;

    await product.save();
    res.json({ message: "Cập nhật sản phẩm thành công", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [DELETE] /api/inventory/products/:id - Xóa sản phẩm (Chỉ Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa sản phẩm khỏi CSDL" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/inventory/history - Lấy Nhật Ký Nhập & Xuất Kho Hợp Nhất (Cho Trang InventoryHistoryPage)
const getInventoryHistory = async (req, res) => {
  try {
    // 1. Lấy tất cả Phiếu Nhập Kho (GoodsReceipt)
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

    // 2. Lấy tất cả Phiếu Xuất Kho từ Đơn Hàng (Order) nếu có
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
      // Trường hợp CSDL chưa có bảng Order
      exportLogs = [];
    }

    // 3. Hợp nhất hai nguồn và sắp xếp giảm dần theo ngày tạo
    const history = [...importLogs, ...exportLogs].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
