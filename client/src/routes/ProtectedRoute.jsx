import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        <h2>403 - Bạn không có quyền truy cập vào tính năng này!</h2>
        <p>
          Quyền hiện tại của bạn: <strong>{user.role}</strong>
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
