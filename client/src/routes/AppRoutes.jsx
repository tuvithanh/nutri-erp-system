import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Auth
import LoginPage from "@/features/auth/pages/LoginPage";

// Dashboard & Reports
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ReportsPage from "@/features/dashboard/pages/ReportsPage";

// Inventory
import WarehouseManagementPage from "@/features/inventory/pages/WarehouseManagementPage";
import InventoryHistoryPage from "@/features/inventory/pages/InventoryHistoryPage";
import StockAuditPage from "@/features/inventory/pages/StockAuditPage";

// Catalog
import ProductManagementPage from "@/features/catalog/pages/ProductManagementPage";
import SupplierManagementPage from "@/features/catalog/pages/SupplierManagementPage";

// Sales & CRM
import SalesManagementPage from "@/features/sales/pages/SalesManagementPage";
import CustomerManagementPage from "@/features/sales/pages/CustomerManagementPage";

// HRM
import EmployeeManagementPage from "@/features/hrm/pages/EmployeeManagementPage";
import RegisterEmployeePage from "@/features/hrm/pages/RegisterEmployeePage";
import LeaveManagementPage from "@/features/hrm/pages/LeaveManagementPage";
import LeaveRequestPage from "@/features/hrm/pages/LeaveRequestPage";

// System
import AuditLogPage from "@/features/system/pages/AuditLogPage";
import ProfilePage from "@/features/system/pages/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse", "sales", "hr"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse", "hr"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Inventory */}
      <Route
        path="/warehouse"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse"]}>
            <WarehouseManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-history"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse"]}>
            <InventoryHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock-audit"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse"]}>
            <StockAuditPage />
          </ProtectedRoute>
        }
      />

      {/* Catalog */}
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse", "sales"]}>
            <ProductManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SupplierManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Sales */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={["admin", "sales"]}>
            <SalesManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={["admin", "sales"]}>
            <CustomerManagementPage />
          </ProtectedRoute>
        }
      />

      {/* HRM */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse", "sales", "hr"]}>
            <EmployeeManagementPage />
          </ProtectedRoute>
        }
      />
      <Route path="/employees" element={<Navigate to="/users" replace />} />
      <Route
        path="/register-employee"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <RegisterEmployeePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-management"
        element={
          <ProtectedRoute allowedRoles={["admin", "hr"]}>
            <LeaveManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-request"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse", "sales", "hr"]}>
            <LeaveRequestPage />
          </ProtectedRoute>
        }
      />

      {/* System */}
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["admin", "warehouse", "sales", "hr"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
