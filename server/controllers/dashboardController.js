const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

// [GET] /api/dashboard/summary - Lấy toàn bộ số liệu thống kê tổng quan
const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();

    // 1. TÍNH TỔNG DOANH THU, COGS (GIÁ VỐN) & LỢI NHUẬN GỘP (Chỉ tính các đơn đã duyệt/hoàn thành)
    const completedOrders = await Order.find({
      status: { $in: ["approved", "shipping", "completed"] },
    }).populate("items.allocatedBatches.inventoryId");

    let totalRevenue = 0;
    let totalCOGS = 0;

    for (const order of completedOrders) {
      totalRevenue += order.totalAmount || 0;

      for (const item of order.items) {
        // Tính COGS dựa trên số lượng x giá nhập gốc của từng lô FEFO đã trừ
        for (const alloc of item.allocatedBatches) {
          if (alloc.inventoryId) {
            totalCOGS += alloc.quantity * (alloc.inventoryId.importPrice || 0);
          }
        }
      }
    }

    const grossProfit = totalRevenue - totalCOGS;

    // 2. CẢNH BÁO TỒN KHO HẠN SỬ DỤNG (30 / 60 / 90 Ngày)
    const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const day60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const activeInventory = await Inventory.find({
      quantity: { $gt: 0 },
    }).populate("product", "sku name unit");

    let expiryAlerts = {
      under30Days: [], // Cực kỳ gấp (< 30 ngày)
      under60Days: [], // Gấp (30 - 60 ngày)
      under90Days: [], // Cảnh báo sớm (60 - 90 ngày)
      expired: [], // Đã quá hạn
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

    // 3. TOP SẢN PHẨM BÁN CHẠY (Top Selling)
    const topProductsPipeline = await Order.aggregate([
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
    ]);

    // 4. BẢNG XẾP HẠNG KPI SALES (Sales Leaderboard)
    const salesPerformance = await Order.aggregate([
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
    ]);

    res.json({
      financials: {
        totalRevenue,
        totalCOGS,
        grossProfit,
        profitMargin:
          totalRevenue > 0
            ? ((grossProfit / totalRevenue) * 100).toFixed(1)
            : 0,
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardSummary };
