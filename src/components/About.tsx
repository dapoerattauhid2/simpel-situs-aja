
import React from 'react';
import { CheckCircle } from 'lucide-react';

const About = () => {
  const achievements = [
    '100+ Proyek Selesai',
    '50+ Klien Puas',
    '24/7 Support',
    '99% Uptime Guarantee'
  ];

  return (
    <section id="tentang" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Tentang Kami
            </h2>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Kami adalah tim profesional yang berdedikasi untuk memberikan solusi digital terbaik. 
              Dengan pengalaman bertahun-tahun, kami telah membantu berbagai klien mencapai tujuan mereka.
            </p>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Komitmen kami adalah menghadirkan inovasi yang tidak hanya memenuhi kebutuhan saat ini, 
              tetapi juga mempersiapkan masa depan yang lebih baik.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-gray-700 font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-1">
              <img 
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Tim kerja" 
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="text-2xl font-bold text-blue-600">5+</div>
              <div className="text-sm text-gray-600">Tahun Pengalaman</div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
