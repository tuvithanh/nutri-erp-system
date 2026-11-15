const orderService = require("../services/orderService");

const createOrder = async (req, res, next) => {
  try {
    const newOrder = await orderService.createOrderWithFEFO(
      req.body,
      req.user.id,
    );
    res.status(201).json({
      message: `Tạo đơn hàng ${newOrder.orderCode} thành công! Đã cấn trừ tồn kho FEFO.`,
      order: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByRole(req.user);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatusWithRollback(
      req.params.id,
      req.body.status,
    );
    res.json({
      message: `Đã cập nhật đơn hàng ${order.orderCode} sang trạng thái "${req.body.status}"`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
};
