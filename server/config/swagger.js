const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NutriERP API Documentation",
      version: "1.0.0",
      description:
        "Hệ thống API quản lý thực phẩm bổ sung NutriERP (Auth, RBAC, Product, Inventory)",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Nhập Access Token vào đây (dạng: Bearer <token>)",
        },
      },
    },
  },
  // Đường dẫn scan các chú thích Swagger JSDoc trong thư mục routes
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
