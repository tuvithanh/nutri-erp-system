import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // CHỈ TỰ ĐỘNG REFRESH KHI:
    // 1. Bị lỗi 401 hoặc 403
    // 2. Chưa từng retry trước đó (_retry = false)
    // 3. Request GỐC KHÔNG PHẢI LÀ /auth/login HOẶC /auth/refresh
    const isAuthRequest =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/logout");

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;
      try {
        const res = await axiosClient.post("/auth/refresh");
        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
