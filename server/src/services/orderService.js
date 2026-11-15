const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

const createOrderWithFEFO = async (orderData, userId) => {
  const { customerName, customerPhone, customerAddress, items, note } =
    orderData;

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("Đơn hàng phải có ít nhất 1 sản phẩm!");
    err.statusCode = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const processedItems = [];
    const now = new Date();

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        const err = new Error(`Sản phẩm ID ${item.productId} không tồn tại`);
        err.statusCode = 404;
        throw err;
      }

      const qtyNeeded = Number(item.quantity);
      if (qtyNeeded <= 0) continue;

      // Tìm tất cả lô kho còn hạn (EXP > now) & số lượng > 0, xếp theo EXP tăng dần (FEFO)
      const availableBatches = await Inventory.find({
        product: product._id,
        quantity: { $gt: 0 },
        expDate: { $gt: now },
      })
        .sort({ expDate: 1 })
        .session(session);

      const totalAvailable = availableBatches.reduce(
        (acc, b) => acc + b.quantity,
        0,
      );
      if (totalAvailable < qtyNeeded) {
        const err = new Error(
          `Sản phẩm "${product.name}" không đủ tồn kho khả dụng! (Cần: ${qtyNeeded}, Còn: ${totalAvailable})`,
        );
        err.statusCode = 400;
        throw err;
      }

      // Phân bổ cấn trừ từng lô FEFO
      let remainingToDeduct = qtyNeeded;
      const allocatedBatches = [];

      for (const batch of availableBatches) {
        if (remainingToDeduct <= 0) break;

        const deductAmount = Math.min(batch.quantity, remainingToDeduct);
        batch.quantity -= deductAmount;
        await batch.save({ session });

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
    const [newOrder] = await Order.create(
      [
        {
          orderCode,
          customerName,
          customerPhone,
          customerAddress,
          items: processedItems,
          totalAmount,
          createdBy: userId,
          note: note || "",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return newOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getOrdersByRole = async (user) => {
  const filter = user.role === "sales" ? { createdBy: user.id } : {};
  return await Order.find(filter)
    .populate("items.product", "sku name unit")
    .populate("createdBy", "fullName role")
    .sort({ createdAt: -1 });
};

const updateOrderStatusWithRollback = async (orderId, status) => {
  const validStatuses = [
    "pending",
    "approved",
    "shipping",
    "completed",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    const err = new Error("Trạng thái không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      const err = new Error("Không tìm thấy đơn hàng");
      err.statusCode = 404;
      throw err;
    }

    // Hoàn trả tồn kho về đúng các lô FEFO đã trừ nếu hủy đơn
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        for (const alloc of item.allocatedBatches) {
          const batch = await Inventory.findById(alloc.inventoryId).session(
            session,
          );
          if (batch) {
            batch.quantity += alloc.quantity;
            await batch.save({ session });
          }
        }
      }
    }

    order.status = status;
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  createOrderWithFEFO,
  getOrdersByRole,
  updateOrderStatusWithRollback,
};
