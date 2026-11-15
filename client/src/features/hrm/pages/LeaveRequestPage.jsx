import MainLayout from "@/layouts/MainLayout";
import LeaveRequestTab from "../components/LeaveRequestTab";

export default function LeaveRequestPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Đăng Ký & Theo Dõi Nghỉ Phép
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Tạo đơn xin nghỉ phép cá nhân và xem lịch sử phản hồi từ cấp quản lý.
        </p>
      </div>

      {/* Load thẳng Component Xin Nghỉ Phép lên đây */}
      <LeaveRequestTab />
    </MainLayout>
  );
}
