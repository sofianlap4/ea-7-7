// src/components/PublicRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute: React.FC<{ isAuthenticated: boolean; children: React.ReactNode }> = ({ isAuthenticated, children }) => {
  return isAuthenticated ? <Navigate to="/courses" replace /> : <>{children}</>;
};

export default PublicRoute;