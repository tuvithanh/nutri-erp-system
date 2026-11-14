import { useState } from "react";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import UserListTab from "../components/hr/UserListTab";
import LeaveRequestTab from "../components/hr/LeaveRequestTab";
import LeaveApprovalTab from "../components/hr/LeaveApprovalTab";

export default function EmployeeManagementPage() {
  const { user: currentUser } = useAuth();

  // Mặc định chọn tab 'users' cho Admin/HR, chọn 'my-leaves' cho các role khác
  const defaultTab = ["admin", "hr"].includes(currentUser?.role)
    ? "users"
    : "my-leaves";
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <MainLayout>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản Lý Nhân Sự & Nghỉ Phép
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quyền hạn hiện tại:{" "}
            <strong className="text-indigo-600 uppercase">
              {currentUser?.role}
            </strong>
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS HEADER */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        {/* TAB 1: DANH SÁCH NHÂN SỰ (Chỉ Admin & HR mới thấy) */}
        {["admin", "hr"].includes(currentUser?.role) && (
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "users"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Danh Sách Nhân Sự
          </button>
        )}

        {/* TAB 2: XIN NGHỈ PHÉP (Mọi Role đều thấy) */}
        <button
          onClick={() => setActiveTab("my-leaves")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "my-leaves"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Đơn Xin Nghỉ Của Tôi
        </button>

        {/* TAB 3: DUYỆT & THỐNG KÊ (Chỉ Admin & HR mới thấy) */}
        {["admin", "hr"].includes(currentUser?.role) && (
          <button
            onClick={() => setActiveTab("approvals")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "approvals"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Duyệt Đơn & Thống Kê
          </button>
        )}
      </div>

      {/* RENDER DYNAMIC TAB DEPENDING ON PERMISSION */}
      <div className="mt-4">
        {activeTab === "users" &&
          ["admin", "hr"].includes(currentUser?.role) && (
            <UserListTab currentUser={currentUser} />
          )}

        {activeTab === "my-leaves" && <LeaveRequestTab />}

        {activeTab === "approvals" &&
          ["admin", "hr"].includes(currentUser?.role) && (
            <LeaveApprovalTab currentUser={currentUser} />
          )}
      </div>
    </MainLayout>
  );
}
