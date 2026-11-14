import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Khai báo Icon SVG tương ứng cho từng mục
  const icons = {
    dashboard: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    audit: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    auditLog: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    reports: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    customers: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    sales: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
    ),
    suppliers: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m-5 0V9m0 0h-2m2 0h2"
        />
      </svg>
    ),
    products: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    warehouse: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
        />
      </svg>
    ),
    users: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    leave: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    history: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  // Gom nhóm danh sách Menu theo phân vùng chức năng
  const menuGroups = [
    {
      groupTitle: "TỔNG QUAN",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          roles: ["admin", "hr", "warehouse", "sales"],
          icon: icons.dashboard,
        },
        {
          label: "Báo Cáo & Thống Kê",
          path: "/reports",
          roles: ["admin", "warehouse", "hr"],
          icon: icons.reports,
        },
      ],
    },
    {
      groupTitle: "VẬN HÀNH & KHO",
      items: [
        {
          label: "Quản Lý Kho (FEFO)",
          path: "/warehouse",
          roles: ["admin", "warehouse"],
          icon: icons.warehouse,
        },
        {
          label: "Danh Mục Sản Phẩm",
          path: "/products",
          roles: ["admin", "warehouse"],
          icon: icons.products,
        },
        {
          label: "Quản Lý Nhà Cung Cấp",
          path: "/suppliers",
          roles: ["admin"],
          icon: icons.suppliers,
        },
        {
          label: "Kiểm Kê Kho",
          path: "/stock-audit",
          roles: ["admin", "warehouse"],
          icon: icons.audit,
        },
        {
          label: "Nhật Ký Nhập / Xuất Kho",
          path: "/inventory-history",
          roles: ["admin", "warehouse"],
          icon: icons.history,
        },
      ],
    },
    {
      groupTitle: "KINH DOANH & KHÁCH HÀNG",
      items: [
        {
          label: "Quản Lý Bán Hàng",
          path: "/sales",
          roles: ["admin", "sales", "warehouse"],
          icon: icons.sales,
        },
        {
          label: "Quản Lý Khách Hàng",
          path: "/customers",
          roles: ["admin", "sales", "warehouse"],
          icon: icons.customers,
        },
      ],
    },
    {
      groupTitle: "NHÂN SỰ & TÀI KHOẢN",
      items: [
        {
          label: "Quản Lý Nhân Sự",
          path: "/users",
          roles: ["admin", "hr"],
          icon: icons.users,
        },
        {
          label: "Đăng Ký Nghỉ Phép",
          path: "/leave-request",
          roles: ["warehouse", "sales"],
          icon: icons.leave,
        },
        {
          label: "Nhật Ký Hệ Thống",
          path: "/audit-logs",
          roles: ["admin"],
          icon: icons.auditLog,
        },
      ],
    },
  ];

  const getHeaderTitle = () => {
    switch (location.pathname) {
      case "/profile":
        return "Hồ Sơ Cá Nhân";
      case "/customers":
        return "Quản Lý Khách Hàng (CRM)";
      case "/suppliers":
        return "Quản Lý Nhà Cung Cấp";
      case "/leave-request":
        return "Đăng Ký Nghỉ Phép";
      case "/products":
        return "Danh Mục Sản Phẩm";
      case "/users":
        return "Quản Lý Nhân Sự";
      case "/warehouse":
        return "Quản Lý Tồn Kho & Lô Hàng";
      case "/sales":
        return "Quản Lý Đơn Hàng & Bán Hàng";
      default:
        return "NutriERP Overview";
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      {/* SIDEBAR BẢN NÂNG CẤP DỄ NHÌN */}
      <aside className="w-64 bg-zinc-900 text-zinc-300 flex flex-col justify-between p-4 border-r border-zinc-800 select-none">
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/40">
              N
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight tracking-wide">
                NutriERP
              </h1>
              <span className="text-[11px] font-medium text-indigo-400">
                Enterprise System
              </span>
            </div>
          </div>

          {/* Navigation Items theo từng nhóm */}
          <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 custom-scrollbar">
            {menuGroups.map((group, idx) => {
              // Lọc các item mà user có quyền xem
              const allowedItems = group.items.filter((item) =>
                item.roles.includes(user?.role),
              );

              if (allowedItems.length === 0) return null;

              return (
                <div key={idx}>
                  <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    {group.groupTitle}
                  </p>
                  <nav className="space-y-1">
                    {allowedItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                              : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`transition-colors ${
                                isActive
                                  ? "text-white"
                                  : "text-zinc-400 group-hover:text-indigo-400"
                              }`}
                            >
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between px-1">
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-zinc-800/80 transition-all flex-1 min-w-0 mr-1"
            title="Xem hồ sơ cá nhân"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30 shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-semibold text-zinc-200 truncate hover:text-indigo-300">
                {user?.fullName}
              </p>
              <p className="text-[11px] text-zinc-500 capitalize truncate">
                {user?.role} Role
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Đăng xuất"
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              {user?.role?.toUpperCase()} PORTAL
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-600">
              {getHeaderTitle()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Trạng thái hệ thống</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Hoạt động
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
