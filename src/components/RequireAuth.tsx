import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession, isUserEmailVerified } from "@/api/auth";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Wraps protected routes. Redirects to /login if not signed in,
 * and to /email-verification if signed in but email not verified.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "authenticated" | "unverified" | "unauthenticated">("loading");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { user } = await getSession();
      if (!mounted) return;
      if (!user) {
        setStatus("unauthenticated");
        return;
      }
      if (!isUserEmailVerified(user)) {
        setStatus("unverified");
        return;
      }
      setStatus("authenticated");
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <span className="sr-only">Checking authentication…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (status === "unverified") {
    return <Navigate to="/email-verification" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
