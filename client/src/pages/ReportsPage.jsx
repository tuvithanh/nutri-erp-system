import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import axiosClient from "../api/axiosClient";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter Thời gian
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if (fromDate) queryParams.push(`fromDate=${fromDate}`);
      if (toDate) queryParams.push(`toDate=${toDate}`);
      const queryString =
        queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

      const res = await axiosClient.get(`/reports/summary${queryString}`);
      setData(res.data);
    } catch (err) {
      console.error("Lỗi nạp báo cáo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
    setTimeout(() => fetchReportData(), 50);
  };

  const summary = data?.summary || {};
  const topProducts = data?.topStockProducts || [];

  return (
    <MainLayout>
      {/* HEADER TRANG BÁO CÁO */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Báo Cáo Tổng Hợp Doanh Thu & Kho Hàng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Đối soát tổng số liệu tài chính bán hàng, chi phí nhập kho và cảnh
            báo dòng đời hàng hóa (FEFO).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium shadow-sm"
        >
          In Báo Cáo Chi Tiết
        </button>
      </div>

      {/* FILTER BAR THỜI GIAN BÁO CÁO */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-col sm:flex-row items-end gap-3"
        >
          <div className="w-full sm:w-48">
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

          <div className="w-full sm:w-48">
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

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              Xem Báo Cáo
            </button>
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg"
              >
                Xóa Lọc
              </button>
            )}
          </div>
        </form>
      </div>

      {/* CÁC THẺ KHIỆN THỊ SỐ LIỆU TỔNG QUAN (METRIC CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            TỔNG DOANH THU BÁN HÀNG
          </span>
          <p className="text-xl font-bold text-indigo-600 mt-1">
            {loading
              ? "---"
              : `${(summary.totalRevenue || 0).toLocaleString("vi-VN")} đ`}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            {summary.totalOrders || 0} đơn hàng thành công
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            TỔNG CHI PHÍ NHẬP KHO
          </span>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {loading
              ? "---"
              : `${(summary.totalImportCost || 0).toLocaleString("vi-VN")} đ`}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Chứng từ vốn đầu vào
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            LỢI NHUẬN ƯỚC TÍNH
          </span>
          <p
            className={`text-xl font-bold mt-1 ${summary.estimatedProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            {loading
              ? "---"
              : `${(summary.estimatedProfit || 0).toLocaleString("vi-VN")} đ`}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Chênh lệch Thu - Chi
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            TỔNG GIÁ TRỊ TỒN KHO
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {loading
              ? "---"
              : `${(summary.totalInventoryValue || 0).toLocaleString("vi-VN")} đ`}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Tổng {summary.totalStockQuantity || 0} đơn vị tồn
          </span>
        </div>
      </div>

      {/* BẢNG CẢNH BÁO LÔ HÀNG VÀ TOP TỒN KHO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* THỐNG KÊ TRẠNG THÁI FEFO KHO */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2">
            Báo Cáo Trạng Thái Lô Hàng FEFO
          </h3>

          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                LÔ HÀNG AN TOÀN
              </p>
              <p className="text-xs text-slate-400">Hạn dùng &gt; 3 tháng</p>
            </div>
            <span className="text-lg font-bold text-emerald-600">
              {loading
                ? "---"
                : summary.totalStockQuantity -
                  (summary.warningBatchesCount + summary.expiredBatchesCount)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div>
              <p className="text-xs font-semibold text-amber-800">
                LÔ SẮP HẾT HẠN
              </p>
              <p className="text-xs text-amber-600">
                Cần đẩy bán (&lt; 3 tháng)
              </p>
            </div>
            <span className="text-lg font-bold text-amber-700">
              {loading ? "---" : summary.warningBatchesCount} Lô
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg border border-rose-200">
            <div>
              <p className="text-xs font-semibold text-rose-800">
                LÔ ĐÃ QUÁ HẠN
              </p>
              <p className="text-xs text-rose-600">Cần lập biên bản hủy</p>
            </div>
            <span className="text-lg font-bold text-rose-700">
              {loading ? "---" : summary.expiredBatchesCount} Lô
            </span>
          </div>
        </div>

        {/* BẢNG TOP SẢN PHẨM TỒN KHO NHIỀU NHẤT */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-base font-bold text-slate-900">
              Top 10 Sản Phẩm Tồn Kho Nhiều Nhất
            </h3>
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
              <tr>
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Tên Sản Phẩm</th>
                <th className="py-3 px-4 text-right">Tổng Tồn Kho</th>
                <th className="py-3 px-4 text-right">Tổng Giá Trị Tồn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-400">
                    Đang tính toán số liệu tồn kho...
                  </td>
                </tr>
              ) : topProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-400">
                    Chưa có sản phẩm trong kho
                  </td>
                </tr>
              ) : (
                topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 text-xs">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {p.totalQty.toLocaleString("vi-VN")} {p.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                      {p.totalValue.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
