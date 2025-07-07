
import React from 'react';
import { Zap, Shield, Heart, Users, Star, Rocket } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: 'Cepat & Efisien',
      description: 'Performa tinggi dengan loading time yang minimal untuk pengalaman pengguna terbaik.'
    },
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Keamanan data terjamin dengan enkripsi tingkat tinggi dan perlindungan maksimal.'
    },
    {
      icon: Heart,
      title: 'User Friendly',
      description: 'Interface yang intuitif dan mudah digunakan untuk semua kalangan pengguna.'
    },
    {
      icon: Users,
      title: 'Tim Profesional',
      description: 'Didukung oleh tim ahli yang berpengalaman dan siap membantu Anda 24/7.'
    },
    {
      icon: Star,
      title: 'Kualitas Terbaik',
      description: 'Standar kualitas tinggi dalam setiap aspek pengembangan dan layanan.'
    },
    {
      icon: Rocket,
      title: 'Inovasi Terdepan',
      description: 'Menggunakan teknologi terbaru untuk solusi yang inovatif dan berkelanjutan.'
    }
  ];

  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Mengapa Memilih Kami?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan layanan terbaik dengan berbagai keunggulan yang akan membantu kesuksesan Anda.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="text-white" size={32} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
