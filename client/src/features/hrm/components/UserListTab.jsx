import { useEffect, useState } from "react";
import axiosClient from "@/api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function UserListTab({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [notification, setNotification] = useState({ type: "", msg: "" });
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get("/users");
      setUsers(res.data);
    } catch (err) {
      setNotification({
        type: "error",
        msg: "Không thể tải danh sách nhân sự",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    try {
      await axiosClient.put(`/users/${user._id}`, { isActive: !user.isActive });
      setNotification({
        type: "success",
        msg: `Đã ${!user.isActive ? "kích hoạt" : "khóa"} tài khoản thành công`,
      });
      fetchUsers();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Lỗi cập nhật",
      });
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?")
    )
      return;
    try {
      await axiosClient.delete(`/users/${id}`);
      setNotification({ type: "success", msg: "Đã xóa tài khoản nhân viên" });
      fetchUsers();
    } catch (err) {
      setNotification({
        type: "error",
        msg: err.response?.data?.message || "Không thể xóa",
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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

      {/* FILTER & ADD BUTTON */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả Roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="warehouse">Warehouse</option>
            <option value="sales">Sales</option>
          </select>
        </div>

        <button
          onClick={() => navigate("/register")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all w-full sm:w-auto"
        >
          + Thêm Nhân Viên Mới
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Nhân Viên</th>
              <th className="py-3.5 px-4 font-semibold">Email</th>
              <th className="py-3.5 px-4 font-semibold">Vai Trò (Role)</th>
              <th className="py-3.5 px-4 font-semibold">Trạng Thái</th>
              <th className="py-3.5 px-4 font-semibold text-right">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">
                  Đang tải dữ liệu nhân sự...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">
                  Không tìm thấy nhân viên phù hợp
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200 text-xs">
                      {u.fullName.charAt(0)}
                    </div>
                    {u.fullName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${
                        u.role === "admin"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : u.role === "hr"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : u.role === "warehouse"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                      ></span>
                      {u.isActive ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {currentUser?.role === "admin" ? (
                      <>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-2.5 py-1 text-xs rounded font-medium border transition-colors ${
                            u.isActive
                              ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                              : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {u.isActive ? "Khóa" : "Mở khóa"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="px-2.5 py-1 text-xs rounded font-medium border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Chỉ xem
                      </span>
                    )}
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
