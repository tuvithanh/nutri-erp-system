const jwt = require("jsonwebtoken");

// 1. Middleware kiểm tra Access Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không tìm thấy Access Token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Access Token không hợp lệ hoặc đã hết hạn" });
    }
    req.user = decoded; // { id, role }
    next();
  });
};

// 2. Middleware phân quyền linh hoạt theo Role
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Tài khoản quyền [${req.user?.role}] không có truy cập vào tài nguyên này`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
