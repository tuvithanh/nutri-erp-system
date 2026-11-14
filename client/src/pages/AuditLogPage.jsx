import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import axiosClient from "../api/axiosClient";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/audit-logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Lỗi nạp nhật ký hệ thống:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Lọc danh sách nhật ký
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      log.user?.fullName?.toLowerCase().includes(term) ||
      log.user?.email?.toLowerCase().includes(term) ||
      log.description?.toLowerCase().includes(term);

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;

    return matchesSearch && matchesAction && matchesModule;
  });

  return (
    <MainLayout>
      {/* HEADER TRANG */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Nhật Ký Thao Tác Hệ Thống (Audit Logs)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quyền Admin: Giám sát toàn bộ hoạt động Thêm, Sửa, Xóa và điều chỉnh
            dữ liệu của người dùng.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium shadow-sm"
        >
          Làm Mới Dữ Liệu
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Từ khóa tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên nhân viên, email, mô tả hành động..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Hành Động
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">Tất cả hành động</option>
              <option value="CREATE">TẠO MỚI (CREATE)</option>
              <option value="UPDATE">CẬP NHẬT (UPDATE)</option>
              <option value="DELETE">XÓA (DELETE)</option>
              <option value="IMPORT">NHẬP KHO (IMPORT)</option>
              <option value="EXPORT">XUẤT KHO (EXPORT)</option>
              <option value="AUDIT">KIỂM KÊ (AUDIT)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Phân Vùng Module
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="all">Tất cả Module</option>
              <option value="INVENTORY">Kho Hàng & Lô Hàng</option>
              <option value="SUPPLIERS">Nhà Cung Cấp</option>
              <option value="PRODUCTS">Sản Phẩm</option>
              <option value="CUSTOMERS">Khách Hàng</option>
              <option value="USERS">Nhân Sự & Tài Khoản</option>
            </select>
          </div>
        </div>
      </div>

      {/* BẢNG BẢN GHI NHẬT KÝ */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4">Thời Gian</th>
              <th className="py-3.5 px-4">Người Thực Hiện</th>
              <th className="py-3.5 px-4">Hành Động</th>
              <th className="py-3.5 px-4">Module</th>
              <th className="py-3.5 px-4">Mô Tả Chi Tiết Thao Tác</th>
              <th className="py-3.5 px-4 text-right">Địa Chỉ IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Đang tải nhật ký thao tác...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Chưa có nhật ký nào phù hợp
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">
                      {log.user?.fullName || "Hệ thống"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {log.user?.email} ({log.user?.role})
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    {log.action === "CREATE" && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-xs">
                        CREATE
                      </span>
                    )}
                    {log.action === "UPDATE" && (
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-bold text-xs">
                        UPDATE
                      </span>
                    )}
                    {log.action === "DELETE" && (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded font-bold text-xs">
                        DELETE
                      </span>
                    )}
                    {["IMPORT", "EXPORT", "AUDIT"].includes(log.action) && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold text-xs">
                        {log.action}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                    {log.module}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {log.description}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-400">
                    {log.ipAddress}
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
