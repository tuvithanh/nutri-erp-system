const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const GoodsReceipt = require("../models/GoodsReceipt");

const getReportSummaryData = async ({ fromDate, toDate }) => {
  // 1. Tạo Query lọc theo khoảng thời gian
  const dateQuery = {};
  if (fromDate || toDate) {
    dateQuery.createdAt = {};
    if (fromDate) dateQuery.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      dateQuery.createdAt.$lte = end;
    }
  }

  // 2. Truy vấn song song 3 nguồn dữ liệu (Đơn hàng, Phiếu nhập, Tồn kho)
  const [orders, receipts, allInventory] = await Promise.all([
    Order.find({ ...dateQuery, status: { $ne: "cancelled" } }),
    GoodsReceipt.find(dateQuery),
    Inventory.find({ quantity: { $gt: 0 } }).populate(
      "product",
      "sku name unit price",
    ),
  ]);

  // 3. Tính Doanh thu & Chi phí nhập kho
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount || 0),
    0,
  );
  const totalImportCost = receipts.reduce(
    (sum, r) => sum + Number(r.totalAmount || 0),
    0,
  );
  const estimatedProfit = totalRevenue - totalImportCost;

  // 4. Thống kê Tồn kho hiện tại & Cảnh báo FEFO
  let totalStockQuantity = 0;
  let totalInventoryValue = 0;
  let warningBatchesCount = 0;
  let expiredBatchesCount = 0;

  const now = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(now.getMonth() + 3);

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

  const topStockProducts = Object.values(productStockMap)
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 10);

  return {
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
  };
};

module.exports = {
  getReportSummaryData,
};
