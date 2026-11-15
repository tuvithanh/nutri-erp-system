const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi hệ thống nội bộ",
    errors: err.errors || [],
  });
};

module.exports = errorHandler;
