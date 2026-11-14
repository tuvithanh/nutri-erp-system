import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-leaves"); // "my-leaves" | "approve-leaves" | "stats"

  // States Đơn của tôi
  const [myLeaves, setMyLeaves] = useState([]);
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // States Duyệt đơn & Thống kê
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: "", msg: "" });

  const fetchMyLeaves = async () => {
    try {
      const res = await axiosClient.get("/leaves/my-leaves");
      setMyLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingLeaves = async () => {
    if (!["admin", "hr"].includes(user?.role)) return;
    try {
      const res = await axiosClient.get("/leaves/pending");
      setPendingLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    if (!["admin", "hr"].includes(user?.role)) return;
    try {
      const res = await axiosClient.get("/leaves/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMyLeaves(), fetchPendingLeaves(), fetchStats()]).finally(
      () => setLoading(false),
    );
  }, []);

  // Gửi đơn xin nghỉ phép
  const handleCreateLeave = async (e) => {
    e.preventDefault();
    setNotification({ type: "", msg: "" });
    try {
      const res = await axiosClient.post("/leaves", {
        reason,
        fromDate,
        toDate,
      });
      setNotification({ type: "success", msg: res.data.message });
      setReason("");
      setFromDate("");
      setToDate("");
      fetchMyLeaves();
      fetchStats();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Không thể gửi đơn",
      });
    }
  };

  // Duyệt / Từ chối đơn
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
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Quản Lý Nghỉ Phép</h1>
        <p className="text-slate-500 text-sm mt-1">
          Tạo đơn xin nghỉ cá nhân và xử lý duyệt đơn nghỉ phép nhân sự.
        </p>
      </div>

      {notification.msg && (
        <div
          className={`mb-6 p-3.5 rounded-xl text-sm flex justify-between items-center ${notification.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
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

      {/* SYSTEM TABS HEADER */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("my-leaves")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "my-leaves" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          📝 Đơn Xin Nghỉ Của Tôi
        </button>

        {/* CHỈ HIỂN THỊ TAB DUYỆT & THỐNG KÊ CHO ADMIN HOẶC HR */}
        {["admin", "hr"].includes(user?.role) && (
          <>
            <button
              onClick={() => setActiveTab("approve-leaves")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === "approve-leaves" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              <span>✅ Duyệt Đơn Nghỉ Phép</span>
              {pendingLeaves.length > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-xs font-bold animate-pulse">
                  {pendingLeaves.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${activeTab === "stats" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              📊 Thống Kê Tổng Quan
            </button>
          </>
        )}
      </div>

      {/* TAB 1: ĐƠN CỦA TÔI */}
      {activeTab === "my-leaves" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Tạo Đơn */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-slate-900 text-base mb-4">
              Tạo Đơn Xin Nghỉ Phép
            </h3>
            <form onSubmit={handleCreateLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Từ Ngày
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm"
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
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lý Do Xin Nghỉ
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Nhập lý do chi tiết..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
              >
                Gửi Đơn Xin Nghỉ
              </button>
            </form>
          </div>

          {/* Danh Sách Lịch Sử */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-sm">
                Lịch Sử Đơn Đã Gửi
              </h3>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Lý Do</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Ghi Chú Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.map((l) => (
                  <tr key={l._id}>
                    <td className="py-3 px-4 text-xs font-medium text-slate-900">
                      {new Date(l.fromDate).toLocaleDateString("vi-VN")} →{" "}
                      {new Date(l.toDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4">{l.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${l.status === "approved" ? "bg-emerald-50 text-emerald-700" : l.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {l.status === "approved"
                          ? "Chấp thuận"
                          : l.status === "rejected"
                            ? "Từ chối"
                            : "Chờ duyệt"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 italic">
                      {l.adminComment || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DUYỆT ĐƠN NGHỈ PHÉP (ADMIN & HR) */}
      {activeTab === "approve-leaves" &&
        ["admin", "hr"].includes(user?.role) && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-400 uppercase">
                <tr>
                  <th className="py-3.5 px-4">Nhân Viên Xin Nghỉ</th>
                  <th className="py-3.5 px-4">Vai Trò (Role)</th>
                  <th className="py-3.5 px-4">Thời Gian Nghỉ</th>
                  <th className="py-3.5 px-4">Lý Do</th>
                  <th className="py-3.5 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      Không có đơn xin nghỉ phép nào chờ duyệt
                    </td>
                  </tr>
                ) : (
                  pendingLeaves.map((l) => (
                    <tr key={l._id}>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {l.user?.fullName} ({l.user?.email})
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold uppercase">
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
        )}

      {/* TAB 3: THỐNG KÊ (ADMIN & HR) */}
      {activeTab === "stats" &&
        ["admin", "hr"].includes(user?.role) &&
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold uppercase text-slate-400">
                Tổng Số Đơn
              </span>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold uppercase text-amber-500">
                Đơn Chờ Duyệt
              </span>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold uppercase text-emerald-500">
                Đơn Đã Duyệt
              </span>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {stats.approved}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold uppercase text-rose-500">
                Đơn Từ Chối
              </span>
              <p className="text-3xl font-bold text-rose-600 mt-2">
                {stats.rejected}
              </p>
            </div>
          </div>
        )}
    </MainLayout>
  );
}
