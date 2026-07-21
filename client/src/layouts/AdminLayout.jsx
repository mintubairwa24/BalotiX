import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/admin/AdminSidebar";

export const AdminLayout = () => {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {/* The specific admin page (e.g., UserList) will be rendered here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};