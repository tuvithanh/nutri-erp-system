import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl font-bold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            N
          </div>
          <h2 className="text-2xl font-bold text-slate-900">NutriERP Portal</h2>
          <p className="text-slate-500 text-sm mt-1">
            Đăng nhập tài khoản quản trị hệ thống
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Nhân Viên
            </label>
            <input
              type="email"
              required
              placeholder="nhanvien@nutrierp.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Mật Khẩu
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {loading ? "Đang truy cập..." : "Đăng Nhập Hệ Thống"}
          </button>
        </form>
      </div>
    </div>
  );
}
