import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  Settings,
} from "lucide-react";

const navLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export const AdminSidebar = () => {
  const linkClass =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50";
  const activeLinkClass = "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50";

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <NavLink to="/admin" className="flex items-center gap-2 font-semibold">
            <span>Admin Panel</span>
          </NavLink>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink key={label} to={to} end className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ""}`}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};