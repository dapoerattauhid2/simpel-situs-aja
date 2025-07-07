
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Calculator, FileText, ShoppingBag, LogOut, Menu, X, CreditCard, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CashierNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: "Kasir",
      href: "/cashier",
      icon: Calculator,
    },
    {
      name: "Pesanan",
      href: "/cashier/orders",
      icon: ShoppingBag,
    },
    {
      name: "Pembayaran Tunai",
      href: "/cashier/cash-payments",
      icon: CreditCard,
    },
    {
      name: "Laporan",
      href: "/cashier/reports",
      icon: BarChart3,
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/cashier") {
      return location.pathname === "/cashier";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/cashier" className="text-lg md:text-2xl font-bold truncate">
            CateringKu Kasir
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-2 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  isActiveRoute(item.href)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-3 w-3 mr-1" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/10 p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.user_metadata?.avatar_url || ""} 
                      alt={user?.user_metadata?.full_name || "Kasir"} 
                    />
                    <AvatarFallback>
                      {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || "K"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Panel Kasir</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/20">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActiveRoute(item.href)
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierNavbar;
