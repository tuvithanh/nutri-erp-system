import { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import axiosClient from "@/api/axiosClient";

export default function InventoryHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lọc và Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all, import, export
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal Xem Chi Tiết Phiếu (Đối soát)
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/inventory/history");
      setLogs(res.data);
    } catch (err) {
      console.error("Lỗi nạp lịch sử kho:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Xử lý Lọc dữ liệu chuẩn xác
  const filteredLogs = logs.filter((item) => {
    // Tìm theo Mã phiếu, Đối tác (NCC/Khách hàng), Mã Lô hoặc Tên SP
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (item.code && item.code.toLowerCase().includes(term)) ||
      (item.partnerName && item.partnerName.toLowerCase().includes(term)) ||
      (item.items &&
        item.items.some(
          (i) =>
            i.productName?.toLowerCase().includes(term) ||
            i.lotNumber?.toLowerCase().includes(term),
        ));

    // Lọc theo Loại phiếu (Nhập / Xuất)
    const matchesType = typeFilter === "all" || item.type === typeFilter;

    // Lọc theo khoảng Ngày lập phiếu
    let matchesDate = true;
    if (fromDate || toDate) {
      const itemDate = new Date(item.createdAt).setHours(0, 0, 0, 0);
      if (fromDate) {
        const from = new Date(fromDate).setHours(0, 0, 0, 0);
        if (itemDate < from) matchesDate = false;
      }
      if (toDate) {
        const to = new Date(toDate).setHours(0, 0, 0, 0);
        if (itemDate > to) matchesDate = false;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <MainLayout>
      {/* HEADER TRANG */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Nhật Ký Nhập & Xuất Kho
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tra cứu, đối soát toàn bộ chứng từ nhập kho nhà cung cấp và xuất
            hàng bán.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg shadow-sm"
        >
          Làm Mới Dữ Liệu
        </button>
      </div>

      {/* TÌM KIẾM & THỦ THUẬT LỌC ĐA TIÊU CHÍ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Từ khóa tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Mã phiếu, NCC, Khách hàng, Tên SP, Lô..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Loại Giao Dịch
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tất cả giao dịch</option>
              <option value="import">Phiếu Nhập Kho (+)</option>
              <option value="export">Phiếu Xuất Kho (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Từ Ngày
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Đến Ngày
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* BẢNG DANH SÁCH PHIẾU NGUYÊN BẢN ERP */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4">Mã Chứng Từ</th>
              <th className="py-3.5 px-4">Ngày Lập</th>
              <th className="py-3.5 px-4">Loại Phiếu</th>
              <th className="py-3.5 px-4">Đối Tác (NCC / Khách Hàng)</th>
              <th className="py-3.5 px-4 text-right">Tổng Quy Mô Số Lượng</th>
              <th className="py-3.5 px-4 text-right">Tổng Giá Trị</th>
              <th className="py-3.5 px-4 text-center">Người Thực Hiện</th>
              <th className="py-3.5 px-4 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-slate-400">
                  Đang tải nhật ký chứng từ kho...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-slate-400">
                  Không tìm thấy chứng từ phù hợp
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const totalQty = log.items.reduce(
                  (sum, i) => sum + Number(i.quantity || 0),
                  0,
                );
                const totalAmount = log.items.reduce(
                  (sum, i) =>
                    sum + Number(i.quantity || 0) * Number(i.price || 0),
                  0,
                );

                return (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {log.code}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.type === "import" ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-xs">
                          NHẬP KHO
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold text-xs">
                          XUẤT KHO
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {log.partnerName || "---"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {totalQty.toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {totalAmount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                      {log.createdByName || "Hệ Thống"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(log)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border border-slate-300"
                      >
                        Đối Soát
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL ĐỐI SOÁT CHI TIẾT PHIẾU NHẬP / XUẤT (PRINTABLE FORMAT) */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden border">
            {/* Header Modal Chứng Từ */}
            <div className="flex justify-between items-start pb-4 border-b">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  CHỨNG TỪ KHO HÀNG
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedReceipt.type === "import"
                    ? "PHIẾU NHẬP KHO"
                    : "PHIẾU XUẤT KHO"}
                  : {selectedReceipt.code}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thời gian ghi nhận:{" "}
                  {new Date(selectedReceipt.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            {/* Thông Tin Chung Chứng Từ */}
            <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 rounded-lg border text-sm">
              <div>
                <p className="text-xs text-slate-500 font-semibold">
                  ĐỐI TÁC GIAO DỊCH
                </p>
                <p className="font-bold text-slate-800">
                  {selectedReceipt.partnerName || "Không xác định"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">
                  NGƯỜI LẬP PHIẾU
                </p>
                <p className="font-bold text-slate-800">
                  {selectedReceipt.createdByName || "N/A"}
                </p>
              </div>
              {selectedReceipt.note && (
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold">
                    GHI CHÚ MỞ RỘNG
                  </p>
                  <p className="text-slate-700 italic">
                    {selectedReceipt.note}
                  </p>
                </div>
              )}
            </div>

            {/* Bảng Chi Tiết Danh Mục Lô Hàng Trong Phiếu */}
            <div className="max-h-60 overflow-y-auto border rounded-lg mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Tên Sản Phẩm</th>
                    <th className="py-2.5 px-3">Số Lô (LOT)</th>
                    <th className="py-2.5 px-3">Hạn Sử Dụng (EXP)</th>
                    <th className="py-2.5 px-3 text-right">Số Lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                    <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReceipt.items.map((item, idx) => {
                    const subTotal =
                      (Number(item.quantity) || 0) * (Number(item.price) || 0);
                    return (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {item.productName}
                        </td>
                        <td className="py-2 px-3 font-mono text-indigo-600">
                          {item.lotNumber}
                        </td>
                        <td className="py-2 px-3">
                          {item.expDate
                            ? new Date(item.expDate).toLocaleDateString("vi-VN")
                            : "---"}
                        </td>
                        <td className="py-2 px-3 text-right font-bold">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {Number(item.price).toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {subTotal.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tổng Kết Phiếu */}
            <div className="flex justify-between items-center pt-3 border-t">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg"
              >
                In Chứng Từ Chi Tiết
              </button>

              <div className="text-right">
                <span className="text-xs text-slate-500">
                  TỔNG CỘNG GIÁ TRỊ GIÁO DỊCH:
                </span>
                <p className="text-lg font-bold text-indigo-700">
                  {selectedReceipt.items
                    .reduce(
                      (sum, i) =>
                        sum +
                        (Number(i.quantity) || 0) * (Number(i.price) || 0),
                      0,
                    )
                    .toLocaleString("vi-VN")}{" "}
                  đ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
