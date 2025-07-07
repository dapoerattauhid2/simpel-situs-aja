
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import MidtransScript from "@/components/MidtransScript";
import Navbar from "@/components/Navbar";
import AdminNavbar from "@/components/AdminNavbar";
import Index from "./pages/Index";
import Orders from "./pages/Orders";
import Children from "./pages/Children";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Cashier from "./pages/Cashier";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import FoodManagement from "./pages/admin/FoodManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import Reports from "./pages/admin/Reports";
import ScheduleManagement from "./pages/admin/ScheduleManagement";
import PopulateDailyMenus from "./pages/admin/PopulateDailyMenus";
import OrderRecap from "./pages/admin/OrderRecap";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isAdmin } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MidtransScript />
      {isAdmin ? <AdminNavbar /> : <Navbar />}
      <Routes>
        {/* Parent routes */}
        {!isAdmin && (
          <>
            <Route path="/" element={<Index />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/children" element={<Children />} />
            <Route path="/cashier" element={<Cashier />} />
          </>
        )}
        
        {/* Admin routes */}
        {isAdmin && (
          <>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/food" element={<FoodManagement />} />
            <Route path="/admin/orders" element={<OrderManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/schedules" element={<ScheduleManagement />} />
            <Route path="/admin/populate-menus" element={<PopulateDailyMenus />} />
            <Route path="/admin/order-recap" element={<OrderRecap />} />
            <Route path="/cashier" element={<Cashier />} />
          </>
        )}
        
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
