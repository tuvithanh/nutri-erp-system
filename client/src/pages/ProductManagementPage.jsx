import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

export default function ProductManagementPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals Visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "Thực phẩm bổ sung",
    unit: "Hộp",
    price: "",
  });

  const [notification, setNotification] = useState({ type: "", msg: "" });

  // Tải danh sách sản phẩm từ CSDL
  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get("/inventory/products");
      setProducts(res.data);
    } catch (err) {
      setNotification({
        type: "error",
        msg: "Không thể tải danh mục sản phẩm",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Xử lý Thêm mới hoặc Cập nhật (Chỉ Admin)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: "", msg: "" });

    try {
      if (editingProduct) {
        // Cập nhật sản phẩm
        const res = await axiosClient.put(
          `/inventory/products/${editingProduct._id}`,
          formData,
        );
        setNotification({ type: "success", msg: res.data.message });
      } else {
        // Tạo sản phẩm mới
        const res = await axiosClient.post(
          "/inventory/products/quick-add",
          formData,
        );
        setNotification({ type: "success", msg: res.data.message });
      }

      handleCloseModal();
      fetchProducts();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Lỗi xử lý sản phẩm",
      });
    }
  };

  // Mở modal sửa
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category || "Thực phẩm bổ sung",
      unit: product.unit || "Hộp",
      price: product.price || "",
    });
    setShowAddModal(true);
  };

  // Xóa sản phẩm (Chỉ Admin)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi CSDL?"))
      return;

    try {
      const res = await axiosClient.delete(`/inventory/products/${id}`);
      setNotification({ type: "success", msg: res.data.message });
      fetchProducts();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Không thể xóa sản phẩm",
      });
    }
  };

  // Reset Form Modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({
      sku: "",
      name: "",
      category: "Thực phẩm bổ sung",
      unit: "Hộp",
      price: "",
    });
  };

  // Danh mục Phân loại duy nhất để lọc
  const categories = Array.from(
    new Set(products.map((p) => p.category || "Thực phẩm bổ sung")),
  );

  // Filter dữ liệu
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Danh Mục Sản Phẩm (Master Data)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin
              ? "Toàn quyền khởi tạo, chỉnh sửa và quản lý sản phẩm trong CSDL hệ thống."
              : "Quyền Quản Lý Kho: Tra cứu thông tin, quy cách đóng gói và mã SKU chuẩn."}
          </p>
        </div>

        {/* NÚT THÊM SẢN PHẨM: CHỈ ADMIN MỚI THẤY */}
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            + Thêm Sản Phẩm Mới
          </button>
        )}
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

      {/* FILTER BAR FOR BOTH ADMIN & WAREHOUSE */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Tìm theo Mã SKU hoặc Tên sản phẩm..."
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Phân Loại:
          </span>
          <select
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE PRODUCTS LIST */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Mã SKU</th>
              <th className="py-3.5 px-4 font-semibold">Tên Sản Phẩm</th>
              <th className="py-3.5 px-4 font-semibold">Danh Mục</th>
              <th className="py-3.5 px-4 font-semibold">Đơn Vị Tính</th>
              <th className="py-3.5 px-4 font-semibold">Giá Bán Niêm Yết</th>
              {isAdmin && (
                <th className="py-3.5 px-4 font-semibold text-right">
                  Hành Động
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="text-center py-8 text-slate-400"
                >
                  Đang tải danh mục sản phẩm...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="text-center py-8 text-slate-400"
                >
                  Không tìm thấy sản phẩm phù hợp
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {p.sku}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                      {p.category || "Thực phẩm bổ sung"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {p.unit}
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-semibold">
                    {p.price?.toLocaleString("vi-VN")} đ
                  </td>

                  {/* CỘT HÀNH ĐỘNG: CHỈ ADMIN MỚI THẤY NÚT SỬA / XÓA */}
                  {isAdmin && (
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-2.5 py-1 text-xs rounded font-medium border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-2.5 py-1 text-xs rounded font-medium border border-rose-300 text-rose-600 hover:bg-rose-50"
                      >
                        Xóa
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM / SỬA SẢN PHẨM (CHỈ DÀNH CHO ADMIN) */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mã SKU (Viết hoa)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingProduct} // Không cho sửa SKU khi đang Edit
                  placeholder="WHEY-GOLD-2KG"
                  className="w-full px-3 py-2 border rounded-lg text-sm uppercase disabled:bg-slate-100 disabled:cursor-not-allowed"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Sản Phẩm
                </label>
                <input
                  type="text"
                  required
                  placeholder="Whey Gold Standard 2kg Vanilla"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Danh Mục
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Protein / Creatine..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Đơn Vị Tính
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Hộp / Chai / Gói"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Giá Bán Niêm Yết
                </label>
                <input
                  type="number"
                  placeholder="1500000"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md shadow-indigo-500/20"
                >
                  {editingProduct ? "Lưu Cập Nhật" : "Tạo Sản Phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
