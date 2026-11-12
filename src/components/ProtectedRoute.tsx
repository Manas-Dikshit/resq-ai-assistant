import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Role = "admin" | "user";

interface ProtectedRouteProps {
  role?: Role;
}

const ProtectedRoute = ({ role }: ProtectedRouteProps = {}) => {
  const { user, loading, role: userRole } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
