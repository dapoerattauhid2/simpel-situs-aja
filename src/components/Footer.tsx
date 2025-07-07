
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">WebSaya</h3>
            <p className="text-gray-400">
              Solusi digital terbaik untuk masa depan yang lebih cerah.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Link Cepat</h4>
            <div className="space-y-2">
              <a href="#home" className="block text-gray-400 hover:text-white transition-colors">Home</a>
              <a href="#tentang" className="block text-gray-400 hover:text-white transition-colors">Tentang</a>
              <a href="#layanan" className="block text-gray-400 hover:text-white transition-colors">Layanan</a>
              <a href="#kontak" className="block text-gray-400 hover:text-white transition-colors">Kontak</a>
            </div>
          </div>
          
          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Layanan</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Web Development</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Mobile App</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">UI/UX Design</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Konsultasi</a>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Kontak</h4>
            <div className="space-y-2 text-gray-400">
              <p>info@websaya.com</p>
              <p>+62 123 456 789</p>
              <p>Jakarta, Indonesia</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 WebSaya. Semua hak dilindungi.
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-4 md:mt-0">
            Dibuat dengan <Heart className="mx-1 text-red-500" size={16} /> di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
