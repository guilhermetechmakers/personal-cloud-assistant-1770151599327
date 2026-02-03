import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardNavbar } from "./DashboardNavbar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-56">
        <DashboardNavbar />
        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
