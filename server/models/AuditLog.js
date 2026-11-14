const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String, // CREATE, UPDATE, DELETE, IMPORT, EXPORT, AUDIT
      required: true,
    },
    module: {
      type: String, // SUPPLIERS, PRODUCTS, INVENTORY, CUSTOMERS, USERS
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
