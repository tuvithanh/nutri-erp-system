import { createContext, useContext, useEffect, useState } from "react";
import axiosClient, { setAccessToken } from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tự động kiểm tra phiên đăng nhập bằng Cookie khi F5
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosClient.post("/auth/refresh");
        setAccessToken(res.data.accessToken);
        setUser(
          res.data.user || JSON.parse(localStorage.getItem("nutri_user")),
        );
      } catch (err) {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("nutri_user");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("nutri_user", JSON.stringify(updatedUser));
  };

  // Hàm Đăng Nhập
  const login = async (email, password) => {
    // Xóa sạch token cũ trong RAM/Storage trước khi login mới
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("nutri_user");

    // Gửi request login
    const res = await axiosClient.post("/auth/login", { email, password });

    // Lưu Access Token mới vào RAM
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    localStorage.setItem("nutri_user", JSON.stringify(res.data.user));

    return res.data;
  };

  // Hàm Đăng Xuất
  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (err) {
      console.error("Lỗi logout:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("nutri_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, updateUserState }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
