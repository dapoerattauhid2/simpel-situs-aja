
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShoppingCart, Package, Users, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/"
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive('/') 
            ? 'bg-orange-100 text-orange-700' 
            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
        } ${mobile ? 'w-full' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        <ShoppingCart className="h-4 w-4" />
        <span>Pesan Menu</span>
      </Link>
      
      <Link
        to="/orders"
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive('/orders') 
            ? 'bg-orange-100 text-orange-700' 
            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
        } ${mobile ? 'w-full' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        <Package className="h-4 w-4" />
        <span>Pesanan</span>
      </Link>
      
      <Link
        to="/children"
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive('/children') 
            ? 'bg-orange-100 text-orange-700' 
            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
        } ${mobile ? 'w-full' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        <Users className="h-4 w-4" />
        <span>Data Anak</span>
      </Link>

      <Link
        to="/cashier"
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive('/cashier') 
            ? 'bg-orange-100 text-orange-700' 
            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
        } ${mobile ? 'w-full' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        <CreditCard className="h-4 w-4" />
        <span>Kasir</span>
      </Link>
    </>
  );

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Katering Sekolah
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLinks />
            
            <Button
              onClick={signOut}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile />
                  
                  <Button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    variant="ghost"
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 hover:bg-red-50 w-full justify-start px-3 py-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
