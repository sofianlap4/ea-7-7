import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  roles?: string[];
  userRole?: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  roles,
  userRole,
  children,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (roles && userRole && !roles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;