import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await axiosClient.get("/dashboard/summary");
      setData(res.data);
    } catch (err) {
      console.error("Lỗi nạp dữ liệu dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64 text-slate-400">
          Đang tổng hợp dữ liệu điều hành NutriERP...
        </div>
      </MainLayout>
    );
  }

  const {
    financials,
    expiryAlertsCount,
    expiryDetails,
    topProducts,
    salesPerformance,
  } = data || {};

  return (
    <MainLayout>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Trung Tâm Điều Hành Real-Time
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Xin chào{" "}
            <strong className="text-indigo-600">{user?.fullName}</strong>! Tổng
            quan hiệu suất kinh doanh và cảnh báo tồn kho FEFO.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 self-start md:self-auto"
        >
          🔄 Cập nhật dữ liệu
        </button>
      </div>

      {/* 1. CARDS TỔNG QUAN TÀI CHÍNH (DOANH THU - COGS - LỢI NHUẬN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">
            Tổng Doanh Thu
          </span>
          <p className="text-2xl font-black text-indigo-600 mt-2">
            {financials?.totalRevenue?.toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Toàn bộ đơn vị bán ra
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">
            Giá Vốn Hàng Bán (COGS)
          </span>
          <p className="text-2xl font-black text-slate-700 mt-2">
            {financials?.totalCOGS?.toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Tính theo giá nhập kho FEFO
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">
            Lợi Nhuận Gộp
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {financials?.grossProfit?.toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
            Biên lợi nhuận: {financials?.profitMargin}%
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">
            Cảnh Báo Lô Hạn Dùng
          </span>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {(expiryAlertsCount?.under30 || 0) +
              (expiryAlertsCount?.expired || 0)}{" "}
            Lô
          </p>
          <span className="text-[11px] text-rose-500 font-medium mt-1 block">
            Cần xả hàng gấp (&lt; 30 ngày)
          </span>
        </div>
      </div>

      {/* 2. KHU VỰC CẢNH BÁO FEFO & TOP SẢN PHẨM BÁN CHẠY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* KHỐI 1: BIỂU ĐỒ & BẢNG CẢNH BÁO LÔ HÀNG HẠN SỬ DỤNG (EXPIRY ALERTS) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              ⚠️ Cảnh Báo Lô Hàng Sắp Hết Hạn (FEFO)
            </h3>
            <span className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded font-semibold">
              Real-time
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4 text-center">
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-rose-600 block">
                Đã Quá Hạn
              </span>
              <strong className="text-lg text-rose-700">
                {expiryAlertsCount?.expired}
              </strong>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-amber-600 block">
                &lt; 30 Ngày
              </span>
              <strong className="text-lg text-amber-700">
                {expiryAlertsCount?.under30}
              </strong>
            </div>
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-yellow-600 block">
                30-60 Ngày
              </span>
              <strong className="text-lg text-yellow-700">
                {expiryAlertsCount?.under60}
              </strong>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-blue-600 block">
                60-90 Ngày
              </span>
              <strong className="text-lg text-blue-700">
                {expiryAlertsCount?.under90}
              </strong>
            </div>
          </div>

          {/* Danh sách các lô cần đẩy Sale gấp */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {expiryDetails?.under30Days?.length === 0 &&
            expiryDetails?.expired?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Không có lô hàng nào sắp hết hạn trong 30 ngày tới.
              </p>
            ) : (
              [
                ...(expiryDetails?.expired || []),
                ...(expiryDetails?.under30Days || []),
              ].map((batch) => (
                <div
                  key={batch._id}
                  className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {batch.product?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      LOT: {batch.lotNumber} | Tồn: {batch.quantity}{" "}
                      {batch.product?.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded text-[10px]">
                      EXP: {new Date(batch.expDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KHỐI 2: TOP SẢN PHẨM BÁN CHẠY (TOP SELLING) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            🔥 Top Sản Phẩm Bán Chạy Nhất
          </h3>
          <div className="space-y-3">
            {topProducts?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Chưa có dữ liệu bán hàng.
              </p>
            ) : (
              topProducts?.map((item, index) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0
                          ? "bg-amber-400 text-white"
                          : index === 1
                            ? "bg-slate-300 text-slate-700"
                            : "bg-amber-700/20 text-amber-800"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {item.productInfo?.name}
                      </p>
                      <p className="text-[11px] text-indigo-600 font-mono">
                        {item.productInfo?.sku}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-xs">
                      {item.totalQuantity} {item.productInfo?.unit}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.totalRevenue?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. BẢNG XẾP HẠNG KPI NHÂN VIÊN BÁN HÀNG (SALES LEADERBOARD) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              🏆 Bảng Xếp Hạng Doanh Số Nhân Viên (KPI Sales)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Xếp hạng theo tổng giá trị các đơn hàng đã tạo thành công.
            </p>
          </div>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Xếp Hạng</th>
              <th className="py-3.5 px-4 font-semibold">Nhân Viên Bán Hàng</th>
              <th className="py-3.5 px-4 font-semibold">Tổng Đơn Đã Lên</th>
              <th className="py-3.5 px-4 font-semibold text-right">
                Tổng Doanh Số Đạt Được
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salesPerformance?.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400">
                  Chưa có phát sinh doanh số bán hàng
                </td>
              </tr>
            ) : (
              salesPerformance?.map((sp, idx) => (
                <tr
                  key={sp._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        idx === 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Hạng #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {sp.userInfo?.fullName} ({sp.userInfo?.email})
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {sp.totalOrders} đơn hàng
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 text-right text-base">
                    {sp.totalSales?.toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
