import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import axiosClient from "../api/axiosClient";

// 💡 HÀM FORMAT SỐ ĐIỆN THOẠI (9, 10, 11 SỐ)
const formatPhoneNumber = (value) => {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 9) {
    // 9 số: 3 - 3 - 3
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 10) {
    // 10 số (Di động): 4 - 3 - 3
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else {
    // 11 số (Máy bàn/Tổng đài): 4 - 3 - 4
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
  }
};

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [notification, setNotification] = useState({ type: "", msg: "" });

  const fetchSuppliers = async () => {
    try {
      const res = await axiosClient.get("/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      setNotification({
        type: "error",
        msg: "Không thể tải danh sách nhà cung cấp từ máy chủ",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // XỬ LÝ KHI NGƯỜI DÙNG NHẬP SỐ ĐIỆN THOẠI (TỰ ĐỘNG FORMAT KHỎANG TRẮNG)
  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setFormData({ ...formData, phone: formatted });
  };

  // VALIDATE DỮ LIỆU ĐẦU VÀO
  const validateForm = () => {
    if (!formData.name || formData.name.trim().length < 2) {
      setNotification({
        type: "error",
        msg: "⚠️ Tên Nhà cung cấp không được để trống và phải từ 2 ký tự trở lên!",
      });
      return false;
    }

    if (formData.phone && formData.phone.trim() !== "") {
      const rawPhone = formData.phone.replace(/\D/g, "");
      if (rawPhone.length < 9 || rawPhone.length > 11) {
        setNotification({
          type: "error",
          msg: "⚠️ Số điện thoại không hợp lệ! Vui lòng nhập từ 9 đến 11 chữ số.",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: "", msg: "" });

    if (!validateForm()) return;

    // Loại bỏ khoảng trắng trước khi gửi dữ liệu về Backend
    const payload = {
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ""),
      address: formData.address ? formData.address.trim() : "",
    };

    try {
      if (editingSupplier) {
        const res = await axiosClient.put(
          `/suppliers/${editingSupplier._id}`,
          payload,
        );
        setNotification({ type: "success", msg: res.data.message });
      } else {
        const res = await axiosClient.post("/suppliers/quick-add", payload);
        setNotification({ type: "success", msg: res.data.message });
      }
      handleCloseModal();
      fetchSuppliers();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Lỗi xử lý nhà cung cấp",
      });
    }
  };

  const handleEdit = (supplier) => {
    setNotification({ type: "", msg: "" });
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: formatPhoneNumber(supplier.phone || ""),
      address: supplier.address || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này khỏi CSDL?")
    )
      return;
    try {
      const res = await axiosClient.delete(`/suppliers/${id}`);
      setNotification({ type: "success", msg: res.data.message });
      fetchSuppliers();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Không thể xóa nhà cung cấp",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData({ name: "", phone: "", address: "" });
  };

  // LỌC DANH SÁCH THÔNG MINH
  const filteredSuppliers = suppliers.filter((s) => {
    const rawSearch = searchTerm.replace(/\D/g, "").toLowerCase();
    const rawPhone = s.phone ? s.phone.replace(/\D/g, "") : "";

    const matchesPhone = rawSearch !== "" && rawPhone.includes(rawSearch);
    const matchesName = s.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCode =
      s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesName || matchesPhone || matchesCode;
  });

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản Lý Nhà Cung Cấp
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quyền Admin: Quản lý toàn bộ danh sách nhà máy sản xuất, nhà nhập
            khẩu đối tác.
          </p>
        </div>

        <button
          onClick={() => {
            setNotification({ type: "", msg: "" });
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          + Thêm Nhà Cung Cấp Mới
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <input
          type="text"
          placeholder="Tìm theo Mã NCC, Tên Nhà Cung Cấp, Số điện thoại..."
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* SUPPLIERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4">Mã NCC</th>
              <th className="py-3.5 px-4">Tên Nhà Cung Cấp</th>
              <th className="py-3.5 px-4">Số Điện Thoại</th>
              <th className="py-3.5 px-4">Địa Chỉ</th>
              <th className="py-3.5 px-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">
                  Đang tải danh sách nhà cung cấp...
                </td>
              </tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">
                  Chưa có nhà cung cấp nào
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {s.code || "NCC-001"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {s.name}
                  </td>

                  {/* HIỂN THỊ SỐ ĐIỆN THOẠI ĐÃ ĐƯỢC FORMAT KHOẢNG TRẮNG ĐẸP MẮT */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    {s.phone ? formatPhoneNumber(s.phone) : "---"}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {s.address || "---"}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-2.5 py-1 text-xs rounded border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-2.5 py-1 text-xs rounded border border-rose-300 text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA NHÀ CUNG CẤP */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingSupplier
                ? "Chỉnh Sửa Nhà Cung Cấp"
                : "Thêm Nhà Cung Cấp Mới"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Nhà Cung Cấp / Nhà Máy{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Công ty Dược phẩm Abbott"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số Điện Thoại Liên Hệ
                </label>
                <input
                  type="text"
                  maxLength={13} // Tối đa 11 chữ số + 2 khoảng trắng
                  placeholder="0901 234 567 hoặc 028 3999 8888"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Địa Chỉ Văn Phòng / Kho
                </label>
                <input
                  type="text"
                  placeholder="KCN Tân Bình, TP.HCM"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow hover:bg-indigo-700"
                >
                  {editingSupplier ? "Lưu Cập Nhật" : "Tạo NCC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
