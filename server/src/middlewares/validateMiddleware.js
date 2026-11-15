const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.slice(1).join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      message: errors[0]?.message || "Dữ liệu đầu vào không hợp lệ",
      errors,
    });
  }

  next();
};

module.exports = validate;
