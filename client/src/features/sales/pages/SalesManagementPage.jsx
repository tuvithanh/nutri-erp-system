import { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/features/auth/context/AuthContext";
import axiosClient from "@/api/axiosClient";

export default function SalesManagementPage() {
  const { user: currentUser } = useAuth();
  const isSales = currentUser?.role === "sales";

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

  // Form State Lên Đơn
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [orderItems, setOrderItems] = useState([
    { productId: "", quantity: 1, price: 0 },
  ]);

  // Form State Thêm Nhanh Khách Hàng
  const [quickCustomerData, setQuickCustomerData] = useState({
    name: "",
    phone: "",
    address: "",
    type: "b2c",
  });

  const [notification, setNotification] = useState({ type: "", msg: "" });

  const fetchData = async () => {
    try {
      const [ordRes, prodRes, custRes] = await Promise.all([
        axiosClient.get("/orders"),
        axiosClient.get("/inventory/products"),
        axiosClient.get("/customers"),
      ]);
      setOrders(ordRes.data);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      setNotification({ type: "error", msg: "Không thể tải dữ liệu hệ thống" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tự động điền SĐT và Địa chỉ khi chọn khách hàng từ Dropdown
  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    const cust = customers.find((c) => c._id === customerId);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
      setCustomerAddress(cust.address || "");
    } else {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
    }
  };

  // Thêm nhanh khách hàng mới ngay trong Modal Bán hàng
  const handleQuickAddCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/customers", quickCustomerData);
      const newCust = res.data.customer;
      setCustomers([...customers, newCust]);

      // Tự động điền dữ liệu khách vừa tạo vào Đơn hàng
      setSelectedCustomerId(newCust._id);
      setCustomerName(newCust.name);
      setCustomerPhone(newCust.phone);
      setCustomerAddress(newCust.address || "");

      setShowQuickAddCustomer(false);
      setQuickCustomerData({ name: "", phone: "", address: "", type: "b2c" });
      setNotification({
        type: "success",
        msg: "Đã thêm và tự chọn khách hàng mới!",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi thêm khách hàng");
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;

    if (field === "productId") {
      const prod = products.find((p) => p._id === value);
      if (prod) updated[index].price = prod.price || 0;
    }

    setOrderItems(updated);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/orders", {
        customerName,
        customerPhone,
        customerAddress,
        note: orderNote,
        items: orderItems,
      });
      setNotification({ type: "success", msg: res.data.message });
      setShowCreateModal(false);
      setSelectedCustomerId("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setOrderNote("");
      setOrderItems([{ productId: "", quantity: 1, price: 0 }]);
      fetchData();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Lỗi tạo đơn hàng",
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axiosClient.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      setNotification({ type: "success", msg: res.data.message });
      fetchData();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Lỗi cập nhật",
      });
    }
  };

  // Lọc dữ liệu
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalOrderAmount = orderItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.price) || 0);
  }, 0);

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản Lý Bán Hàng (Sales Orders)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Lên đơn hàng, tự động xuất kho theo FEFO và in hóa đơn giao hàng.
          </p>
        </div>

        {(isSales || currentUser?.role === "admin") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            + Lên Đơn Hàng Mới
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

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Tìm theo Mã đơn, Tên KH, Số điện thoại..."
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Trạng Thái:
          </span>
          <select
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4">Mã Đơn</th>
              <th className="py-3.5 px-4">Khách Hàng</th>
              <th className="py-3.5 px-4">Sản Phẩm Mua</th>
              <th className="py-3.5 px-4">Tổng Tiền</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Đang tải danh sách đơn hàng...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Chưa có đơn hàng nào
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-indigo-600 font-mono">
                    {order.orderCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.customerPhone}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {order.items.map((i, idx) => (
                      <div key={idx}>
                        • {i.product?.name} ({i.quantity} x{" "}
                        {i.price?.toLocaleString()}đ)
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {order.totalAmount?.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        order.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : order.status === "shipping"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : order.status === "approved"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : order.status === "cancelled"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedOrderForPrint(order)}
                      className="px-2.5 py-1 text-xs rounded border border-slate-300 hover:bg-slate-100 font-medium"
                    >
                      🖨️ In Hóa Đơn
                    </button>

                    {/* Cập nhật trạng thái */}
                    {order.status !== "cancelled" &&
                      order.status !== "completed" && (
                        <select
                          className="px-2 py-1 text-xs border rounded bg-white"
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                        >
                          <option value="pending">Chờ duyệt</option>
                          <option value="approved">Duyệt đơn</option>
                          <option value="shipping">Giao hàng</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Hủy đơn</option>
                        </select>
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL LÊN ĐƠN HÀNG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">
              Lên Đơn Hàng Mới
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* DROPDOWN CHỌN KHÁCH HÀNG CÓ SẴN HOẶC TẠO MỚI */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Chọn Khách Hàng Có Sẵn
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCustomer(true)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Thêm Khách Mới
                  </button>
                </div>
                <select
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                >
                  <option value="">
                    -- Chọn từ CRM (Hoặc điền trực tiếp ở dưới) --
                  </option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} - {c.phone} [
                      {c.type === "b2b" ? "Đại lý" : "Khách lẻ"}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tên Khách Hàng
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
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
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Địa Chỉ Giao Hàng
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123 Nguyễn Huệ, Q.1"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* MẢNG DÒNG SẢN PHẨM MUA */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border flex gap-2 items-end"
                  >
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Sản Phẩm #{idx + 1}
                      </label>
                      <select
                        required
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                        value={item.productId}
                        onChange={(e) =>
                          handleItemChange(idx, "productId", e.target.value)
                        }
                      >
                        <option value="">-- Chọn Sản Phẩm --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            [{p.sku}] {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Số Lượng
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", e.target.value)
                        }
                      />
                    </div>

                    <div className="w-32">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Giá Bán (Đơn vị)
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(idx, "price", e.target.value)
                        }
                      />
                    </div>

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-rose-600 font-bold text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2 border-2 border-dashed border-indigo-300 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-50"
              >
                + Thêm Sản Phẩm Khác
              </button>

              <div className="flex justify-between items-center pt-3 border-t">
                <div>
                  <span className="text-xs text-slate-500">
                    Tổng giá trị đơn hàng:
                  </span>
                  <p className="text-lg font-bold text-indigo-600">
                    {totalOrderAmount.toLocaleString("vi-VN")} đ
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow"
                  >
                    Tạo Đơn Hàng FEFO
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM NHANH KHÁCH HÀNG */}
      {showQuickAddCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Tạo Khách Hàng Mới Vào CRM
            </h3>
            <form onSubmit={handleQuickAddCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Khách Hàng
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn B"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={quickCustomerData.name}
                  onChange={(e) =>
                    setQuickCustomerData({
                      ...quickCustomerData,
                      name: e.target.value,
                    })
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
                  placeholder="0988777666"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={quickCustomerData.phone}
                  onChange={(e) =>
                    setQuickCustomerData({
                      ...quickCustomerData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Địa Chỉ Giao Hàng
                </label>
                <input
                  type="text"
                  placeholder="456 Lê Lợi, Q.1"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={quickCustomerData.address}
                  onChange={(e) =>
                    setQuickCustomerData({
                      ...quickCustomerData,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Loại Khách Hàng
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  value={quickCustomerData.type}
                  onChange={(e) =>
                    setQuickCustomerData({
                      ...quickCustomerData,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="b2c">Khách Mua Lẻ (B2C)</option>
                  <option value="b2b">Đại Lý / Phòng Gym (B2B)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuickAddCustomer(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-medium"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium"
                >
                  Lưu & Chọn Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IN HÓA ĐƠN PDF / GIAO HÀNG */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border">
            <div className="border-b pb-4 mb-4 text-center">
              <h2 className="text-xl font-bold text-indigo-600">
                NUTRIERP SYSTEM
              </h2>
              <p className="text-xs text-slate-500">
                HÓA ĐƠN BÁN HÀNG & PHIẾU XUẤT KHO FEFO
              </p>
              <p className="text-xs font-mono font-bold mt-1">
                {selectedOrderForPrint.orderCode}
              </p>
            </div>

            <div className="text-xs space-y-1 mb-4 text-slate-700">
              <p>
                <strong>Khách hàng:</strong>{" "}
                {selectedOrderForPrint.customerName}
              </p>
              <p>
                <strong>Số điện thoại:</strong>{" "}
                {selectedOrderForPrint.customerPhone}
              </p>
              <p>
                <strong>Địa chỉ:</strong>{" "}
                {selectedOrderForPrint.customerAddress}
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(selectedOrderForPrint.createdAt).toLocaleString(
                  "vi-VN",
                )}
              </p>
            </div>

            <table className="w-full text-xs text-left mb-4 border-t border-b">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="py-2">Sản Phẩm</th>
                  <th className="py-2">SL</th>
                  <th className="py-2 text-right">Đơn Giá</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderForPrint.items.map((i, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{i.product?.name}</td>
                    <td className="py-2">{i.quantity}</td>
                    <td className="py-2 text-right">
                      {i.price?.toLocaleString()}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-sm">TỔNG TIỀN:</span>
              <span className="font-bold text-lg text-indigo-600">
                {selectedOrderForPrint.totalAmount?.toLocaleString()} đ
              </span>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                🖨️ In Phiếu Ngay
              </button>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2 border rounded-lg text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
