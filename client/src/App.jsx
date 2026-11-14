import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterEmployeePage from "./pages/RegisterEmployeePage";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import ProfilePage from "./pages/ProfilePage";
import LeaveRequestPage from "./pages/LeaveRequestPage";
import WarehouseManagementPage from "./pages/WarehouseManagementPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import SalesManagementPage from "./pages/SalesManagementPage";
import CustomerManagementPage from "./pages/CustomerManagementPage";
import SupplierManagementPage from "./pages/SupplierManagementPage";
import InventoryHistoryPage from "./pages/InventoryHistoryPage";
import ReportsPage from "./pages/ReportsPage";
import StockAuditPage from "./pages/StockAuditPage";
import AuditLogPage from "./pages/AuditLogPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin", "hr"]}>
                <EmployeeManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute allowedRoles={["admin", "hr"]}>
                <RegisterEmployeePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SupplierManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["admin", "warehouse"]}>
                <ProductManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["admin", "sales", "warehouse"]}>
                <CustomerManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={["admin", "sales", "warehouse"]}>
                <SalesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute allowedRoles={["admin", "warehouse"]}>
                <WarehouseManagementPage />
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
          <Route
            path="/leave-request"
            element={
              <ProtectedRoute allowedRoles={["sales", "warehouse"]}>
                <LeaveRequestPage />
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
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
