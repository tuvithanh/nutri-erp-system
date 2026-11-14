import { useState } from "react";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

export default function ProfilePage() {
  const { user, updateUserState } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword && newPassword !== confirmPassword) {
      return setError("Mật khẩu mới và nhập lại mật khẩu không khớp!");
    }

    setLoading(true);
    try {
      const payload = { fullName };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await axiosClient.put("/auth/profile", payload);
      setMessage(res.data.message);
      updateUserState(res.data.user);

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Thông Tin Tài Khoản
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý thông tin cá nhân và cài đặt mật khẩu truy cập hệ thống
            NutriERP.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center justify-between">
            <span>✅ {message}</span>
            <button onClick={() => setMessage("")} className="font-bold">
              &times;
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="font-bold">
              &times;
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Card với Avatar */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {user?.fullName}
              </h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold uppercase">
                {user?.role} ROLE
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
            {/* THÔNG TIN CƠ BẢN */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                1. Thông Tin Cơ Bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email (Không thể thay đổi)
                  </label>
                  <input
                    type="email"
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                    value={user?.email || ""}
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* ĐỔI MẬT KHẨU */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
                2. Đặt Lại Mật Khẩu
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Để trống nếu bạn không muốn thay đổi mật khẩu hiện tại.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mật Khẩu Hiện Tại
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Mật Khẩu Mới
                    </label>
                    <input
                      type="password"
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Xác Nhận Mật Khẩu Mới
                    </label>
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
