import { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import axiosClient from "@/api/axiosClient";
import * as XLSX from "xlsx";

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

export default function WarehouseManagementPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [expFilter, setExpFilter] = useState("all");

  // Modals Visibility
  const [showImportModal, setShowImportModal] = useState(false);
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [showQuickAddSupplier, setShowQuickAddSupplier] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Form State Phiếu Nhập Kho Đa Dòng
  const [supplier, setSupplier] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const [receiptItems, setReceiptItems] = useState([
    { product: "", lotNumber: "", expDate: "", quantity: 1, importPrice: 0 },
  ]);

  // Form State Thêm Nhanh Sản Phẩm
  const [quickProductData, setQuickProductData] = useState({
    sku: "",
    name: "",
    unit: "Hộp",
    price: "",
  });

  // Form State Thêm Nhanh Nhà Cung Cấp
  const [quickSupplierData, setQuickSupplierData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [notification, setNotification] = useState({ type: "", msg: "" });

  const fetchData = async () => {
    try {
      const [invRes, prodRes, suppRes] = await Promise.all([
        axiosClient.get("/inventory"),
        axiosClient.get("/inventory/products"),
        axiosClient.get("/suppliers"),
      ]);
      setInventory(invRes.data);
      setProducts(prodRes.data);
      setSuppliers(suppRes.data);
    } catch (err) {
      setNotification({ type: "error", msg: "Không thể tải dữ liệu kho" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRow = () => {
    setReceiptItems([
      ...receiptItems,
      { product: "", lotNumber: "", expDate: "", quantity: 1, importPrice: 0 },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (receiptItems.length === 1) return;
    setReceiptItems(receiptItems.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...receiptItems];
    updated[index][field] = value;
    setReceiptItems(updated);
  };

  // Thêm nhanh sản phẩm mới trong Modal Nhập Kho
  const handleQuickAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post(
        "/inventory/products/quick-add",
        quickProductData,
      );
      setNotification({ type: "success", msg: res.data.message });
      const newProd = res.data.product;
      setProducts([...products, newProd]);

      const updated = [...receiptItems];
      const targetIdx = updated.findIndex((item) => !item.product);
      if (targetIdx !== -1) {
        updated[targetIdx].product = newProd._id;
      } else {
        updated[updated.length - 1].product = newProd._id;
      }
      setReceiptItems(updated);

      setShowQuickAddProduct(false);
      setQuickProductData({ sku: "", name: "", unit: "Hộp", price: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tạo sản phẩm mới");
    }
  };

  // Xử lý thay đổi số điện thoại trong Modal Thêm Nhanh NCC
  const handleQuickSupplierPhoneChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setQuickSupplierData({ ...quickSupplierData, phone: formatted });
  };

  // Thêm nhanh Nhà Cung Cấp trong Modal Nhập Kho
  const handleQuickAddSupplierSubmit = async (e) => {
    e.preventDefault();

    // Check độ dài chữ số SĐT nếu có nhập
    if (quickSupplierData.phone && quickSupplierData.phone.trim() !== "") {
      const rawPhone = quickSupplierData.phone.replace(/\D/g, "");
      if (rawPhone.length < 9 || rawPhone.length > 11) {
        alert(
          "⚠️ Số điện thoại không hợp lệ! Vui lòng nhập từ 9 đến 11 chữ số.",
        );
        return;
      }
    }

    const payload = {
      ...quickSupplierData,
      phone: quickSupplierData.phone.replace(/\D/g, ""), // Loại bỏ khoảng trắng khi gửi API
    };

    try {
      const res = await axiosClient.post("/suppliers/quick-add", payload);
      const newSupplier = res.data.supplier;
      setSuppliers([newSupplier, ...suppliers]);
      setSupplier(newSupplier.name); // Tự động điền NCC vừa tạo vào ô nhập

      setShowQuickAddSupplier(false);
      setQuickSupplierData({ name: "", phone: "", address: "" });
      setNotification({ type: "success", msg: "Đã thêm nhà cung cấp mới!" });
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi thêm nhà cung cấp");
    }
  };

  // Submit Tạo Phiếu Nhập Kho Đa Dòng
  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/inventory/receipt", {
        supplier,
        note: receiptNote,
        items: receiptItems,
      });
      setNotification({ type: "success", msg: res.data.message });
      setShowImportModal(false);
      setSupplier("");
      setReceiptNote("");
      setReceiptItems([
        {
          product: "",
          lotNumber: "",
          expDate: "",
          quantity: 1,
          importPrice: 0,
        },
      ]);
      fetchData();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Lỗi tạo phiếu nhập kho",
      });
    }
  };

  // Import File Excel
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const res = await axiosClient.post("/inventory/import-excel", {
          items: data,
        });
        setNotification({ type: "success", msg: res.data.message });
        if (res.data.errors?.length > 0) {
          alert("Các dòng bị lỗi:\n" + res.data.errors.join("\n"));
        }
        setShowExcelModal(false);
        fetchData();
      } catch (err) {
        alert("Lỗi đọc file Excel hoặc định dạng không đúng!");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Filter dữ liệu kho
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const exp = new Date(item.expDate);
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);

    let matchesExp = true;
    if (expFilter === "warning") {
      matchesExp = exp > now && exp <= threeMonthsLater;
    } else if (expFilter === "expired") {
      matchesExp = exp <= now;
    }

    return matchesSearch && matchesExp;
  });

  const totalReceiptAmount = receiptItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.importPrice) || 0);
  }, 0);

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản Lý Tồn Kho & Lô Hàng (FEFO)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi chi tiết số lượng, vị trí và hạn sử dụng thực phẩm bổ sung.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowExcelModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            📊 Nhập Bằng Excel
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            + Lập Phiếu Nhập Kho
          </button>
        </div>
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
          placeholder="Tìm theo Mã SKU, Tên sản phẩm, Số LOT..."
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Lọc Hạn Sử Dụng:
          </span>
          <select
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
          >
            <option value="all">Tất cả lô hàng</option>
            <option value="warning">⚠️ Sắp hết hạn (&lt; 3 tháng)</option>
            <option value="expired">🚫 Đã quá hạn (Cần hủy)</option>
          </select>
        </div>
      </div>

      {/* TABLE INVENTORY LIST */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4">Mã SKU / Sản Phẩm</th>
              <th className="py-3.5 px-4">Số Lô (LOT)</th>
              <th className="py-3.5 px-4">Hạn Sử Dụng (EXP)</th>
              <th className="py-3.5 px-4">Tồn Kho Thực Tế</th>
              <th className="py-3.5 px-4">Giá Nhập</th>
              <th className="py-3.5 px-4">Trạng Thái FEFO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Đang tải kho hàng...
                </td>
              </tr>
            ) : filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Không có lô hàng phù hợp
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const now = new Date();
                const exp = new Date(item.expDate);
                const isExpired = exp <= now;
                const isWarning =
                  !isExpired &&
                  exp <= new Date(now.setMonth(now.getMonth() + 3));

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-indigo-600 font-mono">
                        {item.product?.sku}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {item.lotNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {new Date(item.expDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-base">
                        {item.quantity}
                      </span>{" "}
                      {item.product?.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.importPrice?.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-3.5 px-4">
                      {isExpired ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">
                          🚫 Quá hạn
                        </span>
                      ) : isWarning ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                          ⚠️ Sắp hết hạn
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                          ✅ An toàn
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: PHIẾU NHẬP KHO THỦ CÔNG ĐA DÒNG */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Tạo Phiếu Nhập Kho Mới
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập nhiều danh mục lô hàng trong cùng một phiếu nhập
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddProduct(true)}
                className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100"
              >
                + Thêm SP Mới Nếu Chưa Có
              </button>
            </div>

            <form onSubmit={handleReceiptSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* NHÀ CUNG CẤP CÓ NÚT QUICK ADD VÀ DATALIST */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Nhà Cung Cấp
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddSupplier(true)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      + Thêm NCC Nhanh
                    </button>
                  </div>
                  <input
                    type="text"
                    list="supplier-list"
                    required
                    placeholder="Chọn hoặc nhập tên nhà cung cấp..."
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />

                  {/* DATALIST ĐƯỢC FORMAT TÊN, MÃ & SĐT CHUẨN KHOẢNG TRẮNG */}
                  <datalist id="supplier-list">
                    {suppliers.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name} ({s.code || "NCC"} -{" "}
                        {s.phone ? formatPhoneNumber(s.phone) : "Không có SĐT"})
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ghi Chú Phiếu Nhập
                  </label>
                  <input
                    type="text"
                    placeholder="Ghi chú thêm (nếu có)..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={receiptNote}
                    onChange={(e) => setReceiptNote(e.target.value)}
                  />
                </div>
              </div>

              {/* MẢNG CÁC DÒNG SẢN PHẨM NHẬP */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {receiptItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 relative space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Sản Phẩm #{idx + 1}
                      </span>
                      {receiptItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="text-xs font-bold text-rose-600 hover:underline"
                        >
                          ✕ Xóa dòng này
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Sản Phẩm
                        </label>
                        <select
                          required
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                          value={item.product}
                          onChange={(e) =>
                            handleRowChange(idx, "product", e.target.value)
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

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Số Lô (LOT)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="LOT-2026-01"
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                          value={item.lotNumber}
                          onChange={(e) =>
                            handleRowChange(idx, "lotNumber", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Hạn Sử Dụng (EXP)
                        </label>
                        <input
                          type="date"
                          required
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                          value={item.expDate}
                          onChange={(e) =>
                            handleRowChange(idx, "expDate", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Số Lượng Nhập
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="100"
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                          value={item.quantity}
                          onChange={(e) =>
                            handleRowChange(idx, "quantity", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Giá Nhập (Đơn vị)
                        </label>
                        <input
                          type="number"
                          placeholder="350000"
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                          value={item.importPrice}
                          onChange={(e) =>
                            handleRowChange(idx, "importPrice", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-2.5 border-2 border-dashed border-indigo-300 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-50 transition-all"
              >
                + Thêm Dòng Sản Phẩm Khác Vào Phiếu Nhập
              </button>

              <div className="flex justify-between items-center pt-3 border-t">
                <div>
                  <span className="text-xs text-slate-500">
                    Tổng giá trị phiếu nhập:
                  </span>
                  <p className="text-lg font-bold text-indigo-600">
                    {totalReceiptAmount.toLocaleString("vi-VN")} đ
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md shadow-indigo-500/20"
                  >
                    Xác Nhận Tạo Phiếu Nhập
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM NHANH SẢN PHẨM MỚI */}
      {showQuickAddProduct && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Tạo Sản Phẩm Mới Vào CSDL
            </h3>
            <form onSubmit={handleQuickAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mã SKU (Viết hoa)
                </label>
                <input
                  type="text"
                  required
                  placeholder="WHEY-GOLD-2KG"
                  className="w-full px-3 py-2 border rounded-lg text-sm uppercase"
                  value={quickProductData.sku}
                  onChange={(e) =>
                    setQuickProductData({
                      ...quickProductData,
                      sku: e.target.value,
                    })
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
                  value={quickProductData.name}
                  onChange={(e) =>
                    setQuickProductData({
                      ...quickProductData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Đơn Vị Tính
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Hộp / Chai / Gói"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={quickProductData.unit}
                    onChange={(e) =>
                      setQuickProductData({
                        ...quickProductData,
                        unit: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Giá Bán Niêm Yết
                  </label>
                  <input
                    type="number"
                    placeholder="1500000"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={quickProductData.price}
                    onChange={(e) =>
                      setQuickProductData({
                        ...quickProductData,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQuickAddProduct(false)}
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

      {/* MODAL 3: THÊM NHANH NHÀ CUNG CẤP (QUICK ADD SUPPLIER HAS PHONE FORMATTING) */}
      {showQuickAddSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Thêm Nhà Cung Cấp Mới
            </h3>
            <form onSubmit={handleQuickAddSupplierSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên Nhà Cung Cấp / Nhà Máy{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Công ty Dược phẩm Abbott"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={quickSupplierData.name}
                  onChange={(e) =>
                    setQuickSupplierData({
                      ...quickSupplierData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số Điện Thoại Liên Hệ (Tự động format khoảng trắng)
                </label>
                <input
                  type="text"
                  maxLength={13} // 11 chữ số + 2 khoảng trắng
                  placeholder="0901 234 567 hoặc 028 3999 8888"
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={quickSupplierData.phone}
                  onChange={handleQuickSupplierPhoneChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Địa Chỉ Văn Phòng / Kho
                </label>
                <input
                  type="text"
                  placeholder="KCN Tân Bình, TP.HCM"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={quickSupplierData.address}
                  onChange={(e) =>
                    setQuickSupplierData({
                      ...quickSupplierData,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuickAddSupplier(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-medium text-slate-600"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow"
                >
                  Lưu & Chọn Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: NHẬP BẰNG EXCEL */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Import Phiếu Nhập Kho Từ Excel
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              File Excel cần chứa các cột bắt buộc:{" "}
              <strong>sku, lotNumber, expDate, quantity, importPrice</strong>.
            </p>

            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
              className="w-full p-2 border border-dashed rounded-lg text-sm text-slate-600 mb-4"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium text-slate-600"
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
