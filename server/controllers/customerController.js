const Customer = require("../models/Customer");

// [GET] /api/customers - Lấy danh sách khách hàng
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [POST] /api/customers - Tạo khách hàng mới (hoặc Thêm Nhanh từ Modal Bán Hàng)
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, type, note } = req.body;

    const existing = await Customer.findOne({ phone: phone.trim() });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Số điện thoại khách hàng này đã tồn tại!" });
    }

    const customerCode = `KH-${Date.now().toString().slice(-5)}`;
    const newCustomer = await Customer.create({
      customerCode,
      name,
      phone: phone.trim(),
      email: email || "",
      address: address || "",
      type: type || "b2c",
      note: note || "",
    });

    res.status(201).json({
      message: "Thêm khách hàng thành công",
      customer: newCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/customers/:id - Cập nhật thông tin khách hàng
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, type, note } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.email = email !== undefined ? email : customer.email;
    customer.address = address !== undefined ? address : customer.address;
    customer.type = type || customer.type;
    customer.note = note !== undefined ? note : customer.note;

    await customer.save();
    res.json({ message: "Cập nhật khách hàng thành công", customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [DELETE] /api/customers/:id - Xóa khách hàng (Chỉ Admin)
const deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa khách hàng khỏi hệ thống" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
