import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
