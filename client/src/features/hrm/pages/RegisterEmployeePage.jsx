import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import axiosClient from "@/api/axiosClient";

export default function RegisterEmployeePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "sales",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/register", formData);
      setMessage(res.data.message);
      setFormData({ fullName: "", email: "", password: "", role: "sales" });
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-slate-500 hover:text-indigo-600 mb-4 inline-flex items-center gap-1"
        >
          ← Quay lại Dashboard
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
            Tạo Tài Khoản Nhân Viên Mới
          </h2>

          {message && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Họ và Tên Nhân Viên
              </label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Công Ty
              </label>
              <input
                type="email"
                required
                placeholder="nhanvien@nutrierp.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Mật Khẩu Mặc Định
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Phân Quyền (Role System)
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="sales">Sales (Nhân viên bán hàng)</option>
                <option value="warehouse">
                  Warehouse (Quản lý kho & Lô hàng)
                </option>
                <option value="hr">HR (Quản trị nhân sự)</option>
                <option value="admin">Admin (Toàn quyền hệ thống)</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {loading ? "Đang khởi tạo..." : "Xác Nhận Tạo Tài Khoản"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
