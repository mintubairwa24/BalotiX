import { Link } from "react-router-dom";
import { Shield, ShoppingCart, User } from "lucide-react";
import { useAuthStore } from "../../store";

/**
 * A conceptual Header component.
 *
 * This component demonstrates how to conditionally render an "Admin Dashboard"
 * link based on the authenticated user's role.
 *
 * You would integrate this logic into your existing site-wide Header or Navbar.
 */
export const Header = () => {
  const { user, isAuthenticated } = useAuthStore((s) => ({
    user: s.user,
    isAuthenticated: !!s.user,
  }));

  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">NextCart</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6">
          {/* Other nav links like Products, Categories etc. would go here */}
        </nav>
        <div className="flex items-center justify-end space-x-4">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              <Shield size={18} />
              Admin Dashboard
            </Link>
          )}
          {/* Other icons like Cart, User Profile would go here */}
        </div>
      </div>
    </header>
  );
};