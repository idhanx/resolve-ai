import React from "react";
import { Navigate } from "react-router-dom";
import { useResolve, type UserRole } from "../ResolveContext";

const homePathForRole = (role: UserRole) => {
  switch (role) {
    case "Employee":
      return "/employee/dashboard";
    case "Manager":
      return "/manager/dashboard";
    case "CTO":
      return "/cto/dashboard";
    case "COO":
      return "/coo/dashboard";
    case "CEO":
      return "/ceo/dashboard";
    default:
      return "/login";
  }
};

interface RequireAuthProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, currentUserRole } = useResolve();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUserRole)) {
    return <Navigate to={homePathForRole(currentUserRole)} replace />;
  }

  return children;
};

export { homePathForRole };
