const cron = require("node-cron");
const Inventory = require("../models/Inventory");
const AuditLog = require("../models/AuditLog");

const startExpiryAlertJob = () => {
  // Chạy tự động vào 07:30 sáng hàng ngày (Múi giờ Việt Nam)
  cron.schedule(
    "30 7 * * *",
    async () => {
      try {
        const now = new Date();
        const warningThreshold = new Date();
        warningThreshold.setDate(now.getDate() + 30); // Ngưỡng cảnh báo 30 ngày

        // Tìm các lô còn tồn kho > 0 nhưng hạn sử dụng <= 30 ngày tới
        const nearExpiryBatches = await Inventory.find({
          quantity: { $gt: 0 },
          expDate: { $lte: warningThreshold },
        }).populate("product", "sku name");

        if (nearExpiryBatches.length > 0) {
          const expiredCount = nearExpiryBatches.filter(
            (b) => new Date(b.expDate) <= now,
          ).length;
          const nearCount = nearExpiryBatches.length - expiredCount;

          const summary = `[CRON FEFO] Quét định kỳ: Phát hiện ${expiredCount} lô đã hết hạn và ${nearCount} lô cận date (<= 30 ngày) cần xử lý.`;
          console.log(summary);

          // Ghi trực tiếp vào Nhật ký hệ thống để Admin & Thủ kho thấy ngay
          await AuditLog.create({
            action: "AUDIT",
            module: "INVENTORY",
            description: summary,
            ipAddress: "SYSTEM-CRON",
          });
        }
      } catch (error) {
        console.error("[CRON FEFO ERROR]:", error.message);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    },
  );

  console.log("Background Cron Job (FEFO Expiry Scanner) initialized.");
};

module.exports = startExpiryAlertJob;
