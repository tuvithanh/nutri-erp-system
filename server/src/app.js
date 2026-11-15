const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const reportRoutes = require("./routes/reportRoutes");
const stockAuditRoutes = require("./routes/stockAuditRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");

const app = express();

// Middlewares cơ bản
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Giao diện Swagger UI tại đường dẫn /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/stock-audits", stockAuditRoutes);
app.use("/api/audit-logs", auditLogRoutes);

app.get("/", (req, res) => {
  res.send(
    "API NutriERP đang hoạt động... Truy cập Swagger API Doc tại /api-docs",
  );
});

// Middleware bắt lỗi tập trung (Đặt cuối cùng)
app.use(errorHandler);

module.exports = app;
