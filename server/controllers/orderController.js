const Order = require("../models/Order");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

// [POST] /api/orders - Tạo đơn hàng mới & Tự động cấn trừ kho FEFO
const createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, note } =
      req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Đơn hàng phải có ít nhất 1 sản phẩm!" });
    }

    let totalAmount = 0;
    const processedItems = [];

    // Lặp qua từng sản phẩm khách mua để kiểm tra & trừ kho FEFO
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Sản phẩm ID ${item.productId} không tồn tại` });
      }

      const qtyNeeded = Number(item.quantity);
      if (qtyNeeded <= 0) continue;

      // 1. Tìm tất cả lô kho của sản phẩm còn hạn (EXP > now) và số lượng > 0, xếp theo EXP tăng dần (FEFO)
      const now = new Date();
      const availableBatches = await Inventory.find({
        product: product._id,
        quantity: { $gt: 0 },
        expDate: { $gt: now },
      }).sort({ expDate: 1 });

      // Tính tổng tồn kho khả dụng
      const totalAvailable = availableBatches.reduce(
        (acc, b) => acc + b.quantity,
        0,
      );
      if (totalAvailable < qtyNeeded) {
        return res.status(400).json({
          message: `Sản phẩm "${product.name}" không đủ tồn kho khả dụng! (Cần: ${qtyNeeded}, Còn: ${totalAvailable})`,
        });
      }

      // 2. Phân bổ cấn trừ theo thuật toán FEFO
      let remainingToDeduct = qtyNeeded;
      const allocatedBatches = [];

      for (const batch of availableBatches) {
        if (remainingToDeduct <= 0) break;

        const deductAmount = Math.min(batch.quantity, remainingToDeduct);
        batch.quantity -= deductAmount;
        await batch.save(); // Lưu ngay tồn kho mới

        remainingToDeduct -= deductAmount;
        allocatedBatches.push({
          inventoryId: batch._id,
          lotNumber: batch.lotNumber,
          quantity: deductAmount,
        });
      }

      const itemPrice = Number(item.price) || product.price || 0;
      totalAmount += qtyNeeded * itemPrice;

      processedItems.push({
        product: product._id,
        quantity: qtyNeeded,
        price: itemPrice,
        allocatedBatches,
      });
    }

    const orderCode = `DH-${Date.now().toString().slice(-6)}`;
    const newOrder = await Order.create({
      orderCode,
      customerName,
      customerPhone,
      customerAddress,
      items: processedItems,
      totalAmount,
      createdBy: req.user.id,
      note: note || "",
    });

    res.status(201).json({
      message: `Tạo đơn hàng ${orderCode} thành công! Đã cấn trừ tồn kho FEFO.`,
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/orders - Lấy danh sách đơn hàng (Sales xem đơn mình, Admin/Warehouse xem tất cả)
const getOrders = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "sales") {
      filter.createdBy = req.user.id;
    }

    const orders = await Order.find(filter)
      .populate("items.product", "sku name unit")
      .populate("createdBy", "fullName role")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Duyệt, Giao, Hoàn thành, Hủy)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "approved",
      "shipping",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // NẾU HỦY ĐƠN HÀNG: HOÀN TRẢ SỐ LƯỢNG TỒN KHO VỀ ĐÚNG CÁC LÔ FEFO BỊ TRỪ
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        for (const alloc of item.allocatedBatches) {
          const batch = await Inventory.findById(alloc.inventoryId);
          if (batch) {
            batch.quantity += alloc.quantity;
            await batch.save();
          }
        }
      }
    }

    order.status = status;
    await order.save();

    res.json({
      message: `Đã cập nhật đơn hàng ${order.orderCode} sang trạng thái "${status}"`,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};
