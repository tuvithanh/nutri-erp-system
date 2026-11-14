const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const GoodsReceipt = require("../models/GoodsReceipt");
const Product = require("../models/Product");

// [GET] /api/reports/dashboard-summary - Lấy tổng quan số liệu báo cáo
const getReportSummary = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // 1. Tạo Query lọc theo khoảng thời gian
    let dateQuery = {};
    if (fromDate || toDate) {
      dateQuery.createdAt = {};
      if (fromDate) dateQuery.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.createdAt.$lte = end;
      }
    }

    // 2. Tính Doanh thu từ Bán hàng (Order)
    const orders = await Order.find(dateQuery);
    let totalRevenue = 0;
    let totalOrders = orders.length;

    orders.forEach((o) => {
      totalRevenue += Number(o.totalAmount || 0);
    });

    // 3. Tính Tổng giá trị Chi phí Nhập kho (GoodsReceipt)
    const receipts = await GoodsReceipt.find(dateQuery);
    let totalImportCost = 0;

    receipts.forEach((r) => {
      totalImportCost += Number(r.totalAmount || 0);
    });

    // Lợi nhuận ước tính (Doanh thu bán - Giá trị nhập kho cùng kỳ)
    const estimatedProfit = totalRevenue - totalImportCost;

    // 4. Thống kê Tồn kho Hiện tại & Cảnh báo FEFO
    const allInventory = await Inventory.find().populate(
      "product",
      "sku name unit price",
    );

    let totalStockQuantity = 0;
    let totalInventoryValue = 0;
    let warningBatchesCount = 0;
    let expiredBatchesCount = 0;

    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);

    // Mảng lưu top sản phẩm tồn kho cao nhất
    const productStockMap = {};

    allInventory.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.importPrice || item.product?.price || 0);

      totalStockQuantity += qty;
      totalInventoryValue += qty * price;

      const exp = new Date(item.expDate);
      if (exp <= now) {
        expiredBatchesCount += 1;
      } else if (exp <= threeMonthsLater) {
        warningBatchesCount += 1;
      }

      // Gom nhóm tính tổng tồn theo từng sản phẩm
      if (item.product) {
        const prodId = item.product._id.toString();
        if (!productStockMap[prodId]) {
          productStockMap[prodId] = {
            sku: item.product.sku,
            name: item.product.name,
            unit: item.product.unit,
            totalQty: 0,
            totalValue: 0,
          };
        }
        productStockMap[prodId].totalQty += qty;
        productStockMap[prodId].totalValue += qty * price;
      }
    });

    // Chuyển object mảng sản phẩm & sắp xếp top tồn kho nhiều nhất
    const topStockProducts = Object.values(productStockMap)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 10);

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalImportCost,
        estimatedProfit,
        totalStockQuantity,
        totalInventoryValue,
        warningBatchesCount,
        expiredBatchesCount,
      },
      topStockProducts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi lấy dữ liệu báo cáo" });
  }
};

module.exports = {
  getReportSummary,
};
