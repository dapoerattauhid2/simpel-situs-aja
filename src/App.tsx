
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Children from "./pages/Children";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import CashierNavbar from "./components/CashierNavbar";
import MidtransScript from "./components/MidtransScript";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import FoodManagement from "./pages/admin/FoodManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import ScheduleManagement from "./pages/admin/ScheduleManagement";
import Reports from "./pages/admin/Reports";
import PopulateDailyMenus from "./pages/admin/PopulateDailyMenus";
import OrderRecap from "./pages/admin/OrderRecap";

// Cashier pages
import CashierDashboard from "./pages/cashier/CashierDashboard";
import CashierOrders from "./pages/cashier/CashierOrders";
import CashierCashPayments from "./pages/cashier/CashierCashPayments";
import CashierReports from "./pages/cashier/CashierReports";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false, cashierOnly = false }: { children: React.ReactNode; adminOnly?: boolean; cashierOnly?: boolean }) => {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading, isAdmin, isCashier } = useUserRole();
  
  if (loading || roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (cashierOnly && !isCashier) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  const { isAdmin, isCashier } = useUserRole();
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isCashierRoute = window.location.pathname.startsWith('/cashier');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        isAdminRoute ? <AdminNavbar /> : 
        isCashierRoute ? <CashierNavbar /> : 
        <Navbar />
      )}
      <Routes>
        <Route 
          path="/auth" 
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } 
        />
        
        {/* Regular user routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/children" 
          element={
            <ProtectedRoute>
              <Children />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />

        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/food-management" 
          element={
            <ProtectedRoute adminOnly={true}>
              <FoodManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/order-management" 
          element={
            <ProtectedRoute adminOnly={true}>
              <OrderManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/schedule-management" 
          element={
            <ProtectedRoute adminOnly={true}>
              <ScheduleManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/order-recap" 
          element={
            <ProtectedRoute adminOnly={true}>
              <OrderRecap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute adminOnly={true}>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/populate-daily-menus" 
          element={
            <ProtectedRoute adminOnly={true}>
              <PopulateDailyMenus />
            </ProtectedRoute>
          } 
        />

        {/* Cashier routes */}
        <Route 
          path="/cashier" 
          element={
            <ProtectedRoute cashierOnly={true}>
              <CashierDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cashier/orders" 
          element={
            <ProtectedRoute cashierOnly={true}>
              <CashierOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cashier/cash-payments" 
          element={
            <ProtectedRoute cashierOnly={true}>
              <CashierCashPayments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cashier/reports" 
          element={
            <ProtectedRoute cashierOnly={true}>
              <CashierReports />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MidtransScript />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
