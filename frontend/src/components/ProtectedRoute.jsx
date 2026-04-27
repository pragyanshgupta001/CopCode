import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute({ children }) {
  const { authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  // Still verifying cookie — don't redirect yet
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 size={24} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Auth check complete — user is not logged in → redirect
  if (!authUser) {
    return (
      <Navigate
        to="/login"
        state={{ redirectTo: location.pathname }}
        replace
      />
    );
  }

  // Auth check complete — user is logged in → render page
  return children;
}
