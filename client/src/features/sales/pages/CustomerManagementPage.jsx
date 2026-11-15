import { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import axiosClient from "@/api/axiosClient";

export default function CustomerManagementPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "b2c",
    note: "",
  });

  const [notification, setNotification] = useState({ type: "", msg: "" });

  const fetchCustomers = async () => {
    try {
      const res = await axiosClient.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      setNotification({
        type: "error",
        msg: "Không thể tải danh sách khách hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        const res = await axiosClient.put(
          `/customers/${editingCustomer._id}`,
          formData,
        );
        setNotification({ type: "success", msg: res.data.message });
      } else {
        const res = await axiosClient.post("/customers", formData);
        setNotification({ type: "success", msg: res.data.message });
      }
      handleCloseModal();
      fetchCustomers();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Lỗi xử lý",
      });
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      type: customer.type || "b2c",
      note: customer.note || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;
    try {
      const res = await axiosClient.delete(`/customers/${id}`);
      setNotification({ type: "success", msg: res.data.message });
      fetchCustomers();
    } catch (err) {
      setNotification({ type: "error", msg: "Không thể xóa khách hàng" });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      type: "b2c",
      note: "",
    });
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản Lý Khách Hàng (CRM)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Lưu trữ thông tin khách lẻ B2C và đối tác/đại lý B2B.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          + Thêm Khách Hàng Mới
        </button>
      </div>

      {notification.msg && (
        <div
          className={`mb-6 p-3.5 rounded-xl text-sm flex justify-between items-center ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          <span>{notification.msg}</span>
          <button
            onClick={() => setNotification({ type: "", msg: "" })}
            className="font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Tìm theo Mã KH, Tên, Số điện thoại..."
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Phân Loại:
          </span>
          <select
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả khách hàng</option>
            <option value="b2c">Khách mua lẻ (B2C)</option>
            <option value="b2b">Đại lý / Phòng Gym (B2B)</option>
          </select>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4">Mã KH</th>
              <th className="py-3.5 px-4">Tên Khách Hàng</th>
              <th className="py-3.5 px-4">Số Điện Thoại</th>
              <th className="py-3.5 px-4">Địa Chỉ</th>
              <th className="py-3.5 px-4">Phân Loại</th>
              <th className="py-3.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Đang tải danh sách khách hàng...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Chưa có khách hàng nào
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {c.customerCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 font-medium">{c.phone}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {c.address || "---"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.type === "b2b"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {c.type === "b2b" ? "Đại Lý (B2B)" : "Khách Lẻ (B2C)"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="px-2.5 py-1 text-xs rounded border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium"
                    >
                      Sửa
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="px-2.5 py-1 text-xs rounded border border-rose-300 text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA KHÁCH HÀNG */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingCustomer
                ? "Chỉnh Sửa Thông Tin Khách Hàng"
                : "Thêm Khách Hàng Mới"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Khách Hàng
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  required
                  placeholder="0901234567"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Địa Chỉ Giao Hàng
                </label>
                <input
                  type="text"
                  placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email (Nếu có)
                  </label>
                  <input
                    type="email"
                    placeholder="khach@gmail.com"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Loại Khách Hàng
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="b2c">Khách Mua Lẻ (B2C)</option>
                    <option value="b2b">Đại Lý / Phòng Gym (B2B)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow"
                >
                  {editingCustomer ? "Lưu Cập Nhật" : "Tạo Khách Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
