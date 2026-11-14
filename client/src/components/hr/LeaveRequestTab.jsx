import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function LeaveRequestTab() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [notification, setNotification] = useState({ type: "", msg: "" });

  const fetchMyLeaves = async () => {
    try {
      const res = await axiosClient.get("/leaves/my-leaves");
      setMyLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

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
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Không thể gửi đơn",
      });
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form xin nghỉ */}
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
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
            >
              Gửi Đơn Xin Nghỉ
            </button>
          </form>
        </div>

        {/* Bảng Lịch sử */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-slate-50/50">
            <h3 className="font-semibold text-slate-800 text-sm">
              Lịch Sử Đơn Đã Gửi Của Tôi
            </h3>
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4">Lý Do</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Phản Hồi Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myLeaves.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    Bạn chưa gửi đơn xin nghỉ phép nào
                  </td>
                </tr>
              ) : (
                myLeaves.map((l) => (
                  <tr key={l._id}>
                    <td className="py-3 px-4 text-xs font-medium text-slate-900">
                      {new Date(l.fromDate).toLocaleDateString("vi-VN")} →{" "}
                      {new Date(l.toDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4">{l.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${
                          l.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : l.status === "rejected"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
