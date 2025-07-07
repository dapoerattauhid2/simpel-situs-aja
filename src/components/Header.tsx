
import React from 'react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">WebSaya</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
            <a href="#tentang" className="text-gray-700 hover:text-blue-600 transition-colors">Tentang</a>
            <a href="#layanan" className="text-gray-700 hover:text-blue-600 transition-colors">Layanan</a>
            <a href="#kontak" className="text-gray-700 hover:text-blue-600 transition-colors">Kontak</a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-2">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Home</a>
              <a href="#tentang" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Tentang</a>
              <a href="#layanan" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Layanan</a>
              <a href="#kontak" className="text-gray-700 hover:text-blue-600 transition-colors py-2">Kontak</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
