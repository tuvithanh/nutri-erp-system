const Supplier = require("../models/Supplier");

// 1. Lấy danh sách NCC
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách nhà cung cấp" });
  }
};

// 2. Thêm nhanh NCC
const quickAddSupplier = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Tên nhà cung cấp phải từ 2 ký tự trở lên" });
    }

    const code = `NCC-${Date.now().toString().slice(-4)}`;
    const newSupplier = await Supplier.create({
      code,
      name: name.trim(),
      phone: phone ? phone.trim() : "",
      address: address ? address.trim() : "",
    });

    res.status(201).json({
      message: "Thêm nhà cung cấp thành công",
      supplier: newSupplier,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Lỗi tạo nhà cung cấp" });
  }
};

// 3. Cập nhật thông tin NCC (BỊ THIẾU HOẶC QUÊN EXPORT GÂY RA LỖI)
const updateSupplier = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    }

    supplier.name = name ? name.trim() : supplier.name;
    supplier.phone = phone !== undefined ? phone.trim() : supplier.phone;
    supplier.address =
      address !== undefined ? address.trim() : supplier.address;

    await supplier.save();
    res.json({ message: "Cập nhật nhà cung cấp thành công", supplier });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Lỗi cập nhật nhà cung cấp" });
  }
};

// 4. Xóa NCC
const deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa nhà cung cấp khỏi hệ thống" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa nhà cung cấp" });
  }
};

// QUAN TRỌNG: Phải export đầy đủ cả 4 hàm này
module.exports = {
  getSuppliers,
  quickAddSupplier,
  updateSupplier,
  deleteSupplier,
};
