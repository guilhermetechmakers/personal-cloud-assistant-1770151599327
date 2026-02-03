import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { ServerError } from "@/pages/ServerError";
import { PasswordReset } from "@/pages/PasswordReset";
import { EmailVerification } from "@/pages/EmailVerification";
import { Dashboard } from "@/pages/Dashboard";
import { Automations } from "@/pages/Automations";
import { Profile } from "@/pages/Profile";
import { Legal } from "@/pages/Legal";
import { Help } from "@/pages/Help";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RequireAuth } from "@/components/RequireAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="skills" element={<Dashboard />} />
            <Route path="automations" element={<Automations />} />
            <Route path="web-agent" element={<Dashboard />} />
            <Route path="settings" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/500" element={<ServerError />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/privacy" element={<Legal title="Privacy Policy" content={<p>Privacy policy content. Last updated metadata and contact for legal inquiries.</p>} />} />
          <Route path="/terms" element={<Legal title="Terms of Service" content={<p>Terms of service content.</p>} />} />
          <Route path="/cookies" element={<Legal title="Cookie Policy" content={<p>Cookie policy content.</p>} />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))",
            color: "rgb(var(--foreground))",
          },
        }}
      />
    </QueryClientProvider>
  );
}
