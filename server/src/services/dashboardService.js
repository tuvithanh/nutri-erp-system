const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

const getDashboardSummaryData = async () => {
  const now = new Date();
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const day60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Chạy song song 4 luồng truy vấn độc lập để tối ưu tốc độ phản hồi
  const [
    completedOrders,
    activeInventory,
    topProductsPipeline,
    salesPerformance,
  ] = await Promise.all([
    // 1. Lấy đơn đã duyệt/giao/hoàn thành để tính doanh thu & giá vốn COGS theo từng lô FEFO
    Order.find({
      status: { $in: ["approved", "shipping", "completed"] },
    }).populate("items.allocatedBatches.inventoryId"),

    // 2. Lấy toàn bộ lô tồn kho > 0 để phân loại cảnh báo hạn sử dụng
    Inventory.find({
      quantity: { $gt: 0 },
    }).populate("product", "sku name unit"),

    // 3. Top 5 sản phẩm bán chạy
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
    ]),

    // 4. Bảng xếp hạng KPI Sales
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$createdBy",
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalSales: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
    ]),
  ]);

  // Tính tổng doanh thu, COGS & lợi nhuận gộp
  let totalRevenue = 0;
  let totalCOGS = 0;

  for (const order of completedOrders) {
    totalRevenue += order.totalAmount || 0;

    for (const item of order.items) {
      for (const alloc of item.allocatedBatches) {
        if (alloc.inventoryId) {
          totalCOGS += alloc.quantity * (alloc.inventoryId.importPrice || 0);
        }
      }
    }
  }

  const grossProfit = totalRevenue - totalCOGS;

  // Phân nhóm cảnh báo hạn sử dụng (30 / 60 / 90 ngày)
  const expiryAlerts = {
    under30Days: [],
    under60Days: [],
    under90Days: [],
    expired: [],
  };

  activeInventory.forEach((item) => {
    const exp = new Date(item.expDate);
    if (exp <= now) {
      expiryAlerts.expired.push(item);
    } else if (exp <= day30) {
      expiryAlerts.under30Days.push(item);
    } else if (exp <= day60) {
      expiryAlerts.under60Days.push(item);
    } else if (exp <= day90) {
      expiryAlerts.under90Days.push(item);
    }
  });

  return {
    financials: {
      totalRevenue,
      totalCOGS,
      grossProfit,
      profitMargin:
        totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0,
    },
    expiryAlertsCount: {
      expired: expiryAlerts.expired.length,
      under30: expiryAlerts.under30Days.length,
      under60: expiryAlerts.under60Days.length,
      under90: expiryAlerts.under90Days.length,
    },
    expiryDetails: expiryAlerts,
    topProducts: topProductsPipeline,
    salesPerformance,
  };
};

module.exports = {
  getDashboardSummaryData,
};
