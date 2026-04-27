import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute({ children }) {
  const { authUser } = useAuthStore();
  const location = useLocation();

  if (!authUser) {
    return (
      <Navigate
        to="/login"
        state={{ redirectTo: location.pathname }}
        replace
      />
    );
  }

  return children;
}