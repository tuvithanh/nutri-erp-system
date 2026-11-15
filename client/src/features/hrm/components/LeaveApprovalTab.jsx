import { useEffect, useState } from "react";
import axiosClient from "@/api/axiosClient";

export default function LeaveApprovalTab({ currentUser }) {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [notification, setNotification] = useState({ type: "", msg: "" });

  const fetchPendingLeaves = async () => {
    try {
      const res = await axiosClient.get("/leaves/pending");
      setPendingLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get("/leaves/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
    fetchStats();
  }, []);

  const handleAction = async (id, status) => {
    const adminComment = window.prompt(
      `Nhập ghi chú khi ${status === "approved" ? "chấp thuận" : "từ chối"} (Không bắt buộc):`,
    );
    try {
      const res = await axiosClient.put(`/leaves/${id}/approve`, {
        status,
        adminComment,
      });
      setNotification({ type: "success", msg: res.data.message });
      fetchPendingLeaves();
      fetchStats();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Lỗi xử lý",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* THỐNG KÊ CARDS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase text-slate-400">
              Tổng Đơn Tất Cả
            </span>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase text-amber-500">
              Đơn Đang Chờ Duyệt
            </span>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase text-emerald-500">
              Đơn Đã Chấp Thuận
            </span>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {stats.approved}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase text-rose-500">
              Đơn Bị Từ Chối
            </span>
            <p className="text-3xl font-bold text-rose-600 mt-2">
              {stats.rejected}
            </p>
          </div>
        </div>
      )}

      {notification.msg && (
        <div
          className={`p-3.5 rounded-xl text-sm flex justify-between items-center ${notification.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
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

      {/* DANH SÁCH DUYỆT */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-sm">
            Danh Sách Đơn Xin Nghỉ Cần Duyệt
          </h3>
          <span className="text-xs text-slate-400">
            {currentUser?.role === "hr"
              ? "Scope: Sales & Warehouse"
              : "Scope: All Employees"}
          </span>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase">
            <tr>
              <th className="py-3.5 px-4">Nhân Viên Xin Nghỉ</th>
              <th className="py-3.5 px-4">Vai Trò (Role)</th>
              <th className="py-3.5 px-4">Thời Gian Nghỉ</th>
              <th className="py-3.5 px-4">Lý Do Detail</th>
              <th className="py-3.5 px-4 text-right">Thao Tác Duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingLeaves.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">
                  Không có đơn nghỉ phép nào chờ duyệt
                </td>
              </tr>
            ) : (
              pendingLeaves.map((l) => (
                <tr key={l._id}>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {l.user?.fullName} ({l.user?.email})
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold uppercase">
                      {l.user?.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium">
                    {new Date(l.fromDate).toLocaleDateString("vi-VN")} →{" "}
                    {new Date(l.toDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3.5 px-4">{l.reason}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleAction(l._id, "approved")}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleAction(l._id, "rejected")}
                      className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-medium hover:bg-rose-700"
                    >
                      Từ Chối
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
